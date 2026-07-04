const express = require('express');
const crypto  = require('crypto');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment      = require('../models/Payment');
const PlanConfig   = require('../models/PlanConfig');
const { protect }  = require('../middleware/auth');
const { getRazorpayConfig } = require('../utils/razorpayConfig');

const router = express.Router();

const getRazorpayKeyId = () => getRazorpayConfig().key_id;
const getRazorpayKeySecret = () => getRazorpayConfig().key_secret;

// ── Add-ons (still static — admin can extend later) ──────────────────────────
const ADD_ONS = {
  boost:     { name: 'Profile Boost', price: 99  },
  superlike: { name: 'Super Like',    price: 49  },
  spotlight: { name: 'Spotlight',     price: 199 },
};

const getRazorpay = () => {
  const Razorpay = require('razorpay');
  const config = getRazorpayConfig();
  return new Razorpay({
    key_id: config.key_id,
    key_secret: config.key_secret,
  });
};

function buildRazorpayErrorPayload(err) {
  const description = err?.error?.description || err?.description || err?.message || 'Razorpay request failed';
  const isAuthFailure = /authentication|unauthorized|bad_request_error|invalid api key/i.test(description);
  const isTimeout = /timeout|timed out|ETIMEDOUT|ECONNRESET|socket hang up|network/i.test(description);
  const status = isAuthFailure ? 502 : (err?.statusCode >= 400 ? err.statusCode : 502);

  let message = description;
  if (isAuthFailure) {
    message = 'Authentication with Razorpay failed. Please verify the Razorpay key ID and secret in the server environment.';
  } else if (isTimeout) {
    message = 'Payment request timed out. Please try again in a moment.';
  } else if (/not found/i.test(description)) {
    message = 'Unable to create payment order. The requested payment resource was not found.';
  }

  return {
    success: false,
    message,
    errorCode: err?.error?.code || 'RAZORPAY_ERROR',
    status,
  };
}

function logRazorpayError(context, err) {
  console.error(`[${context}] Razorpay error`, {
    message: err?.message,
    statusCode: err?.statusCode,
    error: err?.error,
    description: err?.error?.description || err?.description || err?.message,
    response: err?.response,
    stack: err?.stack,
  });
}

// Helper — fetch a single active paid plan from DB
async function getPlan(key) {
  const plan = await PlanConfig.findOne({ key: key.toLowerCase(), isActive: true });
  if (!plan) throw new Error(`Plan "${key}" not found or inactive`);
  return plan;
}

// Helper — compute effective price (respects discount + expiry)
function getEffectivePrice(plan) {
  const d = plan.discount;
  if (
    d?.isActive &&
    d?.offerPrice != null &&
    d.offerPrice >= 0 &&
    (!d.expiresAt || new Date(d.expiresAt) > new Date())
  ) {
    return d.offerPrice;
  }
  return plan.price;
}

// Helper — serialize plan with effectivePrice for API responses
function serializePlan(plan) {
  const obj = plan.toObject ? plan.toObject() : { ...plan };
  obj.effectivePrice = getEffectivePrice(plan);
  obj.currency = plan.currency || 'INR';
  obj.buttonText = plan.buttonText || '';
  obj.buttonColor = plan.buttonColor || '';
  obj.razorpayPlanId = plan.razorpayPlanId || null;
  obj.razorpayPlanAmount = plan.razorpayPlanAmount || null;
  return obj;
}

// Cache for Razorpay plan IDs and current pricing metadata
const razorpayPlanCache = {};

function getRazorpayPlanInterval(durationDays) {
  if (!durationDays || durationDays <= 0) return 1;
  if (durationDays === 365) return 12;
  if (durationDays === 90) return 3;
  return Math.max(1, Math.round(durationDays / 30));
}

async function createRazorpayOrder({ amount, currency, receipt, notes }) {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: (currency || 'INR').toUpperCase(),
    receipt,
    notes,
  });
}

// Expose a helper to clear in-memory Razorpay plan cache (used by admin resync)
router.clearRazorpayCache = function clearRazorpayCache() {
  Object.keys(razorpayPlanCache).forEach(k => delete razorpayPlanCache[k]);
  console.log('Razorpay plan cache cleared (in-memory)');
};

// ── GET /api/subscription/plans — public, used by Pricing page ───────────────
router.get('/plans', async (_req, res) => {
  try {
    const plans = await PlanConfig.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, plans: plans.map(serializePlan), addOns: ADD_ONS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/subscription/status ─────────────────────────────────────────────
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let plan    = user.plan;
    let expired = false;

    // Expire trial
    if (plan !== 'free' && user.isTrialUsed && !user.subscriptionId) {
      if (user.trialEndDate && new Date() > user.trialEndDate) {
        plan = 'free'; expired = true;
        user.plan = 'free';
        await user.save({ validateBeforeSave: false });
      }
    }
    // Expire paid subscription
    if (user.subscriptionEnd && new Date() > user.subscriptionEnd && user.subscriptionId) {
      plan = 'free'; expired = true;
      user.plan = 'free';
      user.subscriptionId = null;
      await user.save({ validateBeforeSave: false });
    }

    const isTrial      = user.isTrialUsed && !user.subscriptionId && plan !== 'free';
    const trialDaysLeft = isTrial && user.trialEndDate
      ? Math.max(0, Math.ceil((new Date(user.trialEndDate) - new Date()) / 86400000))
      : null;

    res.json({
      success: true,
      plan,
      isTrial,
      trialDaysLeft,
      trialEndDate:       user.trialEndDate,
      subscriptionEnd:    user.subscriptionEnd,
      subscriptionStatus: user.subscriptionStatus,
      nextBillingDate:    user.nextBillingDate,
      isTrialUsed:        user.isTrialUsed,
      razorpaySubId:      user.subscriptionId,
      expired,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/subscription/create-subscription ───────────────────────────────
router.post('/create-subscription', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    const planDoc = await getPlan(plan).catch(() => null);
    if (!planDoc || planDoc.key === 'free') {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const amount = getEffectivePrice(planDoc);
    const order = await createRazorpayOrder({
      amount,
      currency: planDoc.currency || 'INR',
      receipt: `p_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`,
      notes: { plan, userId: req.user._id.toString(), type: 'subscription' },
    });

    await Subscription.create({
      userId: req.user._id,
      plan,
      status: 'pending',
      razorpaySubId: order.id,
      razorpayPlanId: planDoc.razorpayPlanId || null,
      totalCount: 1,
      paidCount: 0,
    });

    res.json({
      success: true,
      orderId: order.id,
      keyId: getRazorpayKeyId(),
      plan,
      planName: planDoc.name,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err) {
    const razorpayError = buildRazorpayErrorPayload(err);
    logRazorpayError('create-subscription', err);
    res.status(razorpayError.status).json({
      success: false,
      message: razorpayError.message,
      errorCode: razorpayError.errorCode,
    });
  }
});

// ── POST /api/subscription/verify-subscription ───────────────────────────────
router.post('/verify-subscription', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data.' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', getRazorpayKeySecret())
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscriptionDoc = await Subscription.findOneAndUpdate(
      { razorpaySubId: razorpay_order_id },
      {
        status: 'active',
        startDate,
        endDate,
        paymentId: razorpay_payment_id,
        paidCount: 1,
        nextBillingDate: endDate,
      },
      { new: true }
    );

    const planDoc = await PlanConfig.findOne({ key: plan.toLowerCase() });
    await User.findByIdAndUpdate(req.user._id, {
      plan,
      subscriptionId: subscriptionDoc?.razorpaySubId || razorpay_order_id,
      subscriptionStatus: 'active',
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
      nextBillingDate: endDate,
      razorpayPlanId: planDoc?.razorpayPlanId || null,
    });

    await Payment.create({
      userId: req.user._id,
      plan,
      amount: getEffectivePrice(planDoc) || 0,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: 'paid',
    });

    res.json({ success: true, message: 'Subscription activated', plan, endDate });
  } catch (err) {
    logRazorpayError('verify-subscription', err);
    res.status(500).json({ success: false, message: 'Payment verification failed. Please try again.' });
  }
});

// ── POST /api/subscription/cancel ────────────────────────────────────────────
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.subscriptionId) {
      return res.status(400).json({ success: false, message: 'No active subscription' });
    }

    const razorpay = getRazorpay();
    await razorpay.subscriptions.cancel(user.subscriptionId, { cancel_at_cycle_end: 1 });

    await User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 'cancelled' });
    await Subscription.findOneAndUpdate(
      { razorpaySubId: user.subscriptionId },
      { status: 'cancelled' }
    );

    res.json({ success: true, message: 'Subscription cancelled. Access continues until period end.' });
  } catch (err) {
    const razorpayError = buildRazorpayErrorPayload(err);
    logRazorpayError('cancel-subscription', err);
    res.status(razorpayError.status).json({
      success: false,
      message: razorpayError.message,
      errorCode: razorpayError.errorCode,
    });
  }
});

// ── POST /api/subscription/addon-order ───────────────────────────────────────
// Add-ons remain one-time orders (not recurring)
router.post('/addon-order', protect, async (req, res) => {
  try {
    const { addon } = req.body;
    if (!ADD_ONS[addon]) return res.status(400).json({ success: false, message: 'Invalid add-on' });

    const order = await createRazorpayOrder({
      amount: ADD_ONS[addon].price,
      currency: 'INR',
      receipt: `a_${Date.now().toString().slice(-8)}`,
      notes: { addon, userId: req.user._id.toString(), type: 'addon' },
    });

    res.json({
      success:   true,
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      keyId:     getRazorpayKeyId(),
      addon,
      addonName: ADD_ONS[addon].name,
    });
  } catch (err) {
    logRazorpayError('addon-order', err);
    res.status(502).json({ success: false, message: 'Unable to create payment order. Please try again.' });
  }
});

// ── POST /api/subscription/webhook ───────────────────────────────────────────
// Razorpay sends events here — MUST use raw body (registered in server.js)
router.post('/webhook', async (req, res) => {
  try {
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET || getRazorpayKeySecret();
    const signature = req.headers['x-razorpay-signature'];
    const body      = req.rawBody; // set by express.raw() in server.js

    // Verify webhook signature
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expected !== signature) {
      console.warn('Webhook signature mismatch');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event   = JSON.parse(body);
    const payload = event.payload?.subscription?.entity || {};
    const payment = event.payload?.payment?.entity || {};

    console.log('Webhook event:', event.event, payload.id || payment.id);

    switch (event.event) {

      case 'subscription.activated': {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubId: payload.id },
          { status: 'active' },
          { new: true }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, {
            subscriptionStatus: 'active',
            plan: sub.plan,
          });
        }
        break;
      }

      case 'subscription.charged': {
        // Auto-debit succeeded — extend access by 30 days
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 30);

        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubId: payload.id },
          {
            status:         'active',
            endDate:        nextBilling,
            nextBillingDate: nextBilling,
            paymentId:      payment.id,
            $inc:           { paidCount: 1 },
          },
          { new: true }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, {
            subscriptionStatus: 'active',
            subscriptionEnd:    nextBilling,
            nextBillingDate:    nextBilling,
            plan:               sub.plan,
          });
          // Log payment
          await Payment.create({
            userId:    sub.userId,
            plan:      sub.plan,
            amount:    getEffectivePrice(await PlanConfig.findOne({ key: sub.plan })) || 0,
            orderId:   payload.id,
            paymentId: payment.id,
            status:    'paid',
          });
        }
        break;
      }

      case 'subscription.completed': {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubId: payload.id },
          { status: 'completed' },
          { new: true }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, {
            subscriptionStatus: 'completed',
          });
        }
        break;
      }

      case 'subscription.cancelled': {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubId: payload.id },
          { status: 'cancelled' },
          { new: true }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, {
            subscriptionStatus: 'cancelled',
          });
        }
        break;
      }

      case 'subscription.pending':
      case 'subscription.halted': {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubId: payload.id },
          { status: 'failed' },
          { new: true }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, {
            subscriptionStatus: 'failed',
          });
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment      = require('../models/Payment');
const PlanConfig   = require('../models/PlanConfig');
const { protect }  = require('../middleware/auth');
const { getRazorpayConfig, getRazorpayWebhookSecret } = require('../utils/razorpayConfig');
const {
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../utils/razorpaySecurity');

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
  const isAuthFailure = err?.statusCode === 401 || err?.statusCode === 403
    || /authentication failure|unauthorized|invalid api key/i.test(description);
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

function logRazorpayError(context, err, details = {}) {
  console.error(`[${context}] Razorpay error`, {
    requestId: details.requestId,
    orderId: details.orderId,
    paymentMethod: details.paymentMethod,
    statusCode: err?.statusCode,
    errorCode: err?.error?.code || err?.code,
    description: (err?.error?.description || err?.description || err?.message || 'Razorpay request failed')
      .toString().replace(/[\r\n]+/g, ' ').slice(0, 500),
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
  const amountPaise = Math.round(amount * 100);
  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    throw new Error('Invalid payment amount');
  }
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: amountPaise,
    currency: (currency || 'INR').toUpperCase(),
    receipt,
    notes,
  });
}

async function fulfillVerifiedPayment(orderPayment, razorpayPayment) {
  const session = await mongoose.startSession();
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + (orderPayment.durationDays || 30));
  let alreadyProcessed = false;

  try {
    await session.withTransaction(async () => {
      const storedPayment = await Payment.findById(orderPayment._id).session(session);
      if (!storedPayment) throw new Error('Payment order record not found');
      if (storedPayment.status === 'paid') {
        if (storedPayment.paymentId !== razorpayPayment.id) {
          throw new Error('Order was already completed with a different payment');
        }
        alreadyProcessed = true;
        return;
      }
      if (storedPayment.status !== 'created') throw new Error('Payment order is no longer payable');

      storedPayment.status = 'paid';
      storedPayment.paymentId = razorpayPayment.id;
      storedPayment.paymentMethod = razorpayPayment.method;
      await storedPayment.save({ session });

      if (storedPayment.itemType === 'subscription') {
        const subscription = await Subscription.findOneAndUpdate(
          { razorpaySubId: storedPayment.orderId, userId: storedPayment.userId },
          {
            status: 'active',
            startDate: now,
            endDate,
            paymentId: razorpayPayment.id,
            paidCount: 1,
            nextBillingDate: endDate,
          },
          { new: true, session }
        );
        if (!subscription) throw new Error('Subscription order record not found');

        const userUpdate = await User.updateOne(
          { _id: storedPayment.userId },
          {
            plan: storedPayment.plan,
            subscriptionId: storedPayment.orderId,
            subscriptionStatus: 'active',
            subscriptionStart: now,
            subscriptionEnd: endDate,
            nextBillingDate: endDate,
          },
          { session }
        );
        if (userUpdate.matchedCount !== 1) throw new Error('Payment customer not found');
      }
    });
  } finally {
    await session.endSession();
  }

  return { alreadyProcessed, endDate };
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
    if (typeof plan !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
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

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Subscription.create([{
          userId: req.user._id,
          plan: planDoc.key,
          status: 'pending',
          razorpaySubId: order.id,
          razorpayPlanId: planDoc.razorpayPlanId || null,
          totalCount: 1,
          paidCount: 0,
        }], { session });
        await Payment.create([{
          userId: req.user._id,
          plan: planDoc.key,
          amount,
          amountPaise: order.amount,
          currency: order.currency,
          itemType: 'subscription',
          durationDays: planDoc.durationDays || 30,
          orderId: order.id,
          status: 'created',
        }], { session });
      });
    } finally {
      await session.endSession();
    }

    res.json({
      success: true,
      orderId: order.id,
      keyId: getRazorpayKeyId(),
      plan: planDoc.key,
      planName: planDoc.name,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err) {
    const razorpayError = buildRazorpayErrorPayload(err);
    logRazorpayError('create-subscription', err, { requestId: req.id });
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification data.' });
    }

    if (!verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      getRazorpayKeySecret()
    )) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    const orderPayment = await Payment.findOne({
      orderId: razorpay_order_id,
      userId: req.user._id,
    });
    if (!orderPayment) {
      return res.status(404).json({ success: false, message: 'Payment order was not found for this account.' });
    }

    const razorpayPayment = await getRazorpay().payments.fetch(razorpay_payment_id);
    if (
      razorpayPayment.order_id !== orderPayment.orderId
      || razorpayPayment.amount !== orderPayment.amountPaise
      || razorpayPayment.currency !== orderPayment.currency
    ) {
      return res.status(400).json({ success: false, message: 'Payment does not match the order.' });
    }
    if (razorpayPayment.status !== 'captured') {
      return res.status(409).json({ success: false, message: 'Payment is not captured yet. Please try again shortly.' });
    }

    const result = await fulfillVerifiedPayment(orderPayment, razorpayPayment);
    res.json({
      success: true,
      message: orderPayment.itemType === 'subscription' ? 'Subscription activated' : 'Add-on payment verified',
      plan: orderPayment.itemType === 'subscription' ? orderPayment.plan : undefined,
      endDate: orderPayment.itemType === 'subscription' ? result.endDate : undefined,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (err) {
    logRazorpayError('verify-subscription', err, {
      requestId: req.id,
      orderId: req.body?.razorpay_order_id,
    });
    res.status(500).json({ success: false, message: 'Payment verification failed. Please try again.', errorCode: err?.error?.code });
  }
});

// ── POST /api/subscription/cancel ────────────────────────────────────────────
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.subscriptionId) {
      return res.status(400).json({ success: false, message: 'No active subscription' });
    }

    if (user.subscriptionEnd && user.subscriptionEnd <= new Date()) {
      return res.status(400).json({ success: false, message: 'The paid access period has ended.' });
    }

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

    await Payment.create({
      userId: req.user._id,
      plan: addon,
      amount: ADD_ONS[addon].price,
      amountPaise: order.amount,
      currency: order.currency,
      itemType: 'addon',
      orderId: order.id,
      status: 'created',
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

router.post('/payment-failure', protect, async (req, res) => {
  try {
    const { orderId, errorCode, description, method } = req.body || {};
    if (typeof orderId !== 'string' || !orderId) {
      return res.status(400).json({ success: false, message: 'Payment order ID is required.' });
    }
    const order = await Payment.findOne({ orderId, userId: req.user._id }).select('_id');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Payment order was not found for this account.' });
    }

    console.warn('[razorpay-checkout-failure]', {
      requestId: req.id,
      orderId,
      paymentMethod: typeof method === 'string' ? method.slice(0, 40) : undefined,
      errorCode: typeof errorCode === 'string' ? errorCode.slice(0, 80) : undefined,
      description: typeof description === 'string'
        ? description.replace(/[\r\n]+/g, ' ').slice(0, 500)
        : undefined,
    });
    res.json({ success: true });
  } catch (err) {
    logRazorpayError('payment-failure-diagnostics', err, { requestId: req.id });
    res.status(500).json({ success: false, message: 'Unable to record payment diagnostics.' });
  }
});

// ── POST /api/subscription/webhook ───────────────────────────────────────────
// Razorpay sends events here — MUST use raw body (registered in server.js)
router.post('/webhook', async (req, res) => {
  try {
    const secret    = getRazorpayWebhookSecret();
    const signature = req.headers['x-razorpay-signature'];
    const body      = req.rawBody; // set by express.raw() in server.js

    if (!verifyWebhookSignature(body, signature, secret)) {
      console.warn('[razorpay-webhook] signature mismatch', { requestId: req.id });
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event   = JSON.parse(body);
    const payload = event.payload?.subscription?.entity || {};
    const payment = event.payload?.payment?.entity || {};

    console.log('[razorpay-webhook]', {
      requestId: req.id,
      event: event.event,
      orderId: payment.order_id,
      paymentId: payment.id,
      paymentMethod: payment.method,
      errorCode: payment.error_code,
      description: payment.error_description,
    });

    switch (event.event) {
      case 'payment.captured': {
        const orderPayment = await Payment.findOne({ orderId: payment.order_id });
        if (orderPayment) {
          if (
            payment.amount !== orderPayment.amountPaise
            || payment.currency !== orderPayment.currency
          ) {
            console.error('[razorpay-webhook] captured payment does not match order', {
              requestId: req.id,
              orderId: payment.order_id,
              paymentId: payment.id,
            });
            return res.status(400).json({ success: false, message: 'Payment does not match the order.' });
          }
          await fulfillVerifiedPayment(orderPayment, payment);
        }
        break;
      }

      case 'payment.failed': {
        await Payment.findOneAndUpdate(
          { orderId: payment.order_id, status: 'created' },
          { status: 'failed', paymentId: payment.id, paymentMethod: payment.method }
        );
        break;
      }

      case 'subscription.activated': {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubId: payload.id, paymentId: { $ne: payment.id } },
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
    logRazorpayError('webhook', err, {
      requestId: req.id,
      orderId: req.body?.payload?.payment?.entity?.order_id,
      paymentMethod: req.body?.payload?.payment?.entity?.method,
    });
    res.status(err.message?.includes('webhook secret') ? 503 : 500).json({
      success: false,
      message: 'Webhook processing failed.',
    });
  }
});

module.exports = router;

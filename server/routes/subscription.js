const express = require('express');
const crypto  = require('crypto');
const User         = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment      = require('../models/Payment');
const PlanConfig   = require('../models/PlanConfig');
const { protect }  = require('../middleware/auth');

const router = express.Router();

// ── Add-ons (still static — admin can extend later) ──────────────────────────
const ADD_ONS = {
  boost:     { name: 'Profile Boost', price: 99  },
  superlike: { name: 'Super Like',    price: 49  },
  spotlight: { name: 'Spotlight',     price: 199 },
};

const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

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
  return obj;
}

// Cache for Razorpay plan IDs
const razorpayPlanCache = {};

async function getOrCreateRazorpayPlan(planKey) {
  if (razorpayPlanCache[planKey]) return razorpayPlanCache[planKey];

  const envKey = `RAZORPAY_PLAN_ID_${planKey.toUpperCase()}`;
  if (process.env[envKey]) {
    razorpayPlanCache[planKey] = process.env[envKey];
    return process.env[envKey];
  }

  const planDoc  = await getPlan(planKey);
  const razorpay = getRazorpay();
  const plan = await razorpay.plans.create({
    period:   'monthly',
    interval: 1,
    item: {
      name:     `EloviaLove ${planDoc.name}`,
      amount:   getEffectivePrice(planDoc) * 100,
      currency: 'INR',
    },
    notes: { plan: planKey },
  });

  razorpayPlanCache[planKey] = plan.id;
  console.log(`Created Razorpay plan for ${planKey}: ${plan.id}`);
  return plan.id;
}

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

    const razorpay = getRazorpay();
    const planId   = await getOrCreateRazorpayPlan(plan);

    const subscription = await razorpay.subscriptions.create({
      plan_id:         planId,
      customer_notify: 1,
      total_count:     12,
      quantity:        1,
      notes: { plan, userId: req.user._id.toString() },
    });

    await Subscription.create({
      userId:         req.user._id,
      plan,
      status:         'pending',
      razorpaySubId:  subscription.id,
      razorpayPlanId: planId,
      totalCount:     12,
    });

    res.json({
      success:        true,
      subscriptionId: subscription.id,
      keyId:          process.env.RAZORPAY_KEY_ID,
      plan,
      planName:       planDoc.name,
      amount:         getEffectivePrice(planDoc) * 100,
      currency:       'INR',
    });
  } catch (err) {
    console.error('Create subscription error:', err?.error || err?.message || err);
    const msg = err?.error?.description || err?.message || 'Failed to create subscription';
    res.status(500).json({ success: false, message: msg });
  }
});

// ── POST /api/subscription/verify-subscription ───────────────────────────────
// Called after first payment in Razorpay checkout completes
router.post('/verify-subscription', protect, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan } = req.body;

    // Verify signature
    const body        = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const startDate = new Date();
    const endDate   = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Update subscription record
    await Subscription.findOneAndUpdate(
      { razorpaySubId: razorpay_subscription_id },
      {
        status:    'active',
        startDate,
        endDate,
        paymentId: razorpay_payment_id,
        paidCount: 1,
        nextBillingDate: endDate,
      }
    );

    // Activate user plan
    await User.findByIdAndUpdate(req.user._id, {
      plan,
      subscriptionId:     razorpay_subscription_id,
      subscriptionStatus: 'active',
      subscriptionStart:  startDate,
      subscriptionEnd:    endDate,
      nextBillingDate:    endDate,
      razorpayPlanId:     razorpayPlanCache[plan] || null,
    });

    // Log payment
    await Payment.create({
      userId:    req.user._id,
      plan,
      amount:    getEffectivePrice(await PlanConfig.findOne({ key: plan })) || 0,
      orderId:   razorpay_subscription_id,
      paymentId: razorpay_payment_id,
      status:    'paid',
    });

    res.json({ success: true, message: 'Subscription activated', plan, endDate });
  } catch (err) {
    console.error('Verify subscription error:', err);
    res.status(500).json({ success: false, message: err.message });
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
    console.error('Cancel error:', err?.error || err?.message || err);
    const msg = err?.error?.description || err?.message || 'Cancellation failed';
    res.status(500).json({ success: false, message: msg });
  }
});

// ── POST /api/subscription/addon-order ───────────────────────────────────────
// Add-ons remain one-time orders (not recurring)
router.post('/addon-order', protect, async (req, res) => {
  try {
    const { addon } = req.body;
    if (!ADD_ONS[addon]) return res.status(400).json({ success: false, message: 'Invalid add-on' });

    const razorpay = getRazorpay();
    const order    = await razorpay.orders.create({
      amount:   ADD_ONS[addon].price * 100,
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes:    { addon, userId: req.user._id.toString() },
    });

    res.json({
      success:   true,
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      keyId:     process.env.RAZORPAY_KEY_ID,
      addon,
      addonName: ADD_ONS[addon].name,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/subscription/webhook ───────────────────────────────────────────
// Razorpay sends events here — MUST use raw body (registered in server.js)
router.post('/webhook', async (req, res) => {
  try {
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
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

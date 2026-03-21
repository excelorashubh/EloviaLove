const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Plan config ──────────────────────────────────────────────────────────────
const PLANS = {
  basic:   { name: 'Basic',   price: 149, durationDays: 30 },
  premium: { name: 'Premium', price: 399, durationDays: 30 },
  pro:     { name: 'Pro',     price: 899, durationDays: 30 },
};

const ADD_ONS = {
  boost:     { name: 'Profile Boost', price: 99 },
  superlike: { name: 'Super Like',    price: 49 },
  spotlight: { name: 'Spotlight',     price: 199 },
};

// Lazy-load Razorpay so server starts even without the key configured
const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @route   GET /api/subscription/plans
// @desc    Get all plan details
// @access  Public
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS, addOns: ADD_ONS });
});

// @route   GET /api/subscription/status
// @desc    Get current user's subscription status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check expiry on the fly
    let plan = user.plan;
    let expired = false;

    if (plan === 'premium' && user.isTrialUsed && !user.subscriptionId) {
      if (user.trialEndDate && new Date() > user.trialEndDate) {
        plan = 'free';
        expired = true;
        user.plan = 'free';
        await user.save({ validateBeforeSave: false });
      }
    }
    if (user.subscriptionEnd && new Date() > user.subscriptionEnd && user.subscriptionId) {
      plan = 'free';
      expired = true;
      user.plan = 'free';
      user.subscriptionId = null;
      await user.save({ validateBeforeSave: false });
    }

    const isTrial = user.isTrialUsed && !user.subscriptionId && plan !== 'free';
    const trialDaysLeft = isTrial && user.trialEndDate
      ? Math.max(0, Math.ceil((new Date(user.trialEndDate) - new Date()) / 86400000))
      : 0;

    res.json({
      success: true,
      plan,
      isTrial,
      trialDaysLeft,
      trialEndDate: user.trialEndDate,
      subscriptionEnd: user.subscriptionEnd,
      isTrialUsed: user.isTrialUsed,
      expired,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/subscription/create-order
// @desc    Create Razorpay order for a plan
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const razorpay = getRazorpay();
    const amount = PLANS[plan].price * 100; // paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { plan, userId: req.user._id.toString() },
    });

    await Payment.create({
      userId: req.user._id,
      plan,
      amount: PLANS[plan].price,
      orderId: order.id,
      status: 'created',
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      planName: PLANS[plan].name,
    });
  } catch (err) {
    console.error('Create order error:', err?.error || err?.message || err);
    const msg = err?.error?.description || err?.message || 'Razorpay order creation failed';
    res.status(500).json({ success: false, message: msg });
  }
});

// @route   POST /api/subscription/verify
// @desc    Verify Razorpay payment and activate subscription
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Activate subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLANS[plan].durationDays);

    await Subscription.create({
      userId: req.user._id,
      plan,
      status: 'active',
      startDate,
      endDate,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    await User.findByIdAndUpdate(req.user._id, {
      plan,
      subscriptionId: razorpay_payment_id,
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
    });

    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: 'paid' }
    );

    res.json({ success: true, message: 'Subscription activated', plan, endDate });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/subscription/addon-order
// @desc    Create order for an add-on purchase
// @access  Private
router.post('/addon-order', protect, async (req, res) => {
  try {
    const { addon } = req.body;
    if (!ADD_ONS[addon]) return res.status(400).json({ success: false, message: 'Invalid add-on' });

    const razorpay = getRazorpay();
    const amount = ADD_ONS[addon].price * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { addon, userId: req.user._id.toString() },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      addon,
      addonName: ADD_ONS[addon].name,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

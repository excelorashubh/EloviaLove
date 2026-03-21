const User = require('../models/User');

const PLAN_RANK = { free: 0, basic: 1, premium: 2, pro: 3 };

/**
 * checkPlan('premium') — blocks access if user's plan rank < required
 */
const checkPlan = (requiredPlan) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Auto-expire trial
    if (user.plan === 'premium' && user.isTrialUsed && !user.subscriptionId) {
      if (user.trialEndDate && new Date() > user.trialEndDate) {
        user.plan = 'free';
        await user.save({ validateBeforeSave: false });
      }
    }
    // Auto-expire paid subscription
    if (user.subscriptionEnd && new Date() > user.subscriptionEnd && user.subscriptionId) {
      user.plan = 'free';
      user.subscriptionId = null;
      await user.save({ validateBeforeSave: false });
    }

    if (PLAN_RANK[user.plan] < PLAN_RANK[requiredPlan]) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${requiredPlan} plan or higher`,
        requiredPlan,
        currentPlan: user.plan,
      });
    }

    req.user.plan = user.plan;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = checkPlan;

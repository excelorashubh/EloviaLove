const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users (admin)
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Get users admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:userId/status
// @desc    Activate/deactivate user account
// @access  Private/Admin
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user account
// @access  Private/Admin
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Report.deleteMany({ $or: [{ reporter: userId }, { reportedUser: userId }] }),
      Match.deleteMany({ users: userId }),
      Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] })
    ]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Private/Admin
router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';

    const query = status === 'all' ? {} : { status };

    const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email isActive')
    .populate('resolvedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalReports = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total: totalReports,
        pages: Math.ceil(totalReports / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/reports/:reportId
// @desc    Update report status
// @access  Private/Admin
router.put('/reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = {
      status,
      resolvedBy: req.user._id
    };

    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolvedAt = new Date();
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    )
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email isActive')
    .populate('resolvedBy', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:userId/verify
// @desc    Toggle user verification (blue tick)
// @access  Private/Admin
router.put('/users/:userId/verify', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isVerified must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(userId, { isVerified }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `User ${isVerified ? 'verified' : 'unverified'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalMatches,
      totalMessages,
      pendingReports,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Match.countDocuments(),
      Message.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalMatches,
        totalMessages,
        pendingReports,
        recentUsers,
        userActivity: activeUsers / totalUsers * 100
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ── ANALYTICS ────────────────────────────────────────────────────────────────

// Helper: date range from period query param
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  if (period === 'today')  { start.setHours(0, 0, 0, 0); }
  else if (period === 'week')  { start.setDate(now.getDate() - 7); }
  else if (period === 'month') { start.setMonth(now.getMonth() - 1); }
  else if (period === 'year')  { start.setFullYear(now.getFullYear() - 1); }
  else { start.setFullYear(2000); } // 'all'
  return start;
};

// @route   GET /api/admin/analytics/overview
// @desc    Revenue + user overview cards
router.get('/analytics/overview', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const since = getDateRange(period);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [
      totalRevenue,
      monthRevenue,
      todayRevenue,
      periodRevenue,
      activeSubscriptions,
      newUsersToday,
      newUsersMonth,
      totalUsers,
      failedPayments,
    ] = await Promise.all([
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'paid', createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'paid', createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'paid', createdAt: { $gte: since } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Subscription.countDocuments({ status: 'active' }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      User.countDocuments(),
      Payment.countDocuments({ status: 'failed' }),
    ]);

    res.json({
      success: true,
      totalRevenue:        totalRevenue[0]?.total  || 0,
      monthRevenue:        monthRevenue[0]?.total  || 0,
      todayRevenue:        todayRevenue[0]?.total  || 0,
      periodRevenue:       periodRevenue[0]?.total || 0,
      activeSubscriptions,
      newUsersToday,
      newUsersMonth,
      totalUsers,
      failedPayments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/analytics/monthly-revenue
// @desc    Revenue grouped by month (last 12 months)
router.get('/analytics/monthly-revenue', async (req, res) => {
  try {
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);

    const data = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count:   { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = data.map(d => ({
      label:   `${MONTHS[d._id.month - 1]} ${d._id.year}`,
      revenue: d.revenue,
      count:   d.count,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/analytics/revenue-by-plan
// @desc    Revenue breakdown per plan
router.get('/analytics/revenue-by-plan', async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$plan', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/analytics/user-growth
// @desc    New user signups grouped by month (last 12 months)
router.get('/analytics/user-growth', async (req, res) => {
  try {
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = data.map(d => ({
      label: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
      count: d.count,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/analytics/payments
// @desc    Paginated payment history with filters
router.get('/analytics/payments', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const skip   = (page - 1) * limit;
    const { plan, status, period, from, to } = req.query;

    const match = {};
    if (plan   && plan   !== 'all') match.plan   = plan;
    if (status && status !== 'all') match.status = status;

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to)   match.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    } else if (period && period !== 'all') {
      match.createdAt = { $gte: getDateRange(period) };
    }

    const [payments, total] = await Promise.all([
      Payment.find(match)
        .populate('userId', 'name email profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(match),
    ]);

    res.json({
      success: true,
      payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/analytics/conversion
// @desc    Free → paid conversion rate + plan distribution
router.get('/analytics/conversion', async (req, res) => {
  try {
    const [total, paid, planDist] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: { $in: ['basic', 'premium', 'pro'] } }),
      User.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      total,
      paid,
      conversionRate: total > 0 ? ((paid / total) * 100).toFixed(1) : 0,
      planDistribution: planDist,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

// @route   GET /api/admin/analytics/ads
// @desc    Ad exposure stats — how many users see ads vs don't
router.get('/analytics/ads', async (req, res) => {
  try {
    const [planDist, total] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      User.countDocuments(),
    ]);

    const byPlan = { free: 0, basic: 0, premium: 0, pro: 0 };
    planDist.forEach(p => { if (byPlan[p._id] !== undefined) byPlan[p._id] = p.count; });

    const adAudience  = byPlan.free;                                          // sees ads
    const noAdAudience = byPlan.basic + byPlan.premium + byPlan.pro;          // ad-free
    const exposureRate = total > 0 ? ((adAudience / total) * 100).toFixed(1) : 0;
    const upgradeRate  = total > 0 ? ((noAdAudience / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      total,
      adAudience,
      noAdAudience,
      exposureRate,
      upgradeRate,
      byPlan,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

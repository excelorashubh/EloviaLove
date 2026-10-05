const User = require('../models/User');
const Report = require('../models/Report');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const randomMatchManager = require('../utils/randomMatchManager');

const adminController = {
  async getPlatformStats(req, res) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalMatches,
        totalMessages,
        pendingReports,
        recentUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Match.countDocuments(),
        Message.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalMatches,
          totalMessages,
          pendingReports,
          recentUsers,
          userActivity: totalUsers ? (activeUsers / totalUsers) * 100 : 0,
        },
      });
    } catch (error) {
      console.error('Get platform stats error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  async getRandomVideoMonitoring(req, res) {
    try {
      const snapshot = randomMatchManager.getMonitoringSnapshot();
      return res.json({ success: true, monitoring: snapshot });
    } catch (error) {
      console.error('Get random video monitoring error:', error);
      return res.status(500).json({ success: false, message: 'Unable to load monitoring data' });
    }
  },

  async getAdminOverview(req, res) {
    try {
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

      const [
        totalRevenue,
        monthRevenue,
        todayRevenue,
        activeSubscriptions,
        newUsersToday,
        newUsersMonth,
        totalUsers,
        failedPayments,
      ] = await Promise.all([
        Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.aggregate([{ $match: { status: 'paid', createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.aggregate([{ $match: { status: 'paid', createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Subscription.countDocuments({ status: 'active' }),
        User.countDocuments({ createdAt: { $gte: todayStart } }),
        User.countDocuments({ createdAt: { $gte: monthStart } }),
        User.countDocuments(),
        Payment.countDocuments({ status: 'failed' }),
      ]);

      return res.json({
        success: true,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        activeSubscriptions,
        newUsersToday,
        newUsersMonth,
        totalUsers,
        failedPayments,
      });
    } catch (error) {
      console.error('Get admin overview error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = adminController;

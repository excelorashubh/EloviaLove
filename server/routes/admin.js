const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const Match = require('../models/Match');
const Message = require('../models/Message');
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

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { emitNotificationChange } = require('../utils/notificationEvents');

const router = express.Router();
const isValidNotificationId = (id) => /^[a-f\d]{24}$/i.test(id);

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const requestedPage = req.query.page === undefined ? '1' : String(req.query.page);
    if (!/^\d+$/.test(requestedPage) || Number(requestedPage) < 1 || Number(requestedPage) > 10000) {
      return res.status(400).json({ success: false, message: 'Invalid page number' });
    }
    const page = Number(requestedPage);
    const limit = 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      user: req.user._id
    })
    .select('type title message relatedUser relatedMatch isRead readAt createdAt')
    .populate('relatedUser', 'name profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        hasMore: notifications.length === limit
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private
router.put('/:notificationId/read', protect, async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!isValidNotificationId(notificationId) || !mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (!notification.isRead) {
      await notification.markAsRead();
    }

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    emitNotificationChange(req.app.get('io'), req.user._id, 'notification:read', {
      id: notification._id.toString(),
      unreadCount,
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      unreadCount,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    emitNotificationChange(req.app.get('io'), req.user._id, 'notification:read-all', {
      unreadCount: 0,
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/notifications/:notificationId
// @desc    Delete a notification
// @access  Private
router.delete('/:notificationId', protect, async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!isValidNotificationId(notificationId) || !mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    emitNotificationChange(req.app.get('io'), req.user._id, 'notification:deleted', {
      id: notification._id.toString(),
      unreadCount,
    });

    res.json({
      success: true,
      message: 'Notification deleted',
      unreadCount,
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
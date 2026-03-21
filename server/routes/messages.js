const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/:userId
// @desc    Get messages between current user and another user
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    // Check if there's a match between users
    const match = await Match.findOne({
      users: { $all: [req.user._id, userId] }
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'You can only message matched users'
      });
    }

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profilePhoto')
    .populate('receiver', 'name profilePhoto');

    // Mark messages from the other user as read
    const updateResult = await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    // Notify the sender their messages were read
    if (updateResult.modifiedCount > 0) {
      const io = req.app.get('io');
      if (io) io.to(userId.toString()).emit('messages_read', { by: req.user._id });
    }

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages/:userId
// @desc    Send message to another user
// @access  Private
router.post('/:userId', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { content } = req.body;

    // Check if there's a match between users
    const match = await Match.findOne({
      users: { $all: [req.user._id, userId] }
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'You can only message matched users'
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      content
    });

    // Populate sender info
    await message.populate('sender', 'name profilePhoto');

    // Create notification for receiver
    await Notification.create({
      user: userId,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name} sent you a message`,
      relatedUser: req.user._id
    });

    // Emit the new message to the receiver via socket in real-time
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('private_message', {
        message: {
          _id: message._id,
          sender: message.sender,
          receiver: message.receiver,
          content: message.content,
          createdAt: message.createdAt,
          isRead: message.isRead,
        },
        from: req.user._id.toString(),
      });
    }

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        sender: message.sender,
        receiver: message.receiver,
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.isRead
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages
// @desc    Get user's conversations (recent messages with each match)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get all matches for the user
    const matches = await Match.find({
      users: req.user._id
    }).populate('users', 'name profilePhoto lastActive isActive');

    const conversations = [];

    for (const match of matches) {
      const otherUser = match.users.find(u => u._id.toString() !== req.user._id.toString());
      if (!otherUser) continue;

      // Get the most recent message in this conversation
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.user._id, receiver: otherUser._id },
          { sender: otherUser._id, receiver: req.user._id }
        ]
      })
      .sort({ createdAt: -1 })
      .populate('sender', 'name _id')
      .populate('receiver', 'name _id');

      // Count unread messages from this user
      const unreadCount = await Message.countDocuments({
        sender: otherUser._id,
        receiver: req.user._id,
        isRead: false
      });

      conversations.push({
        matchId: match._id,
        matchedAt: match.createdAt,
        otherUser: {
          id: otherUser._id,
          name: otherUser.name,
          profilePhoto: otherUser.profilePhoto,
          lastActive: otherUser.lastActive
        },
        lastMessage: lastMessage ? {
          id: lastMessage._id,
          content: lastMessage.content,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead
        } : null,
        unreadCount
      });
    }

    // Sort by most recent message
    conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
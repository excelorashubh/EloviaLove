const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { emitNotification } = require('../utils/notificationEvents');

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
      if (io) {
        const event = {
          by: req.user._id.toString(),
          from: userId.toString(),
          to: req.user._id.toString(),
        };
        io.to(userId.toString()).emit('messages_read', event);
        io.to(req.user._id.toString()).emit('messages_read', event);
        console.info('[messages] read receipt emitted', {
          from: event.from,
          to: event.to,
          messageCount: updateResult.modifiedCount,
        });
      }
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
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('clientMessageId').optional().trim().isLength({ min: 1, max: 64 })
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
    const { content, clientMessageId } = req.body;

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

    if (clientMessageId) {
      const previousMessage = await Message.findOne({
        sender: req.user._id,
        receiver: userId,
        clientMessageId
      })
        .populate('sender', 'name profilePhoto')
        .populate('receiver', 'name profilePhoto');
      if (previousMessage) {
        return res.status(200).json({
          success: true,
          message: {
            id: previousMessage._id,
            _id: previousMessage._id,
            clientMessageId: previousMessage.clientMessageId,
            sender: previousMessage.sender,
            receiver: previousMessage.receiver,
            content: previousMessage.content,
            createdAt: previousMessage.createdAt,
            isRead: previousMessage.isRead,
            readAt: previousMessage.readAt,
          }
        });
      }
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      content,
      ...(clientMessageId ? { clientMessageId } : {})
    });

    // Populate both participants so either side can render a new conversation immediately.
    await message.populate('sender', 'name profilePhoto');
    await message.populate('receiver', 'name profilePhoto');

    // Emit after the message is persisted, independently of notification storage.
    const io = req.app.get('io');
    if (io) {
      const event = {
        message: {
          _id: message._id,
          id: message._id,
          clientMessageId: message.clientMessageId,
          sender: message.sender,
          receiver: message.receiver,
          content: message.content,
          createdAt: message.createdAt,
          isRead: message.isRead,
        },
        from: req.user._id.toString(),
        to: userId.toString(),
      };
      io.to(userId.toString()).emit('private_message', event);
      io.to(req.user._id.toString()).emit('private_message', event);
      console.info('[messages] private_message emitted', {
        messageId: message._id.toString(),
        from: event.from,
        to: event.to,
      });
    } else {
      console.error('[messages] Socket.IO unavailable after message persistence', {
        messageId: message._id.toString(),
      });
    }

    try {
      const notification = await Notification.create({
        user: userId,
        type: 'message',
        title: 'New Message',
        message: `${req.user.name} sent you a message`,
        relatedUser: req.user._id
      });
      await emitNotification(io, notification);
    } catch (notificationError) {
      console.error('[messages] notification creation failed after message persistence', {
        messageId: message._id.toString(),
        receiverId: userId.toString(),
        error: notificationError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        _id: message._id,
        clientMessageId: message.clientMessageId,
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

// Mark messages in an authorized match as read without reloading conversation history.
router.post('/:userId/read', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const match = await Match.findOne({
      users: { $all: [req.user._id, userId] }
    }).select('_id');

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'You can only read messages from matched users'
      });
    }

    const result = await Message.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    const io = req.app.get('io');
    if (result.modifiedCount > 0 && io) {
      const event = {
        by: req.user._id.toString(),
        from: userId.toString(),
        to: req.user._id.toString(),
      };
      io.to(userId.toString()).emit('messages_read', event);
      io.to(req.user._id.toString()).emit('messages_read', event);
    }

    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:userId
// @desc    Clear messages between current user and another matched user
// @access  Private
router.delete('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const match = await Match.findOne({
      users: { $all: [req.user._id, userId] }
    }).select('_id');

    if (!match) {
      return res.status(403).json({
        success: false,
        message: 'You can only clear chats with matched users'
      });
    }

    await Message.deleteMany({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      const event = { userId: userId.toString(), by: req.user._id.toString() };
      io.to(userId.toString()).emit('messages_deleted', event);
      io.to(req.user._id.toString()).emit('messages_deleted', event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Clear messages error:', error);
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
    }).populate('users', 'name profilePhoto lastActive isActive isVerified');

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
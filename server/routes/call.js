const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const User = require('../models/User');
const Match = require('../models/Match');
const { authenticateToken } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════════════════════════
// VIDEO CALLING ROUTES - PRODUCTION READY
// ══════════════════════════════════════════════════════════════════════════════

// ── Initiate Call ─────────────────────────────────────────────────────────────
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { receiverId, callType = 'video' } = req.body;
    const callerId = req.user.userId;

    // Validation
    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    if (callerId === receiverId) {
      return res.status(400).json({ error: 'Cannot call yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if users are matched (platform rule)
    const match = await Match.findOne({
      $or: [
        { user1: callerId, user2: receiverId, status: 'accepted' },
        { user1: receiverId, user2: callerId, status: 'accepted' }
      ]
    });

    if (!match) {
      return res.status(403).json({ error: 'You can only call matched users' });
    }

    // Check if receiver has video calls enabled
    if (receiver.settings?.videoCallsDisabled) {
      return res.status(403).json({ error: 'This user has disabled video calls' });
    }

    // Check for active calls
    const activeCall = await Call.findOne({
      $or: [
        { callerId, status: { $in: ['initiated', 'ringing', 'accepted'] } },
        { receiverId: callerId, status: { $in: ['initiated', 'ringing', 'accepted'] } },
        { callerId: receiverId, status: { $in: ['initiated', 'ringing', 'accepted'] } },
        { receiverId, status: { $in: ['initiated', 'ringing', 'accepted'] } }
      ]
    });

    if (activeCall) {
      return res.status(409).json({ error: 'User is already in a call', status: 'busy' });
    }

    // Create call record
    const call = new Call({
      callerId,
      receiverId,
      callType,
      status: 'initiated'
    });

    await call.save();

    // Populate user details
    await call.populate([
      { path: 'callerId', select: 'name profilePicture isVerified' },
      { path: 'receiverId', select: 'name profilePicture isVerified' }
    ]);

    res.status(201).json({
      success: true,
      call: call
    });

  } catch (error) {
    console.error('Call initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// ── Accept Call ───────────────────────────────────────────────────────────────
router.post('/accept/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;

    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Verify user is the receiver
    if (call.receiverId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to accept this call' });
    }

    // Check call status
    if (call.status !== 'initiated' && call.status !== 'ringing') {
      return res.status(400).json({ error: 'Call cannot be accepted', status: call.status });
    }

    // Update call
    call.status = 'accepted';
    call.startedAt = new Date();
    await call.save();

    await call.populate([
      { path: 'callerId', select: 'name profilePicture isVerified' },
      { path: 'receiverId', select: 'name profilePicture isVerified' }
    ]);

    res.json({
      success: true,
      call
    });

  } catch (error) {
    console.error('Call acceptance error:', error);
    res.status(500).json({ error: 'Failed to accept call' });
  }
});

// ── Reject Call ───────────────────────────────────────────────────────────────
router.post('/reject/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;

    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Verify user is the receiver
    if (call.receiverId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to reject this call' });
    }

    // Update call
    call.status = 'rejected';
    call.endedAt = new Date();
    call.endReason = 'declined';
    await call.save();

    res.json({
      success: true,
      message: 'Call rejected'
    });

  } catch (error) {
    console.error('Call rejection error:', error);
    res.status(500).json({ error: 'Failed to reject call' });
  }
});

// ── End Call ──────────────────────────────────────────────────────────────────
router.post('/end/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;
    const { reason = 'completed', quality } = req.body;

    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Verify user is part of the call
    const isParticipant = call.callerId.toString() === userId || 
                          call.receiverId.toString() === userId;
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized to end this call' });
    }

    // Update call
    call.endedAt = new Date();
    call.status = 'completed';
    call.endReason = reason;
    
    if (quality) {
      call.quality = quality;
    }
    
    call.calculateDuration();
    await call.save();

    res.json({
      success: true,
      message: 'Call ended',
      duration: call.duration
    });

  } catch (error) {
    console.error('Call end error:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

// ── Cancel Call (Before Answer) ───────────────────────────────────────────────
router.post('/cancel/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;

    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Verify user is the caller
    if (call.callerId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this call' });
    }

    // Can only cancel if not answered
    if (call.status === 'accepted') {
      return res.status(400).json({ error: 'Cannot cancel an active call. Use end call instead.' });
    }

    // Update call
    call.status = 'cancelled';
    call.endedAt = new Date();
    call.endReason = 'cancelled';
    await call.save();

    res.json({
      success: true,
      message: 'Call cancelled'
    });

  } catch (error) {
    console.error('Call cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel call' });
  }
});

// ── Mark as Missed ────────────────────────────────────────────────────────────
router.post('/missed/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Update call
    call.status = 'missed';
    call.endedAt = new Date();
    call.endReason = 'missed';
    await call.save();

    res.json({
      success: true,
      message: 'Call marked as missed'
    });

  } catch (error) {
    console.error('Call missed marking error:', error);
    res.status(500).json({ error: 'Failed to mark call as missed' });
  }
});

// ── Get Call History ──────────────────────────────────────────────────────────
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0, type = 'all' } = req.query;

    const query = {
      $or: [
        { callerId: userId },
        { receiverId: userId }
      ]
    };

    // Filter by type
    if (type === 'missed') {
      query.receiverId = userId;
      query.status = 'missed';
    } else if (type === 'outgoing') {
      query.callerId = userId;
    } else if (type === 'incoming') {
      query.receiverId = userId;
    }

    const calls = await Call.find(query)
      .populate('callerId', 'name profilePicture isVerified')
      .populate('receiverId', 'name profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const total = await Call.countDocuments(query);

    res.json({
      success: true,
      calls,
      total,
      hasMore: total > parseInt(offset) + parseInt(limit)
    });

  } catch (error) {
    console.error('Call history error:', error);
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

// ── Get Missed Calls Count ────────────────────────────────────────────────────
router.get('/missed-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Call.getMissedCallsCount(userId);

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Missed calls count error:', error);
    res.status(500).json({ error: 'Failed to fetch missed calls count' });
  }
});

// ── Check Call Permission ─────────────────────────────────────────────────────
router.get('/can-call/:userId', authenticateToken, async (req, res) => {
  try {
    const callerId = req.user.userId;
    const { userId: receiverId } = req.params;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.json({ canCall: false, reason: 'User not found' });
    }

    // Check if users are matched
    const match = await Match.findOne({
      $or: [
        { user1: callerId, user2: receiverId, status: 'accepted' },
        { user1: receiverId, user2: callerId, status: 'accepted' }
      ]
    });

    if (!match) {
      return res.json({ canCall: false, reason: 'Not matched' });
    }

    // Check if receiver has video calls enabled
    if (receiver.settings?.videoCallsDisabled) {
      return res.json({ canCall: false, reason: 'Video calls disabled' });
    }

    // Check for active calls
    const activeCall = await Call.findOne({
      $or: [
        { callerId: receiverId, status: { $in: ['initiated', 'ringing', 'accepted'] } },
        { receiverId, status: { $in: ['initiated', 'ringing', 'accepted'] } }
      ]
    });

    if (activeCall) {
      return res.json({ canCall: false, reason: 'User is busy' });
    }

    res.json({ canCall: true });

  } catch (error) {
    console.error('Call permission check error:', error);
    res.status(500).json({ error: 'Failed to check call permission' });
  }
});

module.exports = router;

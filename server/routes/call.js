const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const User = require('../models/User');
const Match = require('../models/Match');
const { authenticateToken } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════════════════════════
// VIDEO CALLING ROUTES - PRODUCTION READY
// ══════════════════════════════════════════════════════════════════════════════

// ── Initiate Call (WITH COMPREHENSIVE SECURITY) ───────────────────────────────
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { receiverId, callType = 'video' } = req.body;
    const callerId = req.user._id;

    console.log(`[API] [Call Initiate] User ${callerId} attempting to call ${receiverId} (type: ${callType})`);

    // Validation
    if (!receiverId) {
      return res.status(400).json({ 
        success: false,
        error: 'Receiver ID is required' 
      });
    }

    if (callerId.toString() === receiverId) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot call yourself' 
      });
    }

    // Get both users
    const [caller, receiver] = await Promise.all([
      User.findById(callerId),
      User.findById(receiverId)
    ]);

    if (!receiver) {
      console.log(`[API] [Call Initiate] Receiver ${receiverId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // SECURITY CHECKS (Same as can-call endpoint)
    
    // 1. Check if caller is banned
    if (caller.callStats?.isBannedFromCalling) {
      const banExpiry = caller.callStats.callBanExpiry;
      if (banExpiry && banExpiry > new Date()) {
        console.log(`[API] [Call Initiate] Caller ${callerId} is banned until ${banExpiry}`);
        return res.status(403).json({ 
          success: false,
          error: 'You are temporarily banned from making calls' 
        });
      }
    }

    // 2. Check if receiver is suspended
    if (!receiver.isActive) {
      console.log(`[API] [Call Initiate] Receiver ${receiverId} account suspended`);
      return res.status(403).json({ 
        success: false,
        error: 'This user account is suspended' 
      });
    }

    // 3. Check if users are matched
    const match = await Match.findOne({
      users: { $all: [callerId, receiverId] }
    });

    if (!match) {
      console.log(`[API] [Call Initiate] Users ${callerId} and ${receiverId} not matched`);
      return res.status(403).json({ 
        success: false,
        error: 'You can only call matched users',
        code: 'NOT_MATCHED'
      });
    }

    // 4. Check if either user has blocked the other
    if (caller.blockedUsers?.includes(receiverId) || receiver.blockedUsers?.includes(callerId)) {
      console.log(`[API] [Call Initiate] Block exists between ${callerId} and ${receiverId}`);
      return res.status(403).json({ 
        success: false,
        error: 'Cannot call blocked users' 
      });
    }

    // 5. Check receiver privacy settings
    if (receiver.privacy?.videoCalls?.enabled === false) {
      console.log(`[API] [Call Initiate] Receiver ${receiverId} has video calls disabled`);
      return res.status(403).json({ 
        success: false,
        error: 'This user has disabled incoming video calls',
        code: 'CALLS_DISABLED'
      });
    }

    // 6. Check verification requirement
    if (receiver.privacy?.videoCalls?.verifiedOnly && !caller.isVerified) {
      console.log(`[API] [Call Initiate] Receiver requires verification, caller ${callerId} not verified`);
      return res.status(403).json({
        success: false,
        error: 'This user only accepts calls from verified members',
        code: 'VERIFICATION_REQUIRED'
      });
    }

    // 7. Check spam limits
    const spamCheck = await Call.checkSpamLimit(callerId);
    if (!spamCheck.allowed) {
      console.log(`[API] [Call Initiate] Spam limit reached for ${callerId}: ${spamCheck.reason}`);
      return res.status(429).json({ 
        success: false,
        error: spamCheck.reason,
        code: 'SPAM_LIMIT'
      });
    }

    // 8. Check cooldown
    const cooldownCheck = await Call.checkCooldown(callerId, receiverId);
    if (!cooldownCheck.allowed) {
      console.log(`[API] [Call Initiate] Cooldown active for ${callerId} calling ${receiverId}`);
      return res.status(429).json({
        success: false,
        error: cooldownCheck.reason,
        code: 'COOLDOWN'
      });
    }

    // 9. Check for active calls (with stale call cleanup)
    await Call.cleanupStaleCallsForUser(callerId);
    await Call.cleanupStaleCallsForUser(receiverId);
    
    const [callerActiveCall, receiverActiveCall] = await Promise.all([
      Call.hasActiveCall(callerId),
      Call.hasActiveCall(receiverId)
    ]);

    if (callerActiveCall) {
      console.log(`[API] [Call Initiate] Caller ${callerId} already in call ${callerActiveCall._id}`);
      return res.status(409).json({ 
        success: false,
        error: 'You are already in a call', 
        status: 'busy',
        code: 'BUSY'
      });
    }

    if (receiverActiveCall) {
      console.log(`[API] [Call Initiate] Receiver ${receiverId} already in call ${receiverActiveCall._id}`);
      return res.status(409).json({ 
        success: false,
        error: 'User is already in a call', 
        status: 'busy',
        code: 'BUSY'
      });
    }

    // ALL CHECKS PASSED - Create call record
    const call = new Call({
      callerId,
      receiverId,
      callType,
      status: 'initiated'
    });

    await call.save();

    console.log(`[API] [Call Initiate] Call ${call._id} created successfully (status: initiated)`);

    // Update caller stats
    await User.findByIdAndUpdate(callerId, {
      $inc: { 'callStats.callsInitiatedToday': 1 },
      $set: { 'callStats.lastCallAt': new Date() }
    });

    // Populate user details
    await call.populate([
      { path: 'callerId', select: 'name profilePhoto isVerified' },
      { path: 'receiverId', select: 'name profilePhoto isVerified' }
    ]);

    res.status(201).json({
      success: true,
      call: call
    });

  } catch (error) {
    console.error('[API] [Call Initiate] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initiate call' 
    });
  }
});

// ── Accept Call ───────────────────────────────────────────────────────────────
router.post('/accept/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    console.log(`[API] [Call Accept] User ${userId} attempting to accept call ${callId}`);

    const call = await Call.findById(callId);
    
    if (!call) {
      console.log(`[API] [Call Accept] Call ${callId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Call not found' 
      });
    }

    // Verify user is the receiver
    if (call.receiverId.toString() !== userId.toString()) {
      console.log(`[API] [Call Accept] User ${userId} unauthorized to accept call ${callId} (receiver: ${call.receiverId})`);
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to accept this call' 
      });
    }

    // Check call status
    if (call.status !== 'initiated' && call.status !== 'ringing') {
      console.log(`[API] [Call Accept] Call ${callId} cannot be accepted (status: ${call.status})`);
      return res.status(400).json({ 
        success: false,
        error: 'Call cannot be accepted', 
        status: call.status 
      });
    }

    // Update call
    const previousStatus = call.status;
    call.status = 'accepted';
    call.startedAt = new Date();
    await call.save();

    await call.populate([
      { path: 'callerId', select: 'name profilePhoto isVerified' },
      { path: 'receiverId', select: 'name profilePhoto isVerified' }
    ]);

    console.log(`[API] [Call Accept] Call ${callId} accepted successfully (was ${previousStatus})`);

    res.json({
      success: true,
      call
    });

  } catch (error) {
    console.error('[API] [Call Accept] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to accept call' 
    });
  }
});

// ── Reject Call ───────────────────────────────────────────────────────────────
router.post('/reject/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    console.log(`[API] [Call Reject] User ${userId} attempting to reject call ${callId}`);

    const call = await Call.findById(callId);
    
    if (!call) {
      console.log(`[API] [Call Reject] Call ${callId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Call not found' 
      });
    }

    // Verify user is the receiver
    if (call.receiverId.toString() !== userId.toString()) {
      console.log(`[API] [Call Reject] User ${userId} unauthorized to reject call ${callId} (receiver: ${call.receiverId})`);
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to reject this call' 
      });
    }

    // Update call
    const previousStatus = call.status;
    call.status = 'rejected';
    call.endedAt = new Date();
    call.endReason = 'declined';
    await call.save();

    console.log(`[API] [Call Reject] Call ${callId} rejected successfully (was ${previousStatus})`);
    console.log(`[API] [Call Cleanup] User ${call.callerId} (caller) released from call state`);
    console.log(`[API] [Call Cleanup] User ${userId} (receiver) released from call state`);

    res.json({
      success: true,
      message: 'Call rejected'
    });

  } catch (error) {
    console.error('[API] [Call Reject] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject call' 
    });
  }
});

// ── End Call ──────────────────────────────────────────────────────────────────
router.post('/end/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;
    const { reason = 'completed', quality } = req.body;

    console.log(`[API] [Call End] User ${userId} attempting to end call ${callId} (reason: ${reason})`);

    const call = await Call.findById(callId);
    
    if (!call) {
      console.log(`[API] [Call End] Call ${callId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Call not found' 
      });
    }

    // Verify user is part of the call
    const isParticipant = call.callerId.toString() === userId.toString() || 
                          call.receiverId.toString() === userId.toString();
    
    if (!isParticipant) {
      console.log(`[API] [Call End] User ${userId} unauthorized to end call ${callId}`);
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to end this call' 
      });
    }

    // Update call
    const previousStatus = call.status;
    call.endedAt = new Date();
    call.status = 'completed';
    call.endReason = reason;
    
    if (quality) {
      call.quality = quality;
    }
    
    call.calculateDuration();
    await call.save();

    console.log(`[API] [Call End] Call ${callId} ended successfully (was ${previousStatus}, duration: ${call.duration}s)`);
    console.log(`[API] [Call Cleanup] User ${call.callerId} (caller) released from call state`);
    console.log(`[API] [Call Cleanup] User ${call.receiverId} (receiver) released from call state`);

    res.json({
      success: true,
      message: 'Call ended',
      duration: call.duration
    });

  } catch (error) {
    console.error('[API] [Call End] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to end call' 
    });
  }
});

// ── Cancel Call (Before Answer) ───────────────────────────────────────────────
router.post('/cancel/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    console.log(`[API] [Call Cancel] User ${userId} attempting to cancel call ${callId}`);

    const call = await Call.findById(callId);
    
    if (!call) {
      console.log(`[API] [Call Cancel] Call ${callId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Call not found' 
      });
    }

    // Verify user is the caller
    if (call.callerId.toString() !== userId.toString()) {
      console.log(`[API] [Call Cancel] User ${userId} unauthorized to cancel call ${callId} (caller: ${call.callerId})`);
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to cancel this call' 
      });
    }

    // Can only cancel if not answered
    if (call.status === 'accepted') {
      console.log(`[API] [Call Cancel] Cannot cancel accepted call ${callId}`);
      return res.status(400).json({ 
        success: false,
        error: 'Cannot cancel an active call. Use end call instead.' 
      });
    }

    // Update call
    const previousStatus = call.status;
    call.status = 'cancelled';
    call.endedAt = new Date();
    call.endReason = 'cancelled';
    await call.save();

    console.log(`[API] [Call Cancel] Call ${callId} cancelled successfully (was ${previousStatus})`);
    console.log(`[API] [Call Cleanup] User ${userId} (caller) released from call state`);
    console.log(`[API] [Call Cleanup] User ${call.receiverId} (receiver) released from call state`);

    res.json({
      success: true,
      message: 'Call cancelled'
    });

  } catch (error) {
    console.error('[API] [Call Cancel] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel call' 
    });
  }
});

// ── Mark as Missed ────────────────────────────────────────────────────────────
router.post('/missed/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;

    console.log(`[API] [Call Missed] Marking call ${callId} as missed`);

    const call = await Call.findById(callId);
    
    if (!call) {
      console.log(`[API] [Call Missed] Call ${callId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Call not found' 
      });
    }

    // Update call
    const previousStatus = call.status;
    call.status = 'missed';
    call.endedAt = new Date();
    call.endReason = 'missed';
    await call.save();

    console.log(`[API] [Call Missed] Call ${callId} marked as missed (was ${previousStatus})`);
    console.log(`[API] [Call Cleanup] User ${call.callerId} (caller) released from call state`);
    console.log(`[API] [Call Cleanup] User ${call.receiverId} (receiver) released from call state`);

    res.json({
      success: true,
      message: 'Call marked as missed'
    });

  } catch (error) {
    console.error('[API] [Call Missed] Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mark call as missed' 
    });
  }
});

// ── Get Call History ──────────────────────────────────────────────────────────
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
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
      .populate('callerId', 'name profilePhoto isVerified')
      .populate('receiverId', 'name profilePhoto isVerified')
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
    const userId = req.user._id;

    const count = await Call.getMissedCallsCount(userId);

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('[API] Missed calls count error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch missed calls count',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ── Check Call Permission (COMPREHENSIVE) ─────────────────────────────────────
router.get('/can-call/:userId', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  const callerId = req.user._id;
  const { userId: receiverId } = req.params;

  let caller = null;
  let receiver = null;
  let match = null;
  let finalDecision = { canCall: false, reason: 'Pending verification' };

  const sendResponse = (statusCode, responseData) => {
    const duration = Date.now() - startTime;
    finalDecision = {
      canCall: responseData.canCall,
      reason: responseData.reason || responseData.error || null
    };

    console.log(`[API] [Call Permission Check]
  - Authenticated User (Caller): ${callerId} (Verified: ${caller?.isVerified ?? 'N/A'})
  - Target User (Receiver): ${receiverId} (Verified: ${receiver?.isVerified ?? 'N/A'})
  - Match Status: ${match ? 'Matched' : 'Not Matched'}
  - Block Status: Caller Blocked Receiver: ${caller?.blockedUsers?.includes(receiverId) ?? 'N/A'}, Receiver Blocked Caller: ${receiver?.blockedUsers?.includes(callerId) ?? 'N/A'}
  - Privacy Settings: Video Calls Enabled: ${receiver?.privacy?.videoCalls?.enabled ?? 'N/A'}, Verified Only: ${receiver?.privacy?.videoCalls?.verifiedOnly ?? 'N/A'}
  - Verification Status: Caller: ${caller?.isVerified ?? 'N/A'}, Receiver: ${receiver?.isVerified ?? 'N/A'}
  - Database Result: Caller Found: ${!!caller}, Receiver Found: ${!!receiver}, Match Found: ${!!match}
  - Final Permission Decision: Can Call = ${finalDecision.canCall}, Reason = "${finalDecision.reason}"
  - Response Time: ${duration}ms`);

    return res.status(statusCode).json(responseData);
  };

  try {
    // Validate receiverId
    if (!receiverId) {
      return sendResponse(400, {
        success: false,
        canCall: false,
        reason: 'Invalid user ID',
        shortReason: 'Error',
        icon: 'error'
      });
    }

    // Get both users
    [caller, receiver] = await Promise.all([
      User.findById(callerId),
      User.findById(receiverId)
    ]);

    // 1. Check if caller exists
    if (!caller) {
      return sendResponse(404, {
        success: false,
        canCall: false,
        reason: 'Your account was not found',
        shortReason: 'Error',
        icon: 'error'
      });
    }

    // 2. Check if receiver exists
    if (!receiver) {
      return sendResponse(200, { 
        success: true,
        canCall: false, 
        reason: 'User not found',
        shortReason: 'Unavailable',
        icon: 'error'
      });
    }

    // 3. Check if caller is banned from calling
    if (caller.callStats?.isBannedFromCalling) {
      const banExpiry = caller.callStats.callBanExpiry;
      if (banExpiry && banExpiry > new Date()) {
        return sendResponse(200, {
          success: true,
          canCall: false,
          reason: 'You are temporarily banned from making calls due to spam reports',
          shortReason: 'Banned',
          icon: 'ban'
        });
      }
    }

    // 4. Check if receiver is suspended
    if (!receiver.isActive) {
      return sendResponse(200, {
        success: true,
        canCall: false,
        reason: 'This user account is currently suspended',
        shortReason: 'Suspended',
        icon: 'shield'
      });
    }

    // 5. Check if users are matched (CRITICAL REQUIREMENT)
    match = await Match.findOne({
      users: { $all: [callerId, receiverId] }
    });

    if (!match) {
      return sendResponse(200, { 
        success: true,
        canCall: false, 
        reason: 'Users must be matched before starting a video call.',
        shortReason: 'Not Matched',
        icon: 'lock'
      });
    }

    // 6. Check if either user has blocked the other
    if (caller.blockedUsers?.includes(receiverId) || receiver.blockedUsers?.includes(callerId)) {
      return sendResponse(200, {
        success: true,
        canCall: false,
        reason: 'Cannot call blocked users',
        shortReason: 'Blocked',
        icon: 'block'
      });
    }

    // 7. Check receiver's privacy settings - video calls enabled
    if (receiver.privacy?.videoCalls?.enabled === false) {
      return sendResponse(200, { 
        success: true,
        canCall: false, 
        reason: 'This member has disabled incoming video calls',
        shortReason: 'Calls Disabled',
        icon: 'lock'
      });
    }

    // 8. Check if receiver requires verified callers only
    if (receiver.privacy?.videoCalls?.verifiedOnly && !caller.isVerified) {
      return sendResponse(200, {
        success: true,
        canCall: false,
        reason: 'This user only accepts calls from verified members. Complete verification to call.',
        shortReason: 'Verification Required',
        icon: 'shield'
      });
    }

    // 9. Check spam limits
    const spamCheck = await Call.checkSpamLimit(callerId);
    if (!spamCheck.allowed) {
      return sendResponse(200, {
        success: true,
        canCall: false,
        reason: spamCheck.reason,
        shortReason: 'Limit Reached',
        icon: 'ban'
      });
    }

    // 10. Check cooldown period (prevent repeated calling same person)
    const cooldownCheck = await Call.checkCooldown(callerId, receiverId);
    if (!cooldownCheck.allowed) {
      return sendResponse(200, {
        success: true,
        canCall: false,
        reason: cooldownCheck.reason,
        shortReason: 'Wait',
        icon: 'clock'
      });
    }

    // 11. Check if receiver is already in another call (with stale call cleanup)
    await Call.cleanupStaleCallsForUser(receiverId);
    const receiverActiveCall = await Call.hasActiveCall(receiverId);

    if (receiverActiveCall) {
      return sendResponse(200, { 
        success: true,
        canCall: false, 
        reason: 'The user is currently in another call',
        shortReason: 'Busy',
        icon: 'clock'
      });
    }

    // 12. Check if caller is already in another call (with stale call cleanup)
    await Call.cleanupStaleCallsForUser(callerId);
    const callerActiveCall = await Call.hasActiveCall(callerId);

    if (callerActiveCall) {
      return sendResponse(200, {
        success: true,
        canCall: false,
        reason: 'You are already in another call',
        shortReason: 'In Call',
        icon: 'clock'
      });
    }

    // ALL CHECKS PASSED ✓
    return sendResponse(200, { 
      success: true,
      canCall: true,
      reason: null,
      receiverInfo: {
        name: receiver.name,
        profilePicture: receiver.profilePhoto,
        isVerified: receiver.isVerified
      }
    });

  } catch (error) {
    console.error('[API] Call permission check error details:', error.stack);
    return sendResponse(500, { 
      success: false,
      canCall: false,
      error: 'Failed to check call permission',
      reason: 'We couldn\'t verify calling permissions right now. Please try again in a moment.',
      shortReason: 'Error',
      icon: 'error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ── Report Call as Spam ───────────────────────────────────────────────────────
router.post('/report/:callId', authenticateToken, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const call = await Call.findById(callId);
    
    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Verify user was part of the call
    const isParticipant = call.callerId.toString() === userId || 
                          call.receiverId.toString() === userId;
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized to report this call' });
    }

    // Mark call as spam
    call.metadata.isSpam = true;
    call.metadata.reportReason = reason;
    if (!call.metadata.reportedBy) {
      call.metadata.reportedBy = [];
    }
    call.metadata.reportedBy.push(userId);
    await call.save();

    // Increment spam score of the other user
    const reportedUserId = call.callerId.toString() === userId 
      ? call.receiverId 
      : call.callerId;
    
    const reportedUser = await User.findById(reportedUserId);
    if (reportedUser) {
      reportedUser.callStats = reportedUser.callStats || {};
      reportedUser.callStats.spamScore = (reportedUser.callStats.spamScore || 0) + 1;
      
      // Ban if spam score exceeds threshold
      if (reportedUser.callStats.spamScore >= 5) {
        reportedUser.callStats.isBannedFromCalling = true;
        reportedUser.callStats.callBanExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      }
      
      await reportedUser.save();
    }

    res.json({
      success: true,
      message: 'Call reported successfully'
    });

  } catch (error) {
    console.error('Call report error:', error);
    res.status(500).json({ error: 'Failed to report call' });
  }
});

// ── Update Privacy Settings ───────────────────────────────────────────────────
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoCalls, voiceCalls, cameraDefaultOn, microphoneDefaultOn, muteIncomingCalls } = req.body;

    const updateData = {};
    
    if (videoCalls !== undefined) {
      updateData['privacy.videoCalls'] = videoCalls;
    }
    if (voiceCalls !== undefined) {
      updateData['privacy.voiceCalls'] = voiceCalls;
    }
    if (cameraDefaultOn !== undefined) {
      updateData['privacy.cameraDefaultOn'] = cameraDefaultOn;
    }
    if (microphoneDefaultOn !== undefined) {
      updateData['privacy.microphoneDefaultOn'] = microphoneDefaultOn;
    }
    if (muteIncomingCalls !== undefined) {
      updateData['privacy.muteIncomingCalls'] = muteIncomingCalls;
    }

    await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    res.json({
      success: true,
      message: 'Privacy settings updated'
    });

  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ── Get Privacy Settings ──────────────────────────────────────────────────────
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('privacy');

    res.json({
      success: true,
      settings: user.privacy || {
        videoCalls: { enabled: true, matchesOnly: true, verifiedOnly: false },
        voiceCalls: { enabled: true, matchesOnly: true, verifiedOnly: false },
        cameraDefaultOn: true,
        microphoneDefaultOn: true,
        muteIncomingCalls: false
      }
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;


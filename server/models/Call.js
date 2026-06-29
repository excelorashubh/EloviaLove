const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  callType: {
    type: String,
    enum: ['video', 'audio'],
    required: true,
    default: 'video'
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'accepted', 'completed', 'missed', 'rejected', 'cancelled', 'failed', 'busy'],
    required: true,
    default: 'initiated',
    index: true
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: null
  },
  endReason: {
    type: String,
    enum: ['completed', 'timeout', 'declined', 'cancelled', 'network_error', 'busy', 'missed'],
    default: null
  },
  metadata: {
    callerLocation: String,
    receiverLocation: String,
    network: {
      callerConnection: String,
      receiverConnection: String
    },
    seen: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reportReason: String,
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ receiverId: 1, createdAt: -1 });
callSchema.index({ status: 1, createdAt: -1 });
callSchema.index({ callerId: 1, receiverId: 1, createdAt: -1 });

// Virtual for call history display
callSchema.virtual('isIncoming').get(function() {
  return this.receiverId.toString();
});

// Method to calculate duration
callSchema.methods.calculateDuration = function() {
  if (this.startedAt && this.endedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return this.duration;
};

// Method to end call
callSchema.methods.endCall = function(reason = 'completed') {
  this.endedAt = new Date();
  this.status = 'completed';
  this.endReason = reason;
  this.calculateDuration();
  return this.save();
};

// Static method to get call history
callSchema.statics.getCallHistory = async function(userId, limit = 50) {
  return this.find({
    $or: [
      { callerId: userId },
      { receiverId: userId }
    ]
  })
  .populate('callerId', 'name profilePhoto isVerified')
  .populate('receiverId', 'name profilePhoto isVerified')
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
};

// Static method to get missed calls count
callSchema.statics.getMissedCallsCount = async function(userId) {
  return this.countDocuments({
    receiverId: userId,
    status: 'missed'
  });
};

// Static method to mark missed calls as seen
callSchema.statics.markMissedCallsAsSeen = async function(userId) {
  return this.updateMany(
    { receiverId: userId, status: 'missed' },
    { $set: { 'metadata.seen': true } }
  );
};

// Static method to check spam limits
callSchema.statics.checkSpamLimit = async function(callerId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const callsToday = await this.countDocuments({
    callerId,
    createdAt: { $gte: today }
  });
  
  const rejectionsToday = await this.countDocuments({
    callerId,
    status: 'rejected',
    createdAt: { $gte: today }
  });
  
  // Limits: 50 calls per day, or more than 10 rejections
  if (callsToday >= 50) {
    return { allowed: false, reason: 'Daily call limit reached (50 calls)' };
  }
  
  if (rejectionsToday >= 10) {
    return { allowed: false, reason: 'Too many rejected calls today. Try again tomorrow.' };
  }
  
  return { allowed: true };
};

// Static method to check for active calls (with stale call prevention)
callSchema.statics.hasActiveCall = async function(userId) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  
  // Find any active call for this user created within last 2 minutes
  const activeCall = await this.findOne({
    $or: [
      { callerId: userId, status: { $in: ['initiated', 'ringing', 'accepted'] } },
      { receiverId: userId, status: { $in: ['initiated', 'ringing', 'accepted'] } }
    ],
    createdAt: { $gte: twoMinutesAgo } // Only consider recent calls
  });

  return activeCall;
};

// Static method to cleanup stale calls for a specific user
callSchema.statics.cleanupStaleCallsForUser = async function(userId) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  
  // Find stale calls (older than 2 minutes and still in active state)
  const staleCalls = await this.find({
    $or: [
      { callerId: userId, status: { $in: ['initiated', 'ringing'] } },
      { receiverId: userId, status: { $in: ['initiated', 'ringing'] } }
    ],
    createdAt: { $lt: twoMinutesAgo }
  });

  let cleanedCount = 0;
  for (const call of staleCalls) {
    if (call.status === 'ringing') {
      call.status = 'missed';
      call.endReason = 'timeout';
    } else {
      call.status = 'cancelled';
      call.endReason = 'timeout';
    }
    call.endedAt = new Date();
    await call.save();
    cleanedCount++;
  }

  if (cleanedCount > 0) {
    console.log(`[Call Model] Cleaned up ${cleanedCount} stale calls for user ${userId}`);
  }

  return cleanedCount;
};

// Static method to check cooldown (prevent spam calling same person)
callSchema.statics.checkCooldown = async function(callerId, receiverId) {
  const lastCall = await this.findOne({
    callerId,
    receiverId,
    status: { $in: ['rejected', 'missed', 'cancelled'] }
  }).sort({ createdAt: -1 });
  
  if (lastCall) {
    const timeSinceLastCall = Date.now() - lastCall.createdAt.getTime();
    const cooldownMinutes = 15;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    
    if (timeSinceLastCall < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastCall) / 60000);
      return {
        allowed: false,
        reason: `Please wait ${remainingMinutes} minute(s) before calling again`
      };
    }
  }
  
  return { allowed: true };
};

// Pre-save hook to validate call data
callSchema.pre('save', function(next) {
  // Prevent calling yourself
  if (this.callerId.toString() === this.receiverId.toString()) {
    next(new Error('Cannot call yourself'));
    return;
  }
  
  // Calculate duration if ended
  if (this.endedAt && this.startedAt) {
    this.calculateDuration();
  }
  
  next();
});

const Call = mongoose.model('Call', callSchema);

module.exports = Call;

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
    }
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
  .populate('callerId', 'name profilePicture isVerified')
  .populate('receiverId', 'name profilePicture isVerified')
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

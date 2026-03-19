const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure users array has exactly 2 users and they are unique
matchSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    return next(new Error('Match must have exactly 2 users'));
  }
  if (this.users[0].toString() === this.users[1].toString()) {
    return next(new Error('Users cannot match with themselves'));
  }
  next();
});

// Compound index for efficient lookups
matchSchema.index({ users: 1 });

// Virtual for the other user in a match
matchSchema.methods.getOtherUser = function(userId) {
  return this.users.find(user => user.toString() !== userId.toString());
};

module.exports = mongoose.model('Match', matchSchema);
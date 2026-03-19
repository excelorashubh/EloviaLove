const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'pass'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate likes
likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

// Index for efficient queries
likeSchema.index({ fromUser: 1, type: 1 });
likeSchema.index({ toUser: 1, type: 1 });

module.exports = mongoose.model('Like', likeSchema);
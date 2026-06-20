const mongoose = require('mongoose');
const crypto = require('crypto');

const contactMessageSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot be more than 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    minlength: [5, 'Subject must have at least 5 characters'],
    maxlength: [120, 'Subject cannot be more than 120 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [15, 'Message must have at least 15 characters'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['New', 'Read', 'Replied', 'Archived'],
    default: 'New',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High'],
    default: 'Normal',
    index: true
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },
  ipAddress: {
    type: String,
    trim: true,
    default: ''
  },
  userAgent: {
    type: String,
    trim: true,
    default: ''
  },
  readAt: {
    type: Date,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  replyText: {
    type: String,
    trim: true,
    default: ''
  },
}, {
  timestamps: true
});

contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ phone: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ fullName: 'text', email: 'text', phone: 'text', subject: 'text', message: 'text' });

contactMessageSchema.methods.markAsRead = function() {
  this.status = this.status === 'Archived' ? 'Archived' : 'Read';
  this.readAt = new Date();
  return this.save({ validateBeforeSave: false });
};

contactMessageSchema.methods.markAsReplied = function(replyText) {
  this.status = 'Replied';
  this.repliedAt = new Date();
  if (replyText) this.replyText = replyText;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

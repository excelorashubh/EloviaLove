const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitorId:  { type: String, required: true, index: true },
  ip:         { type: String },
  userAgent:  { type: String },
  page:       { type: String, default: '/' },
  device:     { type: String, enum: ['mobile', 'desktop', 'tablet'], default: 'desktop' },
  visitedAt:  { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Visitor', visitorSchema);

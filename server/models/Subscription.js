const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:      { type: String, enum: ['basic', 'premium', 'pro'], required: true },
  status:    { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  paymentId: { type: String },
  orderId:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

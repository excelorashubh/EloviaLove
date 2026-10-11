const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:      { type: String, required: true },
  amount:    { type: Number, required: true },
  amountPaise: { type: Number },
  currency:  { type: String, default: 'INR' },
  itemType:  { type: String, enum: ['subscription', 'addon'], default: 'subscription' },
  durationDays: { type: Number },
  orderId:   { type: String, required: true },
  paymentId: { type: String },
  paymentMethod: { type: String },
  status:    { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

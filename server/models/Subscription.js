const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:             { type: String, enum: ['basic', 'premium', 'pro'], required: true },
  status:           { type: String, enum: ['active', 'pending', 'expired', 'cancelled', 'completed', 'failed'], default: 'pending' },
  startDate:        { type: Date },
  endDate:          { type: Date },
  nextBillingDate:  { type: Date },
  // Razorpay recurring
  razorpaySubId:    { type: String }, // subscription_id from Razorpay
  razorpayPlanId:   { type: String }, // plan_id from Razorpay
  paymentId:        { type: String }, // last successful payment_id
  totalCount:       { type: Number, default: 12 },
  paidCount:        { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

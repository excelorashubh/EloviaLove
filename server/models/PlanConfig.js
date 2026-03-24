const mongoose = require('mongoose');

const planConfigSchema = new mongoose.Schema({
  key:          { type: String, required: true, unique: true, lowercase: true, trim: true }, // 'basic', 'premium', 'pro'
  name:         { type: String, required: true },       // Display name
  price:        { type: Number, required: true, min: 0 },
  durationDays: { type: Number, default: 30 },
  description:  { type: String, default: '' },
  color:        { type: String, default: 'from-slate-400 to-slate-500' }, // Tailwind gradient
  isActive:     { type: Boolean, default: true },
  isPopular:    { type: Boolean, default: false },
  sortOrder:    { type: Number, default: 0 },
  features: [
    {
      label:     { type: String, required: true },
      value:     { type: mongoose.Schema.Types.Mixed }, // true | false | '10/day' etc.
      highlight: { type: Boolean, default: false },
    }
  ],
  discount: {
    isActive:   { type: Boolean, default: false },
    offerPrice: { type: Number },           // discounted price in ₹
    label:      { type: String, default: '' }, // e.g. "50% OFF", "Launch Offer"
    expiresAt:  { type: Date },             // null = no expiry
  },
}, { timestamps: true });

module.exports = mongoose.model('PlanConfig', planConfigSchema);

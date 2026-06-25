const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ad title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Ad image is required']
  },
  link: {
    type: String,
    required: [true, 'Ad link is required'],
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Please provide a valid URL'
    }
  },
  placement: {
    type: String,
    required: [true, 'Ad placement is required'],
    enum: {
      values: ['home_hero', 'home_features', 'home_testimonials', 'home_footer', 'blog_list', 'blog_post', 'discover', 'pricing', 'dashboard', 'contact', 'sidebar'],
      message: 'Invalid placement type'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(endDate) {
        return !endDate || endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  targetPlan: {
    type: String,
    enum: ['free', 'all'],
    default: 'free'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
adSchema.index({ placement: 1, active: 1, startDate: 1, endDate: 1 });
adSchema.index({ active: 1, priority: -1 });

// Virtual for CTR
adSchema.virtual('ctr').get(function() {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Method to check if ad is currently active
adSchema.methods.isActiveNow = function() {
  if (!this.active) return false;
  const now = new Date();
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
};

// Method to record impression
adSchema.methods.recordImpression = async function() {
  this.impressions += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to record click
adSchema.methods.recordClick = async function() {
  this.clicks += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to get active ads for placement
adSchema.statics.getActiveForPlacement = async function(placement) {
  const now = new Date();
  return this.find({
    placement,
    active: true,
    $or: [
      { startDate: { $lte: now }, $or: [{ endDate: { $gte: now } }, { endDate: null }] },
      { startDate: null, $or: [{ endDate: { $gte: now } }, { endDate: null }] }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

adSchema.set('toJSON', { virtuals: true });
adSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ad', adSchema);

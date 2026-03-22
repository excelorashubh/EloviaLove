const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Non-binary']
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  interests: [{
    type: String,
    trim: true
  }],
  relationshipGoals: {
    type: String,
    enum: ['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'],
    default: 'Casual Dating'
  },
  // ── Extended profile fields ───────────────────────────────────────────────
  education:  { type: String, default: '' },   // e.g. "Bachelor's", "Master's"
  profession: { type: String, default: '' },   // e.g. "Engineer", "Doctor"
  height:     { type: Number, default: null }, // cm
  income:     { type: String, default: '' },   // e.g. "5-10 LPA"
  religion:   { type: String, default: '' },
  lifestyle: {
    smoking:  { type: String, enum: ['Never', 'Occasionally', 'Regularly', ''], default: '' },
    drinking: { type: String, enum: ['Never', 'Occasionally', 'Regularly', ''], default: '' },
  },
  photos: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  // ── Verification ──────────────────────────────────────────────────────────
  phone:          { type: String, default: '' },
  phoneVerified:  { type: Boolean, default: false },
  emailVerified:  { type: Boolean, default: false },
  otpCode:        { type: String, select: false },
  otpExpiry:      { type: Date,   select: false },
  blueTickStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },

  // ── Subscription ──────────────────────────────────────────────────────────
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'pro'],
    default: 'free'
  },
  // Trial
  isTrialUsed: { type: Boolean, default: false },
  trialStartDate: { type: Date },
  trialEndDate:   { type: Date },
  // Paid subscription
  subscriptionId:    { type: String }, // Razorpay subscription_id (recurring)
  subscriptionStart: { type: Date },
  subscriptionEnd:   { type: Date },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'pending', 'cancelled', 'failed', 'completed'],
    default: null,
  },
  nextBillingDate: { type: Date },
  razorpayPlanId:  { type: String }, // Razorpay plan_id used for this subscription
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);
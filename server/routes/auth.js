const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['Male', 'Female', 'Non-binary']).withMessage('Please select a valid gender')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, dateOfBirth, gender } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Calculate age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old to register'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      dateOfBirth,
      gender
    });

    // ── Activate 10-day free trial on first registration ──
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 10);
    user.plan = 'premium';
    user.isTrialUsed = true;
    user.trialStartDate = new Date();
    user.trialEndDate = trialEnd;
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        profileCompleted: user.profileCompleted,
        plan: user.plan,
        isTrialUsed: user.isTrialUsed,
        trialEndDate: user.trialEndDate,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active
    await user.updateLastActive();

    // ── Check trial expiry ──
    if (user.plan === 'premium' && user.isTrialUsed && !user.subscriptionId) {
      if (user.trialEndDate && new Date() > user.trialEndDate) {
        user.plan = 'free';
        await user.save({ validateBeforeSave: false });
      }
    }
    // ── Check paid subscription expiry ──
    if (user.subscriptionEnd && new Date() > user.subscriptionEnd && user.subscriptionId) {
      user.plan = 'free';
      user.subscriptionId = null;
      await user.save({ validateBeforeSave: false });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        profileCompleted: user.profileCompleted,
        plan: user.plan,
        isTrialUsed: user.isTrialUsed,
        trialEndDate: user.trialEndDate,
        subscriptionEnd: user.subscriptionEnd,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        relationshipGoals: user.relationshipGoals,
        photos: user.photos,
        isVerified: user.isVerified,
        profileCompleted: user.profileCompleted,
        lastActive: user.lastActive,
        age: user.age,
        plan: user.plan,
        isTrialUsed: user.isTrialUsed,
        trialEndDate: user.trialEndDate,
        subscriptionEnd: user.subscriptionEnd,
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
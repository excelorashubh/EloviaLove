const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Like = require('../models/Like');
const Match = require('../models/Match');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('interests').optional().isArray(),
  body('relationshipGoals').optional().isIn(['Casual Dating', 'Serious Relationship', 'Marriage', 'Friendship'])
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

    const { name, bio, location, interests, relationshipGoals } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (relationshipGoals !== undefined) updateData.relationshipGoals = relationshipGoals;

    // Check if profile is now complete
    const user = await User.findById(req.user._id);
    const requiredFields = ['name', 'bio', 'location', 'interests', 'relationshipGoals'];
    const hasAllFields = requiredFields.every(field => {
      if (field === 'interests') return user.interests && user.interests.length > 0;
      return user[field] && user[field].trim() !== '';
    });

    if (hasAllFields) {
      updateData.profileCompleted = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        location: updatedUser.location,
        interests: updatedUser.interests,
        relationshipGoals: updatedUser.relationshipGoals,
        profileCompleted: updatedUser.profileCompleted
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/upload-photo
// @desc    Upload profile photo (base64 fallback if Cloudinary not configured)
// @access  Private
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let photoUrl;

    const cloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    if (cloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'elovialove/profiles',
            transformation: [
              { width: 500, height: 500, crop: 'fill' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      photoUrl = result.secure_url;
    } else {
      // Fallback: store as base64 data URL
      const base64 = req.file.buffer.toString('base64');
      photoUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    await User.findByIdAndUpdate(req.user._id, { profilePhoto: photoUrl });

    res.json({ success: true, message: 'Profile photo uploaded successfully', photoUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during upload' });
  }
});

// @route   POST /api/users/upload-photos
// @desc    Upload additional photos
// @access  Private
router.post('/upload-photos', protect, upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'elovialove/photos',
            transformation: [
              { width: 800, height: 800, crop: 'fill' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    const photoUrls = results.map(result => result.secure_url);

    // Add to user's photos array
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { photos: { $each: photoUrls } } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      photos: photoUrls
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
});

// @route   GET /api/users/discover
// @desc    Get users for discovery (swiping)
// @access  Private
router.get('/discover', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Get users that current user hasn't liked or passed yet
    const likedUserIds = await Like.find({
      fromUser: req.user._id,
      type: { $in: ['like', 'pass'] }
    }).distinct('toUser');

    // Exclude current user, inactive users, and users already interacted with
    const excludeIds = [...likedUserIds, req.user._id];

    const users = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
      profileCompleted: true
    })
    .select('name profilePhoto bio location interests age gender')
    .sort({ lastActive: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        hasMore: users.length === limit
      }
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/like/:userId
// @desc    Like or pass a user
// @access  Private
router.post('/like/:userId', protect, [
  body('type').isIn(['like', 'pass']).withMessage('Type must be like or pass')
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

    const { userId } = req.params;
    const { type } = req.body;

    // Check if target user exists and is active
    const targetUser = await User.findById(userId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-interaction
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot interact with yourself'
      });
    }

    // Check if already interacted
    const existingLike = await Like.findOne({
      fromUser: req.user._id,
      toUser: userId
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Already interacted with this user'
      });
    }

    // Create like/pass record
    await Like.create({
      fromUser: req.user._id,
      toUser: userId,
      type
    });

    let isMatch = false;

    // Check for match if it's a like
    if (type === 'like') {
      const reciprocalLike = await Like.findOne({
        fromUser: userId,
        toUser: req.user._id,
        type: 'like'
      });

      if (reciprocalLike) {
        // Create match
        await Match.create({
          users: [req.user._id, userId]
        });
        isMatch = true;

        // Create notifications for both users
        const Notification = require('../models/Notification');
        await Notification.create([
          {
            user: req.user._id,
            type: 'match',
            title: 'New Match!',
            message: `You matched with ${targetUser.name}!`,
            relatedUser: userId
          },
          {
            user: userId,
            type: 'match',
            title: 'New Match!',
            message: `You matched with ${req.user.name}!`,
            relatedUser: req.user._id
          }
        ]);
      }
    }

    res.json({
      success: true,
      message: type === 'like' ? 'User liked' : 'User passed',
      isMatch
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/report/:userId
// @desc    Report a user
// @access  Private
router.post('/report/:userId', protect, [
  body('reason').isIn(['fake_profile', 'harassment', 'spam', 'inappropriate_content', 'underage', 'other']),
  body('description').optional().trim().isLength({ max: 500 })
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

    const { userId } = req.params;
    const { reason, description } = req.body;

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already reported
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      reportedUser: userId,
      status: { $in: ['pending', 'investigating'] }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this user'
      });
    }

    // Create report
    await Report.create({
      reporter: req.user._id,
      reportedUser: userId,
      reason,
      description
    });

    res.json({
      success: true,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -email');
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        relationshipGoals: user.relationshipGoals,
        photos: user.photos,
        age: user.age,
        gender: user.gender,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/matches
// @desc    Get user's matches
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id
    })
    .populate('users', 'name profilePhoto bio location lastActive isActive')
    .sort({ createdAt: -1 });

    // Filter out current user and inactive users
    const activeMatches = matches
      .map(match => ({
        ...match.toObject(),
        users: match.users.filter(u => u._id.toString() !== req.user._id.toString())
      }))
      .filter(match => match.users.length > 0 && match.users[0].isActive !== false);

    res.json({
      success: true,
      matches: activeMatches
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/matches/:matchId
// @desc    Get specific match details
// @access  Private
router.get('/:matchId', protect, async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
    .populate({
      path: 'users',
      select: 'name profilePhoto bio location interests relationshipGoals photos age gender lastActive',
      match: { isActive: true }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    const isUserInMatch = match.users.some(user => user._id.toString() === req.user._id.toString());
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this match'
      });
    }

    // Get the other user
    const otherUser = match.users.find(user => user._id.toString() !== req.user._id.toString());

    res.json({
      success: true,
      match: {
        id: match._id,
        otherUser,
        createdAt: match.createdAt
      }
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/matches/:matchId
// @desc    Unmatch with a user
// @access  Private
router.delete('/:matchId', protect, async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    const isUserInMatch = match.users.some(user => user._id.toString() === req.user._id.toString());
    if (!isUserInMatch) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this match'
      });
    }

    // Delete the match
    await Match.findByIdAndDelete(matchId);

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Like = require('../models/Like');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: get IDs already swiped by current user + already matched
const getExcludedIds = async (userId) => {
  const [swiped, matched] = await Promise.all([
    Like.find({ fromUser: userId }).distinct('toUser'),
    Match.find({ users: userId }).distinct('users'),
  ]);
  const matchedOthers = matched.filter(id => id.toString() !== userId.toString());
  const all = [...new Set([
    ...swiped.map(id => id.toString()),
    ...matchedOthers.map(id => id.toString()),
    userId.toString()
  ])];
  return all.map(id => new mongoose.Types.ObjectId(id));
};

// @route   GET /api/match/random
// @desc    Get users — priority: people who liked you first, then others
// @access  Private
router.get('/random', protect, async (req, res) => {
  try {
    const excludeIds = await getExcludedIds(req.user._id);

    // Who already liked the current user (mutual chance = high)
    const likedMeIds = await Like.find({
      toUser:   req.user._id,
      fromUser: { $nin: excludeIds },
      type:     'like',
    }).distinct('fromUser');

    // Priority users: people who liked me and aren't excluded
    const priorityUsers = await User.find({
      _id:      { $in: likedMeIds, $nin: excludeIds },
      isActive: true,
    })
      .select('name gender location interests profilePhoto bio relationshipGoals dateOfBirth isVerified')
      .limit(5)
      .lean();

    // Fill remaining slots with random unseen users
    const priorityIds = priorityUsers.map(u => u._id);
    const remainingCount = Math.max(0, 10 - priorityUsers.length);

    const otherUsers = remainingCount > 0
      ? await User.aggregate([
          {
            $match: {
              _id:      { $nin: [...excludeIds, ...priorityIds] },
              isActive: true,
            },
          },
          { $sample: { size: remainingCount } },
          {
            $project: {
              name: 1, gender: 1, location: 1,
              interests: 1, profilePhoto: 1, bio: 1,
              relationshipGoals: 1, dateOfBirth: 1, isVerified: 1,
            },
          },
        ])
      : [];

    const addAge = u => ({
      ...u,
      age: u.dateOfBirth
        ? Math.floor((Date.now() - new Date(u.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      likedYou: likedMeIds.some(id => id.toString() === u._id.toString()),
    });

    const users = [...priorityUsers, ...otherUsers].map(addAge);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Random match error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/match/filter
// @desc    Get up to 20 users matching filters — enforces plan-based access
// @access  Private
router.post('/filter', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const plan = currentUser?.plan || 'free';

    const {
      // Free
      ageMin, ageMax, gender, location,
      // Basic
      onlineOnly,
      // Premium
      interests, education, profession, relationshipGoals, lifestyle,
      // Pro
      heightMin, heightMax, income, religion, isVerified, recentlyActive,
    } = req.body;

    const excludeIds = await getExcludedIds(req.user._id);

    const query = { _id: { $nin: excludeIds }, isActive: true };

    // ── FREE filters (always allowed) ────────────────────────────────────────
    if (gender)   query.gender   = gender;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (ageMin || ageMax) {
      const now = new Date();
      query.dateOfBirth = {};
      if (ageMax) query.dateOfBirth.$gte = new Date(now.getFullYear() - ageMax, now.getMonth(), now.getDate());
      if (ageMin) query.dateOfBirth.$lte = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate());
    }

    // ── BASIC filters ────────────────────────────────────────────────────────
    if (['basic', 'premium', 'pro'].includes(plan)) {
      if (onlineOnly) {
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        query.lastActive = { $gte: fifteenMinsAgo };
      }
    }

    // ── PREMIUM filters ──────────────────────────────────────────────────────
    if (['premium', 'pro'].includes(plan)) {
      if (interests?.length)    query.interests        = { $in: interests };
      if (education)            query.education        = { $regex: education, $options: 'i' };
      if (profession)           query.profession       = { $regex: profession, $options: 'i' };
      if (relationshipGoals)    query.relationshipGoals = relationshipGoals;
      if (lifestyle?.smoking)   query['lifestyle.smoking']  = lifestyle.smoking;
      if (lifestyle?.drinking)  query['lifestyle.drinking'] = lifestyle.drinking;
    }

    // ── PRO filters ──────────────────────────────────────────────────────────
    if (plan === 'pro') {
      if (heightMin || heightMax) {
        query.height = {};
        if (heightMin) query.height.$gte = Number(heightMin);
        if (heightMax) query.height.$lte = Number(heightMax);
      }
      if (income)   query.income   = income;
      if (religion) query.religion = { $regex: religion, $options: 'i' };
      if (isVerified)      query.isVerified = true;
      if (recentlyActive) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        query.lastActive = { $gte: oneDayAgo };
      }
    }

    // Who liked me (for boost sorting)
    const likedMeIds = await Like.find({
      toUser: req.user._id, type: 'like',
    }).distinct('fromUser');
    const likedMeSet = new Set(likedMeIds.map(id => id.toString()));

    let users = await User.find(query)
      .select('name gender location interests profilePhoto bio relationshipGoals dateOfBirth isVerified lastActive education profession height income religion lifestyle')
      .limit(40)
      .lean();

    // Smart sort: liked you > verified > recently active > others
    users.sort((a, b) => {
      const aLiked   = likedMeSet.has(a._id.toString()) ? 3 : 0;
      const bLiked   = likedMeSet.has(b._id.toString()) ? 3 : 0;
      const aVerif   = a.isVerified ? 2 : 0;
      const bVerif   = b.isVerified ? 2 : 0;
      const aActive  = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const bActive  = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      const aScore   = aLiked + aVerif + (aActive > Date.now() - 3600000 ? 1 : 0);
      const bScore   = bLiked + bVerif + (bActive > Date.now() - 3600000 ? 1 : 0);
      return bScore - aScore;
    });

    const withAge = users.slice(0, 20).map(u => ({
      ...u,
      age: u.dateOfBirth
        ? Math.floor((Date.now() - new Date(u.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      likedYou: likedMeSet.has(u._id.toString()),
    }));

    res.json({ success: true, users: withAge, plan });
  } catch (error) {
    console.error('Filter match error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/match/swipe
// @desc    Like or pass — returns isMatch: true if mutual like
// @access  Private
router.post('/swipe', protect, [
  body('targetUserId').notEmpty(),
  body('action').isIn(['like', 'pass'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed' });
    }

    const { targetUserId, action } = req.body;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot swipe yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upsert — allow re-swipe (e.g. undo)
    await Like.findOneAndUpdate(
      { fromUser: req.user._id, toUser: targetUserId },
      { type: action },
      { upsert: true, new: true }
    );

    let isMatch = false;
    let matchedUser = null;

    if (action === 'like') {
      // Send a "someone liked you" notification to the target user
      const likeNotif = await Notification.create({
        user: targetUserId,
        type: 'like',
        title: 'Someone liked you!',
        message: `${req.user.name} liked your profile.`,
        relatedUser: req.user._id
      });
      const io = req.app.get('io');
      if (io) io.to(targetUserId.toString()).emit('notification', likeNotif);
      // Notify the liked user (unless it becomes a match — match notif covers it)
      const reciprocal = await Like.findOne({
        fromUser: targetUserId,
        toUser: req.user._id,
        type: 'like'
      });

      if (reciprocal) {
        // Avoid duplicate matches
        const existing = await Match.findOne({ users: { $all: [req.user._id, targetUserId] } });
        if (!existing) {
          await Match.create({ users: [req.user._id, targetUserId] });
          const matchNotifs = await Notification.create([
            {
              user: req.user._id,
              type: 'match',
              title: 'New Match!',
              message: `You matched with ${targetUser.name}!`,
              relatedUser: targetUserId
            },
            {
              user: targetUserId,
              type: 'match',
              title: 'New Match!',
              message: `You matched with ${req.user.name}!`,
              relatedUser: req.user._id
            }
          ]);
          // Push match notifications via socket
          const io = req.app.get('io');
          if (io) {
            io.to(req.user._id.toString()).emit('notification', matchNotifs[0]);
            io.to(targetUserId.toString()).emit('notification', matchNotifs[1]);
          }
        }
        isMatch = true;
        matchedUser = {
          id: targetUser._id,
          name: targetUser.name,
          profilePhoto: targetUser.profilePhoto
        };
      }
    }

    res.json({ success: true, isMatch, matchedUser });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/match/liked-you
// @desc    Get users who liked the current user (premium feature)
// @access  Private — premium/pro only
router.get('/liked-you', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isPremium = ['premium', 'pro'].includes(user.plan);

    // Find who liked me and I haven't swiped yet
    const alreadySwiped = await Like.find({ fromUser: req.user._id }).distinct('toUser');
    const matched       = await Match.find({ users: req.user._id }).distinct('users');
    const excludeIds    = [...new Set([
      ...alreadySwiped.map(id => id.toString()),
      ...matched.map(id => id.toString()),
      req.user._id.toString(),
    ])].map(id => new mongoose.Types.ObjectId(id));

    const likes = await Like.find({
      toUser:   req.user._id,
      fromUser: { $nin: excludeIds },
      type:     'like',
    }).populate('fromUser', 'name profilePhoto location age bio interests dateOfBirth').lean();

    const profiles = likes.map(l => ({
      ...l.fromUser,
      age: l.fromUser.dateOfBirth
        ? Math.floor((Date.now() - new Date(l.fromUser.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      likedYou: true,
      // Blur profile photo for free users
      profilePhoto: isPremium ? l.fromUser.profilePhoto : null,
    }));

    res.json({ success: true, profiles, isPremium, count: profiles.length });
  } catch (err) {
    console.error('Liked-you error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/match/force
// @desc    Force-create a match with another user (dev/testing only)
// @access  Private
router.post('/force', protect, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ success: false, message: 'targetUserId required' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await Match.findOne({ users: { $all: [req.user._id, targetUserId] } });
    if (existing) return res.json({ success: true, message: 'Match already exists', matchId: existing._id });

    // Upsert likes for both sides
    await Like.findOneAndUpdate(
      { fromUser: req.user._id, toUser: targetUserId },
      { type: 'like' },
      { upsert: true }
    );
    await Like.findOneAndUpdate(
      { fromUser: targetUserId, toUser: req.user._id },
      { type: 'like' },
      { upsert: true }
    );

    const match = await Match.create({ users: [req.user._id, targetUserId] });

    res.json({ success: true, message: 'Match created', matchId: match._id });
  } catch (error) {
    console.error('Force match error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

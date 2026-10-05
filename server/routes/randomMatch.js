const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const randomMatchManager = require('../utils/randomMatchManager');
const User = require('../models/User');

const router = express.Router();

router.post('/start', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const result = await randomMatchManager.startSearch(user, req.app.get('io'));
    res.json(result);
  } catch (error) {
    console.error('Random match start error:', error);
    res.status(500).json({ success: false, message: 'Unable to start random match' });
  }
});

router.post('/skip', protect, async (req, res) => {
  try {
    const result = await randomMatchManager.skipSearch(req.user._id.toString(), req.app.get('io'));
    res.json(result);
  } catch (error) {
    console.error('Random match skip error:', error);
    res.status(500).json({ success: false, message: 'Unable to skip match' });
  }
});

router.post('/end', protect, async (req, res) => {
  try {
    const result = await randomMatchManager.endCall(req.user._id.toString(), req.app.get('io'));
    res.json(result);
  } catch (error) {
    console.error('Random match end error:', error);
    res.status(500).json({ success: false, message: 'Unable to end match' });
  }
});

router.get('/status', protect, async (req, res) => {
  try {
    const result = await randomMatchManager.getStatus(req.user._id.toString());
    res.json(result);
  } catch (error) {
    console.error('Random match status error:', error);
    res.status(500).json({ success: false, message: 'Unable to get status' });
  }
});

router.get('/cards', protect, async (req, res) => {
  try {
    const result = await randomMatchManager.getCards(req.user._id.toString());
    res.json(result);
  } catch (error) {
    console.error('Random match cards error:', error);
    res.status(500).json({ success: false, message: 'Unable to get cards info' });
  }
});

router.post('/report', protect, [body('targetUserId').notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed' });
    const result = await randomMatchManager.reportUser(req.user._id.toString(), req.body.targetUserId, req.body.reason, req.app.get('io'));
    res.json(result);
  } catch (error) {
    console.error('Random match report error:', error);
    res.status(500).json({ success: false, message: 'Unable to submit report' });
  }
});

router.post('/block', protect, [body('targetUserId').notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed' });
    const result = await randomMatchManager.blockUser(req.user._id.toString(), req.body.targetUserId, req.app.get('io'));
    res.json(result);
  } catch (error) {
    console.error('Random match block error:', error);
    res.status(500).json({ success: false, message: 'Unable to block user' });
  }
});

router.post('/recharge', protect, async (req, res) => {
  try {
    const result = await randomMatchManager.recharge(req.user._id.toString(), req.body, req.app.get('io'));
    res.json(result);
  } catch (error) {
    console.error('Random match recharge error:', error);
    res.status(500).json({ success: false, message: 'Unable to recharge' });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const result = await randomMatchManager.getHistory(req.user._id.toString());
    res.json(result);
  } catch (error) {
    console.error('Random match history error:', error);
    res.status(500).json({ success: false, message: 'Unable to get history' });
  }
});

router.get('/admin/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await randomMatchManager.getAnalytics();
    res.json(result);
  } catch (error) {
    console.error('Random match admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Unable to load analytics' });
  }
});

module.exports = router;

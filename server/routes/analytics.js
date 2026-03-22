const express = require('express');
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ── Detect device from user-agent ─────────────────────────────────────────────
const getDevice = (ua = '') => {
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    return /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
};

// @route  POST /api/analytics/track
// @desc   Track a page visit (public — no auth required)
router.post('/track', async (req, res) => {
  try {
    const { visitorId, page = '/' } = req.body;
    if (!visitorId) return res.status(400).json({ success: false, message: 'visitorId required' });

    const ua = req.headers['user-agent'] || '';
    const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();

    await Visitor.create({
      visitorId,
      ip,
      userAgent: ua,
      page,
      device: getDevice(ua),
      visitedAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    // Silently fail — never break the frontend
    res.json({ success: false });
  }
});

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.use(protect);
router.use(authorize('admin'));

// Helper: build date filter
const dateFilter = (period, from, to) => {
  if (from || to) {
    const f = {};
    if (from) f.$gte = new Date(from);
    if (to)   f.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    return f;
  }
  const now = new Date();
  const start = new Date();
  if (period === 'today') { start.setHours(0, 0, 0, 0); }
  else if (period === 'week')  { start.setDate(now.getDate() - 7); }
  else if (period === 'month') { start.setMonth(now.getMonth() - 1); }
  else if (period === 'year')  { start.setFullYear(now.getFullYear() - 1); }
  else { return null; } // all time
  return { $gte: start };
};

// @route  GET /api/analytics/overview
// @desc   Total, unique, today, returning visitors + device split
router.get('/overview', async (req, res) => {
  try {
    const { period = 'month', from, to } = req.query;
    const df = dateFilter(period, from, to);
    const match = df ? { visitedAt: df } : {};

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [total, todayCount, uniqueIds, deviceDist, topPages] = await Promise.all([
      Visitor.countDocuments(match),
      Visitor.countDocuments({ visitedAt: { $gte: todayStart } }),
      Visitor.distinct('visitorId', match),
      Visitor.aggregate([
        { $match: match },
        { $group: { _id: '$device', count: { $sum: 1 } } },
      ]),
      Visitor.aggregate([
        { $match: match },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    // Returning = visitorId seen more than once (all time)
    const returningIds = await Visitor.aggregate([
      { $group: { _id: '$visitorId', visits: { $sum: 1 } } },
      { $match: { visits: { $gt: 1 } } },
      { $count: 'count' },
    ]);

    res.json({
      success: true,
      total,
      unique: uniqueIds.length,
      today: todayCount,
      returning: returningIds[0]?.count || 0,
      newVisitors: uniqueIds.length - (returningIds[0]?.count || 0),
      deviceDist,
      topPages: topPages.map(p => ({ page: p._id, count: p.count })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/analytics/recent
// @desc   Paginated recent visit log
router.get('/recent', async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip  = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      Visitor.find({}).sort({ visitedAt: -1 }).skip(skip).limit(limit).lean(),
      Visitor.countDocuments(),
    ]);

    res.json({ success: true, visits, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/analytics/daily
// @desc   Daily visitor counts (last 30 days)
router.get('/daily', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const data = await Visitor.aggregate([
      { $match: { visitedAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$visitedAt' },
            month: { $month: '$visitedAt' },
            day:   { $dayOfMonth: '$visitedAt' },
          },
          total:  { $sum: 1 },
          unique: { $addToSet: '$visitorId' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const result = data.map(d => ({
      label:  `${d._id.day}/${d._id.month}`,
      total:  d.total,
      unique: d.unique.length,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

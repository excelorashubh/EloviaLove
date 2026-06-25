const express = require('express');
const Ad = require('../models/Ad');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES (Ads served to free users)
// ══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/ads/placement/:placement
// @desc    Get active ads for a specific placement
// @access  Public
router.get('/placement/:placement', async (req, res) => {
  try {
    const { placement } = req.params;
    const ads = await Ad.getActiveForPlacement(placement);
    
    // Filter out expired ads and return the highest priority ad
    const activeAds = ads.filter(ad => ad.isActiveNow());
    const selectedAd = activeAds.length > 0 ? activeAds[0] : null;

    res.json({
      success: true,
      ad: selectedAd
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads'
    });
  }
});

// @route   POST /api/ads/:adId/impression
// @desc    Record ad impression
// @access  Public
router.post('/:adId/impression', async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    await ad.recordImpression();

    res.json({
      success: true,
      impressions: ad.impressions
    });
  } catch (error) {
    console.error('Record impression error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record impression'
    });
  }
});

// @route   POST /api/ads/:adId/click
// @desc    Record ad click
// @access  Public
router.post('/:adId/click', async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    await ad.recordClick();

    res.json({
      success: true,
      clicks: ad.clicks,
      link: ad.link
    });
  } catch (error) {
    console.error('Record click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record click'
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES (Ad management)
// ══════════════════════════════════════════════════════════════════════════════

router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/ads
// @desc    Get all ads (admin)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { placement, active } = req.query;
    
    const filter = {};
    if (placement) filter.placement = placement;
    if (active !== undefined) filter.active = active === 'true';

    const ads = await Ad.find(filter).sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      count: ads.length,
      ads
    });
  } catch (error) {
    console.error('Get all ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads'
    });
  }
});

// @route   GET /api/ads/:adId
// @desc    Get single ad details
// @access  Private/Admin
router.get('/:adId', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      ad
    });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ad'
    });
  }
});

// @route   POST /api/ads
// @desc    Create new ad
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { title, image, link, placement, startDate, endDate, targetPlan, priority, description } = req.body;

    const ad = await Ad.create({
      title,
      image,
      link,
      placement,
      startDate,
      endDate,
      targetPlan,
      priority: priority || 0,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      ad
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create ad'
    });
  }
});

// @route   PUT /api/ads/:adId
// @desc    Update ad
// @access  Private/Admin
router.put('/:adId', async (req, res) => {
  try {
    const { title, image, link, placement, active, startDate, endDate, targetPlan, priority, description } = req.body;

    const ad = await Ad.findByIdAndUpdate(
      req.params.adId,
      {
        title,
        image,
        link,
        placement,
        active,
        startDate,
        endDate,
        targetPlan,
        priority,
        description
      },
      { new: true, runValidators: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      message: 'Ad updated successfully',
      ad
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update ad'
    });
  }
});

// @route   DELETE /api/ads/:adId
// @desc    Delete ad
// @access  Private/Admin
router.delete('/:adId', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.adId);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    await ad.deleteOne();

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad'
    });
  }
});

// @route   GET /api/ads/analytics/stats
// @desc    Get ad analytics
// @access  Private/Admin
router.get('/analytics/stats', async (req, res) => {
  try {
    const totalAds = await Ad.countDocuments();
    const activeAds = await Ad.countDocuments({ active: true });
    
    const ads = await Ad.find();
    
    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

    // Performance by placement
    const byPlacement = {};
    ads.forEach(ad => {
      if (!byPlacement[ad.placement]) {
        byPlacement[ad.placement] = {
          impressions: 0,
          clicks: 0,
          ads: 0
        };
      }
      byPlacement[ad.placement].impressions += ad.impressions;
      byPlacement[ad.placement].clicks += ad.clicks;
      byPlacement[ad.placement].ads += 1;
    });

    // Calculate CTR for each placement
    Object.keys(byPlacement).forEach(placement => {
      const data = byPlacement[placement];
      data.ctr = data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : 0;
    });

    // Top performing ads
    const topAds = ads
      .filter(ad => ad.impressions > 0)
      .sort((a, b) => {
        const ctrA = a.clicks / a.impressions;
        const ctrB = b.clicks / b.impressions;
        return ctrB - ctrA;
      })
      .slice(0, 5)
      .map(ad => ({
        id: ad._id,
        title: ad.title,
        placement: ad.placement,
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr: ad.ctr
      }));

    res.json({
      success: true,
      stats: {
        totalAds,
        activeAds,
        totalImpressions,
        totalClicks,
        overallCTR: parseFloat(overallCTR),
        byPlacement,
        topAds
      }
    });
  } catch (error) {
    console.error('Get ad analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

module.exports = router;

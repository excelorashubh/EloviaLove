const express = require('express');
const router = express.Router();
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION-SAFE SEO ROUTES FOR RENDER DEPLOYMENT
// ══════════════════════════════════════════════════════════════════════════════
// 
// REMOVED: Puppeteer prerendering (causes deployment failures on Render)
// REMOVED: Canvas OG image generation (heavy dependency, not critical)
// 
const Blog = require('../models/Blog');

// ── Dynamic Sitemap Logic ───────────────────────────────────────────────────

/**
 * Generates XML sitemap content
 */
const generateSitemap = async (baseUrl) => {
  // 1. Define Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/contact',
    '/pricing',
    '/signup',
    '/login',
    '/privacy',
    '/terms',
    '/safety',
    '/how-verification-works',
    '/online-dating-safety-india',
    '/report-abuse',
    '/community-guidelines',
    '/safe-first-date-tips',
    '/dating-safety',
    '/community-guidelines',
    '/dating-in-delhi',
    '/dating-in-mumbai',
    '/dating-in-bangalore',
    '/dating-in-kolkata',
    '/dating-in-ranchi',
    '/dating-in-chennai',
    '/dating-in-hyderabad',
    '/dating-in-pune',
    '/dating-in-ahmedabad',
    '/verified-profiles',
    '/private-chat',
    '/video-chat',
    '/safe-dating',
    '/serious-relationships'
  ];

  // 2. Fetch Dynamic Blog Routes
  const blogs = await Blog.find({ isPublished: true }).select('slug updatedAt').lean();
  
  const blogRoutes = blogs.map(blog => ({
    url: `/blog/${blog.slug}`,
    lastmod: blog.updatedAt.toISOString().split('T')[0],
    priority: 0.8
  }));

  // 3. Combine and Format XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  staticRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${route === '' ? '1.0' : '0.7'}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add blog routes
  blogRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};
// REASON: Render free tier doesn't support Chromium/Puppeteer reliably
// SOLUTION: Use react-helmet-async for client-side SEO (already implemented)
//           Google crawls React SPAs natively since 2019
// 
// ══════════════════════════════════════════════════════════════════════════════

// ── Lightweight SEO Middleware (No Puppeteer) ─────────────────────────────────

/**
 * Simple bot detection middleware
 * Logs crawler visits for analytics without heavy prerendering
 */
const prerenderMiddleware = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isCrawler = /googlebot|bingbot|slurp|duckduckbot|yandexbot|facebookexternalhit|twitterbot|linkedinbot/i.test(userAgent);

  if (isCrawler) {
    // Log crawler visits for monitoring
    console.log(`[SEO] Crawler detected: ${userAgent.substring(0, 50)} - ${req.path}`);
    
    // Set cache headers for crawlers
    res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
  }

  // Let React handle all rendering
  // react-helmet-async will inject proper meta tags
  next();
};

// ── SEO Metadata API Routes ───────────────────────────────────────────────────

/**
 * SEO health check endpoint
 * Returns server SEO configuration status
 */
router.get('/status', (req, res) => {
  res.json({
    seoEnabled: true,
    crawlerDetection: true,
    sitemapAvailable: true,
    robotsTxtAvailable: true,
    reactHelmetAsync: true,
    prerenderingEnabled: false, // Disabled for Render stability
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Get SEO metadata for a specific route
 * Used by admin panel to verify SEO configuration
 */
router.get('/metadata/:route(*)', (req, res) => {
  const route = req.params.route || 'home';
  
  // Basic metadata structure (actual metadata is in React components)
  const metadata = {
    route: `/${route}`,
    seoImplementation: 'react-helmet-async',
    crawlable: true,
    indexed: !route.includes('admin') && !route.includes('dashboard'),
    notes: 'Metadata is rendered client-side via react-helmet-async'
  };

  res.json(metadata);
});

/**
 * Trigger sitemap regeneration
 * The actual sitemap is served from server.js root route
 */
router.post('/sitemap/regenerate', async (req, res) => {
  try {
    // Sitemap is dynamically generated in server.js
    // This endpoint just confirms the feature is available
    res.json({
      success: true,
      message: 'Sitemap is dynamically generated at /sitemap.xml',
      url: '/sitemap.xml'
    });
  } catch (error) {
    console.error('Sitemap regeneration error:', error);
    res.status(500).json({
      error: 'Failed to regenerate sitemap',
      details: error.message
    });
  }
});

/**
 * Get robots.txt configuration
 */
router.get('/robots', (req, res) => {
  res.json({
    location: '/robots.txt',
    served: 'static file from client/public',
    crawlDelay: 0,
    allowedPaths: ['/', '/blog', '/about', '/contact', '/pricing'],
    disallowedPaths: ['/admin', '/dashboard', '/api']
  });
});

/**
 * SEO analytics endpoint
 * Track which pages are being crawled
 */
router.get('/analytics/crawls', (req, res) => {
  // In production, this would connect to analytics database
  res.json({
    message: 'Crawler analytics available in admin panel',
    implementation: 'Google Analytics + Search Console'
  });
});

// ── Error Handling ────────────────────────────────────────────────────────────

// Catch-all error handler for SEO routes
router.use((err, req, res, next) => {
  console.error('[SEO Route Error]:', err);
  res.status(500).json({
    error: 'SEO service error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  router,
  prerenderMiddleware,
  generateSitemap
};
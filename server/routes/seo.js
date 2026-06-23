const Blog = require('../models/Blog');

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTION-READY SITEMAP ARCHITECTURE FOR ELOVIA LOVE
// ═══════════════════════════════════════════════════════════════════════════
// Domain: https://elovialove.onrender.com (DO NOT use elovialove.com)
// Architecture: Sitemap Index + Separate XML files
// Compliance: https://www.sitemaps.org/protocol.html
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the correct base URL from environment
 * IMPORTANT: Must use elovialove.onrender.com until custom domain is configured
 */
const getBaseUrl = () => {
  return process.env.CLIENT_URL || 'https://elovialove.onrender.com';
};

/**
 * SITEMAP INDEX - Main entry point
 * Returns XML linking to all sub-sitemaps
 */
const generateSitemapIndex = (baseUrl) => {
  const today = new Date().toISOString();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Sub-sitemaps
  const sitemaps = [
    { loc: '/sitemap-pages.xml', lastmod: today },
    { loc: '/sitemap-cities.xml', lastmod: today },
    { loc: '/sitemap-blog.xml', lastmod: today },
    { loc: '/sitemap-images.xml', lastmod: today },
  ];
  
  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}${sitemap.loc}</loc>\n`;
    xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  return xml;
};

/**
 * SITEMAP: CORE PAGES
 * Only includes pages that exist in React Router
 */
const generatePagesSitemap = (baseUrl) => {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // VERIFIED ROUTES ONLY - All exist in App.jsx
  const pages = [
    // Core Pages
    { url: '', priority: 1.0, changefreq: 'daily', lastmod: today },
    { url: '/about', priority: 0.7, changefreq: 'monthly', lastmod: '2026-06-20' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly', lastmod: today },
    { url: '/pricing', priority: 0.7, changefreq: 'weekly', lastmod: '2026-06-15' },
    { url: '/faq', priority: 0.7, changefreq: 'weekly', lastmod: '2026-06-18' },
    { url: '/blog', priority: 0.8, changefreq: 'daily', lastmod: today },
    { url: '/discover', priority: 0.8, changefreq: 'daily', lastmod: today },
    
    // Legal Pages (alias routes - both resolve to same component)
    { url: '/privacy-policy', priority: 0.5, changefreq: 'yearly', lastmod: '2026-05-13' },
    { url: '/terms-of-service', priority: 0.5, changefreq: 'yearly', lastmod: '2026-05-13' },
  ];
  
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

/**
 * SITEMAP: CITY PAGES
 * Only includes cities with dedicated route components
 */
const generateCitiesSitemap = (baseUrl) => {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // VERIFIED: These have dedicated page components in App.jsx
  const cities = [
    { slug: 'india', priority: 0.9, lastmod: '2026-06-20' },
    { slug: 'delhi', priority: 0.9, lastmod: '2026-06-15' },
    { slug: 'mumbai', priority: 0.9, lastmod: '2026-06-15' },
    { slug: 'bangalore', priority: 0.9, lastmod: '2026-06-15' },
    { slug: 'kolkata', priority: 0.9, lastmod: '2026-06-15' },
    { slug: 'ranchi', priority: 0.9, lastmod: '2026-06-15' },
  ];
  
  cities.forEach(city => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/dating-in-${city.slug}</loc>\n`;
    xml += `    <lastmod>${city.lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${city.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

/**
 * SITEMAP: BLOG POSTS
 * Dynamically includes all published blog posts from database
 */
const generateBlogSitemap = async (baseUrl) => {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Blog hub page
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/blog</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += '  </url>\n';
  
  // Fetch all published blog posts from database
  try {
    const posts = await Blog.find({ isPublished: true })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean();
    
    posts.forEach(post => {
      const lastmod = post.updatedAt 
        ? post.updatedAt.toISOString().split('T')[0] 
        : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });
  } catch (err) {
    console.error('Error fetching blog posts for sitemap:', err);
  }
  
  xml += '</urlset>';
  return xml;
};

/**
 * SITEMAP: IMAGES
 * Includes featured images from blog posts for Google Image Search
 */
const generateImagesSitemap = async (baseUrl) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  
  try {
    // Fetch published blog posts with featured images
    const posts = await Blog.find({ 
      isPublished: true,
      featuredImage: { $exists: true, $ne: '' }
    })
    .select('slug title featuredImage')
    .lean();
    
    posts.forEach(post => {
      if (post.featuredImage) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += '    <image:image>\n';
        xml += `      <image:loc>${post.featuredImage}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(post.title)}</image:title>\n`;
        xml += '    </image:image>\n';
        xml += '  </url>\n';
      }
    });
  } catch (err) {
    console.error('Error generating images sitemap:', err);
  }
  
  xml += '</urlset>';
  return xml;
};

/**
 * Escape XML special characters
 */
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main Sitemap Index Handler - /sitemap.xml
 */
const sitemapHandler = async (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const xml = generateSitemapIndex(baseUrl);
    
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
  } catch (err) {
    console.error('Sitemap index error:', err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap generation failed</error>');
  }
};

/**
 * Pages Sitemap Handler - /sitemap-pages.xml
 */
const pagesHandler = (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const xml = generatePagesSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Pages sitemap error:', err);
    res.status(500).send('Error');
  }
};

/**
 * Cities Sitemap Handler - /sitemap-cities.xml
 */
const citiesHandler = (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const xml = generateCitiesSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
  } catch (err) {
    console.error('Cities sitemap error:', err);
    res.status(500).send('Error');
  }
};

/**
 * Blog Sitemap Handler - /sitemap-blog.xml
 */
const blogHandler = async (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const xml = await generateBlogSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
    res.send(xml);
  } catch (err) {
    console.error('Blog sitemap error:', err);
    res.status(500).send('Error');
  }
};

/**
 * Images Sitemap Handler - /sitemap-images.xml
 */
const imagesHandler = async (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const xml = await generateImagesSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Images sitemap error:', err);
    res.status(500).send('Error');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESS ROUTER SETUP
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();

// Placeholder middleware for prerendering (future use)
const prerenderMiddleware = (req, res, next) => {
  next();
};

// Register sitemap routes
router.get('/sitemap-pages.xml', pagesHandler);
router.get('/sitemap-cities.xml', citiesHandler);
router.get('/sitemap-blog.xml', blogHandler);
router.get('/sitemap-images.xml', imagesHandler);

module.exports = { 
  sitemapHandler,        // Main index handler (used in server.js)
  pagesHandler,
  citiesHandler,
  blogHandler,
  imagesHandler,
  prerenderMiddleware,
  router
};
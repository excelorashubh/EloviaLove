const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs').promises;

// ── Prerendering Setup for React SPA SEO ─────────────────────────────────────

// 1. Prerendering Service
class Prerenderer {
  constructor() {
    this.browser = null;
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async prerender(url, options = {}) {
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.content;
    }

    await this.init();

    const page = await this.browser.newPage();

    try {
      // Set user agent to avoid mobile redirects
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Set viewport
      await page.setViewport({ width: 1200, height: 800 });

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for React to hydrate
      await page.waitForTimeout(2000);

      // Extract HTML content
      const content = await page.content();

      // Cache the result
      this.cache.set(cacheKey, {
        content,
        timestamp: Date.now()
      });

      return content;

    } catch (error) {
      console.error('Prerendering failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Global prerenderer instance
const prerenderer = new Prerenderer();

// Initialize on startup
prerenderer.init().catch(console.error);

// Cleanup on process exit
process.on('SIGINT', async () => {
  await prerenderer.close();
  process.exit(0);
});

// 2. Prerendering Middleware
const prerenderMiddleware = async (req, res, next) => {
  const prerenderedRoutes = [
    '/privacy',
    '/terms',
    '/safety',
    '/community-guidelines',
    '/dating-safety',
    '/report-abuse',
    '/help',
    '/faq',
    '/verified-profiles',
    '/private-chat',
    '/video-chat',
    '/safe-dating',
    '/serious-relationships'
  ];

  // Check if this is a prerendered route
  const isPrerenderedRoute = prerenderedRoutes.some(route =>
    req.path === route || req.path.startsWith('/blog/') || req.path.startsWith('/dating-in-')
  );

  // Check if request is from a crawler
  const userAgent = req.get('User-Agent') || '';
  const isCrawler = /googlebot|bingbot|slurp|duckduckbot|yandexbot/i.test(userAgent);

  if (isPrerenderedRoute && isCrawler) {
    try {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const prerenderedContent = await prerenderer.prerender(fullUrl);

      res.send(prerenderedContent);
      return;
    } catch (error) {
      console.error('Prerendering middleware error:', error);
      // Fall through to normal handling
    }
  }

  next();
};

// ── Dynamic OG Image Generation API ──────────────────────────────────────────

// Register fonts for OG image generation
try {
  registerFont(path.join(__dirname, '../../assets/fonts/Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
  registerFont(path.join(__dirname, '../../assets/fonts/Inter-Regular.ttf'), { family: 'Inter', weight: 'normal' });
} catch (error) {
  console.warn('Font registration failed, using default fonts:', error.message);
}

const generateOgImage = async (type, params) => {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Load background based on type
  let backgroundColor, textColor;
  switch (type) {
    case 'blog':
      backgroundColor = '#FF6B9D'; // Pink gradient start
      textColor = '#FFFFFF';
      break;
    case 'city':
      backgroundColor = '#4F46E5'; // Indigo
      textColor = '#FFFFFF';
      break;
    case 'quote':
      backgroundColor = '#059669'; // Green
      textColor = '#FFFFFF';
      break;
    case 'feature':
      backgroundColor = '#DC2626'; // Red
      textColor = '#FFFFFF';
      break;
    default:
      backgroundColor = '#6B7280'; // Gray
      textColor = '#FFFFFF';
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, backgroundColor);
  gradient.addColorStop(1, adjustColor(backgroundColor, -20)); // Darker shade

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 1200; i += 50) {
    for (let j = 0; j < 630; j += 50) {
      if ((i + j) % 100 === 0) {
        ctx.fillRect(i, j, 25, 25);
      }
    }
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  switch (type) {
    case 'blog':
      // Blog post OG image
      ctx.font = 'bold 48px Inter';
      const titleLines = wrapText(ctx, params.title || 'Blog Post', 1000);
      titleLines.forEach((line, index) => {
        ctx.fillText(line, 600, 200 + (index * 60));
      });

      ctx.font = '24px Inter';
      ctx.fillText(`By ${params.author || 'Elovia Love'} • ${params.readTime || '5'} min read`, 600, 400);

      if (params.category) {
        ctx.font = '18px Inter';
        ctx.fillText(params.category.toUpperCase(), 600, 450);
      }
      break;

    case 'city':
      // City page OG image
      ctx.font = 'bold 56px Inter';
      ctx.fillText('Find Love in', 600, 200);

      ctx.font = 'bold 72px Inter';
      ctx.fillText(params.cityName || 'Your City', 600, 280);

      ctx.font = '24px Inter';
      ctx.fillText(`${params.activeUsers || '1000'}+ Active Members`, 600, 380);
      ctx.fillText(params.region || 'India', 600, 420);
      break;

    case 'quote':
      // Quote card OG image
      ctx.font = 'bold 36px Inter';
      const quoteLines = wrapText(ctx, `"${params.quote || 'Love Quote'}"`, 900);
      quoteLines.forEach((line, index) => {
        ctx.fillText(line, 600, 200 + (index * 50));
      });

      ctx.font = '24px Inter';
      ctx.fillText(`- ${params.author || 'Anonymous'}`, 600, 400);

      if (params.category) {
        ctx.font = '18px Inter';
        ctx.fillText(params.category.toUpperCase(), 600, 450);
      }
      break;

    case 'feature':
      // Feature page OG image
      ctx.font = 'bold 52px Inter';
      ctx.fillText(params.title || 'Feature', 600, 200);

      ctx.font = '28px Inter';
      const descLines = wrapText(ctx, params.description || 'Feature description', 900);
      descLines.forEach((line, index) => {
        ctx.fillText(line, 600, 280 + (index * 35));
      });

      if (params.benefits && params.benefits.length > 0) {
        ctx.font = '20px Inter';
        ctx.fillText(`✓ ${params.benefits[0]}`, 600, 400);
        if (params.benefits[1]) {
          ctx.fillText(`✓ ${params.benefits[1]}`, 600, 430);
        }
      }
      break;
  }

  // Add Elovia Love branding
  ctx.font = '16px Inter';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Elovia Love - Safe & Verified Dating', 600, 580);

  return canvas.toBuffer('image/png');
};

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3); // Max 3 lines
};

const adjustColor = (color, amount) => {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;

  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;

  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
};

// ── API Routes ──────────────────────────────────────────────────────────────

// Prerendering status endpoint
router.get('/prerender/status', (req, res) => {
  res.json({
    prerendererActive: !!prerenderer.browser,
    cacheSize: prerenderer.cache.size,
    uptime: process.uptime()
  });
});

// OG Image generation endpoint
router.post('/og/generate', async (req, res) => {
  try {
    const { type, ...params } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Type parameter required' });
    }

    const imageBuffer = await generateOgImage(type, params);

    // Generate filename
    const filename = `og-${type}-${Date.now()}.png`;
    const imagePath = path.join(__dirname, '../../public/og', filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(imagePath), { recursive: true });

    // Save image
    await fs.writeFile(imagePath, imageBuffer);

    // Return public URL
    const imageUrl = `/og/${filename}`;

    res.json({
      success: true,
      imageUrl,
      type,
      params
    });

  } catch (error) {
    console.error('OG Image generation error:', error);
    res.status(500).json({
      error: 'Failed to generate OG image',
      details: error.message
    });
  }
});

// Manual prerendering endpoint (for admin)
router.post('/prerender/manual', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    const prerenderedContent = await prerenderer.prerender(url);

    res.json({
      success: true,
      contentLength: prerenderedContent.length,
      url
    });

  } catch (error) {
    console.error('Manual prerendering error:', error);
    res.status(500).json({
      error: 'Failed to prerender page',
      details: error.message
    });
  }
});

module.exports = {
  router,
  prerenderMiddleware,
  prerenderer
};
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// ── Security & Performance Middleware ──────────────────────────────────────
// Gzip/Brotli compression for responses
app.use(compression({ level: 6, threshold: 1024 }));

// Enhanced Helmet.js configuration for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://pagead2.googlesyndication.com",
        "https://googleads.g.doubleclick.net",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://www.gstatic.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://elovialove.onrender.com",
        "wss://elovialove.onrender.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://pagead2.googlesyndication.com"
      ],
      frameSrc: ["'self'", "https://googleads.g.doubleclick.net"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'sameorigin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// ── Cache headers for optimal performance ──────────────────────────────────
// API responses (short cache)
app.use('/api/', (req, res, next) => {
  // Cache read-only API endpoints for 5 minutes
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  } else {
    // No cache for POST/PUT/DELETE
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
  next();
});

// Raw body capture for Razorpay webhook signature verification
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }), (req, _res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elovialove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.log('Server will continue running without database connection for demo purposes');
});

// Routes
app.set('io', io);

// ── Prerendering middleware for SEO pages ───────────────────────────────────
const { prerenderMiddleware } = require('./routes/seo');
app.use(prerenderMiddleware);

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/match', require('./routes/match'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/blog',     require('./routes/blog'));
app.use('/api/seo', require('./routes/seo'));

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user's room for private messages
  socket.on('join', (userId) => {
    const roomId = userId?.toString();
    if (roomId) {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    }
  });

  // Handle private messages — relay only to recipient, not back to sender
  socket.on('private_message', (data) => {
    const { to, message, from } = data;
    socket.to(to).emit('private_message', { message, from });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { to, from } = data;
    socket.to(to).emit('typing', { from });
  });

  socket.on('stop_typing', (data) => {
    const { to, from } = data;
    socket.to(to).emit('stop_typing', { from });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ── Dynamic sitemap.xml route (root level) ──────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const Blog = require('./models/Blog');
    const posts = await Blog.find({ isPublished: true }).select('slug updatedAt').sort({ updatedAt: -1 });
    const baseUrl = 'https://elovialove.onrender.com';

    const staticUrls = [
      '/',
      '/blog',
      '/blog/dating-tips',
      '/about',
      '/contact',
      '/pricing',
      '/privacy',
      '/terms',
      '/safety',
      '/community-guidelines',
      '/dating-safety',
      '/report-abuse',
      '/help',
      '/faq',
      '/dating-in-delhi',
      '/dating-in-mumbai',
      '/dating-in-bangalore',
      '/dating-in-kolkata',
      '/dating-in-ranchi',
      '/verified-profiles',
      '/private-chat',
      '/video-chat',
      '/safe-dating',
      '/serious-relationships'
    ];

    const blogSlugs = [
      'dating-profile-tips',
      'online-dating-safety',
      'first-message-examples',
      'how-to-find-real-love',
      'red-flags-in-online-dating',
      'long-distance-relationship-advice',
      'how-to-avoid-fake-profiles',
      'best-dating-app-tips',
      'how-to-start-a-conversation'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticUrls.forEach((path) => {
      xml += `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    const existingUrls = new Set();
    staticUrls.forEach((path) => existingUrls.add(`${baseUrl}${path}`));
    blogSlugs.forEach((slug) => {
      const url = `${baseUrl}/blog/${slug}`;
      existingUrls.add(url);
      xml += `
  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`;
    });

    posts.forEach(post => {
      const url = `${baseUrl}/blog/${post.slug}`;
      if (existingUrls.has(url)) return;
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${post.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).header('Content-Type', 'application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://elovialove.onrender.com/</loc></url>
  <url><loc>https://elovialove.onrender.com/blog</loc></url>
</urlset>`);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep-alive ping — prevents Render free tier from sleeping
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  setInterval(() => {
    https.get('https://elovialove.onrender.com/api/blog?limit=1', (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`);
    }).on('error', () => {});
  }, 14 * 60 * 1000); // every 14 minutes
}

module.exports = { app, server, io };
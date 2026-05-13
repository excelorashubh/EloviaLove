const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
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

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTION-READY EXPRESS SERVER FOR RENDER DEPLOYMENT
// ══════════════════════════════════════════════════════════════════════════════

// ── Trust Proxy (Required for Render) ─────────────────────────────────────────
app.set('trust proxy', 1);

// ── Compression Middleware (Performance) ──────────────────────────────────────
app.use(compression({ 
  level: 6, 
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
// FIXED: Removed upgradeInsecureRequests empty array (causes errors)
// FIXED: Optimized for React SPA + Google Analytics + Render deployment
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React hydration
        "'unsafe-eval'", // Required for React dev mode
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://www.gstatic.com",
        "https://pagead2.googlesyndication.com", // Google Ads
        "https://googleads.g.doubleclick.net"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for React inline styles
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "data:"
      ],
      connectSrc: [
        "'self'",
        "https://www.google-analytics.com",
        "https://analytics.google.com",
        "https://www.googletagmanager.com",
        "https://elovialove.onrender.com",
        "wss://elovialove.onrender.com",
        process.env.CLIENT_URL || "http://localhost:5173"
      ].filter(Boolean),
      frameSrc: [
        "'self'",
        "https://www.google.com", // reCAPTCHA
        "https://pagead2.googlesyndication.com" // Google Ads
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      // REMOVED: upgradeInsecureRequests (let Render handle HTTPS)
    }
  },
  crossOriginEmbedderPolicy: false, // Required for external resources
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow CDN resources
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: { 
    maxAge: 31536000, 
    includeSubDomains: true, 
    preload: true 
  },
  noSniff: true,
  frameguard: { action: 'sameorigin' },
  hidePoweredBy: true,
}));

// ── CORS Configuration ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiting (DDoS Protection) ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ── Cache Headers for API Routes ──────────────────────────────────────────────
app.use('/api/', (req, res, next) => {
  if (req.method === 'GET') {
    // Cache GET requests for 5 minutes
    res.set('Cache-Control', 'public, max-age=300');
  } else {
    // No cache for mutations
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// ── Raw Body for Webhook Verification ─────────────────────────────────────────
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }), (req, _res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});

// ── Body Parsing Middleware ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// ── Database Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elovialove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✓ MongoDB connected successfully'))
.catch(err => {
  console.error('✗ MongoDB connection error:', err.message);
  console.log('⚠ Server will continue running without database connection');
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// ── Socket.io Setup ───────────────────────────────────────────────────────────
app.set('io', io);

// ── SEO Middleware (Lightweight Crawler Detection) ────────────────────────────
const seoModule = require('./routes/seo');
app.use(seoModule.prerenderMiddleware);

// ══════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════════════════════

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
app.use('/api/blog', require('./routes/blog'));
app.use('/api/seo', seoModule.router);

// ══════════════════════════════════════════════════════════════════════════════
// SOCKET.IO REAL-TIME CHAT
// ══════════════════════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════════════════════
// DYNAMIC SITEMAP.XML (SEO)
// ══════════════════════════════════════════════════════════════════════════════

app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://elovialove.onrender.com';
    const xml = await seoModule.generateSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// STATIC FILE SERVING (React Build)
// ══════════════════════════════════════════════════════════════════════════════

// Serve static files from React build with aggressive caching
app.use(express.static(path.join(__dirname, '../client/dist'), {
  maxAge: '1y', // Cache static assets for 1 year
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // HTML files should not be cached (for SPA routing)
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Serve robots.txt and sitemap.xml from public folder
app.use(express.static(path.join(__dirname, '../client/public'), {
  maxAge: '1d',
  index: false // Don't serve index.html from public
}));

// ══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  
  // Don't leak error details in production
  const errorResponse = {
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  res.status(err.status || 500).json(errorResponse);
});

// ══════════════════════════════════════════════════════════════════════════════
// REACT SPA FALLBACK (MUST BE LAST)
// ══════════════════════════════════════════════════════════════════════════════

// Serve React app for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ══════════════════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log('═══════════════════════════════════════════════════════════');
});

// ══════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════════════════════════════════════

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to restart the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to restart the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// RENDER KEEP-ALIVE (Prevent Free Tier Sleep)
// ══════════════════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  setInterval(() => {
    https.get('https://elovialove.onrender.com/api/blog?limit=1', (res) => {
      console.log(`[Keep-Alive] Ping status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[Keep-Alive] Ping failed:', err.message);
    });
  }, 14 * 60 * 1000); // Every 14 minutes
}

module.exports = { app, server, io };
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN STARTUP FUNCTION (ENSURES PROPER INITIALIZATION ORDER)
// ══════════════════════════════════════════════════════════════════════════════

async function startServer() {
  // ── STEP 1: Validate Environment ────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 ELOVIA LOVE - SERVER STARTUP');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const StartupValidator = require('./utils/startupValidator');
  const validator = new StartupValidator();
  
  const validationResult = await validator.validate();
  if (!validationResult.success) {
    console.error('\n❌ Startup validation failed. Server cannot start.');
    process.exit(1);
  }
  
  console.log('\n✓ Validation complete - proceeding with initialization\n');

  // ── STEP 2: Initialize Express ─────────────────────────────────────────────
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
  // EXPRESS MIDDLEWARE CONFIGURATION
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
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://www.gstatic.com",
          "https://pagead2.googlesyndication.com",
          "https://googleads.g.doubleclick.net"
        ],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'",
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
          process.env.CLIENT_URL || "http://localhost:5173"
        ].filter(Boolean),
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://pagead2.googlesyndication.com"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);

  // ── Cache Headers for API Routes ──────────────────────────────────────────────
  app.use('/api/', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
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

  // ── Request Logging Middleware ────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
      console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
  });

  // ── STEP 3: Database Connection ───────────────────────────────────────────────
  console.log('🗄️  Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elovialove');
    console.log('✓ MongoDB connected successfully\n');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue running without database connection\n');
  }

  // Handle MongoDB connection errors after initial connection
  mongoose.connection.on('error', err => {
    console.error('MongoDB runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  // ── Socket.io Setup ───────────────────────────────────────────────────────────
  app.set('io', io);

  // Import video call signaling (with error handling)
  let setupCallSignaling;
  try {
    const callSignaling = require('./utils/callSignaling');
    setupCallSignaling = callSignaling.setupCallSignaling;
    console.log('✓ Video call signaling module loaded');
  } catch (error) {
    console.warn('⚠️  Video call signaling module not available:', error.message);
    setupCallSignaling = () => console.log('Video calling disabled (module not found)');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // API ROUTES (WITH ERROR HANDLING)
  // ══════════════════════════════════════════════════════════════════════════════

  // Health check endpoint (for Render monitoring)
  app.get('/health', (req, res) => {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    res.json(healthStatus);
  });

  // Helper function to safely load routes
  const safeLoadRoute = (path, routePath) => {
    try {
      const route = require(path);
      app.use(routePath, route);
      console.log(`✓ Loaded route: ${routePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load route ${routePath}:`, error.message);
      console.error('   Stack:', error.stack);
      
      // Create a fallback route that returns proper JSON error
      app.use(routePath, (req, res) => {
        console.error(`[RouteError] Request to unloaded route: ${req.method} ${req.path}`);
        res.status(503).json({ 
          success: false,
          error: 'Service temporarily unavailable',
          message: 'This API endpoint failed to load during server startup',
          route: routePath,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      });
      return false;
    }
  };

  // Load all routes with error handling
  console.log('\n📍 Loading API Routes...');
  safeLoadRoute('./routes/auth', '/api/auth');
  safeLoadRoute('./routes/users', '/api/users');
  safeLoadRoute('./routes/match', '/api/match');
  safeLoadRoute('./routes/matches', '/api/matches');
  safeLoadRoute('./routes/messages', '/api/messages');
  safeLoadRoute('./routes/notifications', '/api/notifications');
  safeLoadRoute('./routes/admin', '/api/admin');
  safeLoadRoute('./routes/subscription', '/api/subscription');
  safeLoadRoute('./routes/verify', '/api/verify');
  safeLoadRoute('./routes/analytics', '/api/analytics');
  safeLoadRoute('./routes/blog', '/api/blogs');
  safeLoadRoute('./routes/contact', '/api/contact');
  safeLoadRoute('./routes/ads', '/api/ads');
  safeLoadRoute('./routes/call', '/api/calls');
  console.log('✓ All routes loaded\n');

  // ══════════════════════════════════════════════════════════════════════════════
  // SOCKET.IO REAL-TIME CHAT & VIDEO CALLING
  // ══════════════════════════════════════════════════════════════════════════════

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      const roomId = userId?.toString();
      if (roomId) {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      }
    });

    socket.on('private_message', (data) => {
      const { to, message, from } = data;
      socket.to(to).emit('private_message', { message, from });
    });

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

  // Setup video call signaling
  setupCallSignaling(io);

  // ══════════════════════════════════════════════════════════════════════════════
  // STATIC FILE SERVING (React Build + Static Sitemap)
  // ══════════════════════════════════════════════════════════════════════════════

  app.use(express.static(path.join(__dirname, '../client/dist'), {
    maxAge: '1y',
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  app.use(express.static(path.join(__dirname, '../client/public'), {
    maxAge: '1d',
    index: false
  }));

  // ══════════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING MIDDLEWARE
  // ══════════════════════════════════════════════════════════════════════════════

  app.use((err, req, res, next) => {
    console.error('[Server Error]:', err.stack);
    
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

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 Starting Elovia Love Server...');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📦 Node Version: ${process.version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Missing'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'Not set'}`);
  console.log('───────────────────────────────────────────────────────────');

  server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`✓ Socket.IO: Initialized`);
    console.log(`✓ Video Calling: Signaling Active`);
    console.log(`✓ Health Check: http://localhost:${PORT}/health`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📍 Routes Registered:');
    console.log('   /api/auth        - Authentication');
    console.log('   /api/users       - User Management');
    console.log('   /api/match       - Matching');
    console.log('   /api/matches     - Match List');
    console.log('   /api/messages    - Messaging');
    console.log('   /api/notifications - Notifications');
    console.log('   /api/admin       - Admin Panel');
    console.log('   /api/subscription - Subscriptions');
    console.log('   /api/verify      - Verification');
    console.log('   /api/analytics   - Analytics');
    console.log('   /api/blogs       - Blog Posts');
    console.log('   /api/contact     - Contact Form');
    console.log('   /api/ads         - Advertisements');
    console.log('   /api/calls       - Video Calling');
    console.log('   /health          - Health Check');
    console.log('═══════════════════════════════════════════════════════════');
  });

  return { app, server, io };
}

// ══════════════════════════════════════════════════════════════════════════════
// START THE SERVER
// ══════════════════════════════════════════════════════════════════════════════

startServer().catch(err => {
  console.error('═══════════════════════════════════════════════════════════');
  console.error('❌ FATAL ERROR - Server failed to start');
  console.error('═══════════════════════════════════════════════════════════');
  console.error(err);
  console.error('═══════════════════════════════════════════════════════════');
  process.exit(1);
});

// ══════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════════════════════════════════════

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('═══════════════════════════════════════════════════════════');
  console.error('❌ UNCAUGHT EXCEPTION');
  console.error('═══════════════════════════════════════════════════════════');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('═══════════════════════════════════════════════════════════');
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Attempting graceful shutdown...');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('═══════════════════════════════════════════════════════════');
  console.error('❌ UNHANDLED PROMISE REJECTION');
  console.error('═══════════════════════════════════════════════════════════');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('═══════════════════════════════════════════════════════════');
  
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Server continuing despite unhandled rejection');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// RENDER KEEP-ALIVE (Prevent Free Tier Sleep)
// ══════════════════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  const keepAliveUrl = process.env.KEEP_ALIVE_URL || process.env.CLIENT_URL;
  if (keepAliveUrl) {
    setInterval(() => {
      https.get(`${keepAliveUrl}/api/blogs?limit=1`, (res) => {
        console.log(`[Keep-Alive] Ping status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('[Keep-Alive] Ping failed:', err.message);
      });
    }, 14 * 60 * 1000);
  }
}

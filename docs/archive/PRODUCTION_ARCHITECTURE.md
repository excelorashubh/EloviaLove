# 🏗️ Elovia Love - Production Architecture

## 📁 Project Structure

```
elovia-love/
├── client/                          # React Frontend
│   ├── dist/                        # Production build (generated)
│   ├── public/                      # Static assets
│   │   ├── robots.txt              # SEO crawler instructions
│   │   ├── sitemap.xml             # Static sitemap (fallback)
│   │   └── _headers                # Netlify/Cloudflare headers
│   ├── src/
│   │   ├── components/
│   │   │   ├── seo/                # SEO components (react-helmet-async)
│   │   │   ├── ads/                # Ad components
│   │   │   └── analytics/          # Analytics setup
│   │   ├── pages/                  # React pages
│   │   ├── context/                # React context (Auth, etc.)
│   │   └── services/               # API service layer
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express Backend
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                 # JWT authentication
│   │   └── checkPlan.js            # Subscription validation
│   ├── models/                      # MongoDB models
│   │   ├── User.js
│   │   ├── Blog.js
│   │   ├── Match.js
│   │   ├── Message.js
│   │   └── ...
│   ├── routes/                      # API routes
│   │   ├── auth.js                 # Authentication
│   │   ├── users.js                # User management
│   │   ├── blog.js                 # Blog posts
│   │   ├── match.js                # Matching algorithm
│   │   ├── messages.js             # Chat messages
│   │   ├── subscription.js         # Payment handling
│   │   ├── admin.js                # Admin panel
│   │   ├── analytics.js            # Analytics data
│   │   └── seo.js                  # SEO utilities
│   ├── server.js                    # Main server file
│   ├── package.json
│   └── RENDER_DEPLOYMENT.md
│
└── README.md
```

## 🔄 Request Flow

### 1. Static Assets (CSS, JS, Images)
```
Browser → Render → Express Static Middleware → client/dist/assets/
Cache: 1 year (immutable)
```

### 2. API Requests
```
Browser → Render → Rate Limiter → CORS → Body Parser → API Routes → MongoDB
Cache: 5 minutes (GET only)
```

### 3. React SPA Routes
```
Browser → Render → Express → index.html → React Router → Page Component
Cache: No cache (for SPA routing)
```

### 4. SEO Routes (Sitemap, Robots)
```
Browser/Crawler → Render → Express → Dynamic Generation → XML/TXT Response
Cache: 24 hours (sitemap), 1 day (robots.txt)
```

### 5. WebSocket (Real-time Chat)
```
Browser → Render → Socket.io → Room-based messaging → Target user
```

## 🛡️ Security Architecture

### Helmet Configuration
```javascript
✅ Content Security Policy (CSP)
   - Allows React inline styles/scripts
   - Allows Google Analytics
   - Allows external fonts/images
   - Blocks unsafe eval (except dev mode)

✅ HTTPS Enforcement
   - Handled by Render (automatic)
   - HSTS header (1 year)

✅ XSS Protection
   - noSniff enabled
   - frameGuard (sameorigin)

✅ CORS
   - Restricted to CLIENT_URL
   - Credentials enabled
```

### Rate Limiting
```javascript
API Routes: 100 requests / 15 minutes per IP
Webhook Routes: No rate limit (verified by signature)
```

### Authentication
```javascript
JWT tokens (httpOnly cookies recommended)
Password hashing: bcryptjs
Token expiry: 7 days (configurable)
```

## 📊 Database Architecture

### MongoDB Collections

**users**
- Authentication data
- Profile information
- Subscription status
- Verification status

**blogs**
- Blog posts
- SEO metadata
- Publication status
- Author information

**matches**
- User matching data
- Match scores
- Match status

**messages**
- Chat messages
- Read status
- Timestamps

**subscriptions**
- Payment records
- Plan details
- Razorpay integration

**notifications**
- User notifications
- Read status
- Notification types

**visitors**
- Analytics data
- Page views
- User agents

**reports**
- User reports
- Moderation data

## 🎯 SEO Architecture

### Client-Side SEO (react-helmet-async)
```javascript
✅ Dynamic meta tags per page
✅ Open Graph tags
✅ Twitter Card tags
✅ Canonical URLs
✅ Structured data (JSON-LD)
```

### Server-Side SEO
```javascript
✅ Dynamic sitemap.xml generation
✅ robots.txt serving
✅ Crawler detection middleware
✅ Proper cache headers
✅ XML sitemap with blog posts
```

### Why No Puppeteer?
```
❌ Heavy dependency (100+ MB)
❌ Requires Chromium (not available on Render free tier)
❌ Slow rendering (adds 2-5s per request)
❌ Memory intensive (512MB+ per instance)
❌ Deployment complexity

✅ Google crawls React SPAs natively (since 2019)
✅ react-helmet-async provides all necessary meta tags
✅ Faster deployment
✅ Lower memory usage
✅ More stable on Render
```

## ⚡ Performance Optimizations

### Compression
```javascript
Gzip/Brotli compression (level 6)
Threshold: 1KB
Applies to: HTML, CSS, JS, JSON, XML
```

### Caching Strategy
```javascript
Static Assets (JS/CSS/Images): 1 year
API GET Requests: 5 minutes
API Mutations: No cache
Sitemap: 24 hours
Robots.txt: 1 day
HTML: No cache (SPA routing)
```

### Database Optimization
```javascript
Indexes on frequently queried fields
Lean queries (no Mongoose overhead)
Connection pooling
Graceful reconnection
```

### Keep-Alive (Render Free Tier)
```javascript
Pings /api/blog?limit=1 every 14 minutes
Prevents cold starts
Lightweight endpoint
```

## 🔌 API Architecture

### REST API Endpoints

**Authentication**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**Users**
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/users/search

**Matching**
- GET /api/match/discover
- POST /api/match/like
- POST /api/match/pass
- GET /api/matches

**Messages**
- GET /api/messages/:matchId
- POST /api/messages
- PUT /api/messages/:id/read

**Blog**
- GET /api/blog
- GET /api/blog/:slug
- POST /api/blog (admin)
- PUT /api/blog/:id (admin)
- DELETE /api/blog/:id (admin)

**Subscriptions**
- GET /api/subscription/plans
- POST /api/subscription/create
- POST /api/subscription/webhook
- GET /api/subscription/status

**Admin**
- GET /api/admin/users
- GET /api/admin/analytics
- GET /api/admin/revenue
- POST /api/admin/verify-user

**Analytics**
- POST /api/analytics/track
- GET /api/analytics/visitors
- GET /api/analytics/reports

**SEO**
- GET /api/seo/status
- GET /api/seo/metadata/:route
- POST /api/seo/sitemap/regenerate

### WebSocket Events

**Client → Server**
- join (userId)
- private_message (to, message, from)
- typing (to, from)
- stop_typing (to, from)

**Server → Client**
- private_message (message, from)
- typing (from)
- stop_typing (from)

## 🚀 Deployment Pipeline

### Build Process
```bash
1. Install client dependencies
2. Build React app (Vite)
3. Install server dependencies
4. Start Express server
```

### Environment Variables
```bash
Required:
- NODE_ENV=production
- PORT=5000
- MONGODB_URI
- JWT_SECRET
- CLIENT_URL

Optional:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
```

### Health Checks
```bash
Endpoint: /api/blog?limit=1
Expected: 200 OK with JSON response
Frequency: Every 30 seconds (Render default)
```

## 🐛 Error Handling

### Global Error Handler
```javascript
Catches all unhandled errors
Logs to console
Returns safe error messages (no stack traces in production)
```

### Async Error Handling
```javascript
All async routes wrapped in try-catch
Database errors handled gracefully
Fallback responses for critical routes
```

### Process Error Handling
```javascript
uncaughtException → Log + Exit (production)
unhandledRejection → Log + Exit (production)
SIGTERM → Graceful shutdown
SIGINT → Graceful shutdown
```

## 📈 Monitoring & Logging

### Server Logs
```javascript
✓ MongoDB connection status
✓ Server startup confirmation
✓ Crawler detection
✓ Keep-alive pings
✓ Error stack traces (dev only)
```

### Recommended Monitoring
```javascript
- Render built-in metrics
- MongoDB Atlas monitoring
- Google Analytics
- Google Search Console
- Sentry (error tracking)
- LogRocket (session replay)
```

## 🔄 Middleware Order (Critical!)

```javascript
1. Trust Proxy
2. Compression
3. Helmet (Security Headers)
4. CORS
5. Rate Limiting
6. Cache Headers
7. Raw Body (Webhooks)
8. Body Parser (JSON/URL-encoded)
9. Database Connection
10. SEO Middleware (Crawler Detection)
11. API Routes
12. Static File Serving (React build)
13. Static File Serving (Public folder)
14. Error Handler
15. React SPA Fallback (MUST BE LAST!)
```

## 🎨 Frontend Architecture

### React Components
```javascript
Pages → Layout → Components → UI Elements
Context: AuthContext (global state)
Routing: React Router v7
Styling: Tailwind CSS
Animations: Framer Motion
```

### SEO Components
```javascript
SeoComponents.jsx → react-helmet-async wrappers
EatOptimization.jsx → E-A-T signals
NoIndexComponents.jsx → Private page protection
OgImageGenerator.jsx → Social media previews
```

### State Management
```javascript
AuthContext → User authentication state
Local State → Component-specific state
API Service → Centralized API calls
```

## 🔐 Security Best Practices

✅ Environment variables for secrets
✅ JWT token authentication
✅ Password hashing (bcryptjs)
✅ Rate limiting on API routes
✅ CORS restrictions
✅ Helmet security headers
✅ Input validation (express-validator)
✅ MongoDB injection prevention (Mongoose)
✅ XSS protection (React escapes by default)
✅ CSRF protection (SameSite cookies)

## 📱 Mobile Optimization

✅ Responsive design (Tailwind)
✅ Touch-friendly UI
✅ Fast loading (code splitting)
✅ PWA-ready (service worker)
✅ Mobile-first approach

## 🌐 Browser Support

✅ Chrome (last 2 versions)
✅ Firefox (last 2 versions)
✅ Safari (last 2 versions)
✅ Edge (last 2 versions)
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance Targets

- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- API Response Time: < 500ms
- Database Query Time: < 100ms

## 🎯 Future Improvements

- [ ] Redis caching layer
- [ ] CDN integration (Cloudflare)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Server-side rendering (SSR) for critical pages
- [ ] GraphQL API (optional)
- [ ] Microservices architecture (if scaling needed)
- [ ] Kubernetes deployment (if scaling needed)
- [ ] Real-time analytics dashboard
- [ ] A/B testing framework
- [ ] Advanced monitoring (Datadog, New Relic)

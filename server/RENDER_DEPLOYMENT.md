# 🚀 Render Deployment Guide - Elovia Love

## ✅ Deployment Checklist

### 1. Environment Variables (Render Dashboard)

Set these in Render Dashboard → Environment:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://elovialove.onrender.com
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 2. Render Service Configuration

**Service Type:** Web Service

**Build Command:**
```bash
cd client && npm install && npm run build && cd ../server && npm install
```

**Start Command:**
```bash
cd server && npm start
```

**Node Version:** 22.x (specified in package.json)

**Auto-Deploy:** Yes (recommended)

### 3. Health Check Endpoint

Render will ping: `https://elovialove.onrender.com/api/blog?limit=1`

This endpoint is lightweight and confirms:
- Server is running
- Database connection works
- API routes are functional

### 4. Static File Serving

React build is served from: `server/../client/dist`

Static assets are cached for 1 year (immutable).

HTML files are not cached (for SPA routing).

### 5. SEO Configuration

✅ **Sitemap:** `/sitemap.xml` (dynamically generated)
✅ **Robots.txt:** `/robots.txt` (served from client/public)
✅ **Meta Tags:** Client-side via react-helmet-async
✅ **Crawler Detection:** Lightweight middleware (no Puppeteer)

### 6. Security Headers

✅ Helmet configured for React SPA
✅ CSP allows Google Analytics
✅ CORS configured for production
✅ Rate limiting on API routes
✅ Trust proxy enabled for Render

### 7. Performance Optimizations

✅ Gzip/Brotli compression
✅ Static asset caching (1 year)
✅ API response caching (5 minutes for GET)
✅ MongoDB connection pooling
✅ Keep-alive ping (prevents cold starts)

## 🔧 Troubleshooting

### Issue: "Cannot find module 'puppeteer'"
**Status:** ✅ FIXED
**Solution:** Removed Puppeteer dependency. Using react-helmet-async for SEO instead.

### Issue: "upgradeInsecureRequests error"
**Status:** ✅ FIXED
**Solution:** Removed empty upgradeInsecureRequests array from Helmet CSP.

### Issue: React routes return 404
**Status:** ✅ FIXED
**Solution:** Moved SPA fallback to end of middleware chain.

### Issue: Static files not loading
**Status:** ✅ FIXED
**Solution:** Proper static file serving order with correct cache headers.

### Issue: MongoDB connection fails
**Status:** ✅ HANDLED
**Solution:** Server continues running with fallback responses.

## 📊 Monitoring

### Key Metrics to Watch

1. **Response Time:** Should be < 500ms for API routes
2. **Error Rate:** Should be < 1%
3. **Memory Usage:** Should stay under 512MB
4. **CPU Usage:** Should stay under 50%

### Logs to Monitor

```bash
# Success indicators
✓ MongoDB connected successfully
✓ Server running on port 5000
[Keep-Alive] Ping status: 200

# Warning indicators
⚠ Server will continue running without database connection
[SEO] Crawler detected: Googlebot

# Error indicators
✗ MongoDB connection error
[Server Error]: <error details>
```

## 🎯 Post-Deployment Verification

### 1. Test Core Functionality
- [ ] Homepage loads: https://elovialove.onrender.com/
- [ ] API responds: https://elovialove.onrender.com/api/blog?limit=1
- [ ] Sitemap works: https://elovialove.onrender.com/sitemap.xml
- [ ] Robots.txt works: https://elovialove.onrender.com/robots.txt

### 2. Test SEO
- [ ] View page source shows meta tags
- [ ] Google Search Console can fetch sitemap
- [ ] No CSP errors in browser console
- [ ] Social media preview works (Facebook, Twitter)

### 3. Test Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors

### 4. Test Security
- [ ] HTTPS works
- [ ] Security headers present (check securityheaders.com)
- [ ] No mixed content warnings
- [ ] CORS works correctly

## 🔄 Deployment Process

### Initial Deployment
1. Push code to GitHub
2. Connect Render to GitHub repo
3. Configure environment variables
4. Set build and start commands
5. Deploy

### Subsequent Deployments
1. Push code to GitHub
2. Render auto-deploys (if enabled)
3. Monitor logs for errors
4. Verify functionality

## 📝 Notes

- **Cold Starts:** First request after inactivity may take 30-60 seconds
- **Free Tier:** Service sleeps after 15 minutes of inactivity
- **Keep-Alive:** Pings every 14 minutes to prevent sleep
- **Database:** Use MongoDB Atlas free tier for production
- **CDN:** Consider Cloudflare for additional caching

## 🆘 Support

If deployment fails:
1. Check Render logs for specific error
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Check Node version compatibility
5. Verify build command completes successfully

## 🎉 Success Indicators

When deployment is successful, you should see:

```
═══════════════════════════════════════════════════════════
✓ Server running on port 5000
✓ Environment: production
✓ MongoDB: Connected
═══════════════════════════════════════════════════════════
```

Your site should be live at: https://elovialove.onrender.com

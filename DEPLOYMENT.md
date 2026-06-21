# 🚀 Elovia Love - Production Deployment Guide

This document provides everything needed to deploy and maintain Elovia Love in a production environment, specifically optimized for **Render**.

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Render Configuration](#-render-configuration)
- [Post-Deployment Checklist](#-post-deployment-checklist)
- [Troubleshooting & Fixes](#-troubleshooting--fixes)
- [Production Architecture](#-production-architecture)

---

## ⚡ Quick Start

### 1. Push to GitHub
Ensure your latest changes are committed and pushed to your main branch.
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### 2. Configure Render Service
- **Service Type:** Web Service
- **Runtime:** Node
- **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install`
- **Start Command:** `cd server && npm start`

---

## 🔐 Environment Variables

Required variables for the **Server** service on Render:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for auth tokens | `your_random_string` |
| `CLIENT_URL` | Production URL of your app | `https://elovialove.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name | `your_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_secret` |

---

## 🛠️ Render Configuration

### Build & Start Commands
To ensure a smooth build on Render's shared environment, use these optimized commands:

**Build Command:**
```bash
# Cleans and builds both frontend and backend
cd client && npm install && npm run build && cd ../server && npm install
```

**Start Command:**
```bash
cd server && npm start
```

### Health Check
- **Endpoint:** `/api/blog?limit=1`
- **Purpose:** Verifies DB connectivity and server responsiveness.

---

## ✅ Post-Deployment Checklist

1. [ ] **Verify SSL:** Ensure the site is served over HTTPS.
2. [ ] **Check Sitemap:** Visit `/sitemap.xml` to ensure it generates correctly.
3. [ ] **Check Robots:** Visit `/robots.txt` to verify crawler instructions.
4. [ ] **Test Auth:** Register a new user and log in.
5. [ ] **Test Chat:** Open two browser windows and test real-time messaging.
6. [ ] **Image Uploads:** Verify profile picture uploads go to Cloudinary.

---

## 🐛 Troubleshooting & Fixes

### Common Issues & Solutions

#### 1. "Cannot find module 'puppeteer'"
**Fixed:** Puppeteer was removed to support Render Free Tier. We now use native React SEO and lightweight crawler detection.

#### 2. Cold Starts (Free Tier)
**Solution:** The server includes a "Keep-Alive" ping that hits the API every 14 minutes.
- **Endpoint:** `/api/blog?limit=1`

#### 3. Routing (404 on Refresh)
**Solution:** The Express server is configured with a catch-all route `*` that serves `index.html`. **Important:** This must be the *last* route defined in `server.js`.

#### 4. Helmet CSP Errors
**Solution:** Content Security Policy is configured to allow:
- Inline styles/scripts for React/Framer Motion.
- External fonts (Google Fonts).
- External images (Cloudinary).

---

## 🏗️ Production Architecture

Elovia Love uses a **Hybrid SPA Architecture**:
- **Frontend:** React 19 (Vite) - Single Page Application.
- **Backend:** Express.js (Node 22) - API + Static File Server.
- **SEO:** `react-helmet-async` for dynamic metadata + Server-side sitemap/robots.
- **Database:** MongoDB Atlas (Cloud).
- **Storage:** Cloudinary (Images).

---

**Last Updated:** May 2026
**Status:** ✅ Production Ready

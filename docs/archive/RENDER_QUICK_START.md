# Render Quick Start Guide

## Build Command
```
cd client && npm install && npm run build && cd ../server && npm install
```

## Start Command
```
cd server && npm start
```

## Environment Variables
```
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

## Health Check
Path: `/api/blog?limit=1`

## Verification
- Homepage: https://elovialove.onrender.com/
- API: https://elovialove.onrender.com/api/blog?limit=1
- Sitemap: https://elovialove.onrender.com/sitemap.xml
- Robots: https://elovialove.onrender.com/robots.txt

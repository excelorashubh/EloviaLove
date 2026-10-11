# ❤️ Elovia Love - Premium Dating Platform

[![Production Status](https://img.shields.io/badge/Production-Live-success)](https://elovialove.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

Elovia Love is a modern, high-performance dating platform built with the MERN stack (MongoDB, Express, React, Node.js). It features real-time matching, instant messaging, and a robust SEO-driven architecture.

---

## 🌟 Features

- **Swipe & Discover**: Modern matching interface with Framer Motion animations.
- **Real-time Chat**: Instant messaging powered by Socket.io.
- **SEO Optimized**: Dynamic metadata, sitemaps, and crawler-friendly architecture.
- **Premium UI**: Sleek, mobile-first design using Tailwind CSS.
- **Secure**: JWT authentication, bcrypt hashing, and rate-limiting.
- **Admin Suite**: Comprehensive management of users, reports, and analytics.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **SEO**: React Helmet Async

### Backend
- **Server**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Media**: Cloudinary (Image Hosting)
- **Security**: Helmet, CORS, Express-Validator

---

## 🛠️ Repository Structure

```text
/
├── client/                 # React Frontend
│   ├── public/             # Static assets, robots.txt, sitemap.xml
│   └── src/
│       ├── components/     # UI & SEO Components
│       ├── pages/          # Route views (Home, Discover, Chat)
│       └── services/       # API integration layer
├── server/                 # Express Backend
│   ├── middleware/         # Auth, Security & SEO helpers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API & Page routes
│   └── index.js            # Entry point
├── docs/                   # (Optional) Archived technical logs
├── DEPLOYMENT.md           # Production & Render deployment guide
├── SEO_BLUEPRINT.md        # Strategic SEO clusters & architecture
└── README.md               # You are here
```

---

## 💻 Local Development

### 1. Prerequisites
- Node.js v18+
- MongoDB instance (Local or Atlas)

### 2. Backend Setup
```bash
cd server
npm install
# Configure your .env file
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🌍 SEO Architecture

Elovia Love is built for organic growth:
- **Dynamic Sitemap**: Automatically updated at `/sitemap.xml`.
- **Robots Control**: Optimized `/robots.txt` to prioritize public landing pages.
- **Structured Data**: JSON-LD implementation for rich search results.
- **Meta Management**: Dynamic `<title>` and `<meta>` tags per page.

See [SEO_BLUEPRINT.md](./SEO_BLUEPRINT.md) for the complete strategy.

---

## 🚢 Production Deployment

The platform is optimized for **Render**. Detailed instructions including environment variables and build commands can be found in:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## ⚖️ License

Distributed under the ISC License. See `LICENSE` for more information.

---

**Built with ❤️ by the Elovia Team.**
# EloviaLove - Modern Dating Platform

A fully functional modern dating website built with React, Node.js, Express, MongoDB, and Socket.io.

## Features

### Frontend (React + Vite)
- **Beautiful UI**: Modern design with Tailwind CSS and Framer Motion animations
- **Responsive**: Mobile-first design that works on all devices
- **Public Pages**: Home, About, Contact, Login, Signup
- **User Dashboard**: Profile management, matching, chat, notifications
- **Discover System**: Swipe-based matching interface
- **Real-time Chat**: Socket.io powered messaging
- **Authentication**: JWT-based auth with protected routes

### Backend (Node.js + Express)
- **Authentication**: JWT tokens, password hashing with bcrypt
- **User Management**: Profile creation, photo uploads (Cloudinary)
- **Matching System**: Like/pass system with automatic matching
- **Real-time Chat**: Socket.io for instant messaging
- **Notifications**: Match, message, and system notifications
- **Admin Panel**: User management, reports, analytics
- **Security**: Rate limiting, input validation, CORS

### Database (MongoDB)
- **Users**: Profile data, authentication, preferences
- **Likes**: Like/pass interactions between users
- **Matches**: Successful matches for chat
- **Messages**: Chat history with read status
- **Notifications**: User notifications
- **Reports**: User reports for moderation

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- Bcryptjs
- Cloudinary (image storage)
- Express Validator
- Helmet (security)
- CORS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd elovialove
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/elovialove
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the servers**

   Backend (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```

   Frontend (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-photo` - Upload profile photo
- `POST /api/users/upload-photos` - Upload additional photos
- `GET /api/users/discover` - Get users for discovery
- `POST /api/users/like/:userId` - Like/pass a user
- `POST /api/users/report/:userId` - Report a user

### Matches
- `GET /api/matches` - Get user's matches
- `GET /api/matches/:matchId` - Get specific match
- `DELETE /api/matches/:matchId` - Unmatch user

### Messages
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages/:userId` - Send message
- `GET /api/messages` - Get conversations

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/reports` - Get reports
- `PUT /api/admin/reports/:id` - Update report status
- `GET /api/admin/stats` - Get platform statistics

## Project Structure

```
elovialove/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

## Features Overview

### User Registration & Authentication
- Secure registration with email verification
- JWT-based authentication
- Password strength requirements
- Profile completion tracking

### Profile Management
- Comprehensive profile creation
- Photo uploads with Cloudinary
- Interest and preference settings
- Profile privacy controls

### Matching System
- Discover users with swipe interface
- Like/pass functionality
- Automatic match creation
- Match notifications

### Real-time Chat
- Socket.io powered messaging
- Typing indicators
- Online status
- Message read receipts
- Unread message counters

### Notifications
- Match notifications
- Message notifications
- Like notifications
- System notifications

### Admin Panel
- User management
- Content moderation
- Report handling
- Platform analytics
- Account suspension

### Security Features
- Password hashing
- JWT authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or create an issue in the repository.
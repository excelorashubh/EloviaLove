import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Discover from './pages/Discover';
import CityPage from './pages/CityPage';
import DatingInIndiaPage from './pages/DatingInIndiaPage';
import DatingInDelhiPage from './pages/DatingInDelhiPage';
import DatingInMumbaiPage from './pages/DatingInMumbaiPage';
import DatingInBangalorePage from './pages/DatingInBangalorePage';
import DatingInKolkataPage from './pages/DatingInKolkataPage';
import DatingInRanchiPage from './pages/DatingInRanchiPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chats from './pages/Chats';
import Chat from './pages/Chat';
import Matches from './pages/Matches';
import ProfileEdit from './pages/ProfileEdit';
import Settings from './pages/Settings';
import SalesmanSection from './pages/salesman/SalesmanSection';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminVisitors from './pages/admin/AdminVisitors';
import AdminPlans from './pages/admin/AdminPlans';
import AdminBlog from './pages/admin/AdminBlog';
import AdminAds from './pages/admin/AdminAds';
import AdminContactMessages from './pages/admin/AdminContactMessages';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import GlobalNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import CookieConsent from './components/CookieConsent';

function AppContent() {
  const location = useLocation();
  const hideGlobalNavbar = location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideGlobalNavbar && <GlobalNavbar />}

      <main className={`min-h-screen ${!hideGlobalNavbar ? 'pt-20' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/dating-in-india" element={<DatingInIndiaPage />} />
          <Route path="/dating-in-delhi" element={<DatingInDelhiPage />} />
          <Route path="/dating-in-mumbai" element={<DatingInMumbaiPage />} />
          <Route path="/dating-in-bangalore" element={<DatingInBangalorePage />} />
          <Route path="/dating-in-kolkata" element={<DatingInKolkataPage />} />
          <Route path="/dating-in-ranchi" element={<DatingInRanchiPage />} />
          <Route path="/dating-in-:city" element={<CityPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/home"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman"
            element={
              <ProtectedRoute>
                <SalesmanSection section="home" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/home"
            element={
              <ProtectedRoute>
                <SalesmanSection section="home" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/leads"
            element={
              <ProtectedRoute>
                <SalesmanSection section="leads" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/follow-ups"
            element={
              <ProtectedRoute>
                <SalesmanSection section="follow-ups" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/admissions"
            element={
              <ProtectedRoute>
                <SalesmanSection section="admissions" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/students"
            element={
              <ProtectedRoute>
                <SalesmanSection section="students" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/reports"
            element={
              <ProtectedRoute>
                <SalesmanSection section="reports" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/notifications"
            element={
              <ProtectedRoute>
                <SalesmanSection section="notifications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/chat"
            element={
              <ProtectedRoute>
                <SalesmanSection section="chat" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/profile"
            element={
              <ProtectedRoute>
                <SalesmanSection section="profile" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salesman/settings"
            element={
              <ProtectedRoute>
                <SalesmanSection section="settings" />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><AdminContactMessages /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/visitors" element={<AdminRoute><AdminVisitors /></AdminRoute>} />
          <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
          <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />

          {/* 404 MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <CookieConsent />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
 

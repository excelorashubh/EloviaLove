import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import Login from './pages/Login';
import Register from './pages/Signup';
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

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import GlobalNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import CookieConsent from './components/CookieConsent';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <GlobalNavbar />

          <main className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/discover" element={<Discover />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
 

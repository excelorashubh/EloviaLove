import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useEffect, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminRoute from './components/AdminRoute';
import Footer from './components/layout/Footer';
import CookieConsent from './components/CookieConsent';
import api from './services/api';
import { SEO_PAGE_SLUGS } from './data/seoContent';

// ── Eagerly loaded pages (above-the-fold, critical) ──────────────────────────
import Home from './pages/Home';

// ── Lazy loaded pages (public, non-critical) ──────────────────────────────────
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const DatingTips = lazy(() => import('./pages/DatingTips'));
const SeoPage = lazy(() => import('./pages/SeoPage'));

// ── Lazy loaded authenticated pages ────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Discover = lazy(() => import('./pages/Discover'));
const Matches = lazy(() => import('./pages/Matches'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Chats = lazy(() => import('./pages/Chats'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const Verify = lazy(() => import('./pages/Verify'));

// ── Lazy loaded admin pages ────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminVisitors = lazy(() => import('./pages/admin/AdminVisitors'));
const AdminAds = lazy(() => import('./pages/admin/AdminAds'));
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));

// ── Loading fallback component ─────────────────────────────────────────────────
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

// ── Google Analytics page view helper ────────────────────────────────────────
const trackPageView = (path) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, { page_path: path });
  }
};

// ── Visitor tracker + GA page view — fires on every route change ──────────────
const VisitorTracker = () => {
  const location = useLocation();
  useEffect(() => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('visitorId', visitorId);
    }
    api.post('/analytics/track', { visitorId, page: location.pathname }).catch(() => {});
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
};

// Default SEO wrapper for all routes
const SeoDefaults = () => {
  const location = useLocation();
  const url = `https://elovialove.onrender.com${location.pathname === '/' ? '' : location.pathname}`;
  return (
    <Helmet>
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content="Elovia Love" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://elovialove.onrender.com/EloviaLoveWB_small.png" />
      <meta property="og:image:alt" content="Elovia Love logo" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://elovialove.onrender.com/EloviaLoveWB_small.png" />
      <meta name="twitter:image:alt" content="Elovia Love logo" />
    </Helmet>
  );
};

// Layout wrapper for public/user pages
const MainLayout = ({ children, showNav = false }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
    <SeoDefaults />
    {showNav && <Navbar />}
    <main className="grow">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <VisitorTracker />
        <CookieConsent />
        <Routes>
          {/* Admin — full screen with own sidebar layout */}
          <Route path="/admin" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminUsers /></Suspense></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminReports /></Suspense></AdminRoute>} />
          <Route path="/admin/revenue" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminRevenue /></Suspense></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminAnalytics /></Suspense></AdminRoute>} />
          <Route path="/admin/visitors"  element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminVisitors /></Suspense></AdminRoute>} />
          <Route path="/admin/ads"      element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminAds /></Suspense></AdminRoute>} />
          <Route path="/admin/plans"    element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminPlans /></Suspense></AdminRoute>} />
          <Route path="/admin/blog"     element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminBlog /></Suspense></AdminRoute>} />

          {/* Public & user routes with Navbar + Footer */}
          <Route path="/" element={<MainLayout showNav><Home /></MainLayout>} />
          <Route path="/about" element={<MainLayout showNav><Suspense fallback={<LoadingFallback />}><About /></Suspense></MainLayout>} />
          <Route path="/contact" element={<MainLayout showNav><Suspense fallback={<LoadingFallback />}><Contact /></Suspense></MainLayout>} />
          <Route path="/login" element={<MainLayout showNav><GuestRoute><Suspense fallback={<LoadingFallback />}><Login /></Suspense></GuestRoute></MainLayout>} />
          <Route path="/signup" element={<MainLayout showNav><GuestRoute><Suspense fallback={<LoadingFallback />}><Signup /></Suspense></GuestRoute></MainLayout>} />
          <Route path="/pricing" element={<MainLayout showNav><Suspense fallback={<LoadingFallback />}><Pricing /></Suspense></MainLayout>} />
          <Route path="/blog" element={<MainLayout showNav><Suspense fallback={<LoadingFallback />}><Blog /></Suspense></MainLayout>} />
          <Route path="/blog/" element={<Navigate to="/blog" replace />} />
          <Route path="/blog/dating-tips" element={<MainLayout showNav><Suspense fallback={<LoadingFallback />}><DatingTips /></Suspense></MainLayout>} />
          <Route path="/blog/:slug" element={<MainLayout showNav><Suspense fallback={<LoadingFallback />}><BlogPost /></Suspense></MainLayout>} />
          {SEO_PAGE_SLUGS.map((slug) => (
            <Route
              key={slug}
              path={`/${slug}`}
              element={(
                <MainLayout showNav>
                  <Suspense fallback={<LoadingFallback />}>
                    <SeoPage slug={slug} />
                  </Suspense>
                </MainLayout>
              )}
            />
          ))}
          <Route path="/dashboard" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/discover" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Discover /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/matches" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Matches /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/chat/:userId" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Chat /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Profile /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/profile/edit" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><ProfileEdit /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/notifications" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Notifications /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/chats" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Chats /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/subscription/success" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><SubscriptionSuccess /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/verify" element={<MainLayout><ProtectedRoute><Suspense fallback={<LoadingFallback />}><Verify /></Suspense></ProtectedRoute></MainLayout>} />
          <Route path="/verify-email" element={<MainLayout><Verify /></MainLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

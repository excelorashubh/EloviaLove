import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { Children, useEffect, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';

import GlobalNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';

import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminRoute from './components/AdminRoute';

import api from './services/api';

// ─────────────────────────────────────────────────────────────
// SAFE EAGER IMPORTS
// ─────────────────────────────────────────────────────────────
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

// ─────────────────────────────────────────────────────────────
// SAFE LAZY IMPORTS
// ─────────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Discover = lazy(() => import('./pages/Discover'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminVisitors = lazy(() => import('./pages/admin/AdminVisitors'));
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminAds = lazy(() => import('./pages/admin/AdminAds'));

// ─────────────────────────────────────────────────────────────
// LOADING FALLBACK
// ─────────────────────────────────────────────────────────────
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PAGE TRACKER
// ─────────────────────────────────────────────────────────────
const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    let visitorId = localStorage.getItem('visitorId');

    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      localStorage.setItem('visitorId', visitorId);
    }

    api
      .post('/analytics/track', {
        visitorId,
        page: location.pathname,
      })
      .catch(() => {});

  }, [location.pathname]);

  return null;
};

// ─────────────────────────────────────────────────────────────
// SEO DEFAULTS
// ─────────────────────────────────────────────────────────────
const SeoDefaults = () => {
  const location = useLocation();

  const url =
    `https://elovialove.onrender.com${
      location.pathname === '/' ? '' : location.pathname
    }`;

  return (
    <Helmet>
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content="Elovia Love" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      <meta
        property="og:image"
        content="https://elovialove.onrender.com/EloviaLoveWB_small.png"
      />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />
    </Helmet>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────
const MainLayout = ({ children, showNav = false }) => {
  if (typeof window !== 'undefined') {
    console.log('[MainLayout] rendering', { showNav, childCount: Children.count(children) });
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SeoDefaults />

      {showNav && <GlobalNavbar />}

      <main className="grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 404 PAGE
// ─────────────────────────────────────────────────────────────
const NotFound = () => {
  return (
    <MainLayout showNav>
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">

        <h1 className="text-6xl font-bold text-primary-600 mb-4">
          404
        </h1>

        <p className="text-slate-600 mb-6">
          Page not found
        </p>

        <Link
          to="/"
          className="px-6 py-3 bg-primary-600 text-white rounded-xl"
        >
          Go Home
        </Link>

      </div>
    </MainLayout>
  );
};

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────
function App() {
  if (typeof window !== 'undefined') {
    console.log('[App] render start', window.location.pathname);
  }

  return (
    <ErrorBoundary>

      <AuthProvider>

        <Router>
          {import.meta.env.DEV && typeof window !== 'undefined' && (
            <div className="fixed top-2 left-2 z-[999] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-900 shadow-lg shadow-slate-200">
              APP LOADED {window.location.pathname}
            </div>
          )}

          <VisitorTracker />

          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <MainLayout showNav>
                    <Home />
                  </MainLayout>
                }
              />

              <Route
                path="/blog"
                element={
                  <MainLayout showNav>
                    <Blog />
                  </MainLayout>
                }
              />

              <Route
                path="/about"
                element={
                  <MainLayout showNav>
                    <About />
                  </MainLayout>
                }
              />

              <Route
                path="/contact"
                element={
                  <MainLayout showNav>
                    <Contact />
                  </MainLayout>
                }
              />

              <Route
                path="/login"
                element={
                  <MainLayout showNav>
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  </MainLayout>
                }
              />

              <Route
                path="/signup"
                element={
                  <MainLayout showNav>
                    <GuestRoute>
                      <Signup />
                    </GuestRoute>
                  </MainLayout>
                }
              />

              <Route
                path="/pricing"
                element={
                  <MainLayout showNav>
                    <Pricing />
                  </MainLayout>
                }
              />

              <Route
                path="/discover"
                element={
                  <MainLayout showNav>
                    <Discover />
                  </MainLayout>
                }
              />

              <Route
                path="/blog/:slug"
                element={
                  <MainLayout showNav>
                    <BlogPost />
                  </MainLayout>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout showNav>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <AdminReports />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/revenue"
                element={
                  <AdminRoute>
                    <AdminRevenue />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminRoute>
                    <AdminAnalytics />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/visitors"
                element={
                  <AdminRoute>
                    <AdminVisitors />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/plans"
                element={
                  <AdminRoute>
                    <AdminPlans />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <AdminRoute>
                    <AdminBlog />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/ads"
                element={
                  <AdminRoute>
                    <AdminAds />
                  </AdminRoute>
                }
              />

              <Route
                path="/blog/"
                element={<Navigate to="/blog" replace />}
              />

              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </Suspense>

          <CookieConsent />

        </Router>

      </AuthProvider>

    </ErrorBoundary>
  );
}

export default App;
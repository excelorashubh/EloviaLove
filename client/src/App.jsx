import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { useEffect, Suspense, lazy } from 'react';
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
  return (
    <ErrorBoundary>

      <AuthProvider>

        <Router>

          <VisitorTracker />

          <Suspense fallback={<LoadingFallback />}>

            <Routes>

              {/* HOME */}
              <Route
                path="/"
                element={
                  <MainLayout showNav>
                    <Home />
                  </MainLayout>
                }
              />

              {/* BLOG */}
              <Route
                path="/blog"
                element={
                  <MainLayout showNav>
                    <Blog />
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

              {/* ABOUT */}
              <Route
                path="/about"
                element={
                  <MainLayout showNav>
                    <About />
                  </MainLayout>
                }
              />

              {/* CONTACT */}
              <Route
                path="/contact"
                element={
                  <MainLayout showNav>
                    <Contact />
                  </MainLayout>
                }
              />

              {/* LOGIN */}
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

              {/* SIGNUP */}
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

              {/* PRICING */}
              <Route
                path="/pricing"
                element={
                  <MainLayout showNav>
                    <Pricing />
                  </MainLayout>
                }
              />

              {/* DASHBOARD */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="p-10">
                        Dashboard
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* ADMIN */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <div className="p-10">
                      Admin Dashboard
                    </div>
                  </AdminRoute>
                }
              />

              {/* REDIRECT */}
              <Route
                path="/blog/"
                element={<Navigate to="/blog" replace />}
              />

              {/* 404 */}
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
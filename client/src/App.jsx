import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import GlobalNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import CookieConsent from './components/CookieConsent';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function InlineLogger(){
  useEffect(()=>{ console.log('[InlineLogger] mounted /blog'); return () => console.log('[InlineLogger] unmounted /blog'); }, []);
  console.log('[InlineLogger] render');
  return <div id="BLOG_DIRECT" style={{padding:20}}>BLOG DIRECT</div>;
}

function App() {
  if (typeof window !== 'undefined') {
    console.log('[App] render start', window.location.pathname);
  }

  class BlogErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, info) {
      console.error('[BlogErrorBoundary] caught:', error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div className="p-8 bg-red-50 text-red-700">
            <strong>Blog failed to render:</strong>
            <div>{String(this.state.error)}</div>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <>
      <AuthProvider>
        <Router>
        {import.meta.env.DEV && typeof window !== 'undefined' && (
          <div className="fixed top-2 left-2 z-[999] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-900 shadow-lg shadow-slate-200">
            APP LOADED {window.location.pathname}
          </div>
        )}

        <div id="__direct_probe" style={{position:'fixed', top:80, left:8, background:'#fff', padding:6, zIndex:999}}>#PROBE_DIRECT</div>

        <LocationLogger />

        {
          (() => {
            try {
              console.log('[App] about to render Routes');
              
              return (
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/blog" element={<BlogRenderProbe />} />
                          <Route path="*" element={<div style={{padding:40}}>404 - Not Found</div>} />
                        </Routes>
              );
            } catch (err) {
              console.error('[App] Routes render error', err);
              return (
                <div style={{padding:20, background:'#fff6f6', color:'#7f1d1d'}}>
                  <strong>Routes render error:</strong>
                  <pre style={{whiteSpace:'pre-wrap'}}>{String(err)}</pre>
                </div>
              );
            }
          })()
        }

        <CookieConsent />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;

function BlogRenderProbe() {
  // Local wrapper to surface render logs and errors
  React.useEffect(() => {
    if (typeof window !== 'undefined') console.log('[BlogRenderProbe] mounted');
    return () => { if (typeof window !== 'undefined') console.log('[BlogRenderProbe] unmounted'); };
  }, []);
  console.log('[BlogRenderProbe] render');

  // Local error boundary
  class LocalErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, info) {
      console.error('[LocalErrorBoundary] caught', error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{padding:20, background:'#fff6f6', color:'#7f1d1d'}}>
            <strong>Blog render error:</strong>
            <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="p-4 text-xs text-slate-500">Blog wrapper (probe)</div>
      <main className="grow">
        <LocalErrorBoundary>
          <React.Suspense fallback={<div style={{padding:20}}>Loading blog...</div>}>
            <Blog />
          </React.Suspense>
        </LocalErrorBoundary>
      </main>
      <div style={{padding:12}} />
    </div>
  );
}

function LocationLogger(){
  try{
    const loc = useLocation();
    React.useEffect(()=>{ console.log('[LocationLogger] react-router location', loc && loc.pathname); }, [loc]);
    return null;
  }catch(err){
    console.log('[LocationLogger] hook error', err.message);
    return null;
  }
}


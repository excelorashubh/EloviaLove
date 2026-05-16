import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
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
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/" element={<Navigate to="/blog" replace />} />
              <Route path="*" element={<div style={{padding:40}}>404 - Not Found</div>} />
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
 

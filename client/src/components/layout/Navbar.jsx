import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EloviaLoveWB from "../../assets/EloviaLoveWB.png"

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Discover', path: '/discover' },
      ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
    ] : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className=" text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <img src={EloviaLoveWB} className='w-10' />
            </div>
            <span className={`text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-pink-600`}>
              Elovia Love
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-3 rounded-lg text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-3 px-3">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="w-full text-center py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Log out
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full text-center py-3 text-slate-700 font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full text-center py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

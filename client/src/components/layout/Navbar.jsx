import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import EloviaLoveWB from "../../assets/EloviaLoveWB_small.png"
import VerifiedBadge from '../ui/VerifiedBadge';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuPath, setMobileMenuPath] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const isMobileMenuOpen = mobileMenuPath === location.pathname;
  const { isAuthenticated, logout, user } = useAuth();
  const profileMenuContainerRef = useRef(null);
  const profileToggleButtonRef = useRef(null);
  const profileInitials = (user?.name || user?.username || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
    profileToggleButtonRef.current?.focus();
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
    setIsNotificationOpen(false);
    setMobileMenuPath(null);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
    setMobileMenuPath(null);
    logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleClickOutside = (event) => {
      if (
        profileMenuContainerRef.current &&
        !profileMenuContainerRef.current.contains(event.target) &&
        !profileToggleButtonRef.current?.contains(event.target)
      ) {
        closeProfileMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeProfileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuPath(null);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

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
      data-site-navbar
      className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm dark:shadow-black/40 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-0 md:gap-2 group">
            <div className="text-white p-1 md:p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <img src={EloviaLoveWB} alt="Elovia Love logo" className="w-7 md:w-10" />
            </div>
            <span className="whitespace-nowrap text-lg md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-pink-600">
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
                  location.pathname === link.path ? 'text-primary-600' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="ml-auto md:ml-0 flex shrink-0 items-center gap-1 md:gap-4 relative">
            {isAuthenticated ? (
              <>
              <NotificationBell
                open={isNotificationOpen}
                onToggle={() => {
                  setIsNotificationOpen((prev) => !prev);
                  setIsProfileMenuOpen(false);
                  setMobileMenuPath(null);
                }}
                onClose={() => setIsNotificationOpen(false)}
              />
              <div className="relative z-[60]" ref={profileMenuContainerRef}>
                <button
                  ref={profileToggleButtonRef}
                  type="button"
                  aria-label={`Profile menu${user?.name ? ` for ${user.name}` : ''}`}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="flex w-8 h-8 md:w-9 md:h-9 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-xs font-semibold text-primary-700 dark:text-primary-200">
                      {profileInitials}
                    </span>
                  )}
                  <div className="hidden md:block text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-900">{user?.name}</span>
                      {user?.isVerified && <VerifiedBadge size={14} />}
                    </div>
                    <span className="text-xs text-slate-500">{user?.username || ''}</span>
                  </div>
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full z-[70] mt-2 w-48 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-black py-2 shadow-lg"
                      role="menu"
                      aria-label="Profile menu"
                    >
                      <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">My Profile</Link>
                      <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">Dashboard</Link>
                      <Link to="/discover" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">Discover</Link>
                      <Link to="/matches" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">Matches</Link>
                      <Link to="/chats" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">Chats</Link>
                      <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">Settings</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-900" role="menuitem">Logout</button>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  aria-label="Log in"
                  className="flex md:hidden h-10 items-center justify-center gap-1.5 rounded-lg border border-pink-200 dark:border-pink-900 px-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 transition-colors hover:bg-pink-50 dark:hover:bg-slate-900 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <LogIn size={20} aria-hidden="true" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:block text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Toggle navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              onClick={() => {
                setMobileMenuPath((prev) => (prev === location.pathname ? null : location.pathname));
                setIsProfileMenuOpen(false);
                setIsNotificationOpen(false);
              }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="md:hidden bg-white dark:bg-black border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-100">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="flex w-11 h-11 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-sm font-semibold text-primary-700 dark:text-primary-200">
                      {profileInitials}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>
                      {user?.isVerified && <VerifiedBadge size={14} />}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user?.username || ''}</div>
                  </div>
                </div>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuPath(null)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-200'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-3 px-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuPath(null)}
                      className="w-full text-center py-3 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-center py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuPath(null)}
                      className="w-full text-center py-3 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuPath(null)}
                      className="w-full text-center py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_KEY = 'elovia_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3 mb-3">
              <Cookie size={20} className="text-primary-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm mb-1">We use cookies 🍪</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We use cookies and similar technologies to improve your experience, show personalised ads, and analyse traffic.{' '}
                  <Link to="/about" className="text-primary-600 underline">Learn more</Link>
                </p>
              </div>
              <button onClick={decline} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={decline}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-pink-500 rounded-xl hover:shadow-md transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;

import { useState, useEffect } from 'react';
import AdUnit from './AdUnit';
import { X } from 'lucide-react';

/**
 * StickyMobileAd - Sticky bottom ad for mobile devices
 * Can be dismissed by user
 */
const StickyMobileAd = ({ slot, className = '' }) => {
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const adSlot = slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_MOBILE || '2233445566';

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Restore visibility after 30 seconds if dismissed
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!isMobile || !visible) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 shadow-lg border-t border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="relative">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-1 right-1 z-50 p-1 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close ad"
        >
          <X size={14} className="text-slate-600 dark:text-slate-400" />
        </button>

        {/* Ad container */}
        <div className="flex items-center justify-center py-2 px-4" style={{ minHeight: 50 }}>
          <AdUnit
            slot={adSlot}
            format="horizontal"
            style={{
              minHeight: 50,
              maxHeight: 100,
              width: '100%',
              maxWidth: 320,
            }}
            placement="sticky_mobile"
          />
        </div>
      </div>
    </div>
  );
};

export default StickyMobileAd;

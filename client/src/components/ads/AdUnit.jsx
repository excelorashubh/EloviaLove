import { useEffect, useRef, useState } from 'react';
import { loadAdSense, initializeAd, trackAdImpression } from '../../utils/ads';

const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

/**
 * Base ad unit with enhanced features
 * - Production: lazy-loads real AdSense unit via IntersectionObserver
 * - Development: renders a labeled placeholder
 * - Loading skeleton
 * - Error handling
 */
const AdUnit = ({ slot, format = 'auto', style = {}, className = '', placement = 'generic' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const pushed = useRef(false);
  const impressionTracked = useRef(false);
  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-7967762028283267';

  // Lazy load when ad comes into view
  useEffect(() => {
    if (!isProduction || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  // Load AdSense and initialize ad
  useEffect(() => {
    if (!isProduction || !visible || pushed.current || !clientId || !slot) return;

    let timeoutId = null;

    const loadAndInitialize = async () => {
      try {
        // Load AdSense script
        const success = await loadAdSense();
        if (!success) {
          setError(true);
          return;
        }

        // Initialize ad
        if (ref.current) {
          initializeAd(ref.current);
          pushed.current = true;
          setLoaded(true);

          // Track impression after 1 second
          timeoutId = setTimeout(() => {
            if (!impressionTracked.current) {
              trackAdImpression(slot, placement);
              impressionTracked.current = true;
            }
          }, 1000);
        }
      } catch (err) {
        console.error('[AdUnit] Failed to load ad:', err);
        setError(true);
      }
    };

    loadAndInitialize();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visible, clientId, slot, placement]);

  // Dev placeholder
  if (!isProduction) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 dark:text-slate-500 text-xs font-mono select-none ${className}`}
        style={{ minHeight: style.minHeight || style.height || 90, ...style }}
      >
        <div className="text-2xl mb-2">📢</div>
        <div className="text-center">
          <div>Ad slot: {slot}</div>
          <div className="text-[10px] opacity-50">[{format}] {placement}</div>
        </div>
      </div>
    );
  }

  // No client ID
  if (!clientId) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg ${className}`}
        style={{ minHeight: style.minHeight || style.height || 90, ...style }}
      >
        <p className="text-xs text-slate-400">Advertisement</p>
      </div>
    );
  }

  return (
    <div ref={ref} className={`ad-unit-container ${className}`}>
      {!visible && (
        // Loading skeleton
        <div
          className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"
          style={{ minHeight: style.minHeight || style.height || 90, ...style }}
        />
      )}
      {visible && !loaded && (
        // Loading state
        <div
          className="flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg"
          style={{ minHeight: style.minHeight || style.height || 90, ...style }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading ad...</p>
          </div>
        </div>
      )}
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', ...style }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default AdUnit;

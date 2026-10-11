/**
 * Advertisement Utility Functions
 * Handles Google AdSense initialization, tracking, and ad display logic
 */

// Track if AdSense script is already loaded
let adsenseLoaded = false;
let adsenseLoading = false;
const loadCallbacks = [];
const initializedElements = new WeakSet();
export const ADSENSE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-7967762028283267';
export const ADSENSE_AD_SLOTS = {
  banner: import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_TOP || '9858095130',
  sidebar: import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR || '2360667505',
  native: import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_NATIVE || '8109863804',
  mobile: import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_MOBILE || '1847743171',
};

/**
 * Load Google AdSense script globally (once)
 * @returns {Promise<boolean>} Success status
 */
export const loadAdSense = () => {
  return new Promise((resolve) => {
    // Already loaded
    if (adsenseLoaded) {
      resolve(true);
      return;
    }

    // Currently loading, queue callback
    if (adsenseLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    // Development mode - skip loading
    if (import.meta.env.DEV) {
      console.log('[AdSense] Development mode - skipping script load');
      adsenseLoaded = true;
      resolve(true);
      loadCallbacks.forEach(cb => cb(true));
      loadCallbacks.length = 0;
      return;
    }

    const existingScript = Array.from(document.scripts).find((script) =>
      script.src.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')
    );
    if (existingScript) {
      if (new URL(existingScript.src).searchParams.get('client') === ADSENSE_CLIENT_ID) {
        adsenseLoaded = true;
        resolve(true);
      } else {
        console.error('[AdSense] An AdSense script is already loaded with a different publisher ID');
        resolve(false);
      }
      return;
    }

    adsenseLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      adsenseLoaded = true;
      adsenseLoading = false;
      console.log('[AdSense] Script loaded successfully');
      resolve(true);
      loadCallbacks.forEach(cb => cb(true));
      loadCallbacks.length = 0;
    };

    script.onerror = () => {
      adsenseLoading = false;
      console.error('[AdSense] Failed to load script');
      resolve(false);
      loadCallbacks.forEach(cb => cb(false));
      loadCallbacks.length = 0;
    };

    // Append to document
    document.head.appendChild(script);
  });
};

/**
 * Initialize AdSense ad unit
 * @param {HTMLElement} element - Ad container element
 */
export const initializeAd = (element) => {
  if (!element || initializedElements.has(element)) return;

  const isProductionHost = typeof window !== 'undefined' && import.meta.env.PROD && !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname);

  if (!isProductionHost) {
    return;
  }

  initializedElements.add(element);

  try {
    const pushAd = () => {
      if (typeof window === 'undefined') return;

      window.adsbygoogle = window.adsbygoogle || [];
      if (typeof window.adsbygoogle.push !== 'function') {
        throw new Error('AdSense ad queue is unavailable');
      }
      window.adsbygoogle.push({});
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(pushAd);
    } else {
      pushAd();
    }
  } catch (error) {
    console.error('[AdSense] Failed to initialize ad:', error);
  }
};

/**
 * Check if user should see ads (only free plan users)
 * @param {object} user - User object from AuthContext
 * @returns {boolean} Whether ads should be shown
 */
export const shouldShowAds = (user) => {
  // Not logged in (guest) - show ads
  if (!user) return true;

  // Free plan users see ads
  if (!user.plan || user.plan === 'free') return true;

  // All paid plans are ad-free (basic, premium, pro, gold, vip, lifetime)
  return false;
};

/**
 * Track ad impression
 * @param {string} slot - Ad slot ID
 * @param {string} placement - Ad placement location
 */
export const trackAdImpression = (slot, placement) => {
  try {
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'ad_impression', {
        event_category: 'ads',
        event_label: placement,
        slot_id: slot,
      });
    }

    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('[AdSense] Impression tracked:', { slot, placement });
    }
  } catch (error) {
    console.error('[AdSense] Failed to track impression:', error);
  }
};

/**
 * Track ad click
 * @param {string} slot - Ad slot ID
 * @param {string} placement - Ad placement location
 */
export const trackAdClick = (slot, placement) => {
  try {
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'ad_click', {
        event_category: 'ads',
        event_label: placement,
        slot_id: slot,
      });
    }

    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('[AdSense] Click tracked:', { slot, placement });
    }
  } catch (error) {
    console.error('[AdSense] Failed to track click:', error);
  }
};

/**
 * Get responsive ad size based on viewport
 * @returns {string} Ad size identifier
 */
export const getResponsiveAdSize = () => {
  const width = window.innerWidth;
  
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Check if AdSense is blocked
 * @returns {Promise<boolean>} Whether AdSense is blocked
 */
export const isAdBlockEnabled = async () => {
  try {
    // Wait for script to load
    await loadAdSense();

    // Check if adsbygoogle is available
    if (!window.adsbygoogle) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
};

/**
 * Format ad slot ID
 * @param {string} slot - Raw slot ID
 * @returns {string} Formatted slot ID
 */
export const formatSlotId = (slot) => {
  if (!slot) return '';
  return slot.toString().trim();
};

/**
 * Get ad configuration for different placements
 * @param {string} placement - Ad placement type
 * @returns {object} Ad configuration
 */
export const getAdConfig = (placement) => {
  const configs = {
    banner_top: {
      format: 'horizontal',
      width: 728,
      height: 90,
      responsive: true,
    },
    banner_mobile: {
      format: 'horizontal',
      width: 320,
      height: 100,
      responsive: true,
    },
    sidebar: {
      format: 'rectangle',
      width: 300,
      height: 250,
      responsive: false,
    },
    native: {
      format: 'fluid',
      width: 'auto',
      height: 'auto',
      responsive: true,
    },
    sticky_mobile: {
      format: 'horizontal',
      width: 320,
      height: 50,
      responsive: true,
    },
  };

  return configs[placement] || configs.banner_top;
};

export default {
  loadAdSense,
  initializeAd,
  shouldShowAds,
  trackAdImpression,
  trackAdClick,
  getResponsiveAdSize,
  isAdBlockEnabled,
  formatSlotId,
  getAdConfig,
};

/**
 * Advertisement Utility Functions
 * Handles Google AdSense initialization, tracking, and ad display logic
 */

// Track if AdSense script is already loaded
let adsenseLoaded = false;
let adsenseLoading = false;
const loadCallbacks = [];

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

    const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID;
    
    // No client ID configured
    if (!clientId) {
      console.warn('[AdSense] Client ID not configured');
      resolve(false);
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

    adsenseLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
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
  if (!element) return;

  // Development mode - skip
  if (import.meta.env.DEV) {
    return;
  }

  try {
    if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
      window.adsbygoogle.push({});
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

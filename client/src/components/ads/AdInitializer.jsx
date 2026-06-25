import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loadAdSense, shouldShowAds } from '../../utils/ads';

/**
 * AdInitializer - Global AdSense script loader
 * Loads AdSense script once when user should see ads
 * Place this component in App.jsx
 */
const AdInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Only load if user should see ads
    if (shouldShowAds(user)) {
      loadAdSense().then((success) => {
        if (success) {
          console.log('[AdSense] Initialization complete');
        } else {
          console.warn('[AdSense] Initialization failed or skipped');
        }
      });
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default AdInitializer;

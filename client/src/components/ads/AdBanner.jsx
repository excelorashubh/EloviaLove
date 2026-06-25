import AdUnit from './AdUnit';
import { getResponsiveAdSize } from '../../utils/ads';
import { useState, useEffect } from 'react';

/**
 * AdBanner - Responsive banner ad component
 * Desktop: 728×90 leaderboard
 * Mobile: 320×100 mobile banner
 */
const AdBanner = ({ slot, className = '', placement = 'banner' }) => {
  const [adSize, setAdSize] = useState(getResponsiveAdSize());

  // Update ad size on window resize
  useEffect(() => {
    const handleResize = () => {
      setAdSize(getResponsiveAdSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get slot ID based on device size
  const getSlot = () => {
    if (slot) return slot;
    
    // Use environment variables with fallback
    if (adSize === 'mobile') {
      return import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_MOBILE || '0987654321';
    }
    return import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_TOP || '1234567890';
  };

  return (
    <div className={`ad-banner w-full overflow-hidden ${className}`}>
      <div className="max-w-full mx-auto" style={{ minHeight: adSize === 'mobile' ? 100 : 90 }}>
        <AdUnit
          slot={getSlot()}
          format="horizontal"
          style={{
            minHeight: adSize === 'mobile' ? 100 : 90,
            width: '100%',
          }}
          placement={placement}
        />
      </div>
    </div>
  );
};

export default AdBanner;

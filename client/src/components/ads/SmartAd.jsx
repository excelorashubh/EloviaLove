import { useState, useEffect } from 'react';
import CustomAd from './CustomAd';
import AdUnit from './AdUnit';

/**
 * SmartAd - Intelligent ad component that prioritizes custom ads
 * Falls back to Google AdSense if no custom ad is available
 * 
 * @param {string} placement - Custom ad placement identifier
 * @param {string} slot - AdSense slot ID for fallback
 * @param {string} format - AdSense format (auto, horizontal, rectangle, fluid)
 * @param {object} style - CSS styles
 * @param {string} className - CSS classes
 */
const SmartAd = ({ placement, slot, format = 'auto', style = {}, className = '' }) => {
  const [showAdSense, setShowAdSense] = useState(false);
  const [customAdLoaded, setCustomAdLoaded] = useState(false);

  // Check if custom ad loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!customAdLoaded) {
        setShowAdSense(true);
      }
    }, 2000); // Wait 2 seconds for custom ad

    return () => clearTimeout(timer);
  }, [customAdLoaded]);

  return (
    <div className={className} style={style}>
      {/* Try custom ad first */}
      {!showAdSense && placement && (
        <CustomAd
          placement={placement}
          fallbackSlot={slot}
          className={className}
          style={style}
        />
      )}

      {/* Fallback to AdSense */}
      {showAdSense && slot && (
        <AdUnit
          slot={slot}
          format={format}
          style={style}
          className={className}
        />
      )}

      {/* If neither available, show nothing */}
      {!placement && !slot && null}
    </div>
  );
};

export default SmartAd;

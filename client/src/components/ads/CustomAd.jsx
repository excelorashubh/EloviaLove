import { useEffect, useState, useRef } from 'react';
import adService from '../../services/adService';

/**
 * CustomAd - Displays custom banner ads from database
 * Falls back to AdSense if no custom ad available
 * 
 * @param {string} placement - Ad placement identifier
 * @param {string} fallbackSlot - AdSense slot ID for fallback
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
const CustomAd = ({ placement, fallbackSlot, className = '', style = {} }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef(null);

  // Fetch ad on mount
  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      const fetchedAd = await adService.getAdForPlacement(placement);
      setAd(fetchedAd);
      setLoading(false);
    };

    fetchAd();
  }, [placement]);

  // Record impression when ad becomes visible
  useEffect(() => {
    if (!ad || impressionRecorded || !adRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionRecorded) {
          adService.recordImpression(ad._id);
          setImpressionRecorded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 } // Ad must be 50% visible
    );

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, [ad, impressionRecorded]);

  // Handle ad click
  const handleClick = async (e) => {
    e.preventDefault();
    if (!ad) return;

    const link = await adService.recordClick(ad._id);
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div 
        className={`animate-pulse bg-slate-100 rounded-lg ${className}`}
        style={{ minHeight: 90, ...style }}
      />
    );
  }

  // If no custom ad, return null (parent should show AdSense fallback)
  if (!ad) {
    return null;
  }

  return (
    <div
      ref={adRef}
      className={`custom-ad-container overflow-hidden rounded-lg cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
      style={style}
      onClick={handleClick}
    >
      <img
        src={ad.image}
        alt={ad.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
        Sponsored
      </div>
    </div>
  );
};

export default CustomAd;

import { useEffect, useRef, useState } from 'react';
import AdUnit from './AdUnit';
import { ADSENSE_AD_SLOTS } from '../../utils/ads';

/** Native in-feed ad — blends into content lists */
const InFeedAd = ({ slot, className = '', placement = 'in_feed' }) => {
  const adSlot = slot || ADSENSE_AD_SLOTS.native;
  const containerRef = useRef(null);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateAdStatus = () => {
      const ad = container.querySelector('ins.adsbygoogle');
      if (!ad) return;
      setIsUnfilled(ad?.getAttribute('data-ad-status') === 'unfilled');
    };

    const observer = new MutationObserver(updateAdStatus);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
      subtree: true,
    });
    updateAdStatus();

    return () => observer.disconnect();
  }, []);

  if (isUnfilled) return null;

  return (
    <div ref={containerRef} className={`w-full overflow-hidden rounded-2xl ${className}`} style={{ minHeight: 120 }}>
      <AdUnit
        slot={adSlot}
        format="fluid"
        style={{ minHeight: 120, width: '100%' }}
        placement={placement}
        className="rounded-2xl"
      />
    </div>
  );
};

export default InFeedAd;

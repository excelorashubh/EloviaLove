import AdUnit from './AdUnit';
import { ADSENSE_AD_SLOTS } from '../../utils/ads';

/** Native in-feed ad — blends into content lists */
const InFeedAd = ({ slot, className = '', placement = 'in_feed' }) => {
  const adSlot = slot || ADSENSE_AD_SLOTS.native;

  return (
    <div className={`w-full overflow-hidden rounded-2xl ${className}`} style={{ minHeight: 120 }}>
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

import AdUnit from './AdUnit';
import { ADSENSE_AD_SLOTS } from '../../utils/ads';

/** Responsive leaderboard banner — use between page sections */
const BannerAd = ({ slot, className = '', placement = 'banner' }) => {
  const adSlot = slot || ADSENSE_AD_SLOTS.banner;

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ minHeight: 90 }}>
      <AdUnit
        slot={adSlot}
        format="horizontal"
        style={{ minHeight: 90, width: '100%' }}
        placement={placement}
      />
    </div>
  );
};

export default BannerAd;

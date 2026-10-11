import AdUnit from './AdUnit';
import { ADSENSE_AD_SLOTS } from '../../utils/ads';

/**
 * NativeAd - Fluid in-feed native ad
 * Blends seamlessly with content
 */
const NativeAd = ({ slot, className = '', placement = 'native' }) => {
  const adSlot = slot || ADSENSE_AD_SLOTS.native;

  return (
    <div className={`native-ad w-full overflow-hidden rounded-2xl ${className}`}>
      <div style={{ minHeight: 120 }}>
        <AdUnit
          slot={adSlot}
          format="fluid"
          style={{
            minHeight: 120,
            width: '100%',
          }}
          placement={placement}
          className="rounded-2xl"
        />
      </div>
    </div>
  );
};

export default NativeAd;

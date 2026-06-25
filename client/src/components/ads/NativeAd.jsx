import AdUnit from './AdUnit';

/**
 * NativeAd - Fluid in-feed native ad
 * Blends seamlessly with content
 */
const NativeAd = ({ slot, className = '', placement = 'native' }) => {
  const adSlot = slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_NATIVE || '1122334455';

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

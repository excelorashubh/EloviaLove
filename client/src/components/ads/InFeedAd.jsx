import AdUnit from './AdUnit';

/** Native in-feed ad — blends into content lists */
const InFeedAd = ({ slot, className = '', placement = 'in_feed' }) => {
  const adSlot = slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_NATIVE || '1122334455';

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

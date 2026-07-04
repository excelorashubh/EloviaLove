import AdUnit from './AdUnit';

/** Responsive leaderboard banner — use between page sections */
const BannerAd = ({ slot, className = '', placement = 'banner' }) => {
  const adSlot = slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_TOP || '9858095130';

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

import AdUnit from './AdUnit';

/** Native in-feed ad — blends into content lists */
const InFeedAd = ({ slot, className = '' }) => (
  <div className={`w-full overflow-hidden rounded-2xl ${className}`} style={{ minHeight: 120 }}>
    <AdUnit
      slot={slot || '1122334455'}
      format="fluid"
      style={{ minHeight: 120 }}
    />
  </div>
);

export default InFeedAd;

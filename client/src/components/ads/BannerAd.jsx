import AdUnit from './AdUnit';

/** Responsive leaderboard banner — use between page sections */
const BannerAd = ({ slot, className = '' }) => (
  <div className={`w-full overflow-hidden ${className}`} style={{ minHeight: 90 }}>
    <AdUnit
      slot={slot || '1234567890'}
      format="horizontal"
      style={{ minHeight: 90 }}
    />
  </div>
);

export default BannerAd;

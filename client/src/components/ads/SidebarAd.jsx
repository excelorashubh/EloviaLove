import AdUnit from './AdUnit';

/** 300×250 rectangle — use in sidebars or between content blocks */
const SidebarAd = ({ slot, className = '' }) => (
  <div className={`overflow-hidden ${className}`} style={{ minHeight: 250, width: 300 }}>
    <AdUnit
      slot={slot || '0987654321'}
      format="rectangle"
      style={{ width: 300, height: 250 }}
    />
  </div>
);

export default SidebarAd;

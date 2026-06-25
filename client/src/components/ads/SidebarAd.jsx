import AdUnit from './AdUnit';

/**
 * SidebarAd - 300×250 rectangle ad for sidebars
 * Visible on desktop/tablet only
 */
const SidebarAd = ({ slot, className = '' }) => {
  const adSlot = slot || import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR || '0987654321';

  return (
    <div className={`sidebar-ad hidden lg:block overflow-hidden ${className}`}>
      <div style={{ width: 300, minHeight: 250 }}>
        <AdUnit
          slot={adSlot}
          format="rectangle"
          style={{ width: 300, height: 250 }}
          placement="sidebar"
        />
      </div>
    </div>
  );
};

export default SidebarAd;

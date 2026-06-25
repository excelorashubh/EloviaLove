import { useAuth } from '../../context/AuthContext';
import { shouldShowAds } from '../../utils/ads';
import { Link } from 'react-router-dom';

/**
 * AdWrapper — role-based ad gate.
 *
 * Rules:
 *  - Guest (not logged in)  → show ads (treated as free)
 *  - user.plan === 'free'   → show ads + optional upgrade nudge
 *  - basic / premium / pro / gold / vip / lifetime  → render nothing (ad-free experience)
 */
const AdWrapper = ({ children, showUpgradeNudge = false, className = '' }) => {
  const { user } = useAuth();

  // Check if user should see ads using utility function
  if (!shouldShowAds(user)) {
    return null;
  }

  return (
    <div className={`ad-wrapper ${className}`}>
      {children}
      {showUpgradeNudge && (
        <p className="text-center text-xs text-slate-400 mt-2">
          <Link
            to="/pricing"
            className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            Upgrade to remove ads 🚀
          </Link>
        </p>
      )}
    </div>
  );
};

export default AdWrapper;

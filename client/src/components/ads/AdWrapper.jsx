import { useAuth } from '../../context/AuthContext';

/**
 * AdWrapper — role-based ad gate.
 *
 * Rules:
 *  - Guest (not logged in)  → show ads (treated as free)
 *  - user.plan === 'free'   → show ads + optional upgrade nudge
 *  - basic / premium / pro  → render nothing (ad-free experience)
 */
const AdWrapper = ({ children, showUpgradeNudge = false }) => {
  const { user } = useAuth();

  // Paid plans get a completely clean, ad-free experience
  const isPaid = user && user.plan && user.plan !== 'free';
  if (isPaid) return null;

  return (
    <div className="ad-wrapper">
      {children}
      {showUpgradeNudge && (
        <p className="text-center text-xs text-slate-400 mt-1">
          <a
            href="/pricing"
            className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            Upgrade to remove ads 🚀
          </a>
        </p>
      )}
    </div>
  );
};

export default AdWrapper;

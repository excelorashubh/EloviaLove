import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Crown, Clock } from 'lucide-react';
import api from '../services/api';

const SubscriptionBanner = () => {
  const [status, setStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/subscription/status').then(r => setStatus(r.data)).catch(() => {});
  }, []);

  if (!status || dismissed) return null;

  const { isTrial, trialDaysLeft: rawDaysLeft, plan, trialEndDate } = status;

  // Calculate days left directly from trialEndDate as source of truth
  const trialDaysLeft = trialEndDate
    ? Math.max(0, Math.ceil((new Date(trialEndDate) - new Date()) / 86400000))
    : (rawDaysLeft ?? 0);

  // Show banner only for trial users or expired users
  if (!isTrial && plan !== 'free') return null;
  if (isTrial && trialDaysLeft > 7) return null; // only show when ≤7 days left

  const isExpired = plan === 'free' && status.isTrialUsed;
  const isUrgent = isTrial && trialDaysLeft <= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={`rounded-2xl px-5 py-4 flex items-center justify-between gap-4 mb-5 ${
          isExpired
            ? 'bg-red-50 border border-red-200'
            : isUrgent
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
              : 'bg-gradient-to-r from-primary-50 to-pink-50 border border-primary-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isExpired
            ? <Crown size={20} className="text-red-500 shrink-0" />
            : <Clock size={20} className={`shrink-0 ${isUrgent ? 'text-amber-500' : 'text-primary-500'}`} />
          }
          <div>
            {isExpired ? (
              <>
                <p className="text-sm font-bold text-red-700">Your free trial has ended</p>
                <p className="text-xs text-red-500">Upgrade to continue premium features</p>
              </>
            ) : (
              <>
                <p className={`text-sm font-bold ${isUrgent ? 'text-amber-800' : 'text-primary-800'}`}>
                  {trialDaysLeft === 0
                    ? '⏳ Your trial expires today'
                    : `⏳ ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in your free trial`
                  }
                </p>
                <p className={`text-xs ${isUrgent ? 'text-amber-600' : 'text-primary-600'}`}>
                  Upgrade now to keep premium access
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/pricing"
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
              isExpired
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-r from-primary-600 to-pink-500 hover:shadow-md'
            }`}
          >
            Upgrade
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionBanner;

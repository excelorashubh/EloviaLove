import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Crown, Star, Sparkles, ArrowLeft, X, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BannerAd from '../components/ads/BannerAd';

const PLAN_META = {
  free:    { label: 'Free',    icon: Star,     price: 0,   gradient: 'from-slate-400 to-slate-500' },
  basic:   { label: 'Basic',   icon: Zap,      price: 149, gradient: 'from-blue-500 to-cyan-500'   },
  premium: { label: 'Premium', icon: Sparkles, price: 399, gradient: 'from-primary-600 to-pink-500' },
  pro:     { label: 'Pro',     icon: Crown,    price: 899, gradient: 'from-amber-500 to-orange-500' },
};

const FEATURES = [
  { label: 'Daily Likes',       free: '10/day', basic: 'Unlimited', premium: 'Unlimited', pro: 'Unlimited' },
  { label: 'See Who Liked You', free: false,    basic: false,       premium: true,        pro: true        },
  { label: 'Advanced Filters',  free: false,    basic: true,        premium: true,        pro: true        },
  { label: 'Priority Matching', free: false,    basic: false,       premium: true,        pro: true        },
  { label: 'Read Receipts',     free: false,    basic: false,       premium: true,        pro: true        },
  { label: 'No Ads',            free: false,    basic: true,        premium: true,        pro: true        },
  { label: 'Profile Boost',     free: false,    basic: false,       premium: false,       pro: true        },
  { label: 'VIP Badge',         free: false,    basic: false,       premium: false,       pro: true        },
  { label: 'Top Visibility',    free: false,    basic: false,       premium: false,       pro: true        },
];

const ADD_ONS = [
  { key: 'boost',     label: 'Profile Boost', price: 99,  icon: '🚀', desc: 'Get 10x more profile views for 24h' },
  { key: 'superlike', label: 'Super Like',    price: 49,  icon: '⭐', desc: 'Stand out with a super like'        },
  { key: 'spotlight', label: 'Spotlight',     price: 199, icon: '💡', desc: 'Be featured at the top for 6h'      },
];

// ── Load Razorpay SDK ────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ── Payment Modal ────────────────────────────────────────────────────────────
const PaymentModal = ({ item, isAddon, onClose, onSuccess, user }) => {
  const [step, setStep] = useState('confirm'); // confirm | processing | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const label = isAddon ? item.label : `${item.label} Plan`;
  const price = item.price;
  const Icon = isAddon ? null : item.icon;

  const startPayment = async () => {
    setStep('processing');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay SDK failed to load. Check your internet connection.');

      if (isAddon) {
        // ── Add-ons: one-time order ──────────────────────────────────────────
        const { data } = await api.post('/subscription/addon-order', { addon: item.key });

        const options = {
          key:         data.keyId,
          amount:      data.amount,
          currency:    data.currency,
          name:        'EloviaLove',
          description: data.addonName,
          order_id:    data.orderId,
          prefill:     { name: user?.name || '', email: user?.email || '' },
          theme:       { color: '#c026d3' },
          modal:       { ondismiss: () => setStep('confirm') },
          handler:     () => { setStep('success'); setTimeout(() => onSuccess(item.key, true), 1800); },
        };
        new window.Razorpay(options).open();

      } else {
        // ── Plans: recurring subscription ────────────────────────────────────
        const { data } = await api.post('/subscription/create-subscription', { plan: item.key });

        const options = {
          key:             data.keyId,
          subscription_id: data.subscriptionId,
          name:            'EloviaLove',
          description:     `${data.planName} Plan — Auto-renews monthly`,
          prefill:         { name: user?.name || '', email: user?.email || '' },
          theme:           { color: '#c026d3' },
          modal:           { ondismiss: () => setStep('confirm') },
          handler: async (response) => {
            setStep('processing');
            try {
              await api.post('/subscription/verify-subscription', {
                razorpay_payment_id:      response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature:       response.razorpay_signature,
                plan: item.key,
              });
              setStep('success');
              setTimeout(() => onSuccess(item.key, false), 1800);
            } catch (e) {
              setErrorMsg(e.response?.data?.message || 'Payment verification failed. Contact support.');
              setStep('error');
            }
          },
        };
        new window.Razorpay(options).open();
      }

    } catch (e) {
      const msg = e.response?.data?.message
        || e.response?.data?.error?.description
        || e.message
        || 'Could not initiate payment.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && step !== 'processing' && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* ── Confirm step ── */}
        {step === 'confirm' && (
          <>
            <div className={`bg-gradient-to-br ${isAddon ? 'from-primary-600 to-pink-500' : PLAN_META[item.key]?.gradient || 'from-primary-600 to-pink-500'} p-6 text-white text-center`}>
              <div className="text-4xl mb-2">{isAddon ? item.icon : <Icon size={36} className="mx-auto" />}</div>
              <h2 className="text-xl font-extrabold">{label}</h2>
              <p className="text-white/80 text-sm mt-1">{isAddon ? item.desc : 'Auto-renews monthly · Cancel anytime'}</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Amount</span>
                <span className="font-bold text-slate-900">₹{price}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600 text-sm">GST (18%)</span>
                <span className="font-bold text-slate-900">₹{Math.round(price * 0.18)}</span>
              </div>
              <div className="flex items-center justify-between py-3 mb-4">
                <span className="text-slate-900 font-bold">Total</span>
                <span className="text-xl font-extrabold text-primary-600">₹{Math.round(price * 1.18)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
                <ShieldCheck size={14} className="text-green-500 shrink-0" />
                Secured by Razorpay · 256-bit SSL encryption
              </div>

              <button
                onClick={startPayment}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-pink-500/30 transition-all text-sm"
              >
                Pay ₹{Math.round(price * 1.18)} →
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 mt-2 text-slate-500 text-sm hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ── Processing step ── */}
        {step === 'processing' && (
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <Loader2 size={44} className="text-primary-500 animate-spin" />
            <p className="font-bold text-slate-900 text-lg">Processing Payment</p>
            <p className="text-slate-400 text-sm">Please complete the payment in the Razorpay window...</p>
          </div>
        )}

        {/* ── Success step ── */}
        {step === 'success' && (
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 size={56} className="text-green-500" />
            </motion.div>
            <p className="font-extrabold text-slate-900 text-xl">Payment Successful!</p>
            <p className="text-slate-500 text-sm">{label} is now active on your account.</p>
          </div>
        )}

        {/* ── Error step ── */}
        {step === 'error' && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <AlertCircle size={48} className="text-red-500" />
            <p className="font-bold text-slate-900 text-lg">Payment Failed</p>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
            <button
              onClick={() => setStep('confirm')}
              className="w-full py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-colors text-sm"
            >
              Try Again
            </button>
            <button onClick={onClose} className="text-slate-400 text-sm hover:text-slate-600">
              Cancel
            </button>
          </div>
        )}

        {/* Close button (only on confirm/error) */}
        {(step === 'confirm' || step === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── Main Pricing Page ────────────────────────────────────────────────────────
const Pricing = () => {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [modal, setModal] = useState(null); // { item, isAddon }

  useEffect(() => {
    api.get('/subscription/status').then(r => setStatus(r.data)).catch(() => {});
  }, []);

  const openModal = (item, isAddon = false) => setModal({ item, isAddon });
  const closeModal = () => setModal(null);
  const [cancelling, setCancelling] = useState(false);

  const cancelSubscription = async () => {
    if (!window.confirm('Cancel your subscription? You keep access until the current period ends.')) return;
    setCancelling(true);
    try {
      await api.post('/subscription/cancel');
      const r = await api.get('/subscription/status').catch(() => null);
      if (r) setStatus(r.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleSuccess = async (key, isAddon) => {
    closeModal();
    await loadUser?.();
    const r = await api.get('/subscription/status').catch(() => null);
    if (r) setStatus(r.data);
    if (!isAddon) navigate('/subscription/success');
  };

  const currentPlan = status?.plan || user?.plan || 'free';
  const isTrial = status?.isTrial;
  const trialDaysLeft = status?.trialDaysLeft ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm font-medium">
          <ArrowLeft size={18} /> Back
        </button>

        {/* Hero */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              🎁 10 Days FREE Premium on Signup
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Choose Your Plan</h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Find love faster with premium features. Cancel anytime.</p>
          </motion.div>

          {isTrial && trialDaysLeft > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl font-semibold shadow-lg shadow-orange-200"
            >
              ⏳ Free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} — upgrade to keep premium access
            </motion.div>
          )}
          {isTrial && trialDaysLeft === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-2xl font-semibold shadow-lg"
            >
              ⚠️ Your free trial has expired — upgrade now to continue
            </motion.div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {Object.entries(PLAN_META).map(([planKey, meta], i) => {
            const Icon = meta.icon;
            const isCurrent = currentPlan === planKey;
            const isPremium = planKey === 'premium';

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-3xl p-6 flex flex-col border-2 transition-all ${
                  isPremium
                    ? 'border-primary-500 bg-gradient-to-b from-primary-600 to-pink-600 text-white shadow-2xl shadow-primary-500/30 scale-105'
                    : isCurrent
                      ? 'border-primary-300 bg-white shadow-lg'
                      : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                {isCurrent && !isPremium && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                    Current Plan
                  </span>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isPremium ? 'bg-white/20' : 'bg-primary-50'}`}>
                  <Icon size={22} className={isPremium ? 'text-white' : 'text-primary-600'} />
                </div>

                <h3 className={`text-xl font-bold mb-1 ${isPremium ? 'text-white' : 'text-slate-900'}`}>{meta.label}</h3>
                <div className={`text-3xl font-extrabold mb-1 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                  {meta.price === 0 ? 'Free' : `₹${meta.price}`}
                </div>
                {meta.price > 0 && (
                  <p className={`text-xs mb-5 ${isPremium ? 'text-white/70' : 'text-slate-400'}`}>per month</p>
                )}

                <ul className="space-y-2 flex-1 mb-6">
                  {FEATURES.map(f => {
                    const val = f[planKey];
                    return (
                      <li key={f.label} className="flex items-center gap-2 text-sm">
                        {val === false ? (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <span className={`text-[10px] ${isPremium ? 'text-white/50' : 'text-slate-400'}`}>✕</span>
                          </span>
                        ) : (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-white/30' : 'bg-primary-100'}`}>
                            <Check size={10} className={isPremium ? 'text-white' : 'text-primary-600'} strokeWidth={3} />
                          </span>
                        )}
                        <span className={val === false
                          ? (isPremium ? 'text-white/40 line-through' : 'text-slate-300 line-through')
                          : (isPremium ? 'text-white' : 'text-slate-700')
                        }>
                          {val === true ? f.label : val === false ? f.label : `${f.label}: ${val}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {planKey === 'free' ? (
                  <button disabled className="w-full py-3 rounded-2xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-default">
                    {isCurrent ? 'Current Plan' : 'Free Forever'}
                  </button>
                ) : isCurrent ? (
                  <button disabled className={`w-full py-3 rounded-2xl text-sm font-semibold ${isPremium ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    ✓ Active
                  </button>
                ) : (
                  <button
                    onClick={() => openModal({ key: planKey, ...meta }, false)}
                    className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                      isPremium
                        ? 'bg-white text-primary-600 hover:bg-primary-50 shadow-lg'
                        : 'bg-gradient-to-r from-primary-600 to-pink-500 text-white hover:shadow-lg hover:shadow-pink-500/30'
                    }`}
                  >
                    Upgrade to {meta.label}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Cancel subscription (active paid subscribers only) */}
        {currentPlan !== 'free' && !isTrial && status?.subscriptionStatus !== 'cancelled' && status?.razorpaySubId && (
          <div className="text-center mt-2 mb-8">
            <button
              onClick={cancelSubscription}
              disabled={cancelling}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              {cancelling ? 'Cancelling...' : 'Cancel subscription'}
            </button>
          </div>
        )}
        {status?.subscriptionStatus === 'cancelled' && (
          <div className="text-center mt-2 mb-8 text-sm text-amber-600 font-medium">
            ⚠️ Subscription cancelled — access continues until period end
          </div>
        )}

        {/* Add-ons */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Power-Ups & Add-Ons</h2>
          <p className="text-slate-400 text-sm text-center mb-6">One-time purchases, available on any plan</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ADD_ONS.map((a, i) => (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="text-3xl">{a.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900">{a.label}</h3>
                  <p className="text-sm text-slate-500">{a.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-extrabold text-slate-900">₹{a.price}</span>
                  <button
                    onClick={() => openModal(a, true)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-md active:scale-95 transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ad — above feature comparison */}
        <div className="py-4 flex justify-center">
          <BannerAd slot="3456789012" />
        </div>

        {/* Feature comparison table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Full Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-slate-500 font-semibold w-1/3">Feature</th>
                  {['free','basic','premium','pro'].map(p => (
                    <th key={p} className={`px-4 py-3 font-bold text-center ${currentPlan === p ? 'text-primary-600' : 'text-slate-700'}`}>
                      {PLAN_META[p].label}
                      {currentPlan === p && <span className="block text-[10px] text-primary-400 font-normal">current</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.label} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                    <td className="px-6 py-3 text-slate-700 font-medium">{f.label}</td>
                    {['free','basic','premium','pro'].map(p => (
                      <td key={p} className="px-4 py-3 text-center">
                        {f[p] === true
                          ? <Check size={16} className="text-green-500 mx-auto" strokeWidth={2.5} />
                          : f[p] === false
                            ? <span className="text-slate-300 text-lg">—</span>
                            : <span className="text-slate-700 font-medium">{f[p]}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {modal && (
          <PaymentModal
            item={modal.item}
            isAddon={modal.isAddon}
            user={user}
            onClose={closeModal}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;

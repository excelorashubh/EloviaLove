import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PLAN_META = {
  free:    { label: 'Free',    color: 'slate',  icon: Star,     price: 0   },
  basic:   { label: 'Basic',   color: 'blue',   icon: Zap,      price: 149 },
  premium: { label: 'Premium', color: 'purple', icon: Sparkles, price: 399 },
  pro:     { label: 'Pro',     color: 'amber',  icon: Crown,    price: 899 },
};

const FEATURES = [
  { label: 'Daily Likes',          free: '10/day',  basic: 'Unlimited', premium: 'Unlimited', pro: 'Unlimited' },
  { label: 'See Who Liked You',    free: false,     basic: false,       premium: true,        pro: true        },
  { label: 'Advanced Filters',     free: false,     basic: true,        premium: true,        pro: true        },
  { label: 'Priority Matching',    free: false,     basic: false,       premium: true,        pro: true        },
  { label: 'Read Receipts',        free: false,     basic: false,       premium: true,        pro: true        },
  { label: 'No Ads',               free: false,     basic: true,        premium: true,        pro: true        },
  { label: 'Profile Boost',        free: false,     basic: false,       premium: false,       pro: true        },
  { label: 'VIP Badge',            free: false,     basic: false,       premium: false,       pro: true        },
  { label: 'Top Visibility',       free: false,     basic: false,       premium: false,       pro: true        },
];

const ADD_ONS = [
  { key: 'boost',     label: 'Profile Boost', price: 99,  icon: '🚀', desc: 'Get 10x more profile views for 24h' },
  { key: 'superlike', label: 'Super Like',    price: 49,  icon: '⭐', desc: 'Stand out with a super like' },
  { key: 'spotlight', label: 'Spotlight',     price: 199, icon: '💡', desc: 'Be featured at the top for 6h' },
];

const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const Pricing = () => {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [paying, setPaying] = useState('');

  useEffect(() => {
    api.get('/subscription/status').then(r => setStatus(r.data)).catch(() => {});
  }, []);

  const handleUpgrade = async (plan) => {
    if (paying) return;
    setPaying(plan);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Razorpay failed to load. Check your connection.'); return; }

      const { data } = await api.post('/subscription/create-order', { plan });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'EloviaLove',
        description: `${data.planName} Plan — 30 days`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await api.post('/subscription/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan,
            });
            await loadUser?.();
            const r = await api.get('/subscription/status');
            setStatus(r.data);
            navigate('/subscription/success');
          } catch { alert('Payment verification failed. Contact support.'); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#c026d3' },
      };

      new window.Razorpay(options).open();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error?.description || e.message || 'Could not initiate payment.';
      alert(`Payment error: ${msg}`);
    } finally {
      setPaying('');
    }
  };

  const handleAddon = async (addon) => {
    if (paying) return;
    setPaying(addon);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Razorpay failed to load.'); return; }

      const { data } = await api.post('/subscription/addon-order', { addon });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'EloviaLove',
        description: data.addonName,
        order_id: data.orderId,
        handler: () => alert(`${data.addonName} activated!`),
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#c026d3' },
      };

      new window.Razorpay(options).open();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error?.description || e.message || 'Could not initiate payment.';
      alert(`Payment error: ${msg}`);
    } finally {
      setPaying('');
    }
  };

  const currentPlan = status?.plan || user?.plan || 'free';
  const isTrial = status?.isTrial;
  const trialDaysLeft = status?.trialDaysLeft ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 pb-16">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary-600 to-pink-500 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              🎁 10 Days FREE Premium on Signup
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
              Choose Your Plan
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Find love faster with premium features. Cancel anytime.
            </p>
          </motion.div>

          {/* Trial banner */}
          {isTrial && trialDaysLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl font-semibold shadow-lg shadow-orange-200"
            >
              ⏳ Free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} — upgrade to keep premium access
            </motion.div>
          )}
          {isTrial && trialDaysLeft === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-2xl font-semibold shadow-lg"
            >
              ⚠️ Your free trial has expired — upgrade now to continue
            </motion.div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {Object.entries(PLAN_META).map(([key, meta], i) => {
            const Icon = meta.icon;
            const isCurrent = currentPlan === key;
            const isPremium = key === 'premium';

            return (
              <motion.div
                key={key}
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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                {isCurrent && !isPremium && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    Current Plan
                  </span>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                  isPremium ? 'bg-white/20' : 'bg-primary-50'
                }`}>
                  <Icon size={22} className={isPremium ? 'text-white' : 'text-primary-600'} />
                </div>

                <h3 className={`text-xl font-bold mb-1 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                  {meta.label}
                </h3>
                <div className={`text-3xl font-extrabold mb-1 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                  {meta.price === 0 ? 'Free' : `₹${meta.price}`}
                </div>
                {meta.price > 0 && (
                  <p className={`text-xs mb-5 ${isPremium ? 'text-white/70' : 'text-slate-400'}`}>per month</p>
                )}

                <ul className="space-y-2 flex-1 mb-6">
                  {FEATURES.map(f => {
                    const val = f[key];
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
                        <span className={val === false ? (isPremium ? 'text-white/40 line-through' : 'text-slate-300 line-through') : (isPremium ? 'text-white' : 'text-slate-700')}>
                          {val === true ? f.label : val === false ? f.label : `${f.label}: ${val}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {key === 'free' ? (
                  <button disabled className="w-full py-3 rounded-2xl text-sm font-semibold bg-slate-100 text-slate-400 cursor-default">
                    {isCurrent ? 'Current Plan' : 'Free Forever'}
                  </button>
                ) : isCurrent ? (
                  <button disabled className={`w-full py-3 rounded-2xl text-sm font-semibold ${isPremium ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    ✓ Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={!!paying}
                    className={`w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 ${
                      isPremium
                        ? 'bg-white text-primary-600 hover:bg-primary-50 shadow-lg'
                        : 'bg-gradient-to-r from-primary-600 to-pink-500 text-white hover:shadow-lg hover:shadow-pink-500/30'
                    }`}
                  >
                    {paying === key ? 'Processing...' : `Upgrade to ${meta.label}`}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Power-Ups & Add-Ons</h2>
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
                    onClick={() => handleAddon(a.key)}
                    disabled={!!paying}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-pink-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60"
                  >
                    {paying === a.key ? '...' : 'Buy'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
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
    </div>
  );
};

export default Pricing;

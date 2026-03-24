import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Megaphone, Users, Eye, TrendingUp, ShieldOff, Copy,
  CheckCircle2, ExternalLink, RefreshCw, Info,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

// ── Ad slots config — update slot IDs here when you get them from AdSense ────
const AD_SLOTS = [
  { id: '1234567890', name: 'Home — After Hero',          page: '/home',    format: 'horizontal', audience: 'Guests + Free' },
  { id: '1234567891', name: 'Home — After Testimonials',  page: '/home',    format: 'horizontal', audience: 'Guests + Free' },
  { id: '2345678901', name: 'About — Before CTA',         page: '/about',   format: 'horizontal', audience: 'Guests + Free' },
  { id: '3456789012', name: 'Pricing — Above Comparison', page: '/pricing', format: 'horizontal', audience: 'Guests + Free' },
  { id: '4567890123', name: 'Discover — In-Feed (Liked)', page: '/discover',format: 'fluid',      audience: 'Free users only' },
  { id: '5678901234', name: 'Dashboard — Quick Actions',  page: '/dashboard',format: 'horizontal', audience: 'Free users only' },
];

const PIE_COLORS = ['#e879a0', '#3b82f6', '#f59e0b', '#94a3b8'];
const PLAN_LABELS = { free: 'Free', basic: 'Basic', premium: 'Premium', pro: 'Pro' };

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'bg-primary-500' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon size={15} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── Copy-to-clipboard button ──────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className="p-1 text-slate-400 hover:text-primary-600 transition-colors" title="Copy slot ID">
      {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

// ── Custom pie tooltip ────────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{payload[0].name}</p>
      <p className="text-slate-500">{payload[0].value} users ({payload[0].payload.pct}%)</p>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminAds = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'Not configured';
  const gaId     = import.meta.env.VITE_GA_MEASUREMENT_ID  || 'Not configured';

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics/ads');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build pie data
  const pieData = stats
    ? Object.entries(stats.byPlan).map(([plan, count], i) => ({
        name: PLAN_LABELS[plan] || plan,
        value: count,
        pct: stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0,
        fill: PIE_COLORS[i] || '#94a3b8',
      }))
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ads Management</h1>
            <p className="text-slate-500 text-sm mt-1">AdSense integration status, ad slots, and audience exposure</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.total ?? '—'}
            sub="Registered accounts"
            color="bg-blue-500"
          />
          <StatCard
            icon={Eye}
            label="Ad Audience"
            value={stats?.adAudience ?? '—'}
            sub={`${stats?.exposureRate ?? 0}% of users see ads`}
            color="bg-primary-500"
          />
          <StatCard
            icon={ShieldOff}
            label="Ad-Free Users"
            value={stats?.noAdAudience ?? '—'}
            sub={`${stats?.upgradeRate ?? 0}% on paid plans`}
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Ad Slots"
            value={AD_SLOTS.length}
            sub="Across all pages"
            color="bg-amber-500"
          />
        </div>

        {/* Plan distribution + config */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pie chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-1">Ad Audience by Plan</h2>
            <p className="text-xs text-slate-400 mb-4">Free users see ads · Paid users get ad-free experience</p>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    formatter={(value, entry) => (
                      <span className="text-xs text-slate-600">
                        {value} — {entry.payload.value} ({entry.payload.pct}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Plan breakdown bars */}
            {stats && (
              <div className="mt-4 space-y-2">
                {Object.entries(stats.byPlan).map(([plan, count], i) => (
                  <div key={plan} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 capitalize flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: PIE_COLORS[i] }} />
                        {PLAN_LABELS[plan]}
                        {plan === 'free' && <span className="text-[10px] text-primary-500 font-semibold">(sees ads)</span>}
                      </span>
                      <span className="font-semibold text-slate-700">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%',
                          background: PIE_COLORS[i],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AdSense config status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <h2 className="font-semibold text-slate-800">Integration Status</h2>

            {/* AdSense */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-primary-500" />
                <p className="font-semibold text-slate-800 text-sm">Google AdSense</p>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  clientId !== 'Not configured' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {clientId !== 'Not configured' ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-slate-600 truncate">{clientId}</span>
                <CopyBtn text={clientId} />
              </div>
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Info size={11} className="shrink-0 mt-0.5" />
                Set <code className="bg-slate-100 px-1 rounded">VITE_ADSENSE_CLIENT_ID</code> in <code className="bg-slate-100 px-1 rounded">client/.env</code>
              </p>
              <a
                href="https://adsense.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Open AdSense Dashboard <ExternalLink size={11} />
              </a>
            </div>

            {/* Google Analytics */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" />
                <p className="font-semibold text-slate-800 text-sm">Google Analytics (GA4)</p>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  gaId !== 'Not configured' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {gaId !== 'Not configured' ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-slate-600 truncate">{gaId}</span>
                <CopyBtn text={gaId} />
              </div>
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Info size={11} className="shrink-0 mt-0.5" />
                Set <code className="bg-slate-100 px-1 rounded">VITE_GA_MEASUREMENT_ID</code> in <code className="bg-slate-100 px-1 rounded">client/.env</code>
              </p>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Open Analytics Dashboard <ExternalLink size={11} />
              </a>
            </div>

            {/* Visibility rule */}
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
              <p className="text-xs font-semibold text-primary-700 mb-1">Visibility Rule</p>
              <p className="text-xs text-primary-600 leading-relaxed">
                Ads are shown to <strong>guests</strong> and <strong>free plan</strong> users only.
                Basic, Premium, and Pro users get a completely ad-free experience.
                This is enforced client-side via <code className="bg-primary-100 px-1 rounded">AdWrapper</code> which reads the user plan from AuthContext.
              </p>
            </div>
          </div>
        </div>

        {/* Ad slots table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Active Ad Slots</h2>
              <p className="text-xs text-slate-400 mt-0.5">Replace slot IDs in the component files once you create them in AdSense</p>
            </div>
            <a
              href="https://adsense.google.com/adsense/new/u/0/pub-0000000000000000/myads/sites"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Create Ad Units <ExternalLink size={12} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Page</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Format</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Slot ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {AD_SLOTS.map((slot, i) => (
                  <tr key={slot.id} className={i % 2 === 0 ? '' : 'bg-slate-50/50'}>
                    <td className="px-5 py-3 font-medium text-slate-800">{slot.name}</td>
                    <td className="px-5 py-3">
                      <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{slot.page}</code>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium capitalize">
                        {slot.format}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{slot.audience}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-slate-600">{slot.id}</code>
                        <CopyBtn text={slot.id} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Setup checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">AdSense Setup Checklist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { done: clientId !== 'Not configured', label: 'Set VITE_ADSENSE_CLIENT_ID in client/.env' },
              { done: gaId !== 'Not configured',     label: 'Set VITE_GA_MEASUREMENT_ID in client/.env' },
              { done: true,                          label: 'AdSense script added to index.html (production only)' },
              { done: true,                          label: 'AdWrapper component gates ads by user plan' },
              { done: true,                          label: 'Lazy loading via IntersectionObserver on all ad units' },
              { done: true,                          label: 'Cookie consent banner implemented (GDPR)' },
              { done: true,                          label: 'GA4 page view tracking on every route change' },
              { done: false,                         label: 'Create real ad units in AdSense dashboard and update slot IDs' },
              { done: false,                         label: 'Submit site for AdSense review and approval' },
            ].map(({ done, label }) => (
              <div key={label} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={16}
                  className={`shrink-0 mt-0.5 ${done ? 'text-green-500' : 'text-slate-300'}`}
                />
                <span className={`text-sm ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminAds;

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, TrendingUp, CreditCard, RefreshCw,
  Calendar, BadgeCheck, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmt      = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtShort = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
const toISO    = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

const PLAN_COLORS_BG  = { pro: 'bg-amber-500', premium: 'bg-primary-500', basic: 'bg-blue-500' };

const PERIOD_PRESETS = [
  { label: 'Today',      value: 'today' },
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
  { label: 'This Year',  value: 'year'  },
  { label: 'All Time',   value: 'all'   },
  { label: 'Custom',     value: 'custom'},
];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'bg-primary-500', raw }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon size={15} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{raw ? (value ?? '—') : fmt(value)}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color = 'bg-primary-500' }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 capitalize font-medium">{label}</span>
      <span className="font-bold text-slate-800">{fmt(value)}</span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: max > 0 ? `${Math.min(100, (value / max) * 100)}%` : '0%' }}
      />
    </div>
  </div>
);

// ── Recharts tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name === 'revenue' ? fmt(p.value) : `${p.value} payments`}
        </p>
      ))}
    </div>
  );
};

// ── Payment row ───────────────────────────────────────────────────────────────
const PaymentRow = ({ p }) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-2.5">
        <img
          src={p.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.userId?.name || 'U')}&background=e879a0&color=fff&size=32`}
          alt={p.userId?.name}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{p.userId?.name || '—'}</p>
          <p className="text-xs text-slate-400 truncate">{p.userId?.email}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
        p.plan === 'pro'     ? 'bg-amber-100 text-amber-700' :
        p.plan === 'premium' ? 'bg-primary-100 text-primary-700' :
                               'bg-blue-100 text-blue-700'
      }`}>{p.plan}</span>
    </td>
    <td className="px-4 py-3 text-sm font-bold text-slate-900">{fmt(p.amount)}</td>
    <td className="px-4 py-3">
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}>{p.status}</span>
    </td>
    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell font-mono">
      {(p.paymentId || p.orderId || '—').slice(0, 20)}
    </td>
    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
    </td>
  </tr>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminRevenue = () => {
  // Overview period (cards + charts)
  const [period, setPeriod]     = useState('month');
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly]   = useState([]);
  const [byPlan, setByPlan]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Transaction filters
  const [planFilter,   setPlanFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [txPeriod,     setTxPeriod]     = useState('all');   // preset period for table
  const [customFrom,   setCustomFrom]   = useState('');
  const [customTo,     setCustomTo]     = useState('');
  const [showCustom,   setShowCustom]   = useState(false);

  // Pagination
  const [payments,  setPayments]  = useState([]);
  const [payPage,   setPayPage]   = useState(1);
  const [payTotal,  setPayTotal]  = useState(0);

  // ── Load overview + charts ──────────────────────────────────────────────────
  const load = useCallback(async (spinner = false) => {
    if (spinner) setRefreshing(true); else setLoading(true);
    try {
      const [ovRes, moRes, plRes] = await Promise.all([
        api.get(`/admin/analytics/overview?period=${period}`),
        api.get('/admin/analytics/monthly-revenue'),
        api.get('/admin/analytics/revenue-by-plan'),
      ]);
      setOverview(ovRes.data);
      setMonthly(moRes.data.data || []);
      setByPlan(plRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [period]);

  // ── Load transactions ───────────────────────────────────────────────────────
  const loadPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: payPage });
      if (planFilter   !== 'all') params.set('plan',   planFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      if (txPeriod === 'custom') {
        if (customFrom) params.set('from', customFrom);
        if (customTo)   params.set('to',   customTo);
      } else if (txPeriod !== 'all') {
        params.set('period', txPeriod);
      }

      const res = await api.get(`/admin/analytics/payments?${params}`);
      setPayments(res.data.payments || []);
      setPayTotal(res.data.pagination?.total || 0);
    } catch (e) { console.error(e); }
  }, [payPage, planFilter, statusFilter, txPeriod, customFrom, customTo]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadPayments(); }, [loadPayments]);

  // Reset page when filters change
  const setFilter = (setter) => (val) => { setter(val); setPayPage(1); };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    </AdminLayout>
  );

  const maxPlan    = Math.max(...byPlan.map(p => p.revenue), 1);
  const totalPages = Math.ceil(payTotal / 20);

  // Active filter count badge
  const activeFilters = [
    planFilter   !== 'all',
    statusFilter !== 'all',
    txPeriod     !== 'all',
  ].filter(Boolean).length;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
            <p className="text-slate-500 text-sm mt-1">All payments and subscription earnings</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Overview period selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {['today', 'week', 'month', 'year', 'all'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    period === p ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => load(true)} disabled={refreshing}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign}  label="Total Revenue"        value={overview?.totalRevenue}        color="bg-green-500"   sub="All time" />
          <StatCard icon={TrendingUp}  label="This Month"           value={overview?.monthRevenue}        color="bg-primary-500" sub="Current month" />
          <StatCard icon={Calendar}    label={`Period (${period})`} value={overview?.periodRevenue}       color="bg-blue-500"    sub="Selected period" />
          <StatCard icon={CreditCard}  label="Today"                value={overview?.todayRevenue}        color="bg-pink-500"    sub="Today's earnings" />
          <StatCard icon={BadgeCheck}  label="Active Subscriptions" value={overview?.activeSubscriptions} color="bg-purple-500"  sub="Currently active" raw />
          <StatCard icon={TrendingUp}  label="New Users Today"      value={overview?.newUsersToday}       color="bg-cyan-500"    sub="Signed up today" raw />
          <StatCard icon={TrendingUp}  label="New This Month"       value={overview?.newUsersMonth}       color="bg-orange-500"  sub="Monthly signups" raw />
          <StatCard icon={DollarSign}  label="Failed Payments"      value={overview?.failedPayments}      color="bg-red-500"     sub="All time" raw />
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Monthly area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Monthly Revenue</h2>
            <p className="text-xs text-slate-400 mb-4">Last 12 months</p>
            {monthly.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No revenue data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e879a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e879a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v.split(' ')[0]} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={fmtShort} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#e879a0" strokeWidth={2.5} fill="url(#revGrad2)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue by plan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-5">By Plan</h2>
            {byPlan.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
            ) : (
              <div className="space-y-5">
                {byPlan.map(p => (
                  <ProgressBar key={p._id} label={`${p._id} · ${p.count} txn`}
                    value={p.revenue} max={maxPlan} color={PLAN_COLORS_BG[p._id] || 'bg-slate-400'} />
                ))}
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={byPlan.map(p => ({ name: p._id, revenue: p.revenue }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenue" name="revenue" radius={[4, 4, 0, 0]}
                      fill="#e879a0"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Transaction History ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Table header + filters */}
          <div className="px-5 py-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  Transaction History
                  {activeFilters > 0 && (
                    <span className="text-[10px] font-bold bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                      {activeFilters} filter{activeFilters > 1 ? 's' : ''}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{payTotal} transactions</p>
              </div>
              {/* Reset all */}
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setFilter(setPlanFilter)('all');
                    setFilter(setStatusFilter)('all');
                    setFilter(setTxPeriod)('all');
                    setCustomFrom(''); setCustomTo('');
                    setShowCustom(false);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
                >
                  <X size={12} /> Reset filters
                </button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap gap-2 items-center">

              {/* Period presets */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
                {PERIOD_PRESETS.map(({ label, value }) => (
                  <button key={value}
                    onClick={() => {
                      setFilter(setTxPeriod)(value);
                      setShowCustom(value === 'custom');
                      if (value !== 'custom') { setCustomFrom(''); setCustomTo(''); }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      txPeriod === value ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Plan filter */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'basic', 'premium', 'pro'].map(p => (
                  <button key={p} onClick={() => setFilter(setPlanFilter)(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      planFilter === p ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'paid', 'failed'].map(s => (
                  <button key={s} onClick={() => setFilter(setStatusFilter)(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      statusFilter === s ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom date range */}
            {showCustom && (
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    max={customTo || toISO(new Date())}
                    onChange={e => { setCustomFrom(e.target.value); setPayPage(1); }}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 bg-slate-50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">To</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    max={toISO(new Date())}
                    onChange={e => { setCustomTo(e.target.value); setPayPage(1); }}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 bg-slate-50"
                  />
                </div>
                {(customFrom || customTo) && (
                  <button
                    onClick={() => { setCustomFrom(''); setCustomTo(''); setPayPage(1); }}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <X size={11} /> Clear dates
                  </button>
                )}
                {customFrom && customTo && (
                  <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-1 rounded-lg">
                    {new Date(customFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    {' → '}
                    {new Date(customTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign size={36} className="text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No transactions found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting the filters above</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Payment ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => <PaymentRow key={p._id} p={p} />)}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {payPage} of {totalPages || 1} · {payTotal} transactions
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPayPage(1)} disabled={payPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs px-2">
                    «
                  </button>
                  <button onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronLeft size={14} />
                  </button>
                  {/* Page number pills */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(payPage - 2, totalPages - 4));
                    const pg = start + i;
                    return pg <= totalPages ? (
                      <button key={pg} onClick={() => setPayPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          pg === payPage ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pg}
                      </button>
                    ) : null;
                  })}
                  <button onClick={() => setPayPage(p => Math.min(totalPages, p + 1))} disabled={payPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronRight size={14} />
                  </button>
                  <button onClick={() => setPayPage(totalPages)} disabled={payPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs px-2">
                    »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;

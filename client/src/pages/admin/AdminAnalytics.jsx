import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, CreditCard,
  RefreshCw, ArrowUpRight, Activity, Calendar, BadgeCheck,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmt      = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtShort = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

const PIE_COLORS  = { pro: '#f59e0b', premium: '#e879a0', basic: '#3b82f6', free: '#94a3b8' };
const PLAN_COLORS = { pro: 'bg-amber-500', premium: 'bg-primary-500', basic: 'bg-blue-500' };

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'bg-primary-500', raw }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon size={15} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{raw ? value : fmt(value)}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── CSS progress bar ──────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color = 'bg-primary-500', isCurrency = false }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-slate-500 capitalize">{label}</span>
      <span className="font-semibold text-slate-700">{isCurrency ? fmt(value) : value}</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: max > 0 ? `${Math.min(100, (value / max) * 100)}%` : '0%' }}
      />
    </div>
  </div>
);

// ── Custom tooltip for charts ─────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name === 'revenue' ? fmt(p.value) : p.value}
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
    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{fmt(p.amount)}</td>
    <td className="px-4 py-3">
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}>{p.status}</span>
    </td>
    <td className="px-4 py-3 text-xs text-slate-400">
      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
    </td>
  </tr>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const [period, setPeriod]         = useState('month');
  const [overview, setOverview]     = useState(null);
  const [monthly, setMonthly]       = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [byPlan, setByPlan]         = useState([]);
  const [conversion, setConversion] = useState(null);
  const [payments, setPayments]     = useState([]);
  const [payPage, setPayPage]       = useState(1);
  const [payTotal, setPayTotal]     = useState(0);
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    try {
      const [ovRes, moRes, ugRes, plRes, cvRes] = await Promise.all([
        api.get(`/admin/analytics/overview?period=${period}`),
        api.get('/admin/analytics/monthly-revenue'),
        api.get('/admin/analytics/user-growth'),
        api.get('/admin/analytics/revenue-by-plan'),
        api.get('/admin/analytics/conversion'),
      ]);
      setOverview(ovRes.data);
      setMonthly(moRes.data.data || []);
      setUserGrowth(ugRes.data.data || []);
      setByPlan(plRes.data.data || []);
      setConversion(cvRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [period]);

  const loadPayments = useCallback(async () => {
    try {
      const res = await api.get(`/admin/analytics/payments?page=${payPage}&plan=${planFilter}`);
      setPayments(res.data.payments || []);
      setPayTotal(res.data.pagination?.total || 0);
    } catch (e) { console.error(e); }
  }, [payPage, planFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadPayments(); }, [loadPayments]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    </AdminLayout>
  );

  const maxPlan = Math.max(...byPlan.map(p => p.revenue), 1);

  // Pie data for plan distribution
  const pieData = (conversion?.planDistribution || []).map(p => ({
    name: p._id || 'free',
    value: p.count,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revenue & Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Platform financial overview</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {['today', 'week', 'month', 'year', 'all'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    period === p ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign}   label="Total Revenue"        value={overview?.totalRevenue}        color="bg-green-500"   sub="All time" />
          <StatCard icon={TrendingUp}   label="This Month"           value={overview?.monthRevenue}        color="bg-primary-500" sub="Current month" />
          <StatCard icon={Calendar}     label={`Period (${period})`} value={overview?.periodRevenue}       color="bg-blue-500"    sub="Selected period" />
          <StatCard icon={CreditCard}   label="Today"                value={overview?.todayRevenue}        color="bg-pink-500"    sub="Today's earnings" />
          <StatCard icon={BadgeCheck}   label="Active Subscriptions" value={overview?.activeSubscriptions} color="bg-purple-500"  sub="Currently active" raw />
          <StatCard icon={Users}        label="New Users Today"      value={overview?.newUsersToday}       color="bg-cyan-500"    sub="Signed up today" raw />
          <StatCard icon={Activity}     label="New This Month"       value={overview?.newUsersMonth}       color="bg-orange-500"  sub="Monthly signups" raw />
          <StatCard icon={ArrowUpRight} label="Conversion Rate"      value={`${conversion?.conversionRate || 0}%`} color="bg-teal-500" sub={`${conversion?.paid || 0} paid of ${conversion?.total || 0}`} raw />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Monthly Revenue — Area chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Monthly Revenue</h2>
            <p className="text-xs text-slate-400 mb-4">Last 12 months</p>
            {monthly.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No revenue data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e879a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e879a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v.split(' ')[0]} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={fmtShort} width={48} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#e879a0" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* User Growth — Bar chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">User Growth</h2>
            <p className="text-xs text-slate-400 mb-4">New signups per month</p>
            {userGrowth.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={userGrowth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v.split(' ')[0]} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={32} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="count" name="users" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Revenue by plan — horizontal bars */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
            <h2 className="font-semibold text-slate-800 mb-5">Revenue by Plan</h2>
            {byPlan.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No payment data yet</p>
            ) : (
              <div className="space-y-4">
                {byPlan.map(p => (
                  <ProgressBar
                    key={p._id}
                    label={`${p._id} · ${p.count} payment${p.count !== 1 ? 's' : ''}`}
                    value={p.revenue}
                    max={maxPlan}
                    color={PLAN_COLORS[p._id] || 'bg-slate-400'}
                    isCurrency
                  />
                ))}
              </div>
            )}
          </div>

          {/* Plan distribution — Pie chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Plan Distribution</h2>
            <p className="text-xs text-slate-400 mb-3">Users per plan</p>
            {pieData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[d.name] || '#94a3b8' }} />
                        <span className="text-slate-600 capitalize">{d.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Conversion Funnel</h2>
            <span className="text-2xl font-bold text-green-600">{conversion?.conversionRate || 0}%</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Users',       value: conversion?.total,             color: 'bg-slate-400', pct: 100 },
              { label: 'Paid Subscribers',  value: conversion?.paid,              color: 'bg-green-500', pct: conversion?.total ? (conversion.paid / conversion.total) * 100 : 0 },
              { label: 'Active Subs',       value: overview?.activeSubscriptions, color: 'bg-primary-500', pct: conversion?.total ? ((overview?.activeSubscriptions || 0) / conversion.total) * 100 : 0 },
            ].map(({ label, value, color, pct }) => (
              <div key={label} className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">{value ?? '—'}</p>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pct.toFixed(1)}% of total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment history table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-slate-800">Payment History</h2>
              <p className="text-xs text-slate-400 mt-0.5">{payTotal} total transactions</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'basic', 'premium', 'pro'].map(p => (
                <button
                  key={p}
                  onClick={() => { setPlanFilter(p); setPayPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    planFilter === p ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign size={36} className="text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No payments yet</p>
              <p className="text-slate-400 text-sm mt-1">Transactions will appear here once users subscribe</p>
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
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => <PaymentRow key={p._id} p={p} />)}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Page {payPage} · {payTotal} transactions</p>
                <div className="flex gap-2">
                  <button onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-40 hover:bg-slate-50">
                    Prev
                  </button>
                  <button onClick={() => setPayPage(p => p + 1)} disabled={payments.length < 20}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-40 hover:bg-slate-50">
                    Next
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

export default AdminAnalytics;

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, TrendingUp, CreditCard, RefreshCw,
  Calendar, BadgeCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const fmt      = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtShort = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

const PLAN_COLORS_HEX = { pro: '#f59e0b', premium: '#e879a0', basic: '#3b82f6' };
const PLAN_COLORS_BG  = { pro: 'bg-amber-500', premium: 'bg-primary-500', basic: 'bg-blue-500' };

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
    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
      {p.paymentId || p.orderId || '—'}
    </td>
    <td className="px-4 py-3 text-xs text-slate-400">
      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
    </td>
  </tr>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminRevenue = () => {
  const [period, setPeriod]     = useState('month');
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly]   = useState([]);
  const [byPlan, setByPlan]     = useState([]);
  const [payments, setPayments] = useState([]);
  const [payPage, setPayPage]   = useState(1);
  const [payTotal, setPayTotal] = useState(0);
  const [planFilter, setPlanFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const loadPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: payPage });
      if (planFilter   !== 'all') params.set('plan',   planFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get(`/admin/analytics/payments?${params}`);
      setPayments(res.data.payments || []);
      setPayTotal(res.data.pagination?.total || 0);
    } catch (e) { console.error(e); }
  }, [payPage, planFilter, statusFilter]);

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
  const totalPages = Math.ceil(payTotal / 20);

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
            <p className="text-slate-500 text-sm mt-1">All payments and subscription earnings</p>
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

        {/* Stat cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Monthly revenue area chart */}
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
                  <ProgressBar
                    key={p._id}
                    label={`${p._id} · ${p.count} txn`}
                    value={p.revenue}
                    max={maxPlan}
                    color={PLAN_COLORS_BG[p._id] || 'bg-slate-400'}
                  />
                ))}
                {/* Mini bar chart */}
                <div className="pt-2">
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={byPlan.map(p => ({ name: p._id, revenue: p.revenue }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="revenue" name="revenue" radius={[4, 4, 0, 0]}>
                        {byPlan.map((p, i) => (
                          <rect key={i} fill={PLAN_COLORS_HEX[p._id] || '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment history table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-slate-800">Transaction History</h2>
              <p className="text-xs text-slate-400 mt-0.5">{payTotal} total transactions</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Plan filter */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'basic', 'premium', 'pro'].map(p => (
                  <button
                    key={p}
                    onClick={() => { setPlanFilter(p); setPayPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
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
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setPayPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      statusFilter === s ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign size={36} className="text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No transactions found</p>
              <p className="text-slate-400 text-sm mt-1">Try changing the filters above</p>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setPayPage(p => Math.max(1, p - 1))}
                    disabled={payPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setPayPage(p => p + 1)}
                    disabled={payPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight size={15} />
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

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Eye, Users, UserCheck, UserPlus, Smartphone, Monitor,
  RefreshCw, Globe, Tablet, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const PERIOD_OPTS = [
  { label: 'Today', value: 'today' },
  { label: 'Week',  value: 'week'  },
  { label: 'Month', value: 'month' },
  { label: 'Year',  value: 'year'  },
  { label: 'All',   value: 'all'   },
];

const TABLE_PERIOD_OPTS = [
  { label: 'Today',  value: 'today'  },
  { label: 'Week',   value: 'week'   },
  { label: 'Month',  value: 'month'  },
  { label: 'Year',   value: 'year'   },
  { label: 'All',    value: 'all'    },
  { label: 'Custom', value: 'custom' },
];

const PAGE_OPTS = [
  { label: 'All Pages', value: 'all' },
  { label: '🏠 Home',      value: '/'          },
  { label: '🔑 Login',     value: '/login'      },
  { label: '📝 Signup',    value: '/signup'     },
  { label: '💳 Pricing',   value: '/pricing'    },
  { label: '🔍 Discover',  value: '/discover'   },
  { label: '📊 Dashboard', value: '/dashboard'  },
  { label: '💞 Matches',   value: '/matches'    },
  { label: '💬 Chats',     value: '/chats'      },
  { label: '👤 Profile',   value: '/profile'    },
  { label: 'ℹ️ About',     value: '/about'      },
  { label: '📬 Contact',   value: '/contact'    },
];

const toISO = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

const PIE_COLORS = ['#e879a0', '#818cf8'];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'bg-primary-500' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className={`p-2 rounded-xl ${color}`}><Icon size={15} className="text-white" /></div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── Chart tooltip ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Device icon helper ────────────────────────────────────────────────────────
const DeviceIcon = ({ device }) => {
  if (device === 'mobile')  return <Smartphone size={13} className="text-pink-500" />;
  if (device === 'tablet')  return <Tablet size={13} className="text-purple-500" />;
  return <Monitor size={13} className="text-slate-400" />;
};

// ── Page label prettifier ─────────────────────────────────────────────────────
const prettyPage = (p) => {
  const map = {
    '/':           '🏠 Home',
    '/login':      '🔑 Login',
    '/signup':     '📝 Signup',
    '/pricing':    '💳 Pricing',
    '/discover':   '🔍 Discover',
    '/dashboard':  '📊 Dashboard',
    '/matches':    '💞 Matches',
    '/chats':      '💬 Chats',
    '/profile':    '👤 Profile',
    '/about':      'ℹ️ About',
    '/contact':    '📬 Contact',
    '/verify':     '✅ Verify',
  };
  return map[p] || p;
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminVisitors = () => {
  const [period, setPeriod]         = useState('month');
  const [overview, setOverview]     = useState(null);
  const [daily, setDaily]           = useState([]);
  const [recentVisits, setRecent]   = useState([]);
  const [visitPage, setVisitPage]   = useState(1);
  const [visitTotal, setVisitTotal] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Table filters
  const [tblPeriod,   setTblPeriod]   = useState('all');
  const [tblDevice,   setTblDevice]   = useState('all');
  const [tblPage,     setTblPage]     = useState('all');
  const [customFrom,  setCustomFrom]  = useState('');
  const [customTo,    setCustomTo]    = useState('');
  const [showCustom,  setShowCustom]  = useState(false);

  const load = useCallback(async (spinner = false) => {
    if (spinner) setRefreshing(true); else setLoading(true);
    try {
      const [ovRes, dayRes] = await Promise.all([
        api.get(`/analytics/overview?period=${period}`),
        api.get('/analytics/daily'),
      ]);
      setOverview(ovRes.data);
      setDaily(dayRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [period]);

  const loadRecent = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: visitPage });
      if (tblDevice !== 'all') params.set('device', tblDevice);
      if (tblPage   !== 'all') params.set('pageFilter', tblPage);
      if (tblPeriod === 'custom') {
        if (customFrom) params.set('from', customFrom);
        if (customTo)   params.set('to',   customTo);
      } else if (tblPeriod !== 'all') {
        params.set('period', tblPeriod);
      }
      const res = await api.get(`/analytics/recent?${params}`);
      setRecent(res.data.visits || []);
      setVisitTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
  }, [visitPage, tblDevice, tblPage, tblPeriod, customFrom, customTo]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadRecent(); }, [loadRecent]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    </AdminLayout>
  );

  const deviceMap = {};
  (overview?.deviceDist || []).forEach(d => { deviceMap[d._id] = d.count; });
  const totalDevices = Object.values(deviceMap).reduce((a, b) => a + b, 0) || 1;

  const pieData = [
    { name: 'New',       value: overview?.newVisitors  || 0 },
    { name: 'Returning', value: overview?.returning    || 0 },
  ];

  const totalPages = Math.ceil(visitTotal / 20);

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visitor Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">All visitors — including anonymous users</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {PERIOD_OPTS.map(({ label, value }) => (
                <button key={value} onClick={() => setPeriod(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === value ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
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
          <StatCard icon={Eye}        label="Total Page Views"  value={overview?.total}         color="bg-primary-500" sub={`Period: ${period}`} />
          <StatCard icon={Users}      label="Unique Visitors"   value={overview?.unique}        color="bg-blue-500"    sub="Distinct visitor IDs" />
          <StatCard icon={Globe}      label="Today's Visitors"  value={overview?.today}         color="bg-green-500"   sub="Since midnight" />
          <StatCard icon={UserCheck}  label="Returning"         value={overview?.returning}     color="bg-amber-500"   sub="Visited more than once" />
          <StatCard icon={UserPlus}   label="New Visitors"      value={overview?.newVisitors}   color="bg-cyan-500"    sub="First-time visitors" />
          <StatCard icon={Monitor}    label="Desktop"           value={deviceMap.desktop || 0}  color="bg-slate-500"   sub={`${((deviceMap.desktop || 0) / totalDevices * 100).toFixed(0)}% of visits`} />
          <StatCard icon={Smartphone} label="Mobile"            value={deviceMap.mobile  || 0}  color="bg-pink-500"    sub={`${((deviceMap.mobile  || 0) / totalDevices * 100).toFixed(0)}% of visits`} />
          <StatCard icon={Tablet}     label="Tablet"            value={deviceMap.tablet  || 0}  color="bg-purple-500"  sub={`${((deviceMap.tablet  || 0) / totalDevices * 100).toFixed(0)}% of visits`} />
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Daily area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Daily Visitors</h2>
            <p className="text-xs text-slate-400 mb-4">Last 30 days — total vs unique</p>
            {daily.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No visitor data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e879a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e879a0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="total"  name="total"  stroke="#e879a0" strokeWidth={2} fill="url(#tGrad)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="unique" name="unique" stroke="#818cf8" strokeWidth={2} fill="url(#uGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-1.5 rounded-full bg-primary-400 inline-block" /> Total views
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-1.5 rounded-full bg-indigo-400 inline-block" /> Unique visitors
              </div>
            </div>
          </div>

          {/* New vs Returning donut */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">New vs Returning</h2>
            <p className="text-xs text-slate-400 mb-3">Visitor loyalty breakdown</p>
            {(overview?.unique || 0) === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-slate-600">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Top pages + Device breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top pages */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-4">Top Pages</h2>
            {(overview?.topPages || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {overview.topPages.map((p, i) => {
                  const maxCount = overview.topPages[0]?.count || 1;
                  return (
                    <div key={p.page} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-slate-400 font-mono w-4 shrink-0">{i + 1}.</span>
                          <span className="text-slate-700 font-medium truncate">{prettyPage(p.page)}</span>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0 ml-2">{p.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary-400 transition-all duration-500"
                          style={{ width: `${(p.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-4">Device Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Desktop', key: 'desktop', color: 'bg-slate-500',  icon: Monitor    },
                { label: 'Mobile',  key: 'mobile',  color: 'bg-pink-500',   icon: Smartphone },
                { label: 'Tablet',  key: 'tablet',  color: 'bg-purple-500', icon: Tablet     },
              ].map(({ label, key, color, icon: Icon }) => {
                const count = deviceMap[key] || 0;
                const pct   = ((count / totalDevices) * 100).toFixed(1);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ${color}`}><Icon size={12} className="text-white" /></div>
                        <span className="font-medium text-slate-700">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{count}</span>
                        <span className="text-xs text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Recent Visits Log ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Table header + filters */}
          <div className="px-5 py-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  Recent Visits
                  {[tblPeriod !== 'all', tblDevice !== 'all', tblPage !== 'all'].filter(Boolean).length > 0 && (
                    <span className="text-[10px] font-bold bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                      {[tblPeriod !== 'all', tblDevice !== 'all', tblPage !== 'all'].filter(Boolean).length} filter{[tblPeriod !== 'all', tblDevice !== 'all', tblPage !== 'all'].filter(Boolean).length > 1 ? 's' : ''}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{visitTotal} records</p>
              </div>
              {/* Reset */}
              {(tblPeriod !== 'all' || tblDevice !== 'all' || tblPage !== 'all') && (
                <button
                  onClick={() => {
                    setTblPeriod('all'); setTblDevice('all'); setTblPage('all');
                    setCustomFrom(''); setCustomTo(''); setShowCustom(false); setVisitPage(1);
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
                {TABLE_PERIOD_OPTS.map(({ label, value }) => (
                  <button key={value}
                    onClick={() => {
                      setTblPeriod(value); setVisitPage(1);
                      setShowCustom(value === 'custom');
                      if (value !== 'custom') { setCustomFrom(''); setCustomTo(''); }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      tblPeriod === value ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Device filter */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'desktop', 'mobile', 'tablet'].map(d => (
                  <button key={d}
                    onClick={() => { setTblDevice(d); setVisitPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      tblDevice === d ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {d === 'all' ? 'All Devices' : d}
                  </button>
                ))}
              </div>

              {/* Page filter */}
              <select
                value={tblPage}
                onChange={e => { setTblPage(e.target.value); setVisitPage(1); }}
                className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700"
              >
                {PAGE_OPTS.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Custom date range */}
            {showCustom && (
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">From</label>
                  <input type="date" value={customFrom}
                    max={customTo || toISO(new Date())}
                    onChange={e => { setCustomFrom(e.target.value); setVisitPage(1); }}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 bg-slate-50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">To</label>
                  <input type="date" value={customTo}
                    min={customFrom} max={toISO(new Date())}
                    onChange={e => { setCustomTo(e.target.value); setVisitPage(1); }}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 bg-slate-50"
                  />
                </div>
                {(customFrom || customTo) && (
                  <button onClick={() => { setCustomFrom(''); setCustomTo(''); setVisitPage(1); }}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
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

          {recentVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Eye size={36} className="text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No visits found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting the filters above</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Visitor ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Page</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Device</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">IP</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentVisits.map(v => (
                      <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {v.visitorId?.slice(0, 16)}…
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-slate-700">{prettyPage(v.page)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <DeviceIcon device={v.device} />
                            <span className="text-xs capitalize text-slate-600">{v.device}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-mono text-xs text-slate-400">{v.ip || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(v.visitedAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">Page {visitPage} of {totalPages || 1} · {visitTotal} records</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setVisitPage(1)} disabled={visitPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs px-2">«</button>
                  <button onClick={() => setVisitPage(p => Math.max(1, p - 1))} disabled={visitPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(visitPage - 2, totalPages - 4));
                    const pg = start + i;
                    return pg <= totalPages ? (
                      <button key={pg} onClick={() => setVisitPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          pg === visitPage ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>{pg}</button>
                    ) : null;
                  })}
                  <button onClick={() => setVisitPage(p => Math.min(totalPages, p + 1))} disabled={visitPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronRight size={14} />
                  </button>
                  <button onClick={() => setVisitPage(totalPages)} disabled={visitPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-xs px-2">»</button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminVisitors;

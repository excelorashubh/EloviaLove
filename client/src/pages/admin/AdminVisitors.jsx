import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Eye, Users, UserCheck, UserPlus, Smartphone, Monitor,
  RefreshCw, Globe, ArrowRight,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const PERIOD_OPTS = [
  { label: 'Today',  value: 'today' },
  { label: 'Week',   value: 'week'  },
  { label: 'Month',  value: 'month' },
  { label: 'Year',   value: 'year'  },
  { label: 'All',    value: 'all'   },
];

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

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const AdminVisitors = () => {
  const [period, setPeriod]       = useState('month');
  const [overview, setOverview]   = useState(null);
  const [daily, setDaily]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { load(); }, [load]);

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

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visitor Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Track all visitors — including anonymous users</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              {PERIOD_OPTS.map(({ label, value }) => (
                <button key={value} onClick={() => setPeriod(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
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

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye}       label="Total Page Views"  value={overview?.total}       color="bg-primary-500" sub={`Period: ${period}`} />
          <StatCard icon={Users}     label="Unique Visitors"   value={overview?.unique}      color="bg-blue-500"    sub="Distinct visitor IDs" />
          <StatCard icon={Globe}     label="Today's Visitors"  value={overview?.today}       color="bg-green-500"   sub="Since midnight" />
          <StatCard icon={UserCheck} label="Returning"         value={overview?.returning}   color="bg-amber-500"   sub="Visited more than once" />
          <StatCard icon={UserPlus}  label="New Visitors"      value={overview?.newVisitors} color="bg-cyan-500"    sub="First-time visitors" />
          <StatCard icon={Monitor}   label="Desktop"           value={deviceMap.desktop || 0} color="bg-slate-500"  sub={`${((deviceMap.desktop || 0) / totalDevices * 100).toFixed(0)}% of visits`} />
          <StatCard icon={Smartphone} label="Mobile"           value={deviceMap.mobile || 0} color="bg-pink-500"    sub={`${((deviceMap.mobile || 0) / totalDevices * 100).toFixed(0)}% of visits`} />
          <StatCard icon={Smartphone} label="Tablet"           value={deviceMap.tablet || 0} color="bg-purple-500"  sub={`${((deviceMap.tablet || 0) / totalDevices * 100).toFixed(0)}% of visits`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Daily visitors area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-1">Daily Visitors</h2>
            <p className="text-xs text-slate-400 mb-4">Last 30 days — total vs unique</p>
            {daily.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No visitor data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e879a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e879a0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="total"  name="total"  stroke="#e879a0" strokeWidth={2} fill="url(#totalGrad)"  dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="unique" name="unique" stroke="#818cf8" strokeWidth={2} fill="url(#uniqueGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-1.5 rounded-full bg-primary-400 inline-block" /> Total views
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-1.5 rounded-full bg-indigo-400 inline-block" /> Unique visitors
              </div>
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-4">Top Pages</h2>
            {(overview?.topPages || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
            ) : (
              <div className="space-y-3">
                {overview.topPages.map((p, i) => {
                  const maxCount = overview.topPages[0]?.count || 1;
                  return (
                    <div key={p.page} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-slate-400 font-mono shrink-0">{i + 1}.</span>
                          <span className="text-slate-700 font-medium truncate">{p.page || '/'}</span>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0 ml-2">{p.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-400 transition-all duration-500"
                          style={{ width: `${(p.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Device breakdown bar chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-1">Device Breakdown</h2>
          <p className="text-xs text-slate-400 mb-4">Visits by device type</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Desktop', key: 'desktop', color: 'bg-slate-500',   icon: Monitor },
              { label: 'Mobile',  key: 'mobile',  color: 'bg-pink-500',    icon: Smartphone },
              { label: 'Tablet',  key: 'tablet',  color: 'bg-purple-500',  icon: Smartphone },
            ].map(({ label, key, color, icon: Icon }) => {
              const count = deviceMap[key] || 0;
              const pct   = ((count / totalDevices) * 100).toFixed(1);
              return (
                <div key={key} className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${color}`}>
                      <Icon size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pct}% of visits</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminVisitors;

import { useEffect, useState } from 'react';
import { Users, Heart, MessageSquare, Flag, UserCheck, Activity } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const Bar = ({ label, value, max, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [genderStats, setGenderStats] = useState({ Male: 0, Female: 0, 'Non-binary': 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users?page=1'),
        ]);
        setStats(statsRes.data.stats);

        // Tally gender from first page (rough estimate)
        const counts = { Male: 0, Female: 0, 'Non-binary': 0 };
        usersRes.data.users.forEach(u => { if (counts[u.gender] !== undefined) counts[u.gender]++; });
        setGenderStats(counts);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    </AdminLayout>
  );

  const metrics = [
    { icon: Users,         label: 'Total Users',        value: stats?.totalUsers,     color: 'text-blue-600',   bg: 'bg-blue-50' },
    { icon: UserCheck,     label: 'Active Users',       value: stats?.activeUsers,    color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: Heart,         label: 'Total Matches',      value: stats?.totalMatches,   color: 'text-pink-600',   bg: 'bg-pink-50' },
    { icon: MessageSquare, label: 'Total Messages',     value: stats?.totalMessages,  color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Flag,          label: 'Pending Reports',    value: stats?.pendingReports, color: 'text-red-600',    bg: 'bg-red-50' },
    { icon: Activity,      label: 'New Users (30d)',    value: stats?.recentUsers,    color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const maxGender = Math.max(...Object.values(genderStats), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Platform performance overview</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
              <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Activity Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-5">Activity Rate</h2>
            <div className="space-y-4">
              <Bar label="Active Users" value={stats?.activeUsers} max={stats?.totalUsers} color="bg-green-500" />
              <Bar label="Inactive Users" value={(stats?.totalUsers - stats?.activeUsers)} max={stats?.totalUsers} color="bg-red-400" />
              <Bar label="New This Month" value={stats?.recentUsers} max={stats?.totalUsers} color="bg-blue-500" />
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">Overall activity rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.userActivity?.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-5">Gender Distribution</h2>
            <div className="space-y-4">
              <Bar label="Male" value={genderStats.Male} max={maxGender} color="bg-blue-500" />
              <Bar label="Female" value={genderStats.Female} max={maxGender} color="bg-pink-500" />
              <Bar label="Non-binary" value={genderStats['Non-binary']} max={maxGender} color="bg-purple-500" />
            </div>
            <p className="text-xs text-slate-400 mt-4">* Based on first page of users</p>
          </div>

          {/* Engagement */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-5">Engagement Metrics</h2>
            <div className="space-y-4">
              <Bar label="Matches per User" value={stats?.totalUsers > 0 ? (stats?.totalMatches / stats?.totalUsers).toFixed(2) : 0} max={10} color="bg-pink-500" />
              <Bar label="Messages per User" value={stats?.totalUsers > 0 ? (stats?.totalMessages / stats?.totalUsers).toFixed(2) : 0} max={50} color="bg-purple-500" />
            </div>
          </div>

          {/* Safety */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-5">Safety Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Pending Reports</span>
                <span className="font-bold text-red-600">{stats?.pendingReports}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Report Rate</span>
                <span className="font-bold text-slate-800">
                  {stats?.totalUsers > 0 ? ((stats?.pendingReports / stats?.totalUsers) * 100).toFixed(2) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Inactive Accounts</span>
                <span className="font-bold text-slate-800">{stats?.totalUsers - stats?.activeUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

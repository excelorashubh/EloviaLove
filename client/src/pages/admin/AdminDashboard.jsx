import { useEffect, useState } from 'react';
import { Users, Heart, MessageSquare, Flag, UserCheck, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900">{value ?? '—'}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users?page=1'),
        ]);
        setStats(statsRes.data.stats);
        setRecentUsers(usersRes.data.users.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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

  const cards = [
    { icon: Users,        label: 'Total Users',     value: stats?.totalUsers,    color: 'bg-blue-500',    sub: `${stats?.recentUsers} joined last 30 days` },
    { icon: UserCheck,    label: 'Active Users',    value: stats?.activeUsers,   color: 'bg-green-500',   sub: `${stats?.userActivity?.toFixed(1)}% activity rate` },
    { icon: Heart,        label: 'Total Matches',   value: stats?.totalMatches,  color: 'bg-pink-500',    sub: 'All time' },
    { icon: MessageSquare,label: 'Messages Sent',   value: stats?.totalMessages, color: 'bg-purple-500',  sub: 'All time' },
    { icon: Flag,         label: 'Pending Reports', value: stats?.pendingReports,color: 'bg-red-500',     sub: 'Needs review' },
    { icon: TrendingUp,   label: 'New This Month',  value: stats?.recentUsers,   color: 'bg-orange-500',  sub: 'Last 30 days' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(c => <StatCard key={c.label} {...c} />)}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Signups</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentUsers.map(u => (
              <div key={u._id} className="flex items-center gap-4 px-6 py-3">
                <img
                  src={u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e879a0&color=fff&size=40`}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-slate-400">{u.gender}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

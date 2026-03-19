import { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX, Trash2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive | verified
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId + '_status');
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const toggleVerify = async (userId, currentVerified) => {
    setActionLoading(userId + '_verify');
    try {
      // Use profile update endpoint to toggle verification
      await api.put(`/admin/users/${userId}/verify`, { isVerified: !currentVerified });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: !currentVerified } : u));
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user and all their data?')) return;
    setActionLoading(userId + '_delete');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'active') return u.isActive;
    if (filter === 'inactive') return !u.isActive;
    if (filter === 'verified') return u.isVerified;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'verified'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Gender</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Joined</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(u => (
                        <tr
                          key={u._id}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedUser?._id === u._id ? 'bg-primary-50' : ''}`}
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e879a0&color=fff&size=36`}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate flex items-center gap-1">
                                  {u.name}
                                  {u.isVerified && <ShieldCheck size={13} className="text-blue-500 shrink-0" />}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{u.gender}</td>
                          <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => toggleStatus(u._id, u.isActive)}
                                disabled={actionLoading === u._id + '_status'}
                                title={u.isActive ? 'Deactivate' : 'Activate'}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
                              >
                                {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                              </button>
                              <button
                                onClick={() => deleteUser(u._id)}
                                disabled={actionLoading === u._id + '_delete'}
                                title="Delete user"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-12 text-slate-400">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Page {pagination.page} of {pagination.pages || 1}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= (pagination.pages || 1)}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Detail Panel */}
          {selectedUser && (
            <div className="w-72 shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 self-start">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="text-center">
                <img
                  src={selectedUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=e879a0&color=fff&size=80`}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                />
                <p className="font-bold text-slate-900">{selectedUser.name}</p>
                <p className="text-xs text-slate-400">{selectedUser.email}</p>
              </div>
              <div className="space-y-2 text-sm divide-y divide-slate-100">
                {[
                  ['Gender', selectedUser.gender],
                  ['Role', selectedUser.role],
                  ['Status', selectedUser.isActive ? 'Active' : 'Inactive'],
                  ['Verified', selectedUser.isVerified ? 'Yes' : 'No'],
                  ['Profile', selectedUser.profileCompleted ? 'Complete' : 'Incomplete'],
                  ['Location', selectedUser.location || '—'],
                  ['Joined', new Date(selectedUser.createdAt).toLocaleDateString()],
                  ['Last Active', new Date(selectedUser.lastActive).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
              {selectedUser.bio && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-slate-600">{selectedUser.bio}</p>
                </div>
              )}
              {selectedUser.interests?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.interests.map(i => (
                      <span key={i} className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full">{i}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { toggleStatus(selectedUser._id, selectedUser.isActive); setSelectedUser(u => ({ ...u, isActive: !u.isActive })); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedUser.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteUser(selectedUser._id)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

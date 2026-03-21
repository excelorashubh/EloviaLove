import { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX, Trash2, ShieldCheck, ChevronLeft, ChevronRight, BadgeCheck, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

// ── Blue Tick Review Panel ────────────────────────────────────────────────────
const BlueTickRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/verify/requests');
      setRequests(res.data.requests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const review = async (requestId, action) => {
    setActionLoading(requestId + action);
    setMsg(null);
    try {
      await api.post(`/verify/review/${requestId}`, { action, note });
      setMsg({ type: 'success', text: `Request ${action}d successfully` });
      setRequests(prev => prev.filter(r => r._id !== requestId));
      setSelected(null);
      setNote('');
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Action failed' });
    } finally { setActionLoading(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="flex gap-5">
      {/* Request list */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b ${
            msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {msg.text}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <BadgeCheck size={36} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No pending requests</p>
            <p className="text-slate-400 text-sm mt-1">All blue tick requests have been reviewed</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(r => (
                <tr
                  key={r._id}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${selected?._id === r._id ? 'bg-primary-50' : ''}`}
                  onClick={() => { setSelected(r); setNote(''); setMsg(null); }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userId?.name || 'U')}&background=e879a0&color=fff&size=36`}
                        alt={r.userId?.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{r.userId?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{r.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell capitalize">{r.userId?.plan || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700 w-fit">
                      <Clock size={11} /> Pending
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => review(r._id, 'approve')}
                        disabled={!!actionLoading}
                        title="Approve"
                        className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-40"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => review(r._id, 'reject')}
                        disabled={!!actionLoading}
                        title="Reject"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-72 shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 self-start">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Review Request</h3>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          {/* User info */}
          <div className="text-center">
            <img
              src={selected.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.userId?.name || 'U')}&background=e879a0&color=fff&size=80`}
              alt={selected.userId?.name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
            />
            <p className="font-bold text-slate-900">{selected.userId?.name}</p>
            <p className="text-xs text-slate-400">{selected.userId?.email}</p>
          </div>

          {/* Selfie */}
          {selected.selfieImage && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Submitted Selfie</p>
              <img
                src={selected.selfieImage}
                alt="Selfie"
                className="w-full rounded-2xl object-cover border border-slate-200 max-h-48"
              />
            </div>
          )}

          {/* ID proof if any */}
          {selected.idProof && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">ID Proof</p>
              <img
                src={selected.idProof}
                alt="ID"
                className="w-full rounded-2xl object-cover border border-slate-200 max-h-48"
              />
            </div>
          )}

          <div className="text-xs text-slate-500 space-y-1">
            <p>Submitted: {new Date(selected.createdAt).toLocaleString()}</p>
            <p>Plan: <span className="font-semibold capitalize text-slate-700">{selected.userId?.plan}</span></p>
          </div>

          {/* Rejection note */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Note (optional, shown on reject)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Reason for rejection..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => review(selected._id, 'approve')}
              disabled={!!actionLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            <button
              onClick={() => review(selected._id, 'reject')}
              disabled={!!actionLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main AdminUsers ───────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [tab, setTab] = useState('users'); // 'users' | 'bluetick'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  // Fetch pending blue tick count for badge
  useEffect(() => {
    api.get('/verify/requests').then(r => setPendingCount(r.data.requests?.length || 0)).catch(() => {});
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId + '_status');
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total users</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'users' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Users
          </button>
          <button
            onClick={() => setTab('bluetick')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === 'bluetick' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BadgeCheck size={14} className="text-blue-500" />
            Blue Tick Requests
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {tab === 'bluetick' ? (
          <BlueTickRequests />
        ) : (
          <>
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
                      onClick={() => toggleStatus(selectedUser._id, selectedUser.isActive)}
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
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

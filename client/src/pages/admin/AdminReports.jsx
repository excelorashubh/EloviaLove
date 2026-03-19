import { useEffect, useState, useCallback } from 'react';
import { Flag, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const STATUS_COLORS = {
  pending:      'bg-yellow-100 text-yellow-700',
  investigating:'bg-blue-100 text-blue-700',
  resolved:     'bg-green-100 text-green-700',
  dismissed:    'bg-slate-100 text-slate-500',
};

const REASON_LABELS = {
  fake_profile:          'Fake Profile',
  harassment:            'Harassment',
  spam:                  'Spam',
  inappropriate_content: 'Inappropriate Content',
  underage:              'Underage',
  other:                 'Other',
};

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?page=${page}&status=${statusFilter}`);
      setReports(res.data.reports);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = async (reportId, status) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/reports/${reportId}`, { status, adminNotes: notes });
      setReports(prev => prev.map(r => r._id === reportId ? res.data.report : r));
      setSelected(res.data.report);
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  const banUser = async (userId) => {
    if (!window.confirm('Deactivate this user account?')) return;
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: false });
      alert('User deactivated successfully');
    } catch (e) { console.error(e); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Complaints</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total || 0} total reports</p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-5">
          {/* Reports list */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {reports.map(r => (
                    <div
                      key={r._id}
                      onClick={() => { setSelected(r); setNotes(r.adminNotes || ''); }}
                      className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${selected?._id === r._id ? 'bg-primary-50' : ''}`}
                    >
                      <div className="p-2 bg-red-50 rounded-xl shrink-0">
                        <Flag size={16} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">
                            {r.reporter?.name} → {r.reportedUser?.name}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {REASON_LABELS[r.reason]} · {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                        {r.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{r.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <div className="text-center py-12 text-slate-400">No reports found</div>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages || 1}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                      <ChevronLeft size={15} />
                    </button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= (pagination.pages || 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 self-start">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Report Detail</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-2 text-sm divide-y divide-slate-100">
                {[
                  ['Reporter', selected.reporter?.name],
                  ['Reported', selected.reportedUser?.name],
                  ['Reason', REASON_LABELS[selected.reason]],
                  ['Status', selected.status],
                  ['Date', new Date(selected.createdAt).toLocaleDateString()],
                  ...(selected.resolvedBy ? [['Resolved by', selected.resolvedBy?.name]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800 capitalize">{v}</span>
                  </div>
                ))}
              </div>

              {selected.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">{selected.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Admin Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selected.status === 'pending' && (
                  <button
                    onClick={() => updateReport(selected._id, 'investigating')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    <AlertCircle size={15} /> Mark Investigating
                  </button>
                )}
                {['pending', 'investigating'].includes(selected.status) && (
                  <>
                    <button
                      onClick={() => updateReport(selected._id, 'resolved')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle size={15} /> Resolve
                    </button>
                    <button
                      onClick={() => updateReport(selected._id, 'dismissed')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 disabled:opacity-50"
                    >
                      <XCircle size={15} /> Dismiss
                    </button>
                  </>
                )}
                {selected.reportedUser && (
                  <button
                    onClick={() => banUser(selected.reportedUser._id)}
                    className="w-full py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
                  >
                    Ban Reported User
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

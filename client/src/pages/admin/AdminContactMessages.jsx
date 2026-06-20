import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trash2, ArrowRight, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMessages, deleteAdminMessage, fetchContactSummary } from '../../services/contact';

const STAT_CARDS = [
  { label: 'Total Messages', key: 'total', color: 'bg-slate-900 text-white' },
  { label: 'New', key: 'newCount', color: 'bg-primary-600 text-white' },
  { label: 'Read', key: 'readCount', color: 'bg-emerald-600 text-white' },
  { label: 'Replied', key: 'repliedCount', color: 'bg-cyan-600 text-white' },
  { label: 'Archived', key: 'archivedCount', color: 'bg-slate-500 text-white' },
];

const STATUS_STYLES = {
  New: 'bg-blue-100 text-blue-700',
  Read: 'bg-slate-100 text-slate-700',
  Replied: 'bg-emerald-100 text-emerald-700',
  Archived: 'bg-slate-100 text-slate-500'
};

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600',
  Normal: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700'
};

const columns = [
  { label: 'User', key: 'fullName' },
  { label: 'Email', key: 'email' },
  { label: 'Phone', key: 'phone' },
  { label: 'Subject', key: 'subject' },
  { label: 'Status', key: 'status' },
  { label: 'Priority', key: 'priority' },
  { label: 'Date', key: 'createdAt' },
];

const formatDate = (iso) => new Date(iso).toLocaleString('en-IN', { hour12: true });

function AdminContactMessages() {
  const [summary, setSummary] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [details, setDetails] = useState(null);
  const tableRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, messagesRes] = await Promise.all([
        fetchContactSummary(),
        fetchAdminMessages({ page, status: filterStatus, priority: filterPriority, search, limit: 20 })
      ]);
      setSummary(summaryRes.data.stats);
      setMessages(messagesRes.data.messages);
    } catch (error) {
      console.error('Admin contact load error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, filterStatus, filterPriority, search]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(new Set(messages.map((item) => item._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await deleteAdminMessage(id);
      loadData();
    } catch (error) {
      console.error('Delete contact message error', error);
    }
  };

  const exportCsv = () => {
    const rows = messages.map((message) => ({
      fullName: message.fullName,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message.replace(/\n/g, ' '),
      status: message.status,
      priority: message.priority,
      createdAt: formatDate(message.createdAt)
    }));
    const csv = [
      ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Priority', 'Created Date'],
      ...rows.map((row) => [
        row.fullName,
        row.email,
        row.phone,
        row.subject,
        row.message,
        row.status,
        row.priority,
        row.createdAt
      ])
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contact-messages.csv';
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
              <p className="text-sm text-slate-500">Manage inbound user inquiries, reply quickly, archive, and monitor support workload.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {STAT_CARDS.map((card) => (
            <div key={card.key} className={`rounded-3xl p-5 ${card.color}`}> 
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{card.label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{summary?.[card.key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-sm">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone, subject or message"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Read">Read</option>
                <option value="Replied">Replied</option>
                <option value="Archived">Archived</option>
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table ref={tableRef} className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium"> <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === messages.length && messages.length > 0} /> </th>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 text-left font-medium">{column.label}</th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-slate-400">Loading messages...</td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-slate-500">No contact messages found.</td>
                  </tr>
                ) : messages.map((message) => (
                  <tr key={message._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 align-top"> <input type="checkbox" checked={selectedIds.has(message._id)} onChange={() => handleSelectOne(message._id)} /> </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-slate-900">{message.fullName}</div>
                      {message.userId ? <div className="text-xs text-slate-500">Account linked</div> : <div className="text-xs text-slate-400">Guest</div>}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{message.email}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{message.phone || '—'}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{message.subject}</td>
                    <td className="px-4 py-4 align-top"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[message.status] || 'bg-slate-100 text-slate-700'}`}>{message.status}</span></td>
                    <td className="px-4 py-4 align-top"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_STYLES[message.priority] || 'bg-slate-100 text-slate-700'}`}>{message.priority}</span></td>
                    <td className="px-4 py-4 align-top text-slate-500">{formatDate(message.createdAt)}</td>
                    <td className="px-4 py-4 align-top">
                      <button onClick={() => setDetails(message)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"><ArrowRight size={14} /> View</button>
                      <button onClick={() => handleDelete(message._id)} className="ml-2 inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"><Trash2 size={14} /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {details && (
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Message details</h2>
                <p className="text-sm text-slate-500">View and manage the selected contact message.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition">Mark Read</button>
                <button className="rounded-3xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition">Reply</button>
                <button className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">Archive</button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">From</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{details.fullName}</p>
                  <p className="text-sm text-slate-600">{details.email}</p>
                  <p className="text-sm text-slate-600">{details.phone || 'Phone not provided'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Message</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{details.message}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[details.status] || 'bg-slate-100 text-slate-700'}`}>{details.status}</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Priority</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_STYLES[details.priority] || 'bg-slate-100 text-slate-700'}`}>{details.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Created</span>
                      <span>{formatDate(details.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Updated</span>
                      <span>{formatDate(details.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Notes</p>
                  <p className="mt-3 text-sm text-slate-700">{details.adminNotes || 'No notes yet.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminContactMessages;

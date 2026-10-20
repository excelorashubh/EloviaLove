import { createElement, useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const EMPTY_SUMMARY = {
  totalConversations: 0,
  activeConversations: 0,
  todayChats: 0,
  messagesToday: 0,
  totalMessages: 0,
  unreadMessages: 0,
  activeChatters: 0,
  activeChattersPeriodDays: 30,
  averageMessagesPerConversation: 0,
};

const formatDate = (value) => {
  if (!value) return 'No activity';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const Avatar = ({ user }) => {
  const [failed, setFailed] = useState(false);
  const name = user?.name || 'Unavailable user';
  return user?.profilePhoto && !failed
    ? <img src={user.profilePhoto} alt="" onError={() => setFailed(true)} className="h-9 w-9 shrink-0 rounded-full bg-slate-100 object-cover" />
    : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-semibold text-pink-700">{name === 'Unavailable user' ? '?' : name.trim().charAt(0).toUpperCase()}</span>;
};

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <span className="flex items-center gap-2"><AlertCircle size={17} />{message}</span>
    <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-semibold hover:underline"><RefreshCw size={14} />Retry</button>
  </div>
);

const StatCard = ({ icon, label, value, note, color }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`rounded-xl p-2 ${color}`}>{createElement(icon, { size: 18, className: 'text-white' })}</span>
    </div>
    <p className="text-3xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
  </div>
);

const DetailModal = ({ id, close }) => {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ key: '', conversation: null, error: '' });
  const key = `${id}:${retry}`;
  const loading = result.key !== key;
  const conversation = result.key === key ? result.conversation : null;
  const error = result.key === key ? result.error : '';

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/admin/chats/${id}`, { signal: controller.signal })
      .then((response) => setResult({ key, conversation: response.data.conversation, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) setResult({
          key,
          conversation: null,
          error: requestError.response?.data?.message || 'Unable to load conversation details.',
        });
      });
    return () => controller.abort();
  }, [id, key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="chat-detail-heading" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="chat-detail-heading" className="text-xl font-bold text-slate-900">Conversation Details</h2>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{id}</p>
          </div>
          <button type="button" onClick={close} aria-label="Close details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
        </header>
        {loading ? <div className="space-y-3 animate-pulse"><div className="h-20 rounded-xl bg-slate-100" /><div className="h-20 rounded-xl bg-slate-100" /></div>
          : error ? <ErrorBanner message={error} onRetry={() => setRetry((value) => value + 1)} />
            : conversation && (
              <div className="space-y-5">
                <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div><dt className="text-xs uppercase tracking-wide text-slate-500">Conversation created</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(conversation.createdAt)}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-500">Last activity</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(conversation.lastActivity)}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-500">Messages persisted</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{conversation.messageCount}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-500">Unread messages</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{conversation.unreadCount}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-slate-500">Conversation activity</dt><dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{conversation.status}</dd></div>
                </dl>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(conversation.participants || []).map((user, index) => (
                    <article key={user?._id || `user-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                      <Avatar user={user} />
                      <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{user?.name || 'Unavailable user'}</p><p className="mt-1 text-xs text-slate-500">{!user ? 'No longer registered' : user.isActive === false ? 'Account inactive' : 'Account active'}</p></div>
                    </article>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">Message bodies are never included in Chat Tracking. Conversations are represented by existing match records.</p>
                  <Link to="/admin/matches" onClick={close} className="text-sm font-semibold text-primary-700 hover:underline">View match records</Link>
                </div>
              </div>
            )}
      </section>
    </div>
  );
};

const AdminChats = () => {
  const [summaryResult, setSummaryResult] = useState({ key: 0, summary: EMPTY_SUMMARY, error: '' });
  const [listResult, setListResult] = useState({ key: '', rows: [], pagination: null, error: '' });
  const [analyticsResult, setAnalyticsResult] = useState({ key: 0, data: null, error: '' });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [activityFrom, setActivityFrom] = useState('');
  const [activityTo, setActivityTo] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [days, setDays] = useState(7);
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const summaryKey = reload;
  const summary = summaryResult.key === summaryKey ? summaryResult.summary : EMPTY_SUMMARY;
  const summaryError = summaryResult.key === summaryKey ? summaryResult.error : '';
  const searchKey = JSON.stringify([page, limit, query, from, to, activityFrom, activityTo, status, sort, reload]);
  const listCurrent = listResult.key === searchKey;
  const analyticsKey = `${reload}:${days}`;
  const analytics = analyticsResult.key === analyticsKey ? analyticsResult.data : null;
  const analyticsError = analyticsResult.key === analyticsKey ? analyticsResult.error : '';
  const retry = () => setReload((value) => value + 1);
  const filterChange = (setter, value) => { setter(value); setPage(1); };

  useEffect(() => {
    const timeout = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/chats/summary', { signal: controller.signal })
      .then((response) => setSummaryResult({ key: reload, summary: { ...EMPTY_SUMMARY, ...response.data.summary }, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setSummaryResult({ key: reload, summary: EMPTY_SUMMARY, error: error.response?.data?.message || 'Unable to load chat summary.' });
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/chats', {
      signal: controller.signal,
      params: {
        page, limit, search: query || undefined, from: from || undefined, to: to || undefined,
        activityFrom: activityFrom || undefined, activityTo: activityTo || undefined, status, sort,
      },
    })
      .then((response) => setListResult({ key: searchKey, rows: response.data.conversations || [], pagination: response.data.pagination, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setListResult({ key: searchKey, rows: [], pagination: { page, limit, total: 0, pages: 0 }, error: error.response?.data?.message || 'Unable to load conversations.' });
      });
    return () => controller.abort();
  }, [searchKey, page, limit, query, from, to, activityFrom, activityTo, status, sort, reload]);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/chats/analytics', { signal: controller.signal, params: { days } })
      .then((response) => setAnalyticsResult({ key: analyticsKey, data: response.data, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setAnalyticsResult({ key: analyticsKey, data: null, error: error.response?.data?.message || 'Unable to load chat analytics.' });
      });
    return () => controller.abort();
  }, [reload, days, analyticsKey]);

  const metrics = [
    ['Total Conversations', summary.totalConversations, MessageCircle, 'bg-pink-500'],
    ['Active Conversations', summary.activeConversations, Users, 'bg-green-500'],
    ["Today's New Chats", summary.todayChats, CalendarDays, 'bg-blue-500'],
    ['Messages Sent Today', summary.messagesToday, BarChart3, 'bg-violet-500'],
    ['Total Messages', summary.totalMessages, MessageCircle, 'bg-indigo-500'],
    ['Unread Messages', summary.unreadMessages, MessageCircle, 'bg-orange-500'],
    ['Active Chatters', summary.activeChatters, Users, 'bg-teal-500'],
    ['Average Messages / Conversation', summary.averageMessagesPerConversation, BarChart3, 'bg-rose-500'],
  ];
  const messageDays = analytics?.messageActivity || [];
  const conversationDays = analytics?.conversationActivity || [];
  const chartMaximum = Math.max(1, ...messageDays.map((item) => item.total), ...conversationDays.map((item) => item.total));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header><h1 className="text-2xl font-bold text-slate-900">Chat Tracking</h1><p className="mt-1 text-sm text-slate-500">Monitor conversations, messaging activity, and chat engagement across Elovia Love.</p></header>
        {summaryError && <ErrorBanner message={summaryError} onRetry={retry} />}
        <section aria-label="Chat summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, icon, color]) => <StatCard key={label} label={label} value={summaryError ? '—' : summaryResult.key !== summaryKey ? '—' : value} icon={icon} color={color} note={label === 'Active Chatters' ? `Unique senders/recipients, last ${summary.activeChattersPeriodDays} days` : undefined} />)}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold text-slate-900">Messaging activity</h2><p className="mt-1 text-xs text-slate-500">Daily counts in UTC; no message content is used.</p></div>
            <select aria-label="Analytics period" value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select>
          </div>
          {analyticsError ? <ErrorBanner message={analyticsError} onRetry={retry} /> : !analytics ? <div className="h-40 animate-pulse rounded-xl bg-slate-100" /> : (
            <div className="grid gap-5 md:grid-cols-2">
              {[['Messages', messageDays, 'bg-primary-500'], ['New conversations', conversationDays, 'bg-blue-500']].map(([title, data, color]) => (
                <div key={title} className="rounded-xl bg-slate-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
                  {data.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No activity in this period.</p> : (
                    <div className="flex h-32 items-end gap-1.5">
                      {data.map((item) => (
                        <div key={item._id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${item._id}: ${item.total}`}>
                          <span className="text-[10px] text-slate-500">{item.total}</span>
                          <div className={`w-full max-w-8 rounded-t ${color}`} style={{ height: `${Math.max(4, item.total / chartMaximum * 75)}%` }} />
                          <span className="text-[9px] text-slate-500">{item._id.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="relative xl:col-span-2"><span className="sr-only">Search conversations</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} maxLength={100} placeholder="Search conversation ID, participant name or email" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900" /></label>
            <label><span className="sr-only">Created from</span><input type="date" aria-label="Created from" value={from} onChange={(event) => filterChange(setFrom, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
            <label><span className="sr-only">Created to</span><input type="date" aria-label="Created to" value={to} onChange={(event) => filterChange(setTo, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
            <label><span className="sr-only">Activity from</span><input type="date" aria-label="Activity from" value={activityFrom} onChange={(event) => filterChange(setActivityFrom, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
            <label><span className="sr-only">Activity to</span><input type="date" aria-label="Activity to" value={activityTo} onChange={(event) => filterChange(setActivityTo, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
            <label><span className="sr-only">Conversation status</span><select value={status} onChange={(event) => filterChange(setStatus, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"><option value="all">All availability</option><option value="active">Active accounts</option><option value="unavailable">Unavailable participants</option></select></label>
            <label><span className="sr-only">Sort conversations</span><select value={sort} onChange={(event) => filterChange(setSort, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="activity">Last activity</option><option value="messages">Message count</option></select></label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!listCurrent ? <div className="space-y-3 p-5" aria-label="Loading conversations">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}</div>
            : listResult.error ? <div className="p-5"><ErrorBanner message={listResult.error} onRetry={retry} /></div>
              : listResult.rows.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center"><MessageCircle size={28} className="mb-3 text-slate-300" /><p className="font-semibold text-slate-700">No conversations found</p><p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p></div>
                : <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Conversation ID</th><th className="px-4 py-3">Participants</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Last activity</th><th className="px-4 py-3">Messages</th><th className="px-4 py-3">Unread</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{listResult.rows.map((conversation) => (
                    <tr key={conversation._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600" title={conversation._id}>{conversation._id.slice(-8)}</td>
                      <td className="px-4 py-3"><div className="flex min-w-64 items-center gap-3">{(conversation.participants || []).map((user, index) => <div key={user?._id || `participant-${index}`} className="flex min-w-0 items-center gap-2">{index > 0 && <span className="text-slate-400">&amp;</span>}<Avatar user={user} /><span className="max-w-28 truncate font-medium text-slate-800">{user?.name || 'Unavailable user'}</span></div>)}</div></td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(conversation.createdAt)}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(conversation.lastActivity)}</td><td className="px-4 py-3 text-slate-700">{conversation.messageCount}</td><td className="px-4 py-3 text-slate-700">{conversation.unreadCount}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${conversation.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{conversation.status}</span></td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedId(conversation._id)} className="rounded-lg px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50">View Details</button></td>
                    </tr>
                  ))}</tbody>
                </table></div>}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">{listCurrent && listResult.pagination?.total ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, listResult.pagination.total)} of ${listResult.pagination.total} conversations` : '0 conversations'}</p>
            <div className="flex items-center gap-2"><label><span className="sr-only">Rows per page</span><select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option><option value={100}>100 / page</option></select></label><span className="min-w-20 text-center text-xs text-slate-500">Page {page} of {Math.max(listResult.pagination?.pages || 1, 1)}</span><button type="button" aria-label="Previous page" disabled={page <= 1 || !listCurrent} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"><ChevronLeft size={17} /></button><button type="button" aria-label="Next page" disabled={!listCurrent || page >= (listResult.pagination?.pages || 1)} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"><ChevronRight size={17} /></button></div>
          </footer>
        </section>
      </div>
      {selectedId && <DetailModal id={selectedId} close={() => setSelectedId(null)} />}
    </AdminLayout>
  );
};

export default AdminChats;

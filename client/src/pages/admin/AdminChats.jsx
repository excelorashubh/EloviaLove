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

const DetailModal = ({ id, close, refreshKey }) => {
  const [retry, setRetry] = useState(0);
  const [messagePage, setMessagePage] = useState(1);
  const [result, setResult] = useState({ key: '', conversation: null, messages: [], pagination: null, error: '' });
  const key = `${id}:${retry}:${refreshKey}:${messagePage}`;
  const loading = result.key !== key;
  const conversation = result.key === key ? result.conversation : null;
  const messages = result.key === key ? result.messages : [];
  const pagination = result.key === key ? result.pagination : null;
  const error = result.key === key ? result.error : '';

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get(`/admin/chats/${id}`, { signal: controller.signal }),
      api.get(`/admin/chats/${id}/messages`, {
        signal: controller.signal,
        params: { page: messagePage, limit: 50 },
      }),
    ])
      .then(([conversationResponse, messagesResponse]) => setResult({
        key,
        conversation: conversationResponse.data.conversation,
        messages: messagesResponse.data.messages || [],
        pagination: messagesResponse.data.pagination,
        error: '',
      }))
      .catch((requestError) => {
        if (!controller.signal.aborted) setResult({
          key,
          conversation: null,
          messages: [],
          pagination: null,
          error: requestError.response?.data?.message || 'Unable to load conversation details.',
        });
      });
    return () => controller.abort();
  }, [id, key, messagePage]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="chat-detail-heading" className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
          <div>
            <h2 id="chat-detail-heading" className="text-xl font-bold text-slate-900">Conversation</h2>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{id}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setRetry((value) => value + 1)} aria-label="Refresh conversation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><RefreshCw size={17} /></button>
            <button type="button" onClick={close} aria-label="Close details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
          </div>
        </header>
        {loading ? <div className="space-y-3 p-5 animate-pulse"><div className="h-20 rounded-xl bg-slate-100" /><div className="h-20 rounded-xl bg-slate-100" /><div className="h-48 rounded-xl bg-slate-100" /></div>
          : error ? <div className="p-5"><ErrorBanner message={error} onRetry={() => setRetry((value) => value + 1)} /></div>
            : conversation && (
              <>
                <div className="shrink-0 space-y-4 border-b border-slate-200 p-5">
                  <div className="flex flex-wrap gap-3">
                    {(conversation.participants || []).map((user, index) => (
                      <div key={user?._id || `user-${index}`} className="flex min-w-0 items-center gap-2">
                        <Avatar user={user} />
                        <div className="min-w-0"><p className="max-w-36 truncate text-sm font-semibold text-slate-900">{user?.name || 'Unavailable user'}</p><p className="text-xs text-slate-500">{!user ? 'Deleted' : user.isActive === false ? 'Inactive' : 'Active'}</p></div>
                      </div>
                    ))}
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <div><dt className="text-slate-500">Created</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(conversation.createdAt)}</dd></div>
                    <div><dt className="text-slate-500">Last activity</dt><dd className="mt-1 font-medium text-slate-800">{formatDate(conversation.lastActivity)}</dd></div>
                    <div><dt className="text-slate-500">Availability</dt><dd className="mt-1 font-medium capitalize text-slate-800">{conversation.status}</dd></div>
                    <div><dt className="text-slate-500">Messages</dt><dd className="mt-1 font-medium text-slate-800">{conversation.messageCount}</dd></div>
                    <div><dt className="text-slate-500">Unread</dt><dd className="mt-1 font-medium text-slate-800">{conversation.unreadCount}</dd></div>
                  </dl>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
                  {messages.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">No messages in this conversation yet</p> : messages.map((message) => {
                    const senderId = message.sender?._id || message.sender;
                    const outgoing = String(senderId) === String(conversation.participants?.[0]?._id);
                    return (
                      <article key={message._id} className={`flex ${outgoing ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${outgoing ? 'rounded-tl-sm bg-white' : 'rounded-tr-sm bg-primary-50'}`}>
                          <div className="mb-1 flex items-center gap-2"><Avatar user={message.sender && typeof message.sender === 'object' ? message.sender : null} /><span className="text-xs font-semibold text-slate-700">{message.sender?.name || 'Unavailable user'}</span></div>
                          {message.messageType === 'image' ? <img src={message.content} alt="Message attachment" className="max-h-64 max-w-full rounded-lg object-contain" /> : <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{message.content}</p>}
                          <p className="mt-1 text-right text-[10px] text-slate-500">{formatDate(message.createdAt)} · {message.isRead ? 'Read' : 'Unread'}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 px-4 py-3">
                  <span className="text-xs text-slate-500">{pagination?.total || 0} messages · Page {pagination?.page || 1} of {Math.max(pagination?.pages || 0, 1)}</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={!pagination || messagePage <= 1} onClick={() => setMessagePage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-40">Earlier</button>
                    <button type="button" disabled={!pagination || messagePage >= pagination.pages} onClick={() => setMessagePage((value) => value + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-40">Later</button>
                    <Link to="/admin/matches" onClick={close} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50">Matches</Link>
                  </div>
                </footer>
              </>
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
  const refreshing = summaryResult.key !== summaryKey || !listCurrent || analyticsResult.key !== analyticsKey;
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
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-2xl font-bold text-slate-900">Chat Tracking</h1><p className="mt-1 text-sm text-slate-500">Monitor conversations, messaging activity, and chat engagement across Elovia Love.</p></div>
          <button type="button" onClick={retry} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />Refresh tracking</button>
        </header>
        {summaryError && <ErrorBanner message={summaryError} onRetry={retry} />}
        <section aria-label="Chat summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, icon, color]) => <StatCard key={label} label={label} value={summaryError ? '—' : summaryResult.key !== summaryKey ? '—' : value} icon={icon} color={color} note={label === 'Active Chatters' ? `Unique senders/recipients, last ${summary.activeChattersPeriodDays} days` : label === 'Total Messages' ? 'Messages in recorded conversations' : undefined} />)}
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
                    <tr key={conversation._id} tabIndex={0} role="button" aria-label={`View conversation ${conversation._id}`} onClick={() => setSelectedId(conversation._id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(conversation._id); } }} className="cursor-pointer hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600" title={conversation._id}>{conversation._id.slice(-8)}</td>
                      <td className="px-4 py-3"><div className="flex min-w-64 items-center gap-3">{(conversation.participants || []).map((user, index) => <div key={user?._id || `participant-${index}`} className="flex min-w-0 items-center gap-2">{index > 0 && <span className="text-slate-400">&amp;</span>}<Avatar user={user} /><span className="max-w-28 truncate font-medium text-slate-800">{user?.name || 'Unavailable user'}</span></div>)}</div></td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(conversation.createdAt)}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(conversation.lastActivity)}</td><td className="px-4 py-3 text-slate-700">{conversation.messageCount}</td><td className="px-4 py-3 text-slate-700">{conversation.unreadCount}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${conversation.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{conversation.status}</span></td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={(event) => { event.stopPropagation(); setSelectedId(conversation._id); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50">View Details</button></td>
                    </tr>
                  ))}</tbody>
                </table></div>}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">{listCurrent && listResult.pagination?.total ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, listResult.pagination.total)} of ${listResult.pagination.total} conversations` : '0 conversations'}</p>
            <div className="flex items-center gap-2"><label><span className="sr-only">Rows per page</span><select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option><option value={100}>100 / page</option></select></label><span className="min-w-20 text-center text-xs text-slate-500">Page {page} of {Math.max(listResult.pagination?.pages || 1, 1)}</span><button type="button" aria-label="Previous page" disabled={page <= 1 || !listCurrent} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"><ChevronLeft size={17} /></button><button type="button" aria-label="Next page" disabled={!listCurrent || page >= (listResult.pagination?.pages || 1)} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"><ChevronRight size={17} /></button></div>
          </footer>
        </section>
      </div>
      {selectedId && <DetailModal key={selectedId} id={selectedId} close={() => setSelectedId(null)} refreshKey={reload} />}
    </AdminLayout>
  );
};

export default AdminChats;

import { createElement, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const EMPTY_SUMMARY = {
  total: 0,
  today: 0,
  thisMonth: 0,
  active: 0,
  lastSevenDays: 0,
};

const EMPTY_LIKE_SUMMARY = {
  totalLikesSent: 0,
  likesReceived: 0,
  oneSidedLikes: 0,
  mutualLikes: 0,
  pendingLikes: 0,
  todayLikes: 0,
  monthLikes: 0,
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const Avatar = ({ user, size = 'h-11 w-11' }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const name = user?.name || 'Unavailable user';
  if (user?.profilePhoto && !imageFailed) {
    return (
      <img
        src={user.profilePhoto}
        alt=""
        className={`${size} shrink-0 rounded-full bg-slate-100 object-cover`}
        onError={() => setImageFailed(true)}
      />
    );
  }
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-semibold text-pink-700`}>
      {name === 'Unavailable user' ? '?' : name.trim().charAt(0).toUpperCase()}
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`rounded-xl p-2 ${color}`}>
        {createElement(icon, { size: 18, className: 'text-white' })}
      </span>
    </div>
    <p className="text-3xl font-bold text-slate-900">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <span className="flex items-center gap-2"><AlertCircle size={17} />{message}</span>
    <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-semibold hover:underline">
      <RefreshCw size={14} /> Retry
    </button>
  </div>
);

const MatchDetails = ({ matchId, onClose }) => {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ key: null, match: null, error: '' });
  const requestKey = `${matchId}:${retry}`;
  const loading = result.key !== requestKey;
  const match = result.key === requestKey ? result.match : null;
  const error = result.key === requestKey ? result.error : '';

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/admin/matches/${matchId}`, { signal: controller.signal })
      .then((response) => setResult({ key: requestKey, match: response.data.match, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            match: null,
            error: requestError.response?.data?.message || 'Could not load match details.',
          });
        }
      });
    return () => controller.abort();
  }, [matchId, requestKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="match-details-title" className="text-xl font-bold text-slate-900">Match Details</h2>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{matchId}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close match details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={19} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-28 rounded-xl bg-slate-100" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => setRetry((value) => value + 1)} />
        ) : match ? (
          <div className="space-y-5">
            <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Matched at</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(match.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Account availability</dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{match.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Conversation</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{match.hasConversation ? 'Messages exist' : 'No messages found'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last message activity</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(match.lastActivity)}</dd>
              </div>
            </dl>

            <div className="grid gap-3 sm:grid-cols-2">
              {(match.participants || []).map((participant, index) => (
                <article key={participant?._id || `participant-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <Avatar user={participant} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{participant?.name || 'Unavailable user'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {!participant ? 'No longer registered' : participant.isActive === false ? 'Account inactive' : 'Account active'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Private message contents are not shown. This match model does not store a separate status, conversation ID, or lifecycle history.</p>
              {match.hasConversation && <Link to="/admin/chats" onClick={onClose} className="text-sm font-semibold text-primary-700 hover:underline">Open Chat Tracking</Link>}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

const LikeDetails = ({ likeId, onClose }) => {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ key: null, like: null, error: '' });
  const requestKey = `${likeId}:${retry}`;
  const like = result.key === requestKey ? result.like : null;
  const error = result.key === requestKey ? result.error : '';

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/admin/matches/likes/${likeId}`, { signal: controller.signal })
      .then((response) => setResult({ key: requestKey, like: response.data.like, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, like: null, error: requestError.response?.data?.message || 'Could not load like details.' });
        }
      });
    return () => controller.abort();
  }, [likeId, requestKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="like-details-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="like-details-title" className="text-xl font-bold text-slate-900">Like Details</h2>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{likeId}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close like details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
        </div>
        {error ? <ErrorMessage message={error} onRetry={() => setRetry((value) => value + 1)} /> : !like ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <div className="space-y-5">
            <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Sent at</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{formatDate(like.createdAt)}</dd></div>
              <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{like.likeStatus}</dd></div>
              <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reciprocal like</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{like.reciprocalLike ? formatDate(like.reciprocalLike.createdAt) : 'No reciprocal like recorded'}</dd></div>
              <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Current mutual match</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{like.relatedMatch ? 'Match record exists' : 'No match record'}</dd></div>
              <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Related match ID</dt><dd className="mt-1 break-all font-mono text-xs text-slate-900">{like.relatedMatch?._id || '—'}</dd></div>
            </dl>
            <div className="grid gap-3 sm:grid-cols-2">
              {[['Sender', like.sender, like.accountStatus.sender], ['Recipient', like.recipient, like.accountStatus.recipient]].map(([role, user, status]) => (
                <article key={role} className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{role}</p>
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size="h-9 w-9" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{user?.name || 'Unavailable user'}</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{user?.email || user?._id || 'No longer registered'}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs capitalize text-slate-500">Account: {status}</p>
                </article>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Recorded interaction history</h3>
              {like.interactionHistory.map((entry) => (
                <p key={entry.likeId} className="text-xs text-slate-600">
                  {entry.senderId === like.fromUser ? 'Sender → Recipient' : 'Recipient → Sender'} · {formatDate(entry.createdAt)}
                </p>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const LikeTracking = ({ reload }) => {
  const [summaryResult, setSummaryResult] = useState({ key: null, summary: EMPTY_LIKE_SUMMARY, error: '' });
  const [listResult, setListResult] = useState({ key: null, likes: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, error: '' });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sentBy, setSentBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [reloadLikes, setReloadLikes] = useState(0);
  const [selectedLikeId, setSelectedLikeId] = useState(null);
  const queryKey = JSON.stringify([page, limit, debouncedSearch, status, from, to, sentBy, receivedBy, sort, reload, reloadLikes]);
  const listCurrent = listResult.key === queryKey;
  const rows = listCurrent ? listResult.likes : [];
  const pagination = listCurrent ? listResult.pagination : { page, limit, total: 0, pages: 0 };
  const loading = !listCurrent;
  const listError = listCurrent ? listResult.error : '';
  const summary = summaryResult.key === `${reload}:${reloadLikes}` ? summaryResult.summary : EMPTY_LIKE_SUMMARY;
  const summaryError = summaryResult.key === `${reload}:${reloadLikes}` ? summaryResult.error : '';

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const key = `${reload}:${reloadLikes}`;
    api.get('/admin/matches/likes/summary', { signal: controller.signal })
      .then((response) => setSummaryResult({ key, summary: { ...EMPTY_LIKE_SUMMARY, ...response.data.summary }, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setSummaryResult({ key, summary: EMPTY_LIKE_SUMMARY, error: error.response?.data?.message || 'Could not load like summary.' });
      });
    return () => controller.abort();
  }, [reload, reloadLikes]);

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      page, limit, search: debouncedSearch || undefined, status,
      from: from || undefined, to: to || undefined,
      sentBy: sentBy.trim() || undefined, receivedBy: receivedBy.trim() || undefined, sort,
    };
    api.get('/admin/matches/likes', { signal: controller.signal, params })
      .then((response) => {
        const paginationData = response.data.pagination || { page, limit, total: 0, pages: 0 };
        if (page > Math.max(paginationData.pages, 1)) {
          setPage(Math.max(paginationData.pages, 1));
          return;
        }
        setListResult({
          key: queryKey,
          likes: response.data.likes || [],
          pagination: paginationData,
          error: '',
        });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setListResult({ key: queryKey, likes: [], pagination: { page, limit, total: 0, pages: 0 }, error: error.response?.data?.message || 'Could not load likes.' });
      });
    return () => controller.abort();
  }, [queryKey, page, limit, debouncedSearch, status, from, to, sentBy, receivedBy, sort, reload, reloadLikes]);

  const updateFilter = (setter, value) => { setter(value); setPage(1); };
  const metrics = [
    ['Total Likes Sent', summary.totalLikesSent, 'bg-pink-500'],
    ['Likes Received', summary.likesReceived, 'bg-rose-500'],
    ['One-Sided Likes', summary.oneSidedLikes, 'bg-amber-500'],
    ['Mutual Likes (Pairs)', summary.mutualLikes, 'bg-green-500'],
    ['Pending Likes', summary.pendingLikes, 'bg-orange-500'],
    ["Today's Likes", summary.todayLikes, 'bg-blue-500'],
    ['Likes This Month', summary.monthLikes, 'bg-violet-500'],
  ];

  return (
    <section className="space-y-4 border-t border-slate-200 pt-6" aria-label="Like Tracking">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-slate-900">Like Tracking</h2><p className="mt-1 text-sm text-slate-500">Directional likes are listed individually; mutual pair totals count each pair once.</p></div>
        <button type="button" onClick={() => setReloadLikes((value) => value + 1)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh likes
        </button>
      </header>
      {summaryError && <ErrorMessage message={summaryError} onRetry={() => setReloadLikes((value) => value + 1)} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, color]) => <MetricCard key={label} label={label} value={summaryError ? '—' : value} icon={Heart} color={color} />)}
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        <label className="relative sm:col-span-2"><span className="sr-only">Search sender or recipient</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} maxLength={100} placeholder="Search sender, recipient, email or ID" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900" /></label>
        <label><span className="sr-only">Like status</span><select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"><option value="all">All Likes</option><option value="pending">One-Sided / Pending</option><option value="mutual">Mutual Likes</option><option value="unavailable">Unavailable Users</option></select></label>
        <label><span className="sr-only">Sort likes</span><select value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"><option value="newest">Newest First</option><option value="oldest">Oldest First</option></select></label>
        <label><span className="sr-only">Start date</span><input type="date" value={from} onChange={(event) => updateFilter(setFrom, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
        <label><span className="sr-only">End date</span><input type="date" value={to} onChange={(event) => updateFilter(setTo, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
        <label><span className="sr-only">Sent by user ID</span><input value={sentBy} onChange={(event) => updateFilter(setSentBy, event.target.value)} placeholder="Sent by user ID" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
        <label><span className="sr-only">Received by user ID</span><input value={receivedBy} onChange={(event) => updateFilter(setReceivedBy, event.target.value)} placeholder="Received by user ID" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" /></label>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {listError ? <div className="p-5"><ErrorMessage message={listError} onRetry={() => setReloadLikes((value) => value + 1)} /></div> : loading ? (
          <div className="space-y-3 p-5" aria-label="Loading likes">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}</div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center"><Heart size={26} className="mb-2 text-slate-300" /><p className="font-semibold text-slate-700">No likes found</p><p className="mt-1 text-sm text-slate-500">Try adjusting the search or filters.</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Like ID</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Direction</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Sent at</th><th className="px-4 py-3">Reciprocal at</th><th className="px-4 py-3">Account status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{rows.map((like) => (
              <tr key={like._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600" title={like._id}>{like._id.slice(-8)}</td>
                <td className="max-w-40 truncate px-4 py-3 font-medium text-slate-800">{like.sender?.name || 'Unavailable user'}</td>
                <td className="max-w-40 truncate px-4 py-3 font-medium text-slate-800">{like.recipient?.name || 'Unavailable user'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">Sender → Recipient</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${like.likeStatus === 'mutual' ? 'bg-green-100 text-green-700' : like.likeStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{like.likeStatus === 'pending' ? 'Pending / One-Sided' : like.likeStatus}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatDate(like.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatDate(like.reciprocalLike?.createdAt)}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{like.accountsAvailable ? 'Both available' : 'Unavailable user'}</td>
                <td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedLikeId(like._id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"><Eye size={13} /> Details</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">{pagination.total ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} likes` : '0 likes'}</p>
          <div className="flex items-center gap-2"><label className="text-xs text-slate-500"><span className="sr-only">Likes per page</span><select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700"><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option><option value={100}>100 / page</option></select></label><span className="min-w-20 text-center text-xs text-slate-500">Page {pagination.page || 1} of {Math.max(pagination.pages || 0, 1)}</span><button type="button" aria-label="Previous likes page" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"><ChevronLeft size={17} /></button><button type="button" aria-label="Next likes page" onClick={() => setPage((value) => value + 1)} disabled={loading || page >= (pagination.pages || 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"><ChevronRight size={17} /></button></div>
        </footer>
      </section>
      {selectedLikeId && <LikeDetails likeId={selectedLikeId} onClose={() => setSelectedLikeId(null)} />}
    </section>
  );
};

const AdminMatches = () => {
  const [summaryResult, setSummaryResult] = useState({ key: null, summary: EMPTY_SUMMARY, error: '' });
  const [listResult, setListResult] = useState({
    key: null,
    rows: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    error: '',
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');
  const [conversation, setConversation] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [reload, setReload] = useState(0);
  const summary = summaryResult.key === reload ? summaryResult.summary : EMPTY_SUMMARY;
  const summaryLoading = summaryResult.key !== reload;
  const summaryError = summaryResult.key === reload ? summaryResult.error : '';
  const queryKey = JSON.stringify([page, limit, debouncedSearch, from, to, status, conversation, sort, reload]);
  const isCurrentList = listResult.key === queryKey;
  const rows = isCurrentList ? listResult.rows : [];
  const pagination = isCurrentList
    ? listResult.pagination
    : { page, limit, total: 0, pages: 0 };
  const loading = !isCurrentList;
  const refreshing = summaryResult.key !== reload || loading;
  const listError = isCurrentList ? listResult.error : '';

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/matches/summary', { signal: controller.signal })
      .then((response) => setSummaryResult({
        key: reload,
        summary: { ...EMPTY_SUMMARY, ...response.data.summary },
        error: '',
      }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setSummaryResult({
            key: reload,
            summary: EMPTY_SUMMARY,
            error: error.response?.data?.message || 'Could not load match summary.',
          });
        }
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/admin/matches', {
      signal: controller.signal,
      params: {
        page,
        limit,
        search: debouncedSearch || undefined,
        from: from || undefined,
        to: to || undefined,
        status,
        conversation,
        sort,
      },
    })
      .then((response) => {
        setListResult({
          key: queryKey,
          rows: response.data.matches || [],
          pagination: response.data.pagination || { page, limit, total: 0, pages: 0 },
          error: '',
        });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setListResult({
            key: queryKey,
            rows: [],
            pagination: { page, limit, total: 0, pages: 0 },
            error: error.response?.data?.message || 'Could not load matches.',
          });
        }
      });
    return () => controller.abort();
  }, [page, limit, debouncedSearch, from, to, status, conversation, sort, reload, queryKey]);

  const refresh = useCallback(() => setReload((value) => value + 1), []);
  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const metrics = [
    { label: 'Total Matches', value: summary.total, icon: Heart, color: 'bg-pink-500' },
    { label: "Today's Matches", value: summary.today, icon: CalendarDays, color: 'bg-blue-500' },
    { label: 'Matches This Month', value: summary.thisMonth, icon: CalendarDays, color: 'bg-violet-500' },
    { label: 'Active Matches', value: summary.active, icon: Users, color: 'bg-green-500' },
    { label: 'New Matches (Last 7 Days)', value: summary.lastSevenDays, icon: MessageCircle, color: 'bg-orange-500' },
    { label: 'Unmatched Mutual Likes', value: summary.unmatchedMutualLikes, icon: Heart, color: 'bg-rose-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Match Tracking</h1>
              <p className="mt-1 text-sm text-slate-500">Monitor, investigate, and analyze platform matches.</p>
            </div>
            <button type="button" onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh tracking
            </button>
          </div>
        </header>

        {summaryError && <ErrorMessage message={summaryError} onRetry={refresh} />}
        <section aria-label="Match summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              {...metric}
              value={summaryLoading || summaryError ? '—' : metric.value}
            />
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <label className="relative sm:col-span-2">
              <span className="sr-only">Search matches</span>
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => updateFilter(setSearch, event.target.value)}
                placeholder="Search match ID, participant name or email"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </label>
            <label>
              <span className="sr-only">Start date</span>
              <input type="date" value={from} onChange={(event) => updateFilter(setFrom, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" />
            </label>
            <label>
              <span className="sr-only">End date</span>
              <input type="date" value={to} onChange={(event) => updateFilter(setTo, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900" />
            </label>
            <label>
              <span className="sr-only">Account availability</span>
              <select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900">
                <option value="all">All statuses</option>
                <option value="active">Both accounts active</option>
                <option value="unavailable">Unavailable participant</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Conversation activity</span>
              <select value={conversation} onChange={(event) => updateFilter(setConversation, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900">
                <option value="all">All activity</option>
                <option value="yes">Has messages</option>
                <option value="no">No messages</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Sort matches</span>
              <select value={sort} onChange={(event) => updateFilter(setSort, event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="activity">Recent activity</option>
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {listError ? (
            <div className="p-5"><ErrorMessage message={listError} onRetry={refresh} /></div>
          ) : loading ? (
            <div className="space-y-3 p-5" aria-label="Loading matches">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <Heart size={28} className="mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700">No matches found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Match ID</th>
                    <th className="px-4 py-3 font-semibold">Participants</th>
                    <th className="px-4 py-3 font-semibold">Matched at</th>
                    <th className="px-4 py-3 font-semibold">Availability</th>
                    <th className="px-4 py-3 font-semibold">Conversation</th>
                    <th className="px-4 py-3 font-semibold">Last activity</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((match) => (
                    <tr key={match._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600" title={match._id}>{match._id.slice(-8)}</td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-64 items-center gap-3">
                          {(match.participants || []).map((participant, index) => (
                            <div key={participant?._id || `participant-${index}`} className="flex min-w-0 items-center gap-2">
                              {index > 0 && <span className="text-slate-400">&amp;</span>}
                              <Avatar user={participant} size="h-8 w-8" />
                              <span className="max-w-32 truncate font-medium text-slate-800">{participant?.name || 'Unavailable user'}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(match.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${match.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {match.status === 'active' ? 'Active accounts' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{match.hasConversation ? 'Messages found' : 'No messages'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(match.lastActivity)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setSelectedMatchId(match._id)} className="rounded-lg px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              {pagination.total
                ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} matches`
                : '0 matches'}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">
                <span className="sr-only">Rows per page</span>
                <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700">
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </label>
              <span className="min-w-20 text-center text-xs text-slate-500">Page {pagination.page || 1} of {Math.max(pagination.pages || 0, 1)}</span>
              <button type="button" aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40">
                <ChevronLeft size={17} />
              </button>
              <button type="button" aria-label="Next page" onClick={() => setPage((value) => value + 1)} disabled={loading || page >= (pagination.pages || 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40">
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        </section>
        <LikeTracking reload={reload} />
      </div>

      {selectedMatchId && <MatchDetails matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />}
    </AdminLayout>
  );
};

export default AdminMatches;

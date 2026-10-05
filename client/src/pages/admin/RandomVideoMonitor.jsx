import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Clock3, Flag, RefreshCw,
  Search, ShieldAlert, Video, Wifi, X,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

const REFRESH_INTERVAL = 8000;
const EMPTY_LIST = [];

const formatDate = value => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString();
};

const formatDuration = seconds => {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return 'Not available';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.max(0, Math.floor(seconds % 60))}s`;
};

const shortId = value => value ? `${String(value).slice(0, 8)}…` : 'Not available';

const EVENT_LABELS = {
  queue_joined: 'Joined queue',
  queue_left: 'Left queue',
  match_found: 'Match found',
  session_started: 'Call started',
  session_ended: 'Call ended',
  session_skipped: 'Match skipped',
  report_submitted: 'Report submitted',
  user_blocked: 'User blocked',
  queue_error: 'Queue error',
  session_error: 'Session error',
};

const panelClass = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/20 dark:bg-neutral-950';
const mutedClass = 'text-slate-500 dark:text-white/60';

const DetailDialog = ({ item, onClose }) => {
  if (!item) return null;
  const entries = Object.entries(item.data).filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <section
        aria-labelledby="monitor-detail-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/20 dark:bg-neutral-950"
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{item.type}</p>
            <h2 id="monitor-detail-title" className="mt-1 text-lg font-bold">{item.title}</h2>
          </div>
          <button aria-label="Close details" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="min-w-0 rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <dt className={`text-xs capitalize ${mutedClass}`}>{key.replace(/([A-Z])/g, ' $1').replace(/Id$/, ' ID')}</dt>
              <dd className="mt-1 break-words text-sm font-medium">
                {/(At|timestamp)$/i.test(key) ? formatDate(value) : typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </dd>
            </div>
          ))}
        </dl>
        {!entries.length && <p className={`text-sm ${mutedClass}`}>No additional details are available.</p>}
      </section>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, note, tone = 'pink' }) => {
  const tones = {
    pink: 'bg-primary-600',
    violet: 'bg-violet-600',
    amber: 'bg-amber-500',
    red: 'bg-rose-600',
  };
  return (
    <div className={`${panelClass} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-medium ${mutedClass}`}>{label}</p>
        <span className={`rounded-xl p-2 text-white ${tones[tone]}`}>{createElement(Icon, { size: 18 })}</span>
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className={`mt-1 text-xs ${mutedClass}`}>{note}</p>
    </div>
  );
};

const RandomVideoMonitor = () => {
  const [monitoring, setMonitoring] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState(null);

  const refresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const response = await api.get('/admin/monitoring/random-video');
      setMonitoring(response.data.monitoring);
      setRequestError(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Unable to refresh random video monitoring:', error);
      setRequestError(true);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const intervalId = window.setInterval(() => refresh(), REFRESH_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  const queueEntries = monitoring?.queueEntries || EMPTY_LIST;
  const activeSessions = monitoring?.activeSessionEntries || EMPTY_LIST;
  const recentEvents = monitoring?.recentEvents || EMPTY_LIST;
  const searchText = search.trim().toLowerCase();

  const filteredQueue = useMemo(() => queueEntries.filter(entry => {
    const matchesStatus = queueFilter === 'all' || entry.status === queueFilter;
    const matchesSearch = !searchText || `${entry.name || ''} ${entry.userId || ''}`.toLowerCase().includes(searchText);
    return matchesStatus && matchesSearch;
  }), [queueEntries, queueFilter, searchText]);

  const filteredSessions = useMemo(() => activeSessions.filter(session => (
    !searchText || `${session.sessionId || ''} ${session.userAId || ''} ${session.userBId || ''}`.toLowerCase().includes(searchText)
  )), [activeSessions, searchText]);

  const filteredEvents = useMemo(() => recentEvents.filter(event => {
    const label = EVENT_LABELS[event.type] || event.type || '';
    const matchesSearch = !searchText || `${label} ${event.sessionId || ''} ${event.userId || ''} ${event.reporterId || ''} ${event.targetId || ''} ${event.userAId || ''} ${event.userBId || ''}`.toLowerCase().includes(searchText);
    const isError = event.type === 'queue_error' || event.type === 'session_error';
    const matchesType = eventFilter === 'all' || (eventFilter === 'errors' ? isError : event.type?.startsWith(eventFilter));
    const time = new Date(event.timestamp).getTime();
    const matchesFrom = !fromDate || time >= new Date(`${fromDate}T00:00:00`).getTime();
    const matchesTo = !toDate || time <= new Date(`${toDate}T23:59:59.999`).getTime();
    return matchesSearch && matchesType && matchesFrom && matchesTo;
  }), [recentEvents, searchText, eventFilter, fromDate, toDate]);

  const resetFilters = () => {
    setSearch('');
    setQueueFilter('all');
    setEventFilter('all');
    setFromDate('');
    setToDate('');
  };

  const status = monitoring?.status;
  const statusLabel = requestError && monitoring
    ? 'Connection delayed'
    : requestError
      ? 'Monitoring unavailable'
      : status === 'warning'
        ? 'Warning'
        : status === 'healthy'
          ? 'System healthy'
          : 'Status unavailable';
  const statusTone = requestError ? 'text-amber-600 dark:text-amber-400' : status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

  if (initialLoading && !monitoring) {
    return (
      <AdminLayout>
        <div className="space-y-6" aria-label="Loading Random Video monitoring">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-white/10" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(key => <div key={key} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />)}</div>
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />
        </div>
      </AdminLayout>
    );
  }

  if (requestError && !monitoring) {
    return (
      <AdminLayout>
        <div className={`${panelClass} mx-auto max-w-xl p-8 text-center`}>
          <AlertTriangle className="mx-auto text-amber-500" size={32} />
          <h1 className="mt-4 text-xl font-bold">Unable to load monitoring data.</h1>
          <p className={`mt-2 text-sm ${mutedClass}`}>Please try again.</p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700" onClick={() => refresh(true)}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">Random Video Monitor</h1>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${statusTone}`}>
                <span className="h-2 w-2 rounded-full bg-current" /> {statusLabel}
              </span>
            </div>
            <p className={`mt-1 text-sm ${mutedClass}`}>Live operational monitoring · Last successful update: {lastUpdated?.toLocaleTimeString() || 'Not available'}</p>
          </div>
          <button disabled={refreshing} onClick={() => refresh(true)} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 dark:border-white/20 dark:bg-neutral-950 dark:hover:bg-white/10 sm:self-auto">
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} /> Refresh
          </button>
        </header>

        {requestError && (
          <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            The latest refresh failed. Showing the last successful snapshot.
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Random Video health metrics">
          <MetricCard icon={Activity} label="Queue" value={monitoring?.queueSize ?? 'Not available'} note={monitoring?.queueSize >= 20 ? 'High queue backlog' : 'Currently waiting'} tone="violet" />
          <MetricCard icon={Video} label="Active sessions" value={monitoring?.activeSessionCount ?? activeSessions.length} note={monitoring?.activeSessionEntriesTruncated ? 'Showing up to 100 sessions' : 'Live in-memory sessions'} />
          <MetricCard icon={Flag} label="Reports tracked" value={monitoring?.reports ?? 'Not available'} note="In-memory total; pending status unavailable" tone="amber" />
          <MetricCard icon={ShieldAlert} label="Session errors" value={monitoring?.failedEventsLastHour ?? 'Not available'} note="Tracked in the last hour" tone="red" />
        </section>

        <section className={`${panelClass} p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">System health</h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>Status and alerts reflect the existing Random Video monitoring snapshot.</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${status === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'}`}>
              {status === 'warning' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {statusLabel}
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <Wifi size={18} className={requestError ? 'text-amber-500' : 'text-emerald-500'} />
              <div><p className="text-sm font-medium">Monitoring API</p><p className={`text-xs ${mutedClass}`}>{requestError ? 'Connection delayed' : 'Reachable'}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <Activity size={18} className="text-slate-400" />
              <div><p className="text-sm font-medium">Matching service</p><p className={`text-xs ${mutedClass}`}>Not separately reported</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <Clock3 size={18} className="text-slate-400" />
              <div><p className="text-sm font-medium">Socket.IO / WebRTC</p><p className={`text-xs ${mutedClass}`}>Not available in monitoring snapshot</p></div>
            </div>
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Live queue</h2>
              <p className={`mt-1 text-xs ${mutedClass}`}>Current waiting users · Admin actions are not exposed by the existing API.</p>
            </div>
            <span className={`text-xs ${mutedClass}`}>{monitoring?.queueSize ?? 0} waiting</span>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="relative min-w-[220px] flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedClass}`} size={16} />
              <input aria-label="Search users or session IDs" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-white/20 dark:bg-black" onChange={event => setSearch(event.target.value)} placeholder="Search user or session ID" value={search} />
            </label>
            <select aria-label="Queue status filter" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-black" onChange={event => setQueueFilter(event.target.value)} value={queueFilter}>
              <option value="all">All queue states</option>
              <option value="waiting">Waiting</option>
            </select>
            <select aria-label="Event type filter" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-black" onChange={event => setEventFilter(event.target.value)} value={eventFilter}>
              <option value="all">All events</option>
              <option value="queue">Queue</option>
              <option value="session">Sessions</option>
              <option value="report">Reports</option>
              <option value="user">Blocks</option>
              <option value="errors">Errors</option>
            </select>
            <label className="flex items-center gap-2 text-xs">
              <span className={mutedClass}>From</span>
              <input aria-label="Events from date" className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-white/20 dark:bg-black" onChange={event => setFromDate(event.target.value)} type="date" value={fromDate} />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <span className={mutedClass}>To</span>
              <input aria-label="Events to date" className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-white/20 dark:bg-black" onChange={event => setToDate(event.target.value)} type="date" value={toDate} />
            </label>
            <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-white/20 dark:hover:bg-white/10" onClick={resetFilters}>Reset filters</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className={`border-b border-slate-100 text-xs uppercase ${mutedClass} dark:border-white/10`}>
                <tr><th className="px-3 py-3 font-semibold">User</th><th className="px-3 py-3 font-semibold">Waiting</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Joined</th><th className="px-3 py-3 font-semibold">Details</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filteredQueue.map(entry => (
                  <tr key={entry.userId} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-3 py-3"><p className="font-medium">{entry.name || `User ${shortId(entry.userId)}`}</p><p className={`text-xs ${mutedClass}`}>{shortId(entry.userId)}</p></td>
                    <td className="px-3 py-3">{formatDuration(Math.max(0, (Date.now() - new Date(entry.joinedAt).getTime()) / 1000))}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-800 dark:bg-violet-500/15 dark:text-violet-300">Waiting</span></td>
                    <td className="px-3 py-3">{formatDate(entry.joinedAt)}</td>
                    <td className="px-3 py-3"><button className="font-semibold text-primary-600 hover:underline" onClick={() => setSelected({ type: 'Queue user', title: entry.name || shortId(entry.userId), data: entry })}>View</button></td>
                  </tr>
                ))}
                {!filteredQueue.length && <tr><td className={`px-3 py-8 text-center ${mutedClass}`} colSpan="5">{monitoring?.queueSize ? 'No queue entries match these filters.' : 'No users currently waiting'}</td></tr>}
              </tbody>
            </table>
          </div>
          {monitoring?.queueEntriesTruncated && <p className={`mt-3 text-xs ${mutedClass}`}>Showing the first 100 waiting users.</p>}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className={`${panelClass} p-5`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="font-semibold">Recent events</h2><p className={`mt-1 text-xs ${mutedClass}`}>Latest events recorded by the current process.</p></div>
              <span className={`text-xs ${mutedClass}`}>{filteredEvents.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className={`border-b border-slate-100 text-xs uppercase ${mutedClass} dark:border-white/10`}>
                  <tr><th className="px-3 py-3 font-semibold">Time</th><th className="px-3 py-3 font-semibold">Event</th><th className="px-3 py-3 font-semibold">User</th><th className="px-3 py-3 font-semibold">Session</th><th className="px-3 py-3 font-semibold">Details</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {filteredEvents.map(event => {
                    const errorEvent = event.type === 'queue_error' || event.type === 'session_error';
                    const userId = event.userId || event.reporterId || event.targetId || event.userAId || event.userBId;
                    return (
                      <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="whitespace-nowrap px-3 py-3">{formatDate(event.timestamp)}</td>
                        <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5">{errorEvent ? <AlertTriangle className="text-rose-500" size={15} /> : <CheckCircle2 className="text-emerald-500" size={15} />}{EVENT_LABELS[event.type] || event.type}</span></td>
                        <td className="px-3 py-3">{shortId(userId)}</td>
                        <td className="px-3 py-3">{shortId(event.sessionId)}</td>
                        <td className="px-3 py-3"><button className="font-semibold text-primary-600 hover:underline" onClick={() => setSelected({ type: 'Monitoring event', title: EVENT_LABELS[event.type] || event.type, data: event })}>View</button></td>
                      </tr>
                    );
                  })}
                  {!filteredEvents.length && <tr><td className={`px-3 py-8 text-center ${mutedClass}`} colSpan="5">{recentEvents.length ? 'No recent events match these filters.' : 'No recent Random Video events'}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${panelClass} p-5`}>
            <div className="mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /><h2 className="font-semibold">Alerts</h2></div>
            {monitoring?.alerts?.length ? (
              <ul className="space-y-3">
                {monitoring.alerts.map((alert, index) => <li key={`${alert}-${index}`} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle className="mt-0.5 shrink-0" size={16} /><span>{alert}</span></li>)}
              </ul>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <CheckCircle2 size={18} /> No current monitoring alerts.
              </div>
            )}
          </section>
        </div>

        <section className={`${panelClass} p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold">Active sessions</h2><p className={`mt-1 text-xs ${mutedClass}`}>Live sessions held in this server process; no termination action is available in the existing admin API.</p></div>
            <span className={`text-xs ${mutedClass}`}>{monitoring?.activeSessionCount ?? activeSessions.length} active</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map(session => (
              <article key={session.sessionId} className="rounded-xl border border-slate-200 p-4 dark:border-white/15">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{shortId(session.sessionId)}</p><p className={`mt-1 text-xs ${mutedClass}`}>{session.mode || 'Mode unavailable'} · {session.status || 'Status unavailable'}</p></div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">{session.status || 'Active'}</span>
                </div>
                <p className={`mt-3 text-xs ${mutedClass}`}>Users {shortId(session.userAId)} · {shortId(session.userBId)}</p>
                <p className={`mt-1 text-xs ${mutedClass}`}>Started {formatDate(session.startedAt)}</p>
                <button className="mt-3 text-sm font-semibold text-primary-600 hover:underline" onClick={() => setSelected({ type: 'Active session', title: shortId(session.sessionId), data: session })}>View details</button>
              </article>
            ))}
            {!filteredSessions.length && <p className={`py-5 text-sm ${mutedClass}`}>{activeSessions.length ? 'No active sessions match this search.' : 'No active Random Video sessions.'}</p>}
          </div>
          {monitoring?.activeSessionEntriesTruncated && <p className={`mt-3 text-xs ${mutedClass}`}>Showing the first 100 sessions.</p>}
        </section>
      </div>
      <DetailDialog item={selected} onClose={() => setSelected(null)} />
    </AdminLayout>
  );
};

export default RandomVideoMonitor;

import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bell, CheckCheck, Trash2, User } from 'lucide-react';
import { SITE_URL } from '../data/seoContent';
import BackButton from '../components/BackButton';
import { getNotificationDestination, useNotifications } from '../context/NotificationContext';

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const formatTime = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const diffM = Math.floor((now - d) / 60000);
  if (diffM < 1) return 'Just now';
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
};

const getIcon = (type) => {
  switch (type) {
    case 'match': return <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />;
    case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'like': return <Heart className="w-5 h-5 text-red-400" />;
    case 'verification': return <User className="w-5 h-5 text-primary-600" />;
    case 'system': return <Bell className="w-5 h-5 text-slate-500" />;
    default: return <User className="w-5 h-5 text-slate-400" />;
  }
};

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    actionError,
    refreshNotifications,
    markAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification,
  } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (notification) => {
    if (!notification.isRead && !(await markAsRead(notification._id))) return;
    const destination = getNotificationDestination(notification);
    if (destination) navigate(destination);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Notifications — Elovia Love</title>
        <meta name="description" content="View all your notifications from matches, messages, and profile activity on Elovia Love." />
        <link rel="canonical" href={`${SITE_URL}/notifications`} />
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-black">
      <header className="bg-white dark:bg-black shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <BackButton to="/dashboard" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#FD5A7A] to-[#FD2B6B] text-white rounded-xl transition-opacity hover:opacity-90 font-medium text-sm disabled:opacity-50"
              >
                <CheckCheck size={15} />
                {markingAll ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter tabs */}
        <div className="bg-white dark:bg-black rounded-2xl p-1 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.filter(n => n.isRead).length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => refreshNotifications({ showLoading: true })}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
        {actionError && (
          <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
            {actionError}
          </p>
        )}

        {filtered.length > 0 ? (
          <Motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {filtered.map(n => (
              <Motion.div
                key={n._id}
                variants={fadeIn}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                  n.isRead ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-black' : 'border-primary-200 dark:border-pink-900 bg-primary-50/40 dark:bg-black'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.isRead ? 'bg-slate-100 dark:bg-black' : 'bg-primary-100 dark:bg-black'}`}>
                    {getIcon(n.type)}
                  </div>

                  <button
                    type="button"
                    onClick={() => openNotification(n)}
                    className="flex-1 min-w-0 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-primary-600"
                    aria-label={`Open notification: ${n.title}${n.isRead ? '' : ', unread'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                      <span className="text-xs text-slate-400 shrink-0">{formatTime(n.createdAt)}</span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{n.message}</p>

                    {n.relatedUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={n.relatedUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.relatedUser.name)}&background=e879a0&color=fff`}
                          alt={n.relatedUser.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{n.relatedUser.name}</span>
                      </div>
                    )}
                  </button>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n._id)}
                        className="rounded-lg p-2 text-[#FD2B6B] hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-[#FD2B6B] dark:hover:bg-black"
                        aria-label={`Mark ${n.title} as read`}
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(n._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500 dark:hover:bg-slate-900"
                      aria-label={`Delete ${n.title}`}
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Motion.div>
            ))}
          </Motion.div>
        ) : (
          <Motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center py-20">
            <Bell className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No notifications</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {filter === 'unread' ? "You're all caught up!"
                : filter === 'read' ? "No read notifications yet."
                : "Nothing here yet."}
            </p>
          </Motion.div>
        )}
      </div>
      </div>
    </>
  );
};

export default Notifications;

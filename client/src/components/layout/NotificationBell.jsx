import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bell, CheckCheck, Heart, MessageCircle, Trash2, User, X } from 'lucide-react';
import { getNotificationDestination, useNotifications } from '../../context/NotificationContext';

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getNotificationIcon = (type) => {
  if (type === 'match') return <Heart size={17} className="text-pink-500" fill="currentColor" />;
  if (type === 'like') return <Heart size={17} className="text-rose-500" />;
  if (type === 'message') return <MessageCircle size={17} className="text-blue-500" />;
  if (type === 'verification') return <User size={17} className="text-[#FD2B6B]" />;
  return <Bell size={17} className="text-slate-500 dark:text-slate-300" />;
};

const NotificationBell = ({ open, onToggle, onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    actionError,
    socketConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const openNotification = async (notification) => {
    const destination = getNotificationDestination(notification);
    if (!notification.isRead && !(await markAsRead(notification._id))) return;
    onClose();
    if (destination) navigate(destination);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative z-[65]" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="notification-dropdown"
        onClick={onToggle}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-pink-50 hover:text-[#FD2B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD2B6B] dark:text-slate-200 dark:hover:bg-slate-900"
      >
        <Bell size={21} strokeWidth={1.9} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-black"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {unreadCount ? `${unreadCount} unread notifications` : 'No unread notifications'}
      </span>

      <AnimatePresence>
        {open && (
          <Motion.section
            id="notification-dropdown"
            role="dialog"
            aria-label="Latest notifications"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: 'easeOut' }}
            className="absolute right-[-6rem] top-full mt-2 flex max-h-[min(70vh,34rem)] w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-900/15 dark:border-slate-800 dark:bg-black dark:shadow-black/60 md:right-0"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Latest notifications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {socketConnected ? 'Live updates on' : 'Reconnecting · checking for updates'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="rounded-lg p-2 text-[#FD2B6B] transition-colors hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-[#FD2B6B] dark:hover:bg-slate-900"
                    aria-label="Mark all notifications as read"
                    title="Mark all as read"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary-600 dark:text-slate-300 dark:hover:bg-slate-900"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-3 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => refreshNotifications({ showLoading: true })}
                  className="mt-1 font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}
            {actionError && (
              <p className="mx-3 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
                {actionError}
              </p>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-live="polite" aria-busy={loading}>
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500 dark:text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
                  Loading notifications
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-[#FD5A7A]/10 to-[#FD2B6B]/10 text-[#FD2B6B] dark:bg-black">
                    <Bell size={20} aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">You’re all caught up</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">New updates will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((notification) => (
                    <li key={notification._id} className={!notification.isRead ? 'bg-linear-to-r from-[#FD5A7A]/10 to-[#FD2B6B]/5 dark:bg-black dark:bg-none' : ''}>
                      <div className="flex items-start gap-2 px-3 py-3">
                        <button
                          type="button"
                          onClick={() => openNotification(notification)}
                          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-black">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</span>
                              {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[#FD2B6B]" aria-label="Unread" />}
                            </span>
                            <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{notification.message}</span>
                            <span className="mt-1 block text-[11px] text-slate-400">{formatTime(notification.createdAt)}</span>
                          </span>
                        </button>
                        <div className="flex shrink-0 flex-col">
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification._id)}
                              className="rounded-lg p-1.5 text-[#FD2B6B] hover:bg-pink-100 focus-visible:outline-2 focus-visible:outline-[#FD2B6B] dark:hover:bg-slate-800"
                              aria-label={`Mark ${notification.title} as read`}
                              title="Mark as read"
                            >
                              <CheckCheck size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notification._id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500 dark:hover:bg-slate-800"
                            aria-label={`Delete ${notification.title}`}
                            title="Delete notification"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/notifications');
              }}
              className="border-t border-slate-100 bg-linear-to-r from-[#FD5A7A] to-[#FD2B6B] bg-clip-text px-4 py-3 text-center text-sm font-semibold text-transparent transition-colors hover:bg-pink-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#FD2B6B] dark:border-slate-800 dark:hover:bg-black"
            >
              View all notifications
            </button>
          </Motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

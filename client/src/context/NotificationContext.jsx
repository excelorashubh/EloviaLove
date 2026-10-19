/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);
const NOTIFICATION_LIMIT = 20;
const POLL_INTERVAL = 30000;

export const getNotificationDestination = (notification) => {
  const relatedUserId = typeof notification.relatedUser === 'object'
    ? notification.relatedUser?._id
    : notification.relatedUser;

  switch (notification.type) {
    case 'message':
      return relatedUserId ? `/chat/${encodeURIComponent(relatedUserId)}` : '/chats';
    case 'match':
      return '/matches';
    case 'like':
      return '/discover';
    case 'verification':
      return '/profile';
    default:
      return null;
  }
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user, socket } = useAuth();
  const userId = user?.id || user?._id;
  const userIdRef = useRef(userId);
  const notificationIdsRef = useRef(new Set());
  const notificationRevisionRef = useRef(0);
  const refreshRequestRef = useRef(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  userIdRef.current = userId;

  const refreshNotifications = useCallback(async ({ showLoading = false } = {}) => {
    if (!isAuthenticated || !userId) return false;
    const requestId = ++refreshRequestRef.current;
    const notificationRevision = notificationRevisionRef.current;
    if (showLoading) {
      setLoading(true);
      setError('');
    }

    try {
      const response = await api.get('/notifications');
      if (!response.data?.success) throw new Error('Unable to load notifications');
      if (
        String(userIdRef.current) !== String(userId) ||
        requestId !== refreshRequestRef.current ||
        notificationRevision !== notificationRevisionRef.current
      ) return false;

      const latestNotifications = Array.isArray(response.data.notifications) ? response.data.notifications : [];
      notificationIdsRef.current = new Set(latestNotifications.map((notification) => notification._id));
      setNotifications(latestNotifications);
      setUnreadCount(Number(response.data.unreadCount) || 0);
      setError('');
      return true;
    } catch (requestError) {
      if (
        String(userIdRef.current) === String(userId) &&
        requestId === refreshRequestRef.current &&
        notificationRevision === notificationRevisionRef.current
      ) {
        setError(requestError.response?.data?.message || 'Could not load notifications. Please try again.');
        console.error('Load notifications error:', requestError);
      }
      return false;
    } finally {
      if (
        showLoading &&
        String(userIdRef.current) === String(userId) &&
        requestId === refreshRequestRef.current
      ) setLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      notificationRevisionRef.current += 1;
      refreshRequestRef.current += 1;
      setNotifications([]);
      notificationIdsRef.current.clear();
      setUnreadCount(0);
      setLoading(false);
      setError('');
      setActionError('');
      setSocketConnected(false);
      return undefined;
    }

    notificationRevisionRef.current += 1;
    setNotifications([]);
    notificationIdsRef.current.clear();
    setUnreadCount(0);
    setError('');
    setActionError('');
    refreshNotifications({ showLoading: true });
    return undefined;
  }, [isAuthenticated, userId, refreshNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !userId || !socket) {
      setSocketConnected(false);
      return undefined;
    }

    const handleNotification = (notification) => {
      if (!notification?._id) {
        refreshNotifications();
        return;
      }
      if (notificationIdsRef.current.has(notification._id)) return;
      notificationRevisionRef.current += 1;
      notificationIdsRef.current.add(notification._id);
      setNotifications((current) => {
        return [notification, ...current].slice(0, NOTIFICATION_LIMIT);
      });
      setUnreadCount((count) => count + 1);
      setError('');
    };
    const handleRead = ({ id, unreadCount: count } = {}) => {
      notificationRevisionRef.current += 1;
      if (id) setNotifications((current) => current.map((item) => (
        item._id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
      )));
      if (Number.isInteger(count)) setUnreadCount(count);
      else if (id) setUnreadCount((value) => Math.max(0, value - 1));
    };
    const handleReadAll = ({ unreadCount: count } = {}) => {
      notificationRevisionRef.current += 1;
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(Number.isInteger(count) ? count : 0);
    };
    const handleDeleted = ({ id, unreadCount: count } = {}) => {
      notificationRevisionRef.current += 1;
      notificationIdsRef.current.delete(id);
      setNotifications((current) => current.filter((item) => item._id !== id));
      if (Number.isInteger(count)) setUnreadCount(count);
    };
    const handleConnect = () => {
      setSocketConnected(true);
      refreshNotifications();
    };
    const handleDisconnect = () => setSocketConnected(false);

    socket.on('notification', handleNotification);
    socket.on('notification:read', handleRead);
    socket.on('notification:read-all', handleReadAll);
    socket.on('notification:deleted', handleDeleted);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setSocketConnected(socket.connected);
    if (socket.connected) refreshNotifications();

    return () => {
      socket.off('notification', handleNotification);
      socket.off('notification:read', handleRead);
      socket.off('notification:read-all', handleReadAll);
      socket.off('notification:deleted', handleDeleted);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [isAuthenticated, refreshNotifications, socket, userId]);

  useEffect(() => {
    if (!isAuthenticated || socketConnected) return undefined;
    const interval = window.setInterval(() => refreshNotifications(), POLL_INTERVAL);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, refreshNotifications, socketConnected]);

  const markAsRead = useCallback(async (notificationId) => {
    const notification = notifications.find((item) => item._id === notificationId);
    if (!notification || notification.isRead) return true;

    setActionError('');
    notificationRevisionRef.current += 1;
    setNotifications((current) => current.map((item) => (
      item._id === notificationId ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
    )));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (Number.isInteger(response.data?.unreadCount)) setUnreadCount(response.data.unreadCount);
      return true;
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Could not mark this notification as read.');
      await refreshNotifications();
      console.error('Mark notification read error:', requestError);
      return false;
    }
  }, [notifications, refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    setActionError('');
    notificationRevisionRef.current += 1;
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Could not mark all notifications as read.');
      await refreshNotifications();
      console.error('Mark all notifications read error:', requestError);
      return false;
    }
  }, [refreshNotifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    const existing = notifications.find((item) => item._id === notificationId);
    setActionError('');
    notificationRevisionRef.current += 1;
    setNotifications((current) => current.filter((item) => item._id !== notificationId));
    notificationIdsRef.current.delete(notificationId);
    if (existing && !existing.isRead) setUnreadCount((count) => Math.max(0, count - 1));
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (Number.isInteger(response.data?.unreadCount)) setUnreadCount(response.data.unreadCount);
      return true;
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Could not delete this notification.');
      await refreshNotifications();
      console.error('Delete notification error:', requestError);
      return false;
    }
  }, [notifications, refreshNotifications]);

  return (
    <NotificationContext.Provider value={{
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
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

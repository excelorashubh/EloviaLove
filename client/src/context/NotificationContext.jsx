/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);
const NOTIFICATION_LIMIT = 20;
const POLL_INTERVAL = 30000;
const NOTIFICATION_REQUEST_TIMEOUT = 15000;

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
  const activeRequestRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  userIdRef.current = userId;

  const refreshNotifications = useCallback(({ showLoading = false } = {}) => {
    if (!isAuthenticated || !userId) return false;
    const currentRequest = activeRequestRef.current;
    if (currentRequest && String(currentRequest.userId) === String(userId)) {
      if (showLoading) {
        setLoading(true);
        setError('');
      }
      return currentRequest.promise;
    }

    const controller = new AbortController();
    const request = {
      userId,
      controller,
      promise: null,
    };
    activeRequestRef.current = request;
    const notificationRevision = notificationRevisionRef.current;
    if (showLoading) {
      setLoading(true);
      setError('');
    }

    request.promise = (async () => {
      try {
        const response = await api.get('/notifications', {
          timeout: NOTIFICATION_REQUEST_TIMEOUT,
          signal: controller.signal,
        });
        const payload = response.data;
        if (payload?.success === false) {
          throw new Error(payload.message || 'The notifications service could not complete the request.');
        }
        const latestNotifications = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : Array.isArray(payload?.data?.notifications)
              ? payload.data.notifications
              : Array.isArray(payload?.data)
                ? payload.data
                : null;
        if (!latestNotifications) {
          throw new Error('The notifications service returned an unexpected response.');
        }
        if (
          String(userIdRef.current) !== String(userId) ||
          activeRequestRef.current !== request ||
          notificationRevision !== notificationRevisionRef.current
        ) return false;

        notificationIdsRef.current = new Set(latestNotifications.map((notification) => notification._id));
        setNotifications(latestNotifications);
        const responseUnreadCount = Number(payload?.unreadCount ?? payload?.data?.unreadCount);
        setUnreadCount(Number.isFinite(responseUnreadCount)
          ? responseUnreadCount
          : latestNotifications.filter((notification) => !notification.isRead).length);
        setError('');
        return true;
      } catch (requestError) {
        if (
          !controller.signal.aborted &&
          String(userIdRef.current) === String(userId) &&
          activeRequestRef.current === request
        ) {
          const message = requestError.code === 'ECONNABORTED' || requestError.code === 'ERR_CANCELED'
            ? 'Loading notifications timed out. Please try again.'
            : requestError.response?.status === 401
              ? 'Your session has expired. Please sign in again.'
              : requestError.response?.data?.message || requestError.message || 'Could not load notifications. Please try again.';
          setError(message);
          console.error('Load notifications error:', requestError);
        }
        return false;
      } finally {
        if (activeRequestRef.current === request) {
          activeRequestRef.current = null;
          if (String(userIdRef.current) === String(userId)) setLoading(false);
        }
      }
    })();
    return request.promise;
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      notificationRevisionRef.current += 1;
      activeRequestRef.current?.controller.abort();
      activeRequestRef.current = null;
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

    return () => {
      const request = activeRequestRef.current;
      if (request && String(request.userId) === String(userId)) {
        activeRequestRef.current = null;
        request.controller.abort();
      }
    };
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

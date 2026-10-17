/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const isBrowser = typeof window !== 'undefined';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => (isBrowser ? localStorage.getItem('token') : null));
  const [socket, setSocket] = useState(null);

  const clearSession = useCallback(() => {
    if (isBrowser) localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, [isBrowser]);

  const loadUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      if (isBrowser && localStorage.getItem('token') !== token) return;
      if (!response.data?.user) {
        throw new Error('Authentication response did not include a user');
      }
      setUser(response.data.user);
    } catch (error) {
      if (isBrowser && localStorage.getItem('token') !== token) return;
      const status = error?.response?.status;
      const isInvalidSession =
        status === 401 || error?.message === 'Authentication response did not include a user';
      if (isInvalidSession) clearSession();
      console.error('Failed to load user:', error);
    } finally {
      if (!isBrowser || localStorage.getItem('token') === token) {
        setLoading(false);
      }
    }
  }, [clearSession, isBrowser, token]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token, isBrowser, loadUser]);

  // Shared authenticated socket for global events and page-level subscriptions.
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    if (!token || !user?._id) {
      return undefined;
    }

    const currentSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(currentSocket);

    const handleConnect = () => currentSocket.emit('join', user._id);
    const handleProfileUpdate = (payload) => {
      window.dispatchEvent(new CustomEvent('profile_updated', { detail: payload }));
      if (payload?.userId === user._id) loadUser();
    };
    currentSocket.on('connect', handleConnect);
    currentSocket.on('profile_updated', handleProfileUpdate);

    return () => {
      currentSocket.off('connect', handleConnect);
      currentSocket.off('profile_updated', handleProfileUpdate);
      currentSocket.disconnect();
      setSocket((activeSocket) => activeSocket === currentSocket ? null : activeSocket);
    };
  }, [loadUser, token, user?._id]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('elovia_random_match_gift_pending', 'true');
      setToken(newToken);
      setUser({ ...newUser, giftClaimed: false, randomMatchCards: 20 });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    clearSession();
  };

  const updateProfile = async (profileData) => {
    try {
      await api.put('/users/profile', profileData);
      // Re-fetch full user to keep state in sync
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
    socket,
    isAuthenticated: !loading && Boolean(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
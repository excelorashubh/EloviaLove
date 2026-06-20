import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, isBrowser]);

  // Socket for global realtime events (profile updates)
  const socketRef = useRef(null);
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    if (!socketRef.current && token) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current.on('connect', () => {
        // join personal room when authenticated
        if (user?._id) socketRef.current.emit('join', user._id);
      });
      socketRef.current.on('profile_updated', (payload) => {
        // Broadcast a window event so pages can reactively refresh or update lists
        try {
          window.dispatchEvent(new CustomEvent('profile_updated', { detail: payload }));
        } catch (e) {
          // ignore
        }
        // If the updated profile is the current user, reload user data
        if (user?._id && payload?.userId === user._id) {
          loadUser();
        }
      });
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token, user?._id]);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      // Debug logs for verification troubleshooting
      console.log('Loaded profile:', response.data.user);
      console.log('Loaded profile.isVerified:', response.data.user?.isVerified);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

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
      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
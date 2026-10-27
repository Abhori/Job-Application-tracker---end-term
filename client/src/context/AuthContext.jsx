import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // No active session; clean up token if stale
        localStorage.removeItem('applytrack_token');
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      if (data.token) {
        localStorage.setItem('applytrack_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authApi.register(userData);
      if (data.token) {
        localStorage.setItem('applytrack_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('applytrack_token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Update failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Profile update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

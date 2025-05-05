import React, { createContext, useState, useEffect } from 'react';
import { auth } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if user is logged in as guest
        const guestMode = localStorage.getItem('guestMode');
        if (guestMode === 'true') {
          setUser({ username: 'Guest', email: 'guest@cpusaas.com', isGuest: true });
          setIsGuest(true);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await auth.getProfile();
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
        setError('Authentication failed. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (username, email, password) => {
    try {
      const response = await auth.register(username, email, password);
      localStorage.setItem('token', response.data.token);
      loadUserProfile();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await auth.login(email, password);
      localStorage.setItem('token', response.data.token);
      await loadUserProfile();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Guest login
  const loginAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    setUser({ username: 'Guest', email: 'guest@cpusaas.com', isGuest: true });
    setIsGuest(true);
    return { success: true };
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const response = await auth.getProfile();
      setUser(response.data);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      logout();
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
    setUser(null);
    setIsGuest(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        loginAsGuest,
        isGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
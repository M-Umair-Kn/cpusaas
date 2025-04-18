import React, { createContext, useState, useEffect } from 'react';
import { auth } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
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
  const register = async (email, password) => {
    try {
      const response = await auth.register(email, password);
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
      loadUserProfile();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
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
    setUser(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 
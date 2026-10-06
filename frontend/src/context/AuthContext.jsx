import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/login', { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await API.post('/admin/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Admin login failed' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await API.post('/register', { name, email, phone, password });
      const { token, user } = res.data;

      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
      }
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const googleAuth = async (googleData) => {
    try {
      const res = await API.post('/google-auth', googleData);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google Authentication failed' };
    }
  };

  const forgotPassword = async (identifier) => {
    try {
      const res = await API.post('/forgot-password', { identifier });
      return { success: true, message: res.data.message, demoOtp: res.data.demoOtp };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (identifier, otp) => {
    try {
      const res = await API.post('/verify-otp', { identifier, otp });
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'OTP verification failed' };
    }
  };

  const resetPassword = async (identifier, otp, newPassword) => {
    try {
      const res = await API.post('/reset-password', { identifier, otp, newPassword });
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Password reset failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, googleAuth, forgotPassword, verifyOtp, resetPassword, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Authentication context and provider.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error: any) {
      // Only log error details in development, not tokens
      if (import.meta.env.DEV) {
        console.error('Error fetching user:', error.response?.status, error.response?.data?.detail || error.message);
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;
      
      if (!access_token || !refresh_token) {
        throw new Error('Invalid response from server: missing tokens');
      }
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      await fetchUser();
    } catch (error: any) {
      // Only log error message in development, not sensitive data
      if (import.meta.env.DEV) {
        console.error('Login error:', error.response?.status, error.response?.data?.detail || error.message);
      }
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
        role: 'student',
      });
      
      // Auto-login after registration
      await login(email, password);
    } catch (error: any) {
      // Only log error message in development, not sensitive data
      if (import.meta.env.DEV) {
        console.error('Registration error:', error.response?.status, error.response?.data?.detail || error.message);
      }
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};


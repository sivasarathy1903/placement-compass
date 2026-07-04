import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types/auth';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, studentName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
      const { token, refreshToken, id, email: userEmail, roles } = response.data;

      const loggedUser: User = { id, email: userEmail, roles };

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setUser(loggedUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, studentName: string) => {
    try {
      await api.post('/api/auth/register', { email, password, studentName });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to revoke the refresh token in the database
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
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

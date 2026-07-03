import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async () => {
    const token = localStorage.getItem('dos_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('dos_access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('dos_access_token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem('dos_access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, login: loginUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

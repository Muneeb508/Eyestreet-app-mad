import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('streeteye_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setToken(res.token);
      await AsyncStorage.setItem(
        'streeteye_auth',
        JSON.stringify({ user: res.user, token: res.token })
      );
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async ({ name, email, password, city }) => {
    try {
      const res = await api.signup({ name, email, password, city });
      setUser(res.user);
      setToken(res.token);
      await AsyncStorage.setItem(
        'streeteye_auth',
        JSON.stringify({ user: res.user, token: res.token })
      );
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('streeteye_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};



import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

// Simple storage abstraction for web/native
const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    try {
      const SecureStore = await import('expo-secure-store');
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token on mount
  useEffect(() => {
    loadStoredToken();
  }, []);

  const loadStoredToken = async () => {
    try {
      const storedToken = await storage.getItem('shrinkly_token');
      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);
        // Fetch user profile
        const response = await authAPI.getMe();
        setUser(response.data.user);
      }
    } catch (err) {
      console.log('Token load error:', err);
      await storage.removeItem('shrinkly_token');
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
      await storage.setItem('shrinkly_token', newToken);
      
      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      setError(null);
      const response = await authAPI.signup({ name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
      await storage.setItem('shrinkly_token', newToken);
      
      return { success: true };
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const handleOAuthToken = useCallback(async (oauthToken) => {
    try {
      setError(null);
      setAuthToken(oauthToken);
      setToken(oauthToken);
      await storage.setItem('shrinkly_token', oauthToken);
      
      const response = await authAPI.getMe();
      setUser(response.data.user);
      
      return { success: true };
    } catch (err) {
      const message = err.message || 'OAuth login failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setError(null);
    await storage.removeItem('shrinkly_token');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        error,
        login,
        signup,
        logout,
        handleOAuthToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

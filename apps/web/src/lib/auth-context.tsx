'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User } from './api';

const TOKEN_KEY = 'legaldocs_token';
const REFRESH_TOKEN_KEY = 'legaldocs_refresh_token';
const TOKEN_EXPIRY_KEY = 'legaldocs_token_expiry';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isMounted: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const saveTokens = useCallback((accessToken: string, refreshToken?: string, expiresAt?: number) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (expiresAt) {
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    }
    setToken(accessToken);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      clearAuth();
      return false;
    }

    try {
      const { accessToken, refreshToken: newRefreshToken, expiresAt } = await authApi.refreshToken(refreshToken);
      saveTokens(accessToken, newRefreshToken, expiresAt);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth, saveTokens]);

  useEffect(() => {
    // Mark as mounted (client-side only)
    setIsMounted(true);

    // Check for stored token on mount
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user
      authApi.me(storedToken)
        .then(({ user }) => {
          setUser(user);
        })
        .catch(async () => {
          // Try to refresh token
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            const newToken = localStorage.getItem(TOKEN_KEY);
            if (newToken) {
              try {
                const { user } = await authApi.me(newToken);
                setUser(user);
              } catch {
                clearAuth();
              }
            }
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [clearAuth, refreshAccessToken]);

  const login = async (email: string, password: string) => {
    const { user, token, refreshToken, expiresAt } = await authApi.login({ email, password });
    saveTokens(token, refreshToken, expiresAt);
    setUser(user);
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    const { user, token, refreshToken, expiresAt } = await authApi.register({ email, password, fullName, phone });
    saveTokens(token, refreshToken, expiresAt);
    setUser(user);
  };

  const logout = async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      try {
        await authApi.logout(currentToken);
      } catch {
        // Ignore logout API errors - still clear local state
      }
    }
    clearAuth();
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isMounted,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

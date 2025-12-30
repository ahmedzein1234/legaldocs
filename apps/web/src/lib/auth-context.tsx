'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User } from './api';
import { initErrorTracking, setUser as setErrorTrackingUser } from './error-tracking';

/**
 * Auth Context - Secure Cookie-Based Authentication
 *
 * SECURITY: This implementation uses httpOnly cookies for JWT storage.
 * Tokens are set by the backend via Set-Cookie headers and automatically
 * included in requests via credentials: 'include'.
 *
 * This prevents XSS attacks from accessing tokens via JavaScript.
 */

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isMounted: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Refresh authentication by calling the refresh endpoint.
   * The refresh token is sent automatically via httpOnly cookie.
   */
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Call refresh endpoint - cookies are sent automatically
      await authApi.refreshToken();
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  /**
   * Verify current session by fetching user profile.
   * If the access token is expired, attempt to refresh it.
   */
  const verifySession = useCallback(async () => {
    try {
      // Try to get current user - cookies sent automatically
      const { user } = await authApi.me();
      setUser(user);
      setErrorTrackingUser({ id: user.id, email: user.email, name: user.fullName });
      return true;
    } catch (error) {
      // If unauthorized, try to refresh the token
      const refreshed = await refreshAuth();
      if (refreshed) {
        try {
          const { user } = await authApi.me();
          setUser(user);
          setErrorTrackingUser({ id: user.id, email: user.email, name: user.fullName });
          return true;
        } catch {
          clearAuth();
          return false;
        }
      }
      clearAuth();
      return false;
    }
  }, [clearAuth, refreshAuth]);

  useEffect(() => {
    // Mark as mounted (client-side only)
    setIsMounted(true);

    // Initialize error tracking
    initErrorTracking();

    // Verify session on mount - no localStorage needed
    // Cookies are automatically sent with requests
    verifySession().finally(() => {
      setIsLoading(false);
    });
  }, [verifySession]);

  const login = async (email: string, password: string) => {
    // Login endpoint sets httpOnly cookies via Set-Cookie header
    const { user } = await authApi.login({ email, password });
    setUser(user);
    // Set user context for error tracking
    setErrorTrackingUser({ id: user.id, email: user.email, name: user.fullName });
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    // Register endpoint sets httpOnly cookies via Set-Cookie header
    const { user } = await authApi.register({ email, password, fullName, phone });
    setUser(user);
    // Set user context for error tracking
    setErrorTrackingUser({ id: user.id, email: user.email, name: user.fullName });
  };

  const logout = async () => {
    try {
      // Logout endpoint clears httpOnly cookies
      await authApi.logout();
    } catch {
      // Ignore logout API errors - still clear local state
    }
    clearAuth();
    // Clear user context for error tracking
    setErrorTrackingUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isMounted,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      refreshAuth,
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

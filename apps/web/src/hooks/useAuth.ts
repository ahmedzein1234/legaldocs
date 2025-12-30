'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { User } from '@/lib/api';

// Auth API response types
interface AuthResponse {
  user: User;
  token: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

/**
 * Hook for user authentication with React Query
 * Manages login, register, and logout mutations with automatic cache invalidation
 */
export function useAuthMutation() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: data,
      });
      return response;
    },
    onSuccess: ({ user, token }) => {
      // Store token in localStorage
      localStorage.setItem('legaldocs_token', token);

      // Update user cache
      queryClient.setQueryData(['auth', 'user'], user);

      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: data,
      });
      return response;
    },
    onSuccess: ({ user, token }) => {
      // Store token in localStorage
      localStorage.setItem('legaldocs_token', token);

      // Update user cache
      queryClient.setQueryData(['auth', 'user'], user);

      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Remove token from localStorage
      localStorage.removeItem('legaldocs_token');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}

/**
 * Hook to fetch the current authenticated user
 * Returns null if not authenticated
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await apiRequest<{ user: User }>('/api/auth/me');
      return response.user;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: false, // Don't retry on auth failures
  });
}

/**
 * Combined auth hook that provides both user data and auth mutations
 */
export function useAuth() {
  const userQuery = useCurrentUser();
  const mutations = useAuthMutation();

  return {
    user: userQuery.data ?? null,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    error: userQuery.error,
    ...mutations,
  };
}

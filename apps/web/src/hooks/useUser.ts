'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { User } from '@/lib/api';

// User update input types
interface UpdateUserInput {
  fullName?: string;
  fullNameAr?: string;
  phone?: string;
  uiLanguage?: string;
  preferredDocLanguages?: string[];
}

interface UpdateUserResponse {
  user: User;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Hook for user profile mutations (update profile, change password)
 */
export function useUserMutations() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const response = await apiRequest<UpdateUserResponse>('/api/user/profile', {
        method: 'PATCH',
        body: data,
      });
      return response.user;
    },
    onSuccess: (updatedUser) => {
      // Update user in auth cache
      queryClient.setQueryData(['auth', 'user'], updatedUser);

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      await apiRequest<{ success: boolean }>('/api/user/password', {
        method: 'POST',
        body: data,
      });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      // Note: This uses fetch directly since we need FormData
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      return data.user as User;
    },
    onSuccess: (updatedUser) => {
      // Update user in auth cache
      queryClient.setQueryData(['auth', 'user'], updatedUser);

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (password: string) => {
      await apiRequest<{ success: boolean }>('/api/user/account', {
        method: 'DELETE',
        body: { password },
      });
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();

      // Remove token
      localStorage.removeItem('legaldocs_token');
    },
  });

  return {
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAccount,
  };
}

/**
 * Hook to get user preferences
 */
export function useUserPreferences() {
  const queryClient = useQueryClient();

  // Get preferences from the cached user data
  const user = queryClient.getQueryData<User>(['auth', 'user']);

  return {
    uiLanguage: user?.uiLanguage || 'en',
    preferredDocLanguages: user?.preferredDocLanguages || ['en'],
  };
}

/**
 * Combined hook that provides user data and mutations
 */
export function useUser() {
  const queryClient = useQueryClient();
  const mutations = useUserMutations();

  // Get user from cache (set by useAuth)
  const user = queryClient.getQueryData<User>(['auth', 'user']);

  return {
    user: user ?? null,
    ...mutations,
  };
}

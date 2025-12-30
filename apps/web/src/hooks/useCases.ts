'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { casesApi, Case, CaseTask, CreateCaseInput } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { captureError } from '@/lib/error-tracking';

// Extended case type with related data
// Omit 'notes' from Case since it's a different type in details view (array of CaseNote vs string)
export interface CaseWithDetails extends Omit<Case, 'notes'> {
  tasks: CaseTask[];
  notes: CaseNote[];
  documents: CaseDocument[];
  timeEntries: TimeEntry[];
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  noteType: string;
  isPrivate: boolean;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  documentId: string;
  title: string;
  documentNumber: string;
  documentType: string;
  status: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  caseId: string;
  description: string;
  activityType: string;
  date: string;
  durationMinutes: number;
  hourlyRate?: number;
  amount?: number;
  isBillable: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface CaseListParams {
  page?: number;
  limit?: number;
  status?: string;
  caseType?: string;
  search?: string;
}

/**
 * Hook to fetch paginated list of cases
 */
export function useCases(params?: CaseListParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['cases', params],
    queryFn: async () => {
      const response = await casesApi.list(params);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch a single case with all related data
 */
export function useCase(id: string | null) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['cases', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await casesApi.get(id);
      return response.data.case as CaseWithDetails;
    },
    enabled: isAuthenticated && !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch case statistics
 */
export function useCaseStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['cases', 'stats'],
    queryFn: async () => {
      const response = await casesApi.stats();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for case mutations (create, update, delete)
 */
export function useCaseMutations() {
  const queryClient = useQueryClient();

  const createCase = useMutation({
    mutationFn: async (data: CreateCaseInput) => {
      const response = await casesApi.create(data);
      return response.data.case;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseMutations', action: 'create' });
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCaseInput & { status?: string; nextHearingDate?: string; nextDeadline?: string }> }) => {
      const response = await casesApi.update(id, data);
      return response.data.case;
    },
    onSuccess: (updatedCase) => {
      queryClient.setQueryData(['cases', updatedCase.id], (old: CaseWithDetails | undefined) => {
        if (!old) return old;
        return { ...old, ...updatedCase };
      });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseMutations', action: 'update' });
    },
  });

  const deleteCase = useMutation({
    mutationFn: async (id: string) => {
      await casesApi.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.removeQueries({ queryKey: ['cases', deletedId] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseMutations', action: 'delete' });
    },
  });

  return { createCase, updateCase, deleteCase };
}

/**
 * Hook for case task mutations
 */
export function useCaseTaskMutations(caseId: string) {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: async (data: { title: string; description?: string; taskType?: string; priority?: string; dueDate?: string; assignedTo?: string }) => {
      const response = await casesApi.createTask(caseId, data);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseTaskMutations', action: 'create' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<{ title: string; status: string; dueDate: string; priority: string }> }) => {
      const response = await casesApi.updateTask(caseId, taskId, data);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseTaskMutations', action: 'update' });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      await casesApi.deleteTask(caseId, taskId);
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseTaskMutations', action: 'delete' });
    },
  });

  return { createTask, updateTask, deleteTask };
}

/**
 * Hook for case note mutations
 */
export function useCaseNoteMutations(caseId: string) {
  const queryClient = useQueryClient();

  const addNote = useMutation({
    mutationFn: async (data: { content: string; noteType?: string; isPrivate?: boolean }) => {
      const response = await casesApi.addNote(caseId, data);
      return response.data.note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useCaseNoteMutations', action: 'add' });
    },
  });

  return { addNote };
}

/**
 * Hook for time entry mutations
 */
export function useTimeEntryMutations(caseId: string) {
  const queryClient = useQueryClient();

  const logTime = useMutation({
    mutationFn: async (data: { description: string; date: string; durationMinutes: number; activityType?: string; isBillable?: boolean }) => {
      const response = await casesApi.logTime(caseId, data);
      return response.data.timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases', 'stats'] });
    },
    onError: (error) => {
      captureError(error, { hook: 'useTimeEntryMutations', action: 'log' });
    },
  });

  return { logTime };
}

/**
 * Combined hook for case detail page
 */
export function useCaseDetail(id: string) {
  const caseQuery = useCase(id);
  const caseMutations = useCaseMutations();
  const taskMutations = useCaseTaskMutations(id);
  const noteMutations = useCaseNoteMutations(id);
  const timeMutations = useTimeEntryMutations(id);

  return {
    caseData: caseQuery.data,
    isLoading: caseQuery.isLoading,
    error: caseQuery.error,
    refetch: caseQuery.refetch,
    ...caseMutations,
    ...taskMutations,
    ...noteMutations,
    ...timeMutations,
  };
}

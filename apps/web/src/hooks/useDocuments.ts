'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getStoredToken } from '@/lib/api-client';
import { Document, CreateDocumentInput, GeneratedContent } from '@/lib/api';

// API response types
interface DocumentsResponse {
  documents: Document[];
}

interface DocumentResponse {
  document: Document;
}

interface GenerateDocumentInput {
  prompt: string;
  documentType: string;
  languages: string[];
}

interface GenerateDocumentResponse {
  success: boolean;
  generated: GeneratedContent;
  languages: string[];
}

/**
 * Hook to fetch all documents for the authenticated user
 */
export function useDocuments() {
  const token = getStoredToken();

  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await apiRequest<DocumentsResponse>('/api/documents', {
        token,
      });
      return response.documents;
    },
    enabled: !!token,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch a single document by ID
 */
export function useDocument(id: string | null) {
  const token = getStoredToken();

  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest<DocumentResponse>(`/api/documents/${id}`, {
        token,
      });
      return response.document;
    },
    enabled: !!token && !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook for document mutations (create, update, delete, generate)
 */
export function useDocumentMutations() {
  const queryClient = useQueryClient();
  const token = getStoredToken();

  const createDocument = useMutation({
    mutationFn: async (data: CreateDocumentInput) => {
      const response = await apiRequest<DocumentResponse>('/api/documents', {
        method: 'POST',
        body: data,
        token,
      });
      return response.document;
    },
    onSuccess: (newDocument) => {
      // Add new document to the cache
      queryClient.setQueryData<Document[]>(['documents'], (old) => {
        if (!old) return [newDocument];
        return [newDocument, ...old];
      });

      // Invalidate documents list to refetch
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateDocumentInput> }) => {
      const response = await apiRequest<DocumentResponse>(`/api/documents/${id}`, {
        method: 'PATCH',
        body: data,
        token,
      });
      return response.document;
    },
    onSuccess: (updatedDocument) => {
      // Update document in cache
      queryClient.setQueryData(['documents', updatedDocument.id], updatedDocument);

      // Update in documents list
      queryClient.setQueryData<Document[]>(['documents'], (old) => {
        if (!old) return [updatedDocument];
        return old.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc));
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest<{ success: boolean }>(`/api/documents/${id}`, {
        method: 'DELETE',
        token,
      });
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from documents list
      queryClient.setQueryData<Document[]>(['documents'], (old) => {
        if (!old) return [];
        return old.filter((doc) => doc.id !== deletedId);
      });

      // Invalidate single document query
      queryClient.invalidateQueries({ queryKey: ['documents', deletedId] });
    },
  });

  const generateDocument = useMutation({
    mutationFn: async (data: GenerateDocumentInput) => {
      const response = await apiRequest<GenerateDocumentResponse>('/api/documents/generate', {
        method: 'POST',
        body: data,
        token,
      });
      return response;
    },
  });

  return {
    createDocument,
    updateDocument,
    deleteDocument,
    generateDocument,
  };
}

/**
 * Combined hook that provides both document queries and mutations
 */
export function useDocumentsWithMutations() {
  const documentsQuery = useDocuments();
  const mutations = useDocumentMutations();

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    ...mutations,
  };
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getStoredToken } from '@/lib/api-client';
import { DocumentSigner } from '@/lib/api';

// Signature request types
interface SignatureRequest {
  id: string;
  documentId: string;
  documentNumber: string;
  documentTitle: string;
  requesterName: string;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  createdAt: string;
  expiresAt?: string;
  signers: DocumentSigner[];
}

interface SignatureRequestsResponse {
  requests: SignatureRequest[];
}

interface CreateSignatureRequestInput {
  documentId: string;
  signers: {
    email?: string;
    phone?: string;
    fullName: string;
    fullNameAr?: string;
    role?: string;
    signingOrder: number;
    preferredLanguage: string;
  }[];
  expiresIn?: number; // days
}

interface SignDocumentInput {
  token: string;
  signatureData?: string; // Base64 signature image
}

interface SignDocumentResponse {
  success: boolean;
  document: {
    id: string;
    status: string;
    blockchainHash?: string;
    blockchainTx?: string;
  };
}

/**
 * Hook to fetch signature requests for the authenticated user
 */
export function useSignatureRequests() {
  const token = getStoredToken();

  return useQuery({
    queryKey: ['signatures', 'requests'],
    queryFn: async () => {
      const response = await apiRequest<SignatureRequestsResponse>('/api/signatures/requests', {
        token,
      });
      return response.requests;
    },
    enabled: !!token,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch a single signature request by token
 */
export function useSignatureRequest(requestToken: string | null) {
  return useQuery({
    queryKey: ['signatures', 'request', requestToken],
    queryFn: async () => {
      if (!requestToken) return null;
      const response = await apiRequest<{ request: SignatureRequest }>(
        `/api/signatures/request/${requestToken}`
      );
      return response.request;
    },
    enabled: !!requestToken,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch signature status for a document
 */
export function useDocumentSignatures(documentId: string | null) {
  const token = getStoredToken();

  return useQuery({
    queryKey: ['signatures', 'document', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const response = await apiRequest<{ signers: DocumentSigner[] }>(
        `/api/documents/${documentId}/signatures`,
        { token }
      );
      return response.signers;
    },
    enabled: !!token && !!documentId,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook for signature-related mutations
 */
export function useSignatureMutations() {
  const queryClient = useQueryClient();
  const token = getStoredToken();

  const createSignatureRequest = useMutation({
    mutationFn: async (data: CreateSignatureRequestInput) => {
      const response = await apiRequest<{ request: SignatureRequest }>(
        '/api/signatures/request',
        {
          method: 'POST',
          body: data,
          token,
        }
      );
      return response.request;
    },
    onSuccess: () => {
      // Invalidate signature requests to refetch
      queryClient.invalidateQueries({ queryKey: ['signatures', 'requests'] });
      // Invalidate documents as status may have changed
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const signDocument = useMutation({
    mutationFn: async (data: SignDocumentInput) => {
      const response = await apiRequest<SignDocumentResponse>('/api/signatures/sign', {
        method: 'POST',
        body: data,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate signature request
      queryClient.invalidateQueries({ queryKey: ['signatures', 'request', variables.token] });
      // Invalidate signature requests list
      queryClient.invalidateQueries({ queryKey: ['signatures', 'requests'] });
      // Invalidate documents
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const declineSignature = useMutation({
    mutationFn: async ({ token, reason }: { token: string; reason?: string }) => {
      await apiRequest<{ success: boolean }>('/api/signatures/decline', {
        method: 'POST',
        body: { token, reason },
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate signature request
      queryClient.invalidateQueries({ queryKey: ['signatures', 'request', variables.token] });
      // Invalidate signature requests list
      queryClient.invalidateQueries({ queryKey: ['signatures', 'requests'] });
    },
  });

  const cancelSignatureRequest = useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest<{ success: boolean }>(`/api/signatures/request/${requestId}`, {
        method: 'DELETE',
        token,
      });
      return requestId;
    },
    onSuccess: () => {
      // Invalidate signature requests
      queryClient.invalidateQueries({ queryKey: ['signatures', 'requests'] });
    },
  });

  const resendSignatureRequest = useMutation({
    mutationFn: async ({ requestId, signerId }: { requestId: string; signerId: string }) => {
      await apiRequest<{ success: boolean }>(
        `/api/signatures/request/${requestId}/resend/${signerId}`,
        {
          method: 'POST',
          token,
        }
      );
    },
  });

  return {
    createSignatureRequest,
    signDocument,
    declineSignature,
    cancelSignatureRequest,
    resendSignatureRequest,
  };
}

/**
 * Combined hook that provides signature requests and mutations
 */
export function useSignatures() {
  const requestsQuery = useSignatureRequests();
  const mutations = useSignatureMutations();

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    error: requestsQuery.error,
    refetch: requestsQuery.refetch,
    ...mutations,
  };
}

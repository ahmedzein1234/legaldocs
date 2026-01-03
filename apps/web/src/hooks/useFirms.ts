'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchFirms,
  getFirm,
  getFirmReviews,
  registerFirm,
  getAnchorPartner,
  calculateCommission,
  getOpenRequests,
  createServiceRequest,
  submitRequestForBidding,
  getRequestBids,
  submitBid,
  acceptBid,
  getUserEngagements,
  payForEngagement,
  approveEngagement,
  submitReview,
  getMyFirm,
  getMyFirmBids,
  getMyFirmEngagements,
  completeEngagement,
  type SearchFirmsParams,
  type GetOpenRequestsParams,
  type RegisterFirmData,
  type CreateServiceRequestData,
  type SubmitBidData,
  type SubmitReviewData,
  type BidStatus,
  type EngagementStatus,
} from '@/lib/firms';

// ============================================
// FIRM SEARCH & DISCOVERY
// ============================================

export function useFirms(params: SearchFirmsParams = {}) {
  return useQuery({
    queryKey: ['firms', params],
    queryFn: () => searchFirms(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFirm(idOrSlug: string) {
  return useQuery({
    queryKey: ['firm', idOrSlug],
    queryFn: () => getFirm(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFirmReviews(firmId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['firm-reviews', firmId, page, limit],
    queryFn: () => getFirmReviews(firmId, page, limit),
    enabled: !!firmId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnchorPartner() {
  return useQuery({
    queryKey: ['anchor-partner'],
    queryFn: getAnchorPartner,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCommissionCalculator(amount: number, firmRate = 20, anchorRate = 8) {
  return useQuery({
    queryKey: ['commission', amount, firmRate, anchorRate],
    queryFn: () => calculateCommission(amount, firmRate, anchorRate),
    enabled: amount > 0,
    staleTime: 1000 * 60 * 60, // 1 hour (static calculation)
  });
}

// ============================================
// FIRM REGISTRATION
// ============================================

export function useRegisterFirm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterFirmData) => registerFirm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-firm'] });
    },
  });
}

// ============================================
// SERVICE REQUESTS
// ============================================

export function useOpenRequests(params: GetOpenRequestsParams = {}) {
  return useQuery({
    queryKey: ['open-requests', params],
    queryFn: () => getOpenRequests(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequestData) => createServiceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-requests'] });
    },
  });
}

export function useSubmitRequestForBidding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => submitRequestForBidding(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-requests'] });
      queryClient.invalidateQueries({ queryKey: ['open-requests'] });
    },
  });
}

export function useRequestBids(requestId: string, sortBy?: 'price' | 'rating' | 'delivery' | 'value_score') {
  return useQuery({
    queryKey: ['request-bids', requestId, sortBy],
    queryFn: () => getRequestBids(requestId, sortBy),
    enabled: !!requestId,
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// BIDDING
// ============================================

export function useSubmitBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitBidData) => submitBid(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['open-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-firm-bids'] });
      queryClient.invalidateQueries({ queryKey: ['request-bids', variables.requestId] });
    },
  });
}

export function useAcceptBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => acceptBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-engagements'] });
      queryClient.invalidateQueries({ queryKey: ['request-bids'] });
    },
  });
}

// ============================================
// ENGAGEMENTS
// ============================================

export function useUserEngagements(status?: EngagementStatus, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['user-engagements', status, page, limit],
    queryFn: () => getUserEngagements(status, page, limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePayForEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (engagementId: string) => payForEngagement(engagementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-engagements'] });
    },
  });
}

export function useApproveEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (engagementId: string) => approveEngagement(engagementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-engagements'] });
    },
  });
}

// ============================================
// REVIEWS
// ============================================

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitReviewData) => submitReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['firm-reviews', variables.firmId] });
      queryClient.invalidateQueries({ queryKey: ['firm', variables.firmId] });
    },
  });
}

// ============================================
// FIRM DASHBOARD
// ============================================

export function useMyFirm() {
  return useQuery({
    queryKey: ['my-firm'],
    queryFn: getMyFirm,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyFirmBids(status?: BidStatus, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['my-firm-bids', status, page, limit],
    queryFn: () => getMyFirmBids(status, page, limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyFirmEngagements(status?: EngagementStatus, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['my-firm-engagements', status, page, limit],
    queryFn: () => getMyFirmEngagements(status, page, limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCompleteEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ engagementId, deliverableUrl }: { engagementId: string; deliverableUrl?: string }) =>
      completeEngagement(engagementId, deliverableUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-firm-engagements'] });
    },
  });
}

/**
 * Firm Marketplace Types and API Functions
 */

import { apiClient } from './api-client';

// ============================================
// TYPES
// ============================================

export type FirmStatus = 'pending' | 'active' | 'suspended' | 'inactive';
export type FirmType = 'local' | 'international' | 'boutique';
export type FirmSize = 'solo' | 'small' | 'medium' | 'large';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type ServiceType = 'consultation' | 'document_review' | 'document_drafting' | 'case_representation' | 'notarization' | 'translation' | 'other';
export type RequestStatus = 'draft' | 'pending_review' | 'open' | 'bidding' | 'anchor_review' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type BidStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
export type EngagementStatus = 'pending_payment' | 'active' | 'in_progress' | 'under_review' | 'completed' | 'cancelled' | 'disputed';
export type Urgency = 'urgent' | 'express' | 'standard' | 'flexible';

export interface LawFirm {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  logoUrl?: string;
  email: string;
  phone?: string;
  country: string;
  emirate?: string;
  city?: string;
  firmType: FirmType;
  firmSize: FirmSize;
  specializations: string[];
  description?: string;
  descriptionAr?: string;
  totalLawyers: number;
  totalCasesCompleted: number;
  totalReviews: number;
  averageRating: number;
  responseTimeHours: number;
  minConsultationFee?: number;
  maxConsultationFee?: number;
  isAnchorPartner: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  status: FirmStatus;
  verificationStatus: VerificationStatus;
  commissionRate: number;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  userId: string;
  serviceType: ServiceType;
  category: string;
  documentId?: string;
  title: string;
  description: string;
  requiredLanguages: string[];
  requiredEmirate?: string;
  urgency: Urgency;
  deadline?: string;
  complexity: 'simple' | 'medium' | 'complex' | 'highly_complex';
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  status: RequestStatus;
  anchorOfferedAt?: string;
  anchorResponseDeadline?: string;
  assignedFirmId?: string;
  assignedLawyerId?: string;
  acceptedBidId?: string;
  finalPrice?: number;
  platformCommission?: number;
  anchorShare?: number;
  bidCount?: number;
  lowestBid?: number;
  highestBid?: number;
  createdAt: string;
}

export interface RequestBid {
  id: string;
  requestId: string;
  firmId: string;
  firmName?: string;
  firmLogo?: string;
  firmRating?: number;
  firmCases?: number;
  submittedBy: string;
  assignedLawyerId?: string;
  bidAmount: number;
  currency: string;
  serviceFee: number;
  platformCommission: number;
  firmReceives: number;
  estimatedHours?: number;
  deliveryDays: number;
  deliveryDate?: string;
  coverLetter?: string;
  inclusions: string[];
  status: BidStatus;
  viewedByUser: boolean;
  validUntil?: string;
  createdAt: string;
}

export interface FirmEngagement {
  id: string;
  engagementNumber: string;
  requestId: string;
  bidId?: string;
  firmId: string;
  firmName?: string;
  firmLogo?: string;
  requestTitle?: string;
  userId: string;
  leadLawyerId?: string;
  serviceType: ServiceType;
  category: string;
  agreedAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  anchorShareRate: number;
  anchorShare: number;
  firmPayout: number;
  paymentType: 'full_upfront' | 'milestone' | 'completion' | 'deposit_balance';
  depositAmount: number;
  depositPaid: boolean;
  status: EngagementStatus;
  expectedEndDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface FirmReview {
  id: string;
  firmId: string;
  engagementId?: string;
  userId: string;
  reviewerName?: string;
  overallRating: number;
  communicationRating?: number;
  expertiseRating?: number;
  timelinessRating?: number;
  valueRating?: number;
  title?: string;
  reviewText?: string;
  serviceType?: string;
  category?: string;
  engagementValue?: number;
  isVerified: boolean;
  createdAt: string;
}

export interface CommissionBreakdown {
  transactionAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  anchorShareRate: number;
  anchorShare: number;
  netPlatformCommission: number;
  firmPayout: number;
}

export interface FirmMembership {
  role: string;
  canBid: boolean;
  canAcceptCases: boolean;
  canManageFirm: boolean;
  canViewFinancials: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

interface PaginatedData<T> {
  pagination: {
    total: number;
    limit: number;
    offset?: number;
    page?: number;
    totalPages?: number;
  };
}

// ============================================
// API FUNCTIONS
// ============================================

// Search firms
export interface SearchFirmsParams {
  search?: string;
  category?: string;
  emirate?: string;
  firmSize?: FirmSize;
  minRating?: number;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchFirms(params: SearchFirmsParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.category) queryParams.set('category', params.category);
  if (params.emirate) queryParams.set('emirate', params.emirate);
  if (params.firmSize) queryParams.set('firmSize', params.firmSize);
  if (params.minRating) queryParams.set('minRating', params.minRating.toString());
  if (params.verifiedOnly) queryParams.set('verifiedOnly', 'true');
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  return apiClient.get<ApiResponse<{ firms: LawFirm[] } & PaginatedData<LawFirm>>>(
    `/api/firms${query ? `?${query}` : ''}`
  );
}

// Get firm by ID or slug
export async function getFirm(idOrSlug: string) {
  return apiClient.get<ApiResponse<{ firm: LawFirm }>>(`/api/firms/${idOrSlug}`);
}

// Get firm reviews
export async function getFirmReviews(firmId: string, page = 1, limit = 10) {
  return apiClient.get<ApiResponse<{ reviews: FirmReview[] } & PaginatedData<FirmReview>>>(
    `/api/firms/${firmId}/reviews?page=${page}&limit=${limit}`
  );
}

// Register a new firm
export interface RegisterFirmData {
  name: string;
  nameAr?: string;
  email: string;
  phone?: string;
  country?: string;
  emirate?: string;
  firmType?: FirmType;
  firmSize?: FirmSize;
  specializations?: string[];
  description?: string;
}

export async function registerFirm(data: RegisterFirmData) {
  return apiClient.post<ApiResponse<{ firmId: string; message: string }>>('/api/firms/register', data);
}

// Get anchor partner
export async function getAnchorPartner() {
  return apiClient.get<ApiResponse<{ anchor: { firm: LawFirm; firstRefusalHours: number } | null }>>('/api/firms/anchor');
}

// Calculate commission
export async function calculateCommission(amount: number, firmRate = 20, anchorRate = 8) {
  return apiClient.get<ApiResponse<{ breakdown: CommissionBreakdown }>>(
    `/api/firms/calculate-commission?amount=${amount}&firmRate=${firmRate}&anchorRate=${anchorRate}`
  );
}

// ============================================
// SERVICE REQUESTS
// ============================================

// Get open requests (for firms to bid on)
export interface GetOpenRequestsParams {
  category?: string;
  serviceType?: ServiceType;
  emirate?: string;
  minBudget?: number;
  maxBudget?: number;
  urgency?: Urgency;
  limit?: number;
  offset?: number;
}

export async function getOpenRequests(params: GetOpenRequestsParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.set('category', params.category);
  if (params.serviceType) queryParams.set('serviceType', params.serviceType);
  if (params.emirate) queryParams.set('emirate', params.emirate);
  if (params.minBudget) queryParams.set('minBudget', params.minBudget.toString());
  if (params.maxBudget) queryParams.set('maxBudget', params.maxBudget.toString());
  if (params.urgency) queryParams.set('urgency', params.urgency);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  return apiClient.get<ApiResponse<{ requests: ServiceRequest[] } & PaginatedData<ServiceRequest>>>(
    `/api/firms/requests/open${query ? `?${query}` : ''}`
  );
}

// Create service request
export interface CreateServiceRequestData {
  serviceType: ServiceType;
  category: string;
  documentId?: string;
  title: string;
  description: string;
  requiredLanguages?: string[];
  requiredEmirate?: string;
  urgency?: Urgency;
  deadline?: string;
  complexity?: 'simple' | 'medium' | 'complex' | 'highly_complex';
  budgetMin?: number;
  budgetMax?: number;
}

export async function createServiceRequest(data: CreateServiceRequestData) {
  return apiClient.post<ApiResponse<{ requestId: string; message: string }>>('/api/firms/requests', data);
}

// Submit request for bidding
export async function submitRequestForBidding(requestId: string) {
  return apiClient.post<ApiResponse<{ offeredToAnchor: boolean; anchorDeadline?: string; message: string }>>(
    `/api/firms/requests/${requestId}/submit`
  );
}

// Get bids for a request
export async function getRequestBids(requestId: string, sortBy?: 'price' | 'rating' | 'delivery' | 'value_score') {
  const query = sortBy ? `?sortBy=${sortBy}` : '';
  return apiClient.get<ApiResponse<{ bids: RequestBid[] }>>(`/api/firms/requests/${requestId}/bids${query}`);
}

// ============================================
// BIDDING
// ============================================

export interface SubmitBidData {
  requestId: string;
  firmId: string;
  assignedLawyerId?: string;
  bidAmount: number;
  deliveryDays: number;
  coverLetter?: string;
  inclusions?: string[];
  validDays?: number;
}

export async function submitBid(data: SubmitBidData) {
  return apiClient.post<ApiResponse<{ bidId: string; message: string }>>('/api/firms/bids', data);
}

export async function acceptBid(bidId: string) {
  return apiClient.post<ApiResponse<{ engagementId: string; message: string }>>(`/api/firms/bids/${bidId}/accept`);
}

// ============================================
// ENGAGEMENTS
// ============================================

export async function getUserEngagements(status?: EngagementStatus, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  return apiClient.get<ApiResponse<{ engagements: FirmEngagement[] } & PaginatedData<FirmEngagement>>>(
    `/api/firms/engagements?${params.toString()}`
  );
}

export async function payForEngagement(engagementId: string) {
  return apiClient.post<ApiResponse<{ message: string }>>(`/api/firms/engagements/${engagementId}/pay`);
}

export async function approveEngagement(engagementId: string) {
  return apiClient.post<ApiResponse<{ message: string }>>(`/api/firms/engagements/${engagementId}/approve`);
}

// ============================================
// REVIEWS
// ============================================

export interface SubmitReviewData {
  firmId: string;
  engagementId: string;
  overallRating: number;
  communicationRating?: number;
  expertiseRating?: number;
  timelinessRating?: number;
  valueRating?: number;
  title?: string;
  reviewText?: string;
}

export async function submitReview(data: SubmitReviewData) {
  return apiClient.post<ApiResponse<{ reviewId: string; message: string }>>('/api/firms/reviews', data);
}

// ============================================
// FIRM DASHBOARD
// ============================================

export async function getMyFirm() {
  return apiClient.get<ApiResponse<{ firm: LawFirm | null; membership: FirmMembership | null }>>('/api/firms/my-firm');
}

export async function getMyFirmBids(status?: BidStatus, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  return apiClient.get<ApiResponse<{ bids: RequestBid[] } & PaginatedData<RequestBid>>>(
    `/api/firms/my-firm/bids?${params.toString()}`
  );
}

export async function getMyFirmEngagements(status?: EngagementStatus, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  return apiClient.get<ApiResponse<{ engagements: FirmEngagement[] } & PaginatedData<FirmEngagement>>>(
    `/api/firms/my-firm/engagements?${params.toString()}`
  );
}

export async function completeEngagement(engagementId: string, deliverableUrl?: string) {
  return apiClient.post<ApiResponse<{ message: string }>>(
    `/api/firms/my-firm/engagements/${engagementId}/complete`,
    { deliverableUrl }
  );
}

// ============================================
// CONSTANTS
// ============================================

export const SERVICE_TYPES: { value: ServiceType; labelEn: string; labelAr: string }[] = [
  { value: 'consultation', labelEn: 'Legal Consultation', labelAr: 'استشارة قانونية' },
  { value: 'document_review', labelEn: 'Document Review', labelAr: 'مراجعة المستندات' },
  { value: 'document_drafting', labelEn: 'Document Drafting', labelAr: 'صياغة المستندات' },
  { value: 'case_representation', labelEn: 'Case Representation', labelAr: 'تمثيل القضايا' },
  { value: 'notarization', labelEn: 'Notarization', labelAr: 'التوثيق' },
  { value: 'translation', labelEn: 'Legal Translation', labelAr: 'الترجمة القانونية' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export const LEGAL_CATEGORIES: { value: string; labelEn: string; labelAr: string }[] = [
  { value: 'employment', labelEn: 'Employment Law', labelAr: 'قانون العمل' },
  { value: 'real_estate', labelEn: 'Real Estate', labelAr: 'العقارات' },
  { value: 'corporate', labelEn: 'Corporate / Commercial', labelAr: 'الشركات والتجارة' },
  { value: 'family', labelEn: 'Family Law', labelAr: 'قانون الأسرة' },
  { value: 'civil', labelEn: 'Civil Litigation', labelAr: 'القضايا المدنية' },
  { value: 'criminal', labelEn: 'Criminal Law', labelAr: 'القانون الجنائي' },
  { value: 'immigration', labelEn: 'Immigration', labelAr: 'الهجرة' },
  { value: 'intellectual_property', labelEn: 'Intellectual Property', labelAr: 'الملكية الفكرية' },
  { value: 'banking', labelEn: 'Banking & Finance', labelAr: 'البنوك والتمويل' },
  { value: 'maritime', labelEn: 'Maritime Law', labelAr: 'القانون البحري' },
  { value: 'construction', labelEn: 'Construction', labelAr: 'البناء والتشييد' },
  { value: 'insurance', labelEn: 'Insurance', labelAr: 'التأمين' },
];

export const EMIRATES: { value: string; labelEn: string; labelAr: string }[] = [
  { value: 'dubai', labelEn: 'Dubai', labelAr: 'دبي' },
  { value: 'abu_dhabi', labelEn: 'Abu Dhabi', labelAr: 'أبوظبي' },
  { value: 'sharjah', labelEn: 'Sharjah', labelAr: 'الشارقة' },
  { value: 'ajman', labelEn: 'Ajman', labelAr: 'عجمان' },
  { value: 'ras_al_khaimah', labelEn: 'Ras Al Khaimah', labelAr: 'رأس الخيمة' },
  { value: 'fujairah', labelEn: 'Fujairah', labelAr: 'الفجيرة' },
  { value: 'umm_al_quwain', labelEn: 'Umm Al Quwain', labelAr: 'أم القيوين' },
];

export const URGENCY_OPTIONS: { value: Urgency; labelEn: string; labelAr: string; days: string }[] = [
  { value: 'urgent', labelEn: 'Urgent', labelAr: 'عاجل', days: '24 hours' },
  { value: 'express', labelEn: 'Express', labelAr: 'سريع', days: '3 days' },
  { value: 'standard', labelEn: 'Standard', labelAr: 'عادي', days: '7 days' },
  { value: 'flexible', labelEn: 'Flexible', labelAr: 'مرن', days: 'No deadline' },
];

export const FIRM_SIZES: { value: FirmSize; labelEn: string; labelAr: string }[] = [
  { value: 'solo', labelEn: 'Solo Practitioner', labelAr: 'محامي منفرد' },
  { value: 'small', labelEn: 'Small (2-10 lawyers)', labelAr: 'صغير (2-10 محامين)' },
  { value: 'medium', labelEn: 'Medium (11-50 lawyers)', labelAr: 'متوسط (11-50 محامي)' },
  { value: 'large', labelEn: 'Large (50+ lawyers)', labelAr: 'كبير (50+ محامي)' },
];

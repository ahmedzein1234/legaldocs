// ============================================
// USER TYPES
// ============================================

export type UserRole = 'user' | 'lawyer' | 'admin' | 'org_admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  fullNameUr?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  uiLanguage: 'en' | 'ar' | 'ur';
  preferredDocLanguages: string[];
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  fullName: string;
  fullNameAr?: string;
  phone?: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'organizationId'>;
  token: string;
  expiresAt: number;
}

// ============================================
// DOCUMENT TYPES
// ============================================

export type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_signatures'
  | 'partially_signed'
  | 'signed'
  | 'certified'
  | 'archived';

export type DocumentType =
  | 'rental_agreement'
  | 'employment_contract'
  | 'service_agreement'
  | 'nda'
  | 'power_of_attorney'
  | 'sale_agreement'
  | 'partnership_agreement'
  | 'memorandum_of_understanding'
  | 'will'
  | 'custom';

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  titleAr?: string;
  titleUr?: string;
  documentType: DocumentType;
  contentEn?: Record<string, unknown>;
  contentAr?: Record<string, unknown>;
  contentUr?: Record<string, unknown>;
  languages: string[];
  bindingLanguage: string;
  status: DocumentStatus;
  templateId?: string;
  createdBy: string;
  organizationId?: string;
  blockchainHash?: string;
  pdfUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCreateInput {
  title: string;
  titleAr?: string;
  titleUr?: string;
  documentType: DocumentType;
  contentEn?: Record<string, unknown>;
  contentAr?: Record<string, unknown>;
  contentUr?: Record<string, unknown>;
  languages?: string[];
  bindingLanguage?: string;
  templateId?: string;
}

export interface DocumentUpdateInput {
  title?: string;
  titleAr?: string;
  titleUr?: string;
  contentEn?: Record<string, unknown>;
  contentAr?: Record<string, unknown>;
  contentUr?: Record<string, unknown>;
  status?: DocumentStatus;
}

// ============================================
// SIGNER TYPES
// ============================================

export type SignerStatus = 'pending' | 'viewed' | 'signed' | 'declined';

export interface DocumentSigner {
  id: string;
  documentId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  order: number;
  status: SignerStatus;
  signedAt?: string;
  signatureData?: string;
  ipAddress?: string;
  userAgent?: string;
  signingToken: string;
  tokenExpiresAt: string;
  createdAt: string;
}

export interface SignerCreateInput {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  order?: number;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface Template {
  id: string;
  name: string;
  nameAr?: string;
  nameUr?: string;
  category: string;
  description?: string;
  descriptionAr?: string;
  contentEn?: Record<string, unknown>;
  contentAr?: Record<string, unknown>;
  contentUr?: Record<string, unknown>;
  variables: TemplateVariable[];
  isPublic: boolean;
  createdBy?: string;
  organizationId?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  labelAr?: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  defaultValue?: string;
  options?: { value: string; label: string; labelAr?: string }[];
}

// ============================================
// LAWYER MARKETPLACE TYPES
// ============================================

export type LawyerStatus = 'pending' | 'verified' | 'suspended' | 'inactive';

export interface Lawyer {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  avatarUrl?: string;
  title: string;
  bio?: string;
  yearsExperience: number;
  languages: string[];
  barNumber?: string;
  barAssociation?: string;
  licenseNumber?: string;
  licenseCountry: string;
  licenseEmirate?: string;
  licenseVerified: boolean;
  licenseVerifiedAt?: string;
  country: string;
  emirate?: string;
  city?: string;
  officeAddress?: string;
  specializations: string[];
  documentTypes: string[];
  consultationFee: number;
  hourlyRate?: number;
  minProjectFee?: number;
  currency: string;
  isAvailable: boolean;
  responseTimeHours: number;
  totalReviews: number;
  averageRating: number;
  totalCasesCompleted: number;
  successRate: number;
  status: LawyerStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuoteRequestStatus =
  | 'open'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type ServiceType = 'review' | 'certify' | 'consult' | 'draft';

export type UrgencyLevel = 'standard' | 'urgent' | 'express';

export interface QuoteRequest {
  id: string;
  userId: string;
  documentId?: string;
  documentType: string;
  documentTitle?: string;
  documentSummary?: string;
  anonymizedContent?: string;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
  deadline?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  specialInstructions?: string;
  targetEmirate?: string;
  targetSpecialization?: string;
  preferredLanguages: string[];
  status: QuoteRequestStatus;
  acceptedQuoteId?: string;
  acceptedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type LawyerQuoteStatus =
  | 'pending'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'withdrawn';

export interface LawyerQuote {
  id: string;
  requestId: string;
  lawyerId: string;
  amount: number;
  currency: string;
  platformFee: number;
  totalAmount: number;
  estimatedHours?: number;
  estimatedDays?: number;
  deliveryDate?: string;
  coverLetter?: string;
  approachDescription?: string;
  inclusions: string[];
  exclusions?: string;
  status: LawyerQuoteStatus;
  viewedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'TOKEN_EXPIRED'
  | 'INVALID_TOKEN';

// ============================================
// GCC COUNTRY TYPES
// ============================================

export type GCCCountryCode = 'ae' | 'sa' | 'qa' | 'kw' | 'bh' | 'om';

export interface GCCJurisdiction {
  id: string;
  name: string;
  nameAr: string;
}

export interface GCCCountryConfig {
  code: GCCCountryCode;
  name: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
  languageRequired: 'ar_only' | 'ar_primary' | 'bilingual';
  eSignatureValid: boolean;
  eSignatureRequiresCertificate: boolean;
  eSignatureRestrictions: string[];
  notarizationRequired: string[];
  jurisdictions: GCCJurisdiction[];
  legalFramework: string;
  complianceNotes: string[];
}

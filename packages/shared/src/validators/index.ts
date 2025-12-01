import { z } from 'zod';

// ============================================
// AUTH VALIDATORS
// ============================================

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  fullNameAr: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ============================================
// DOCUMENT VALIDATORS
// ============================================

export const documentTypeSchema = z.enum([
  'rental_agreement',
  'employment_contract',
  'service_agreement',
  'nda',
  'power_of_attorney',
  'sale_agreement',
  'partnership_agreement',
  'memorandum_of_understanding',
  'will',
  'custom',
]);

export const documentStatusSchema = z.enum([
  'draft',
  'pending_review',
  'pending_signatures',
  'partially_signed',
  'signed',
  'certified',
  'archived',
]);

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  titleAr: z.string().max(200).optional(),
  titleUr: z.string().max(200).optional(),
  documentType: documentTypeSchema,
  contentEn: z.record(z.unknown()).optional(),
  contentAr: z.record(z.unknown()).optional(),
  contentUr: z.record(z.unknown()).optional(),
  languages: z.array(z.string()).default(['en']),
  bindingLanguage: z.string().default('ar'),
  templateId: z.string().uuid().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleAr: z.string().max(200).optional(),
  titleUr: z.string().max(200).optional(),
  contentEn: z.record(z.unknown()).optional(),
  contentAr: z.record(z.unknown()).optional(),
  contentUr: z.record(z.unknown()).optional(),
  status: documentStatusSchema.optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// ============================================
// SIGNER VALIDATORS
// ============================================

export const addSignerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  phone: z.string().optional(),
  role: z.string().max(50).default('Signer'),
  order: z.number().int().min(1).default(1),
});

export const signDocumentSchema = z.object({
  signatureData: z.string().min(1, 'Signature is required'),
});

export type AddSignerInput = z.infer<typeof addSignerSchema>;
export type SignDocumentInput = z.infer<typeof signDocumentSchema>;

// ============================================
// LAWYER MARKETPLACE VALIDATORS
// ============================================

export const serviceTypeSchema = z.enum(['review', 'certify', 'consult', 'draft']);
export const urgencySchema = z.enum(['standard', 'urgent', 'express']);

export const createQuoteRequestSchema = z.object({
  documentId: z.string().uuid().optional(),
  documentType: z.string().min(1),
  documentTitle: z.string().optional(),
  serviceType: serviceTypeSchema.default('review'),
  urgency: urgencySchema.default('standard'),
  deadline: z.string().datetime().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  currency: z.string().default('AED'),
  specialInstructions: z.string().max(1000).optional(),
  targetEmirate: z.string().optional(),
  targetSpecialization: z.string().optional(),
  preferredLanguages: z.array(z.string()).default(['en']),
});

export const submitQuoteSchema = z.object({
  amount: z.number().min(0, 'Amount is required'),
  currency: z.string().default('AED'),
  estimatedDays: z.number().int().min(1).optional(),
  deliveryDate: z.string().datetime().optional(),
  coverLetter: z.string().max(2000).optional(),
  inclusions: z.array(z.string()).default([]),
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type SubmitQuoteInput = z.infer<typeof submitQuoteSchema>;

// ============================================
// PAGINATION VALIDATORS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================
// ID VALIDATORS
// ============================================

export const uuidSchema = z.string().uuid('Invalid ID format');

export const idParamSchema = z.object({
  id: uuidSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

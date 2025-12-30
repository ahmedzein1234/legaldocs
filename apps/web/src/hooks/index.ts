/**
 * Custom React Query Hooks
 *
 * Centralized exports for all custom hooks in the LegalDocs application.
 * These hooks provide type-safe data fetching and state management using React Query.
 */

// Authentication hooks
export {
  useAuth,
  useAuthMutation,
  useCurrentUser,
} from './useAuth';

// Document hooks
export {
  useDocuments,
  useDocument,
  useDocumentMutations,
  useDocumentsWithMutations,
} from './useDocuments';

// Template hooks
export {
  useTemplates,
  useTemplate,
  useTemplateCategories,
  useTemplatesByCategory,
  useTemplateSearch,
  useTemplatesWithCategories,
} from './useTemplates';

// User profile hooks
export {
  useUser,
  useUserMutations,
  useUserPreferences,
} from './useUser';

// Signature hooks
export {
  useSignatures,
  useSignatureRequests,
  useSignatureRequest,
  useDocumentSignatures,
  useSignatureMutations,
} from './useSignatures';

// PDF generation hooks
export {
  usePdfGenerator,
  type PdfGeneratorOptions,
  type PdfPreviewOptions,
  type UsePdfGeneratorResult,
} from './usePdfGenerator';

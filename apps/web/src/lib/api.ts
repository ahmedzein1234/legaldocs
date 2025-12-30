/**
 * API Client for LegalDocs
 *
 * SECURITY: This client uses httpOnly cookies for authentication.
 * - Cookies are set by the backend via Set-Cookie headers
 * - Cookies are automatically included via credentials: 'include'
 * - No tokens are stored in localStorage (prevents XSS attacks)
 */

import { captureError } from './error-tracking';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Only log in browser during development
const isClient = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV === 'development';

const log = (...args: unknown[]) => {
  if (isClient && isDev) console.log(...args);
};

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const url = `${API_URL}${endpoint}`;
  log(`[API] ${method} ${url}`, body ? JSON.stringify(body).substring(0, 200) + '...' : '');

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Include httpOnly cookies in requests
  });

  log(`[API] Response status: ${response.status}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    // Send error to Sentry instead of console.error
    captureError(new Error(error.error || `API Error: ${response.status}`), {
      endpoint,
      method,
      status: response.status,
      response: error,
    });
    throw new Error(error.error || 'An error occurred');
  }

  const data = await response.json();
  log(`[API] Success response:`, JSON.stringify(data).substring(0, 200) + '...');
  return data;
}

// Auth API Response types (matching backend format)
interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

/**
 * Auth API
 * All endpoints use httpOnly cookies for authentication.
 * Tokens are NOT passed as parameters - they're sent automatically via cookies.
 */
export const authApi = {
  register: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    const response = await api<AuthResponse>('/api/auth/register', { method: 'POST', body: data });
    // Note: Backend sets httpOnly cookies via Set-Cookie header
    return { user: response.data.user };
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api<AuthResponse>('/api/auth/login', { method: 'POST', body: data });
    // Note: Backend sets httpOnly cookies via Set-Cookie header
    return { user: response.data.user };
  },

  me: async () => {
    // Auth cookie sent automatically
    const response = await api<MeResponse>('/api/auth/me');
    return { user: response.data.user };
  },

  logout: () =>
    // Backend clears httpOnly cookies
    api<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  refreshToken: async () => {
    // Refresh token cookie sent automatically
    const response = await api<{ success: boolean; data: { accessToken: string; refreshToken: string; expiresAt: number } }>(
      '/api/auth/refresh',
      { method: 'POST' }
    );
    // Note: Backend sets new httpOnly cookies via Set-Cookie header
    return response.data;
  },

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api<{ success: boolean }>('/api/auth/change-password', { method: 'POST', body: data }),

  updateProfile: (data: Partial<{ fullName: string; fullNameAr: string; phone: string; uiLanguage: string; preferredDocLanguages: string[] }>) =>
    api<{ success: boolean; data: { user: User } }>('/api/auth/profile', { method: 'PATCH', body: data }),
};

// Documents API - all endpoints use httpOnly cookies for auth
export const documentsApi = {
  list: () =>
    api<{ documents: Document[] }>('/api/documents'),

  get: (id: string) =>
    api<{ document: Document }>(`/api/documents/${id}`),

  create: (data: CreateDocumentInput) =>
    api<{ document: Document }>('/api/documents', { method: 'POST', body: data }),

  update: (id: string, data: Partial<CreateDocumentInput>) =>
    api<{ document: Document }>(`/api/documents/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    api<{ success: boolean }>(`/api/documents/${id}`, { method: 'DELETE' }),

  generate: (data: { prompt: string; documentType: string; languages: string[] }) =>
    api<{ success: boolean; generated: GeneratedContent; languages: string[] }>('/api/documents/generate', { method: 'POST', body: data }),

  download: (id: string) =>
    api<{ success: boolean; data: DocumentDownloadData }>(`/api/documents/${id}/download`),
};

// Document download response type
export interface DocumentDownloadData {
  documentId: string;
  documentNumber: string;
  title: string;
  titleAr?: string;
  documentType: string;
  status: string;
  contentEn?: unknown;
  contentAr?: unknown;
  languages: string[];
  bindingLanguage: string;
  owner: string;
  signers: Array<{
    name: string;
    email?: string;
    role: string;
    status: string;
    signedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Templates API - all endpoints use httpOnly cookies for auth
export const templatesApi = {
  list: () =>
    api<{ templates: Template[] }>('/api/templates'),

  categories: () =>
    api<{ categories: Category[] }>('/api/templates/categories'),
};

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  phone?: string;
  avatarUrl?: string;
  uiLanguage?: string;
  preferredDocLanguages?: string[];
}

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  titleAr?: string;
  titleUr?: string;
  documentType: string;
  contentEn?: string;
  contentAr?: string;
  contentUr?: string;
  languages: string[];
  bindingLanguage: string;
  status: 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';
  riskScore?: number;
  riskDetails?: string;
  blockchainHash?: string;
  blockchainTx?: string;
  createdAt: string;
  updatedAt: string;
  signers?: DocumentSigner[];
}

export interface DocumentSigner {
  id: string;
  documentId: string;
  email?: string;
  phone?: string;
  fullName: string;
  fullNameAr?: string;
  role?: string;
  signingOrder: number;
  status: 'pending' | 'viewed' | 'signed' | 'declined';
  preferredLanguage: string;
  signedAt?: string;
  viewedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  nameAr?: string;
  nameUr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionUr?: string;
  category: string;
  isPublic: boolean;
  isSystem: boolean;
  usageCount: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  nameUr: string;
}

export interface CreateDocumentInput {
  title: string;
  titleAr?: string;
  titleUr?: string;
  documentType: string;
  contentEn?: unknown;
  contentAr?: unknown;
  contentUr?: unknown;
  languages?: string[];
  bindingLanguage?: string;
}

export interface GeneratedContent {
  en?: { title: string; content: string };
  ar?: { title: string; content: string };
  ur?: { title: string; content: string };
}

// Case types
export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  titleAr?: string;
  description?: string;
  caseType: string;
  practiceArea?: string;
  jurisdiction: string;
  court?: string;
  status: 'open' | 'active' | 'pending' | 'on_hold' | 'closed' | 'won' | 'lost' | 'settled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  opposingParty?: string;
  opposingCounsel?: string;
  caseValue?: number;
  currency: string;
  billingType: 'hourly' | 'fixed' | 'contingency' | 'retainer';
  hourlyRate?: number;
  totalBilled: number;
  totalPaid: number;
  courtCaseNumber?: string;
  referenceNumber?: string;
  statuteOfLimitations?: string;
  nextHearingDate?: string;
  nextDeadline?: string;
  tags?: string[];
  notes?: string;
  dateOpened: string;
  dateClosed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseInput {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  caseType: string;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  priority?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  opposingParty?: string;
  opposingCounsel?: string;
  caseValue?: number;
  currency?: string;
  billingType?: string;
  hourlyRate?: number;
  retainerAmount?: number;
  courtCaseNumber?: string;
  referenceNumber?: string;
  statuteOfLimitations?: string;
  tags?: string[];
  notes?: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  taskType: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: string;
  assignedTo?: string;
  isCourtDeadline?: boolean;
  createdAt: string;
}

// Cases API
export const casesApi = {
  list: (params?: { page?: number; limit?: number; status?: string; caseType?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.caseType) searchParams.set('caseType', params.caseType);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return api<{ success: boolean; data: { cases: Case[]; meta: { page: number; limit: number; total: number; totalPages: number } } }>(
      `/api/cases${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) =>
    api<{ success: boolean; data: { case: Case & { tasks: CaseTask[]; notes: unknown[]; documents: unknown[]; timeEntries: unknown[] } } }>(
      `/api/cases/${id}`
    ),

  create: (data: CreateCaseInput) =>
    api<{ success: boolean; data: { case: Case } }>('/api/cases', { method: 'POST', body: data }),

  update: (id: string, data: Partial<CreateCaseInput & { status?: string; nextHearingDate?: string; nextDeadline?: string }>) =>
    api<{ success: boolean; data: { case: Case } }>(`/api/cases/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    api<{ success: boolean }>(`/api/cases/${id}`, { method: 'DELETE' }),

  stats: () =>
    api<{ success: boolean; data: { stats: unknown; upcomingDeadlines: CaseTask[]; overdueTasks: CaseTask[]; casesByType: unknown[] } }>(
      '/api/cases/stats'
    ),

  // Task management
  createTask: (caseId: string, data: { title: string; description?: string; taskType?: string; priority?: string; dueDate?: string; assignedTo?: string }) =>
    api<{ success: boolean; data: { task: CaseTask } }>(`/api/cases/${caseId}/tasks`, { method: 'POST', body: data }),

  updateTask: (caseId: string, taskId: string, data: Partial<{ title: string; status: string; dueDate: string; priority: string }>) =>
    api<{ success: boolean; data: { task: CaseTask } }>(`/api/cases/${caseId}/tasks/${taskId}`, { method: 'PATCH', body: data }),

  deleteTask: (caseId: string, taskId: string) =>
    api<{ success: boolean }>(`/api/cases/${caseId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Notes
  addNote: (caseId: string, data: { content: string; noteType?: string; isPrivate?: boolean }) =>
    api<{ success: boolean; data: { note: unknown } }>(`/api/cases/${caseId}/notes`, { method: 'POST', body: data }),

  // Time entries
  logTime: (caseId: string, data: { description: string; date: string; durationMinutes: number; activityType?: string; isBillable?: boolean }) =>
    api<{ success: boolean; data: { timeEntry: unknown } }>(`/api/cases/${caseId}/time`, { method: 'POST', body: data }),
};

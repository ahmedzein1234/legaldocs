// API Client for LegalDocs

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Only log in browser, not during SSR
const isClient = typeof window !== 'undefined';
const log = (...args: unknown[]) => {
  if (isClient) console.log(...args);
};
const logError = (...args: unknown[]) => {
  if (isClient) console.error(...args);
};

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  log(`[API] ${method} ${url}`, body ? JSON.stringify(body).substring(0, 200) + '...' : '');

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  log(`[API] Response status: ${response.status}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    logError(`[API] Error response:`, error);
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

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    const response = await api<AuthResponse>('/api/auth/register', { method: 'POST', body: data });
    return {
      user: response.data.user,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: response.data.expiresAt
    };
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api<AuthResponse>('/api/auth/login', { method: 'POST', body: data });
    return {
      user: response.data.user,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: response.data.expiresAt
    };
  },

  me: async (token: string) => {
    const response = await api<MeResponse>('/api/auth/me', { token });
    return { user: response.data.user };
  },

  logout: (token: string) =>
    api<{ success: boolean }>('/api/auth/logout', { method: 'POST', token }),

  refreshToken: async (refreshToken: string) => {
    const response = await api<{ success: boolean; data: { accessToken: string; refreshToken: string; expiresAt: number } }>(
      '/api/auth/refresh',
      { method: 'POST', body: { refreshToken } }
    );
    return response.data;
  },

  changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
    api<{ success: boolean }>('/api/auth/change-password', { method: 'POST', body: data, token }),

  updateProfile: (data: Partial<{ fullName: string; fullNameAr: string; phone: string; uiLanguage: string; preferredDocLanguages: string[] }>, token: string) =>
    api<{ success: boolean; data: { user: User } }>('/api/auth/profile', { method: 'PATCH', body: data, token }),
};

// Documents API
export const documentsApi = {
  list: (token: string) =>
    api<{ documents: Document[] }>('/api/documents', { token }),

  get: (id: string, token: string) =>
    api<{ document: Document }>(`/api/documents/${id}`, { token }),

  create: (data: CreateDocumentInput, token: string) =>
    api<{ document: Document }>('/api/documents', { method: 'POST', body: data, token }),

  update: (id: string, data: Partial<CreateDocumentInput>, token: string) =>
    api<{ document: Document }>(`/api/documents/${id}`, { method: 'PATCH', body: data, token }),

  delete: (id: string, token: string) =>
    api<{ success: boolean }>(`/api/documents/${id}`, { method: 'DELETE', token }),

  generate: (data: { prompt: string; documentType: string; languages: string[] }, token: string) =>
    api<{ success: boolean; generated: GeneratedContent; languages: string[] }>('/api/documents/generate', { method: 'POST', body: data, token }),
};

// Templates API
export const templatesApi = {
  list: (token: string) =>
    api<{ templates: Template[] }>('/api/templates', { token }),

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

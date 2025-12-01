/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    name: 'Admin User',
  },
  lawyer: {
    email: 'lawyer@example.com',
    password: 'LawyerPass123!',
    name: 'John Lawyer',
    barNumber: 'BAR123456',
  },
};

export const testDocuments = {
  rentalAgreement: {
    type: 'rental_agreement',
    title: 'Test Rental Agreement',
    landlordName: 'John Smith',
    tenantName: 'Jane Doe',
    propertyAddress: '123 Test Street, Dubai, UAE',
    monthlyRent: '5000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    securityDeposit: '5000',
  },
  depositReceipt: {
    type: 'deposit_receipt',
    title: 'Test Deposit Receipt',
    payerName: 'Jane Doe',
    payeeName: 'John Smith',
    amount: '5000',
    depositDate: '2024-01-01',
    propertyDetails: 'Marina Tower, Unit 123',
    paymentMethod: 'Bank Transfer',
  },
  nda: {
    type: 'nda',
    title: 'Test Non-Disclosure Agreement',
    disclosingParty: 'Tech Solutions LLC',
    receivingParty: 'Innovation Corp',
    effectiveDate: '2024-01-01',
    term: '2 years',
    jurisdiction: 'Dubai, UAE',
  },
  serviceAgreement: {
    type: 'service_agreement',
    title: 'Test Service Agreement',
    providerName: 'Service Provider Inc',
    clientName: 'Client Company Ltd',
    serviceDescription: 'Software development and consulting services',
    startDate: '2024-01-01',
    fee: '10000',
    paymentTerms: 'Monthly',
  },
};

export const testTemplates = {
  rental: {
    id: 'template-rental-001',
    name: 'Dubai Rental Agreement',
    category: 'Real Estate',
    language: 'en',
  },
  employment: {
    id: 'template-employment-001',
    name: 'Employment Contract',
    category: 'Employment',
    language: 'en',
  },
  nda: {
    id: 'template-nda-001',
    name: 'Non-Disclosure Agreement',
    category: 'Business',
    language: 'en',
  },
};

export const testSignatures = {
  singleSigner: {
    documentTitle: 'Test Document for Signing',
    signerEmail: 'signer@example.com',
    signerName: 'John Signer',
    message: 'Please sign this test document',
  },
  multipleSigners: {
    documentTitle: 'Multi-Signer Document',
    signers: [
      { email: 'signer1@example.com', name: 'First Signer' },
      { email: 'signer2@example.com', name: 'Second Signer' },
      { email: 'signer3@example.com', name: 'Third Signer' },
    ],
    message: 'Please all sign this document',
  },
};

export const testCases = {
  contractDispute: {
    title: 'Contract Dispute Case',
    description: 'Dispute regarding breach of contract terms',
    category: 'Contract Law',
    priority: 'high',
    documents: ['contract.pdf', 'correspondence.pdf'],
  },
  employmentIssue: {
    title: 'Employment Termination',
    description: 'Unfair dismissal claim',
    category: 'Employment Law',
    priority: 'medium',
    documents: ['employment_contract.pdf'],
  },
};

export const testConsultations = {
  rentalQuery: {
    question: 'What are my rights as a tenant in Dubai?',
    category: 'Real Estate',
    context: 'Landlord is trying to increase rent by 20%',
  },
  employmentQuery: {
    question: 'Can my employer terminate my contract without notice?',
    category: 'Employment',
    context: 'I have been working for 2 years',
  },
  contractQuery: {
    question: 'Is this non-compete clause enforceable?',
    category: 'Contract',
    context: 'The clause prevents me from working in the same industry for 5 years',
  },
};

export const testLawyers = {
  corporateLawyer: {
    name: 'Sarah Johnson',
    specialty: 'Corporate Law',
    experience: '15 years',
    rating: 4.8,
    hourlyRate: '500',
    languages: ['English', 'Arabic'],
  },
  familyLawyer: {
    name: 'Ahmed Al-Mansoori',
    specialty: 'Family Law',
    experience: '10 years',
    rating: 4.9,
    hourlyRate: '400',
    languages: ['Arabic', 'English'],
  },
};

export const invalidData = {
  email: {
    empty: '',
    invalid: 'notanemail',
    missingAt: 'test.com',
    missingDomain: 'test@',
  },
  password: {
    empty: '',
    tooShort: '123',
    noUppercase: 'password123!',
    noLowercase: 'PASSWORD123!',
    noNumber: 'Password!',
    noSpecial: 'Password123',
  },
  phone: {
    empty: '',
    invalid: '123',
    tooShort: '12345',
  },
  date: {
    empty: '',
    invalid: '2024-13-45',
    pastDate: '2020-01-01',
  },
};

export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  documents: {
    list: '/api/documents',
    create: '/api/documents',
    get: (id: string) => `/api/documents/${id}`,
    update: (id: string) => `/api/documents/${id}`,
    delete: (id: string) => `/api/documents/${id}`,
  },
  templates: {
    list: '/api/templates',
    get: (id: string) => `/api/templates/${id}`,
  },
  signatures: {
    list: '/api/signatures',
    create: '/api/signatures',
    get: (id: string) => `/api/signatures/${id}`,
    sign: (id: string) => `/api/signatures/${id}/sign`,
  },
  generate: {
    document: '/api/generate/document',
  },
};

export const mockApiResponses = {
  loginSuccess: {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    },
  },
  documentsList: {
    documents: [
      {
        id: '1',
        title: 'Test Document 1',
        type: 'rental_agreement',
        status: 'draft',
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        title: 'Test Document 2',
        type: 'nda',
        status: 'signed',
        createdAt: '2024-01-02',
      },
    ],
  },
};

export const testConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'ar'],
  defaultTimeout: 5000,
  longTimeout: 30000,
  shortTimeout: 1000,
};

export const pageUrls = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  dashboard: '/dashboard',
  documents: '/dashboard/documents',
  templates: '/dashboard/templates',
  signatures: '/dashboard/signatures',
  generate: '/dashboard/generate',
  advisor: '/dashboard/advisor',
  consult: '/dashboard/advisor/consult',
  review: '/dashboard/advisor/review',
  cases: '/dashboard/advisor/cases',
  lawyers: '/dashboard/lawyers',
  settings: '/dashboard/settings',
};

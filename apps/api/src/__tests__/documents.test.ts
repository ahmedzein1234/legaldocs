import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Document validation schemas (matching the routes)
const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  titleAr: z.string().max(200).optional(),
  titleUr: z.string().max(200).optional(),
  documentType: z.string().min(1, 'Document type is required'),
  contentEn: z.record(z.unknown()).optional(),
  contentAr: z.record(z.unknown()).optional(),
  contentUr: z.record(z.unknown()).optional(),
  languages: z.array(z.string()).default(['en']),
  bindingLanguage: z.string().default('ar'),
  templateId: z.string().uuid().optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleAr: z.string().max(200).optional(),
  titleUr: z.string().max(200).optional(),
  contentEn: z.record(z.unknown()).optional(),
  contentAr: z.record(z.unknown()).optional(),
  contentUr: z.record(z.unknown()).optional(),
  status: z
    .enum([
      'draft',
      'pending_review',
      'pending_signatures',
      'partially_signed',
      'signed',
      'certified',
      'archived',
    ])
    .optional(),
});

const addSignerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().max(50).default('Signer'),
  order: z.number().int().min(1).default(1),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

describe('Document Validation Schemas', () => {
  describe('Create Document Schema', () => {
    it('should accept valid document data', () => {
      const validData = {
        title: 'Employment Contract',
        documentType: 'employment_contract',
        languages: ['en', 'ar'],
        bindingLanguage: 'ar',
      };
      const result = createDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalData = {
        title: 'Simple Document',
        documentType: 'general',
      };
      const result = createDocumentSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.languages).toEqual(['en']);
        expect(result.data.bindingLanguage).toBe('ar');
      }
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        documentType: 'contract',
      };
      const result = createDocumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject title exceeding max length', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        documentType: 'contract',
      };
      const result = createDocumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept content as object', () => {
      const dataWithContent = {
        title: 'Contract with Content',
        documentType: 'contract',
        contentEn: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
        },
      };
      const result = createDocumentSchema.safeParse(dataWithContent);
      expect(result.success).toBe(true);
    });

    it('should validate templateId as UUID', () => {
      const validData = {
        title: 'Document',
        documentType: 'contract',
        templateId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = createDocumentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid templateId', () => {
      const invalidData = {
        title: 'Document',
        documentType: 'contract',
        templateId: 'not-a-uuid',
      };
      const result = createDocumentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Document Schema', () => {
    it('should accept partial updates', () => {
      const validUpdate = {
        title: 'Updated Title',
      };
      const result = updateDocumentSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should accept status updates', () => {
      const statusUpdate = {
        status: 'pending_signatures' as const,
      };
      const result = updateDocumentSchema.safeParse(statusUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidStatus = {
        status: 'invalid_status',
      };
      const result = updateDocumentSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('should accept empty update (all optional)', () => {
      const result = updateDocumentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('Add Signer Schema', () => {
    it('should accept valid signer data', () => {
      const validSigner = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Witness',
        order: 2,
      };
      const result = addSignerSchema.safeParse(validSigner);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalSigner = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      const result = addSignerSchema.safeParse(minimalSigner);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('Signer');
        expect(result.data.order).toBe(1);
      }
    });

    it('should reject invalid email', () => {
      const invalidSigner = {
        name: 'Invalid Email',
        email: 'not-an-email',
      };
      const result = addSignerSchema.safeParse(invalidSigner);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidSigner = {
        name: '',
        email: 'valid@example.com',
      };
      const result = addSignerSchema.safeParse(invalidSigner);
      expect(result.success).toBe(false);
    });

    it('should reject order less than 1', () => {
      const invalidSigner = {
        name: 'Test',
        email: 'test@example.com',
        order: 0,
      };
      const result = addSignerSchema.safeParse(invalidSigner);
      expect(result.success).toBe(false);
    });
  });

  describe('Pagination Schema', () => {
    it('should coerce string values to numbers', () => {
      const queryParams = {
        page: '2',
        limit: '50',
      };
      const result = paginationSchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should apply default values', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject page less than 1', () => {
      const invalidParams = {
        page: '0',
      };
      const result = paginationSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding max', () => {
      const invalidParams = {
        limit: '200',
      };
      const result = paginationSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should accept optional filters', () => {
      const withFilters = {
        status: 'draft',
        type: 'contract',
        search: 'employment',
      };
      const result = paginationSchema.safeParse(withFilters);
      expect(result.success).toBe(true);
    });
  });
});

describe('Document Business Logic', () => {
  describe('Document Number Generation', () => {
    function generateDocumentNumber(): string {
      const year = new Date().getFullYear();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `DR-${year}-${random}`;
    }

    it('should generate document number in correct format', () => {
      const docNumber = generateDocumentNumber();
      expect(docNumber).toMatch(/^DR-\d{4}-[A-Z0-9]{6}$/);
    });

    it('should include current year', () => {
      const docNumber = generateDocumentNumber();
      const currentYear = new Date().getFullYear();
      expect(docNumber).toContain(currentYear.toString());
    });

    it('should generate unique numbers', () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateDocumentNumber());
      }
      // High probability of uniqueness with 36^6 possibilities
      expect(numbers.size).toBe(100);
    });
  });

  describe('Signing Token Generation', () => {
    function generateSigningToken(): string {
      return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    }

    it('should generate token of correct length', () => {
      const token = generateSigningToken();
      // Two UUIDs without dashes: 32 + 32 = 64 characters
      expect(token.length).toBe(64);
    });

    it('should contain only alphanumeric characters', () => {
      const token = generateSigningToken();
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSigningToken());
      }
      expect(tokens.size).toBe(100);
    });
  });
});

describe('Document Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    draft: ['pending_review', 'pending_signatures', 'archived'],
    pending_review: ['draft', 'pending_signatures', 'archived'],
    pending_signatures: ['partially_signed', 'signed', 'archived'],
    partially_signed: ['signed', 'archived'],
    signed: ['certified', 'archived'],
    certified: ['archived'],
    archived: [],
  };

  function isValidTransition(from: string, to: string): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it('should allow draft to pending_signatures', () => {
    expect(isValidTransition('draft', 'pending_signatures')).toBe(true);
  });

  it('should allow pending_signatures to signed', () => {
    expect(isValidTransition('pending_signatures', 'signed')).toBe(true);
  });

  it('should not allow signed to draft', () => {
    expect(isValidTransition('signed', 'draft')).toBe(false);
  });

  it('should not allow any transition from archived', () => {
    expect(isValidTransition('archived', 'draft')).toBe(false);
    expect(isValidTransition('archived', 'signed')).toBe(false);
  });

  it('should allow archiving from any status', () => {
    expect(isValidTransition('draft', 'archived')).toBe(true);
    expect(isValidTransition('signed', 'archived')).toBe(true);
  });
});

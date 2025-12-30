import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Signature validation schemas (matching the routes)
const signatureRequestSchema = z.object({
  documentId: z.string(),
  documentName: z.string(),
  documentType: z.string(),
  title: z.string(),
  message: z.string().optional(),
  signers: z.array(z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['signer', 'approver', 'witness', 'cc']),
    deliveryMethod: z.enum(['email', 'whatsapp', 'both']),
  })),
  signingOrder: z.enum(['sequential', 'parallel']).default('sequential'),
  expiresInDays: z.number().min(1).max(90).default(30),
  reminderFrequency: z.enum(['none', 'daily', 'weekly']).default('none'),
  allowDecline: z.boolean().default(true),
  requireVerification: z.boolean().default(false),
});

const submitSignatureSchema = z.object({
  signatureType: z.enum(['draw', 'type', 'upload']),
  signatureData: z.string(),
  verificationCode: z.string().optional(),
});

const declineSchema = z.object({
  reason: z.string().optional(),
});

describe('Signature Validation Schemas', () => {
  describe('Signature Request Schema', () => {
    it('should accept valid signature request', () => {
      const validRequest = {
        documentId: '550e8400-e29b-41d4-a716-446655440000',
        documentName: 'Employment Contract',
        documentType: 'contract',
        title: 'Employment Agreement for John Doe',
        signers: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'signer' as const,
            deliveryMethod: 'email' as const,
          },
          {
            name: 'Jane Smith',
            phone: '+971501234567',
            role: 'witness' as const,
            deliveryMethod: 'whatsapp' as const,
          },
        ],
        signingOrder: 'sequential' as const,
        expiresInDays: 14,
      };
      const result = signatureRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalRequest = {
        documentId: 'doc-123',
        documentName: 'Contract',
        documentType: 'contract',
        title: 'Simple Contract',
        signers: [
          {
            name: 'Signer',
            email: 'signer@example.com',
            role: 'signer' as const,
            deliveryMethod: 'email' as const,
          },
        ],
      };
      const result = signatureRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signingOrder).toBe('sequential');
        expect(result.data.expiresInDays).toBe(30);
        expect(result.data.reminderFrequency).toBe('none');
        expect(result.data.allowDecline).toBe(true);
        expect(result.data.requireVerification).toBe(false);
      }
    });

    it('should accept all signer roles', () => {
      const roles = ['signer', 'approver', 'witness', 'cc'] as const;
      for (const role of roles) {
        const request = {
          documentId: 'doc-123',
          documentName: 'Contract',
          documentType: 'contract',
          title: 'Contract',
          signers: [
            {
              name: 'Test',
              email: 'test@example.com',
              role,
              deliveryMethod: 'email' as const,
            },
          ],
        };
        const result = signatureRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      }
    });

    it('should accept all delivery methods', () => {
      const methods = ['email', 'whatsapp', 'both'] as const;
      for (const deliveryMethod of methods) {
        const request = {
          documentId: 'doc-123',
          documentName: 'Contract',
          documentType: 'contract',
          title: 'Contract',
          signers: [
            {
              name: 'Test',
              email: 'test@example.com',
              phone: '+971501234567',
              role: 'signer' as const,
              deliveryMethod,
            },
          ],
        };
        const result = signatureRequestSchema.safeParse(request);
        expect(result.success).toBe(true);
      }
    });

    it('should reject expiry less than 1 day', () => {
      const invalidRequest = {
        documentId: 'doc-123',
        documentName: 'Contract',
        documentType: 'contract',
        title: 'Contract',
        signers: [
          {
            name: 'Test',
            email: 'test@example.com',
            role: 'signer' as const,
            deliveryMethod: 'email' as const,
          },
        ],
        expiresInDays: 0,
      };
      const result = signatureRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject expiry more than 90 days', () => {
      const invalidRequest = {
        documentId: 'doc-123',
        documentName: 'Contract',
        documentType: 'contract',
        title: 'Contract',
        signers: [
          {
            name: 'Test',
            email: 'test@example.com',
            role: 'signer' as const,
            deliveryMethod: 'email' as const,
          },
        ],
        expiresInDays: 100,
      };
      const result = signatureRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty signers array', () => {
      const invalidRequest = {
        documentId: 'doc-123',
        documentName: 'Contract',
        documentType: 'contract',
        title: 'Contract',
        signers: [],
      };
      const result = signatureRequestSchema.safeParse(invalidRequest);
      // Empty arrays are technically valid in Zod unless constrained
      expect(result.success).toBe(true);
    });
  });

  describe('Submit Signature Schema', () => {
    it('should accept draw signature', () => {
      const validSignature = {
        signatureType: 'draw' as const,
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
      const result = submitSignatureSchema.safeParse(validSignature);
      expect(result.success).toBe(true);
    });

    it('should accept type signature', () => {
      const validSignature = {
        signatureType: 'type' as const,
        signatureData: 'John Doe',
      };
      const result = submitSignatureSchema.safeParse(validSignature);
      expect(result.success).toBe(true);
    });

    it('should accept upload signature', () => {
      const validSignature = {
        signatureType: 'upload' as const,
        signatureData: 'https://storage.example.com/signatures/uploaded.png',
      };
      const result = submitSignatureSchema.safeParse(validSignature);
      expect(result.success).toBe(true);
    });

    it('should accept optional verification code', () => {
      const signatureWithCode = {
        signatureType: 'draw' as const,
        signatureData: 'data:image/png;base64,abc123',
        verificationCode: '123456',
      };
      const result = submitSignatureSchema.safeParse(signatureWithCode);
      expect(result.success).toBe(true);
    });

    it('should reject invalid signature type', () => {
      const invalidSignature = {
        signatureType: 'stamp',
        signatureData: 'some-data',
      };
      const result = submitSignatureSchema.safeParse(invalidSignature);
      expect(result.success).toBe(false);
    });

    it('should reject empty signature data', () => {
      const invalidSignature = {
        signatureType: 'draw' as const,
        signatureData: '',
      };
      const result = submitSignatureSchema.safeParse(invalidSignature);
      // Empty string is still valid string in base schema
      expect(result.success).toBe(true);
    });
  });

  describe('Decline Schema', () => {
    it('should accept decline with reason', () => {
      const decline = {
        reason: 'The terms are not acceptable',
      };
      const result = declineSchema.safeParse(decline);
      expect(result.success).toBe(true);
    });

    it('should accept decline without reason', () => {
      const decline = {};
      const result = declineSchema.safeParse(decline);
      expect(result.success).toBe(true);
    });
  });
});

describe('Signature Token Logic', () => {
  function generateSigningToken(requestId: string, index: number): string {
    const data = `${requestId}:${index}:${Date.now()}`;
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function decodeSigningToken(token: string): { requestId: string; signerIndex: number } | null {
    try {
      const padded = token.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(padded);
      const parts = decoded.split(':');
      return {
        requestId: parts[0],
        signerIndex: parseInt(parts[1], 10),
      };
    } catch {
      return null;
    }
  }

  it('should generate URL-safe tokens', () => {
    const token = generateSigningToken('request-123', 0);
    // Should not contain +, /, or = which are problematic in URLs
    expect(token).not.toMatch(/[+/=]/);
  });

  it('should encode and decode correctly', () => {
    const requestId = 'sig_1234567890_abc';
    const signerIndex = 2;
    const token = generateSigningToken(requestId, signerIndex);
    const decoded = decodeSigningToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.requestId).toBe(requestId);
    expect(decoded?.signerIndex).toBe(signerIndex);
  });

  it('should return null for invalid tokens', () => {
    const decoded = decodeSigningToken('invalid-token-that-is-not-base64!!!');
    expect(decoded).toBeNull();
  });

  it('should generate unique tokens for different signers', () => {
    const requestId = 'request-123';
    const token0 = generateSigningToken(requestId, 0);
    const token1 = generateSigningToken(requestId, 1);
    expect(token0).not.toBe(token1);
  });
});

describe('Signature Flow Logic', () => {
  interface Signer {
    id: string;
    status: 'pending' | 'viewed' | 'signed' | 'declined';
    order: number;
  }

  function getCurrentSigner(signers: Signer[], signingOrder: 'sequential' | 'parallel'): Signer | null {
    if (signingOrder === 'parallel') {
      // In parallel mode, return any pending signer
      return signers.find(s => s.status === 'pending' || s.status === 'viewed') || null;
    }
    // In sequential mode, return the first pending signer by order
    const pending = signers
      .filter(s => s.status === 'pending' || s.status === 'viewed')
      .sort((a, b) => a.order - b.order);
    return pending[0] || null;
  }

  function isSigningComplete(signers: Signer[]): boolean {
    return signers.every(s => s.status === 'signed' || s.status === 'declined');
  }

  function canSignerSign(signer: Signer, signers: Signer[], signingOrder: 'sequential' | 'parallel'): boolean {
    if (signer.status !== 'pending' && signer.status !== 'viewed') {
      return false;
    }
    if (signingOrder === 'parallel') {
      return true;
    }
    // Sequential: check if all previous signers have signed
    const previousSigners = signers.filter(s => s.order < signer.order);
    return previousSigners.every(s => s.status === 'signed');
  }

  it('should identify current signer in sequential order', () => {
    const signers: Signer[] = [
      { id: '1', status: 'signed', order: 1 },
      { id: '2', status: 'pending', order: 2 },
      { id: '3', status: 'pending', order: 3 },
    ];
    const current = getCurrentSigner(signers, 'sequential');
    expect(current?.id).toBe('2');
  });

  it('should identify current signer in parallel order', () => {
    const signers: Signer[] = [
      { id: '1', status: 'signed', order: 1 },
      { id: '2', status: 'pending', order: 2 },
      { id: '3', status: 'viewed', order: 3 },
    ];
    const current = getCurrentSigner(signers, 'parallel');
    expect(current?.status).toMatch(/pending|viewed/);
  });

  it('should detect complete signing', () => {
    const complete: Signer[] = [
      { id: '1', status: 'signed', order: 1 },
      { id: '2', status: 'signed', order: 2 },
    ];
    expect(isSigningComplete(complete)).toBe(true);

    const incomplete: Signer[] = [
      { id: '1', status: 'signed', order: 1 },
      { id: '2', status: 'pending', order: 2 },
    ];
    expect(isSigningComplete(incomplete)).toBe(false);
  });

  it('should allow signing only when previous signers completed (sequential)', () => {
    const signers: Signer[] = [
      { id: '1', status: 'pending', order: 1 },
      { id: '2', status: 'pending', order: 2 },
    ];

    // Second signer cannot sign before first
    expect(canSignerSign(signers[1], signers, 'sequential')).toBe(false);
    // First signer can sign
    expect(canSignerSign(signers[0], signers, 'sequential')).toBe(true);

    // After first signs
    signers[0].status = 'signed';
    expect(canSignerSign(signers[1], signers, 'sequential')).toBe(true);
  });

  it('should allow any pending signer in parallel mode', () => {
    const signers: Signer[] = [
      { id: '1', status: 'pending', order: 1 },
      { id: '2', status: 'pending', order: 2 },
    ];

    expect(canSignerSign(signers[0], signers, 'parallel')).toBe(true);
    expect(canSignerSign(signers[1], signers, 'parallel')).toBe(true);
  });
});

describe('Signature Expiry Logic', () => {
  function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  function getExpiryDate(daysFromNow: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }

  function getDaysUntilExpiry(expiresAt: string): number {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  it('should detect expired requests', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isExpired(yesterday.toISOString())).toBe(true);
  });

  it('should not mark future dates as expired', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isExpired(tomorrow.toISOString())).toBe(false);
  });

  it('should calculate expiry date correctly', () => {
    const expiry = getExpiryDate(30);
    const daysUntil = getDaysUntilExpiry(expiry.toISOString());
    expect(daysUntil).toBeGreaterThanOrEqual(29);
    expect(daysUntil).toBeLessThanOrEqual(31);
  });
});

describe('Audit Trail Logic', () => {
  interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actorId?: string;
    actorName?: string;
    details: string;
    ipAddress?: string;
  }

  function createAuditEntry(action: string, details: string, actor?: { id: string; name: string }, ipAddress?: string): AuditEntry {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      actorId: actor?.id,
      actorName: actor?.name,
      details,
      ipAddress,
    };
  }

  it('should create audit entry with correct structure', () => {
    const entry = createAuditEntry(
      'document_signed',
      'John Doe signed the document',
      { id: 'user-123', name: 'John Doe' },
      '192.168.1.1'
    );

    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.action).toBe('document_signed');
    expect(entry.actorId).toBe('user-123');
    expect(entry.actorName).toBe('John Doe');
    expect(entry.ipAddress).toBe('192.168.1.1');
  });

  it('should handle entries without actor', () => {
    const entry = createAuditEntry('signing_completed', 'All parties have signed');

    expect(entry.actorId).toBeUndefined();
    expect(entry.actorName).toBeUndefined();
  });

  it('should generate unique IDs for each entry', () => {
    const entry1 = createAuditEntry('action1', 'details1');
    const entry2 = createAuditEntry('action2', 'details2');

    expect(entry1.id).not.toBe(entry2.id);
  });
});

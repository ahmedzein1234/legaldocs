import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Case validation schemas (matching the routes)
const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  titleAr: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  caseType: z.string().min(1, 'Case type is required'),
  practiceArea: z.string().optional(),
  jurisdiction: z.string().optional().default('UAE'),
  court: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  opposingParty: z.string().optional(),
  opposingCounsel: z.string().optional(),
  caseValue: z.coerce.number().optional(),
  currency: z.string().default('AED'),
  billingType: z.enum(['hourly', 'fixed', 'contingency', 'retainer']).default('hourly'),
  hourlyRate: z.coerce.number().optional(),
  retainerAmount: z.coerce.number().optional(),
  courtCaseNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  statuteOfLimitations: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional(),
  taskType: z.string().default('general'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

const updateCaseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleAr: z.string().max(200).optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  caseType: z.string().optional(),
  practiceArea: z.string().optional(),
  jurisdiction: z.string().optional(),
  court: z.string().optional(),
  status: z.enum(['open', 'active', 'pending', 'on_hold', 'closed', 'won', 'lost', 'settled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  opposingParty: z.string().optional(),
  opposingCounsel: z.string().optional(),
  caseValue: z.coerce.number().optional(),
  currency: z.string().optional(),
  billingType: z.enum(['hourly', 'fixed', 'contingency', 'retainer']).optional(),
  hourlyRate: z.coerce.number().optional(),
  courtCaseNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  statuteOfLimitations: z.string().optional(),
  nextHearingDate: z.string().optional(),
  nextDeadline: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

describe('Case Validation Schemas', () => {
  describe('Create Case Schema', () => {
    it('should accept valid case data', () => {
      const validCase = {
        title: 'Corporate Merger Case',
        caseType: 'corporate',
        practiceArea: 'commercial',
        jurisdiction: 'Dubai',
        clientName: 'ABC Corporation',
        clientEmail: 'legal@abc.com',
        caseValue: 5000000,
        currency: 'AED',
        priority: 'high' as const,
      };
      const result = createCaseSchema.safeParse(validCase);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalCase = {
        title: 'Simple Case',
        caseType: 'civil',
      };
      const result = createCaseSchema.safeParse(minimalCase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.jurisdiction).toBe('UAE');
        expect(result.data.priority).toBe('medium');
        expect(result.data.currency).toBe('AED');
        expect(result.data.billingType).toBe('hourly');
      }
    });

    it('should reject empty title', () => {
      const invalidCase = {
        title: '',
        caseType: 'civil',
      };
      const result = createCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
    });

    it('should reject missing case type', () => {
      const invalidCase = {
        title: 'No Type Case',
      };
      const result = createCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidCase = {
        title: 'Invalid Priority',
        caseType: 'civil',
        priority: 'super-urgent',
      };
      const result = createCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
    });

    it('should accept empty string for optional email', () => {
      const caseWithEmptyEmail = {
        title: 'Case with Empty Email',
        caseType: 'civil',
        clientEmail: '',
      };
      const result = createCaseSchema.safeParse(caseWithEmptyEmail);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidCase = {
        title: 'Bad Email Case',
        caseType: 'civil',
        clientEmail: 'not-an-email',
      };
      const result = createCaseSchema.safeParse(invalidCase);
      expect(result.success).toBe(false);
    });

    it('should coerce numeric strings', () => {
      const caseWithStringNumbers = {
        title: 'String Numbers',
        caseType: 'civil',
        caseValue: '100000',
        hourlyRate: '500',
      };
      const result = createCaseSchema.safeParse(caseWithStringNumbers);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.caseValue).toBe(100000);
        expect(result.data.hourlyRate).toBe(500);
      }
    });

    it('should accept tags array', () => {
      const caseWithTags = {
        title: 'Tagged Case',
        caseType: 'civil',
        tags: ['urgent', 'vip', 'commercial'],
      };
      const result = createCaseSchema.safeParse(caseWithTags);
      expect(result.success).toBe(true);
    });
  });

  describe('Update Case Schema', () => {
    it('should accept partial updates', () => {
      const partialUpdate = {
        status: 'active' as const,
        priority: 'urgent' as const,
      };
      const result = updateCaseSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should accept all case statuses', () => {
      const statuses = ['open', 'active', 'pending', 'on_hold', 'closed', 'won', 'lost', 'settled'] as const;
      for (const status of statuses) {
        const result = updateCaseSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid status', () => {
      const invalidUpdate = {
        status: 'dismissed',
      };
      const result = updateCaseSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should accept date updates', () => {
      const dateUpdate = {
        nextHearingDate: '2024-06-15',
        nextDeadline: '2024-05-30',
      };
      const result = updateCaseSchema.safeParse(dateUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('Create Task Schema', () => {
    it('should accept valid task data', () => {
      const validTask = {
        title: 'Prepare Discovery Documents',
        description: 'Compile all relevant documents for discovery phase',
        taskType: 'document_prep',
        priority: 'high' as const,
        dueDate: '2024-05-15',
      };
      const result = createTaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalTask = {
        title: 'Simple Task',
      };
      const result = createTaskSchema.safeParse(minimalTask);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taskType).toBe('general');
        expect(result.data.priority).toBe('medium');
        expect(result.data.status).toBe('pending');
      }
    });

    it('should reject empty title', () => {
      const invalidTask = {
        title: '',
      };
      const result = createTaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should accept all task statuses', () => {
      const statuses = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
      for (const status of statuses) {
        const result = createTaskSchema.safeParse({ title: 'Task', status });
        expect(result.success).toBe(true);
      }
    });
  });
});

describe('Case Business Logic', () => {
  describe('Case Number Generation', () => {
    function generateCaseNumber(): string {
      const year = new Date().getFullYear();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `CASE-${year}-${random}`;
    }

    it('should generate case number in correct format', () => {
      const caseNumber = generateCaseNumber();
      expect(caseNumber).toMatch(/^CASE-\d{4}-[A-Z0-9]{6}$/);
    });

    it('should include current year', () => {
      const caseNumber = generateCaseNumber();
      const currentYear = new Date().getFullYear();
      expect(caseNumber).toContain(currentYear.toString());
    });
  });

  describe('Case Status Transitions', () => {
    const validTransitions: Record<string, string[]> = {
      open: ['active', 'pending', 'on_hold', 'closed'],
      active: ['pending', 'on_hold', 'closed', 'won', 'lost', 'settled'],
      pending: ['active', 'on_hold', 'closed'],
      on_hold: ['active', 'pending', 'closed'],
      closed: [], // Terminal state
      won: [],    // Terminal state
      lost: [],   // Terminal state
      settled: [], // Terminal state
    };

    function isValidStatusTransition(from: string, to: string): boolean {
      return validTransitions[from]?.includes(to) ?? false;
    }

    it('should allow open to active', () => {
      expect(isValidStatusTransition('open', 'active')).toBe(true);
    });

    it('should allow active to won/lost/settled', () => {
      expect(isValidStatusTransition('active', 'won')).toBe(true);
      expect(isValidStatusTransition('active', 'lost')).toBe(true);
      expect(isValidStatusTransition('active', 'settled')).toBe(true);
    });

    it('should not allow transitions from terminal states', () => {
      expect(isValidStatusTransition('closed', 'active')).toBe(false);
      expect(isValidStatusTransition('won', 'active')).toBe(false);
      expect(isValidStatusTransition('lost', 'active')).toBe(false);
    });
  });

  describe('Case Priority Scoring', () => {
    const priorityScore: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    };

    function sortCasesByPriority(cases: { title: string; priority: string }[]) {
      return [...cases].sort(
        (a, b) => (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0)
      );
    }

    it('should sort cases by priority correctly', () => {
      const cases = [
        { title: 'Low Priority', priority: 'low' },
        { title: 'Urgent Case', priority: 'urgent' },
        { title: 'Medium Priority', priority: 'medium' },
        { title: 'High Priority', priority: 'high' },
      ];

      const sorted = sortCasesByPriority(cases);
      expect(sorted[0].priority).toBe('urgent');
      expect(sorted[1].priority).toBe('high');
      expect(sorted[2].priority).toBe('medium');
      expect(sorted[3].priority).toBe('low');
    });
  });

  describe('Billing Calculations', () => {
    function calculateBilling(
      billingType: 'hourly' | 'fixed' | 'contingency' | 'retainer',
      hours: number,
      hourlyRate: number,
      fixedAmount?: number,
      contingencyPercentage?: number,
      caseValue?: number
    ): number {
      switch (billingType) {
        case 'hourly':
          return hours * hourlyRate;
        case 'fixed':
          return fixedAmount || 0;
        case 'contingency':
          return ((caseValue || 0) * (contingencyPercentage || 0)) / 100;
        case 'retainer':
          return fixedAmount || 0;
        default:
          return 0;
      }
    }

    it('should calculate hourly billing correctly', () => {
      const amount = calculateBilling('hourly', 10, 500);
      expect(amount).toBe(5000);
    });

    it('should calculate fixed billing correctly', () => {
      const amount = calculateBilling('fixed', 0, 0, 25000);
      expect(amount).toBe(25000);
    });

    it('should calculate contingency billing correctly', () => {
      const amount = calculateBilling('contingency', 0, 0, 0, 20, 1000000);
      expect(amount).toBe(200000);
    });
  });
});

describe('Task Due Date Logic', () => {
  function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  function getDaysUntilDue(dueDate: string | null): number | null {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  it('should detect overdue tasks', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    expect(isOverdue(pastDate.toISOString())).toBe(true);
  });

  it('should not mark future tasks as overdue', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    expect(isOverdue(futureDate.toISOString())).toBe(false);
  });

  it('should handle null due dates', () => {
    expect(isOverdue(null)).toBe(false);
    expect(getDaysUntilDue(null)).toBe(null);
  });

  it('should calculate days until due correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    futureDate.setHours(23, 59, 59, 999);
    const days = getDaysUntilDue(futureDate.toISOString());
    expect(days).toBeGreaterThanOrEqual(10);
    expect(days).toBeLessThanOrEqual(11);
  });
});

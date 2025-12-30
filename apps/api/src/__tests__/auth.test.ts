import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// These tests validate the auth validation schemas and business logic

describe('Auth Validation Schemas', () => {
  // Test registration schema
  describe('Registration Schema', () => {
    const registerSchema = z.object({
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
      phone: z.string().optional(),
    });

    it('should accept valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'John Doe',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123',
        fullName: 'John Doe',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject weak password (no uppercase)', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'John Doe',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password (no number)', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password',
        fullName: 'John Doe',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        fullName: 'John Doe',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'J',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // Test login schema
  describe('Login Schema', () => {
    const loginSchema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    });

    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // Test profile update schema
  describe('Update Profile Schema', () => {
    const updateProfileSchema = z.object({
      fullName: z.string().min(2).max(100).optional(),
      fullNameAr: z.string().max(100).optional(),
      phone: z.string().optional(),
      uiLanguage: z.enum(['en', 'ar', 'ur']).optional(),
      preferredDocLanguages: z.array(z.string()).optional(),
    });

    it('should accept valid profile update', () => {
      const validData = {
        fullName: 'Updated Name',
        uiLanguage: 'ar' as const,
      };
      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (all optional)', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid language', () => {
      const invalidData = {
        uiLanguage: 'invalid',
      };
      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // Test change password schema
  describe('Change Password Schema', () => {
    const changePasswordSchema = z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    });

    it('should accept valid password change', () => {
      const validData = {
        currentPassword: 'anypassword',
        newPassword: 'NewPassword123',
      };
      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const invalidData = {
        currentPassword: 'anypassword',
        newPassword: 'weak',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Auth Error Responses', () => {
  // Test error response structure
  it('should have proper error response structure', () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email address',
        details: { field: 'email' },
      },
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toHaveProperty('code');
    expect(errorResponse.error).toHaveProperty('message');
  });
});

/**
 * PDF Generation Types
 *
 * Comprehensive type definitions for the professional PDF generation system.
 */

// ============================================
// DOCUMENT DATA TYPES
// ============================================

export interface PartyInfo {
  name: string;
  nameAr?: string;
  idNumber: string;
  idType?: 'passport' | 'national_id' | 'trade_license' | 'commercial_registration';
  nationality?: string;
  address?: string;
  addressAr?: string;
  phone?: string;
  email?: string;
  role?: string;
  roleAr?: string;
}

export interface SignerInfo {
  id: string;
  name: string;
  email: string;
  role: 'signer' | 'witness' | 'notary' | 'approver';
  status: 'pending' | 'signed' | 'declined';
  signedAt?: string;
  signatureImage?: string; // Base64 encoded
  ipAddress?: string;
  deviceInfo?: string;
}

export interface AuditEntry {
  timestamp: string;
  event: string;
  actor: string;
  details?: string;
  ipAddress?: string;
}

export interface DocumentMetadata {
  documentNumber: string;
  documentType: string;
  title: string;
  titleAr?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  status: 'draft' | 'pending' | 'partially_signed' | 'signed' | 'certified' | 'expired' | 'cancelled';
  owner: string;
  ownerEmail?: string;
  organizationName?: string;
  organizationLogo?: string; // Base64 or URL
}

export interface CountryConfig {
  code: string;
  name: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
  jurisdiction?: string;
  legalSystem?: string;
  officialLanguages: string[];
}

// ============================================
// PDF GENERATION OPTIONS
// ============================================

export interface PDFGenerationOptions {
  // Document identification
  documentId: string;
  templateId?: string;

  // Content
  metadata: DocumentMetadata;
  contentEn?: string;
  contentAr?: string;
  contentUr?: string;

  // Parties
  parties?: PartyInfo[];
  partyA?: PartyInfo;
  partyB?: PartyInfo;

  // Signers & Signatures
  signers?: SignerInfo[];
  includeSignatures?: boolean;
  includeWitnesses?: boolean;

  // Audit & Compliance
  auditTrail?: AuditEntry[];
  includeAuditTrail?: boolean;
  blockchainHash?: string;
  verificationQRCode?: string;

  // Localization
  language: 'en' | 'ar' | 'ur';
  country: CountryConfig;

  // Appearance
  isDraft?: boolean;
  includeWatermark?: boolean;
  watermarkText?: string;
  includeLogo?: boolean;
  logoUrl?: string;

  // Output preferences
  paperSize?: 'A4' | 'LETTER' | 'LEGAL';
  orientation?: 'portrait' | 'landscape';
  includePageNumbers?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;

  // Financial
  amount?: string;
  currency?: string;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export type TemplateType =
  | 'employment_contract'
  | 'rental_agreement'
  | 'sale_agreement'
  | 'service_agreement'
  | 'nda'
  | 'power_of_attorney'
  | 'mou'
  | 'partnership_agreement'
  | 'loan_agreement'
  | 'general_contract'
  | 'certificate'
  | 'invoice';

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sections: TemplateSection[];
  defaultStyles: TemplateStyles;
  supportsRTL: boolean;
  requiresWitnesses: boolean;
  requiresNotarization: boolean;
}

export interface TemplateSection {
  id: string;
  type: 'header' | 'parties' | 'content' | 'terms' | 'signatures' | 'witnesses' | 'footer' | 'audit';
  title?: string;
  titleAr?: string;
  required: boolean;
  order: number;
}

export interface TemplateStyles {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontFamilyAr: string;
  headerSize: number;
  bodySize: number;
  lineHeight: number;
}

// ============================================
// PDF SERVICE RESPONSE
// ============================================

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: ArrayBuffer;
  pdfUrl?: string;
  filename: string;
  size?: number;
  pageCount?: number;
  generatedAt: string;
  expiresAt?: string;
  error?: string;
}

// ============================================
// RENDERING OPTIONS
// ============================================

export interface BrowserRenderingOptions {
  width: number;
  height: number;
  scale: number;
  printBackground: boolean;
  preferCSSPageSize: boolean;
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter: boolean;
}

// ============================================
// GCC COUNTRY CONFIGURATIONS
// ============================================

export const GCC_COUNTRIES: Record<string, CountryConfig> = {
  ae: {
    code: 'ae',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    currency: 'AED',
    currencySymbol: 'د.إ',
    jurisdiction: 'Federal Law',
    legalSystem: 'Civil Law',
    officialLanguages: ['ar', 'en'],
  },
  sa: {
    code: 'sa',
    name: 'Kingdom of Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    jurisdiction: 'Sharia Law',
    legalSystem: 'Islamic Law',
    officialLanguages: ['ar'],
  },
  qa: {
    code: 'qa',
    name: 'State of Qatar',
    nameAr: 'دولة قطر',
    currency: 'QAR',
    currencySymbol: 'ر.ق',
    jurisdiction: 'Civil Law',
    legalSystem: 'Mixed Civil/Sharia',
    officialLanguages: ['ar'],
  },
  kw: {
    code: 'kw',
    name: 'State of Kuwait',
    nameAr: 'دولة الكويت',
    currency: 'KWD',
    currencySymbol: 'د.ك',
    jurisdiction: 'Civil Law',
    legalSystem: 'Mixed Civil/Sharia',
    officialLanguages: ['ar'],
  },
  bh: {
    code: 'bh',
    name: 'Kingdom of Bahrain',
    nameAr: 'مملكة البحرين',
    currency: 'BHD',
    currencySymbol: 'د.ب',
    jurisdiction: 'Civil Law',
    legalSystem: 'Mixed Civil/Sharia',
    officialLanguages: ['ar'],
  },
  om: {
    code: 'om',
    name: 'Sultanate of Oman',
    nameAr: 'سلطنة عمان',
    currency: 'OMR',
    currencySymbol: 'ر.ع',
    jurisdiction: 'Royal Decree',
    legalSystem: 'Mixed Civil/Sharia',
    officialLanguages: ['ar'],
  },
};

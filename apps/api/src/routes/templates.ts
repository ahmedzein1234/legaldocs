import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/index.js';

// Types for Cloudflare bindings
type Bindings = {
  DB: D1Database;
};

type Variables = {
  userId: string;
  userRole: string;
};

const templates = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// COUNTRY CONFIGURATIONS
// ============================================

type CountryCode = 'ae' | 'sa' | 'qa' | 'kw' | 'bh' | 'om';

interface CountryConfig {
  name: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
  languageRequired: 'ar' | 'both' | 'any';
  eSignatureValid: boolean;
  jurisdictions: string[];
  complianceNotes: string[];
}

const countryConfigs: Record<CountryCode, CountryConfig> = {
  ae: {
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    currency: 'AED',
    currencySymbol: 'د.إ',
    languageRequired: 'both',
    eSignatureValid: true,
    jurisdictions: ['DIFC', 'ADGM', 'Mainland', 'Free Zone'],
    complianceNotes: [
      'Federal Law No. 1 of 2006 (E-commerce & Transactions)',
      'Contracts must be in Arabic for court validity',
      'Real estate requires notarization',
      'Employment contracts must follow MOL templates',
    ],
  },
  sa: {
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    languageRequired: 'ar',
    eSignatureValid: true,
    jurisdictions: ['Riyadh', 'Jeddah', 'Eastern Province'],
    complianceNotes: [
      'Arabic is mandatory for legal validity',
      'Sharia compliance required',
      'E-signature valid under Anti-Electronic Crimes Law',
      'Real estate requires Notary Public authentication',
    ],
  },
  qa: {
    name: 'Qatar',
    nameAr: 'قطر',
    currency: 'QAR',
    currencySymbol: 'ر.ق',
    languageRequired: 'both',
    eSignatureValid: true,
    jurisdictions: ['QFC', 'Mainland'],
    complianceNotes: [
      'Arabic required for government dealings',
      'E-signature valid under Law No. 16 of 2010',
      'Real estate requires authentication',
      'QFC operates under English common law framework',
      'Labor Law No. 14 of 2004 governs employment',
      'Commercial contracts follow Civil Code Law No. 22 of 2004',
    ],
  },
  kw: {
    name: 'Kuwait',
    nameAr: 'الكويت',
    currency: 'KWD',
    currencySymbol: 'د.ك',
    languageRequired: 'ar',
    eSignatureValid: true,
    jurisdictions: ['Mainland'],
    complianceNotes: [
      'Arabic is the official legal language',
      'E-signature valid under Law No. 20 of 2014',
      'Certain contracts require notarization',
      'Private Sector Labor Law No. 6 of 2010 governs employment',
      'Real estate transactions require Ministry of Justice authentication',
      'Commercial contracts follow Civil and Commercial Law',
    ],
  },
  bh: {
    name: 'Bahrain',
    nameAr: 'البحرين',
    currency: 'BHD',
    currencySymbol: 'د.ب',
    languageRequired: 'both',
    eSignatureValid: true,
    jurisdictions: ['Mainland', 'Financial Harbour'],
    complianceNotes: [
      'Arabic/English both accepted',
      'E-Signature Law of 2002',
      'Progressive digital government initiatives',
      'Labor Law for the Private Sector (Law No. 36 of 2012)',
      'Bahrain Financial Harbour operates under special regulations',
      'Commercial Companies Law governs corporate agreements',
      'Real estate registration with Survey and Land Registration Bureau',
    ],
  },
  om: {
    name: 'Oman',
    nameAr: 'عُمان',
    currency: 'OMR',
    currencySymbol: 'ر.ع',
    languageRequired: 'ar',
    eSignatureValid: true,
    jurisdictions: ['Muscat', 'Free Zones'],
    complianceNotes: [
      'Arabic mandatory for legal documents',
      'E-Transactions Law Royal Decree 69/2008',
      'Government contracts require Arabic',
      'Labor Law (Royal Decree 35/2003, amended by 113/2011)',
      'Free zones may have specific regulations',
      'Real estate transactions require notarization',
      'Commercial Law follows Civil and Commercial Code',
    ],
  },
};

// ============================================
// TEMPLATE ROUTES
// ============================================

/**
 * GET /api/templates
 * List all public/system templates
 */
templates.get('/', optionalAuthMiddleware, async (c) => {
  const db = c.env.DB;

  const result = await db
    .prepare(
      `SELECT * FROM templates
       WHERE is_system = 1 OR is_public = 1
       ORDER BY usage_count DESC, created_at DESC`
    )
    .all();

  return c.json({
    success: true,
    data: { templates: result.results },
  });
});

/**
 * GET /api/templates/categories
 * Get template categories
 */
templates.get('/categories', (c) => {
  const categories = [
    { id: 'real_estate', name: 'Real Estate', nameAr: 'العقارات', nameUr: 'رئیل اسٹیٹ' },
    { id: 'employment', name: 'Employment', nameAr: 'التوظيف', nameUr: 'ملازمت' },
    { id: 'general', name: 'General', nameAr: 'عام', nameUr: 'عام' },
    { id: 'nda', name: 'NDA', nameAr: 'عدم الإفصاح', nameUr: 'عدم افشاء' },
    { id: 'services', name: 'Services', nameAr: 'الخدمات', nameUr: 'خدمات' },
    { id: 'corporate', name: 'Corporate', nameAr: 'الشركات', nameUr: 'کارپوریٹ' },
    { id: 'family', name: 'Family Law', nameAr: 'قانون الأسرة', nameUr: 'خاندانی قانون' },
    { id: 'intellectual_property', name: 'IP', nameAr: 'الملكية الفكرية', nameUr: 'دانشورانہ ملکیت' },
  ];
  return c.json({
    success: true,
    data: { categories },
  });
});

/**
 * GET /api/templates/:id
 * Get a specific template
 */
templates.get('/:id', optionalAuthMiddleware, async (c) => {
  const { id } = c.req.param();
  const db = c.env.DB;

  const template = await db
    .prepare('SELECT * FROM templates WHERE id = ?')
    .bind(id)
    .first();

  if (!template) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } },
      404
    );
  }

  // Increment usage count
  await db
    .prepare('UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?')
    .bind(id)
    .run();

  return c.json({
    success: true,
    data: { template },
  });
});

// ============================================
// COUNTRY CONFIGURATION ROUTES
// ============================================

/**
 * GET /api/countries
 * Get all supported GCC countries
 */
templates.get('/countries/list', (c) => {
  const countries = Object.entries(countryConfigs).map(([code, config]) => ({
    code,
    name: config.name,
    nameAr: config.nameAr,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    languageRequired: config.languageRequired,
    eSignatureValid: config.eSignatureValid,
    jurisdictions: config.jurisdictions,
  }));

  return c.json({
    success: true,
    data: { countries },
  });
});

/**
 * GET /api/countries/:code
 * Get specific country configuration
 */
templates.get('/countries/:code', (c) => {
  const { code } = c.req.param();
  const config = countryConfigs[code as CountryCode];

  if (!config) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Country not found' } },
      404
    );
  }

  return c.json({
    success: true,
    data: {
      code,
      ...config,
    },
  });
});

/**
 * GET /api/compliance/:country/:documentType
 * Get compliance requirements for a document type in a country
 */
templates.get('/compliance/:country/:documentType', (c) => {
  const { country, documentType } = c.req.param();
  const config = countryConfigs[country as CountryCode];

  if (!config) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Country not found' } },
      404
    );
  }

  // Document type specific compliance
  const complianceRules: Record<string, Record<string, string[]>> = {
    ae: {
      employment: [
        'Must follow MOL standard template',
        'Probation period max 6 months',
        'Notice period must be specified',
        'Gratuity calculation must follow UAE Labor Law',
        'Bilingual required (English + Arabic)',
      ],
      real_estate: [
        'Must be registered with DLD (Dubai) or relevant authority',
        'Ejari registration required for rentals',
        'Arabic version required for court validity',
        'Power of Attorney for agents must be notarized',
      ],
      nda: [
        'E-signature valid',
        'Non-compete clauses limited to 2 years',
        'Must specify confidential information clearly',
      ],
      services: [
        'VAT compliance required',
        'Payment terms must be clear',
        'Dispute resolution mechanism required',
      ],
    },
    sa: {
      employment: [
        'Must be in Arabic',
        'Saudi Labor Law compliance',
        'GOSI registration required',
        'Wage Protection System (WPS) compliant',
      ],
      real_estate: [
        'Arabic mandatory',
        'Notarization required',
        'Registration with Ministry of Justice',
      ],
    },
    qa: {
      employment: [
        'Must comply with Labor Law No. 14 of 2004',
        'Bilingual contracts recommended (Arabic + English)',
        'Probation period maximum 6 months',
        'End of service benefits calculated per Labor Law',
        'Working hours limited to 48 hours per week',
        'Annual leave minimum 3 weeks after one year',
        'Notice period requirements must be specified',
      ],
      real_estate: [
        'Must be authenticated by relevant authority',
        'Arabic version required for legal enforcement',
        'Registration with Qatar Real Estate Registration Department',
        'Property ownership restrictions apply for non-GCC nationals',
        'Rental contracts require government registration',
        'Power of Attorney must be notarized',
      ],
      nda: [
        'E-signature valid under Law No. 16 of 2010',
        'Confidential information must be clearly defined',
        'Duration of confidentiality must be specified',
        'Non-compete clauses enforceable if reasonable',
        'QFC contracts may follow English common law',
      ],
      services: [
        'Payment terms must be clearly stated',
        'Scope of services must be detailed',
        'Dispute resolution mechanism required',
        'Liability and indemnity clauses recommended',
        'QFC jurisdiction requires specific drafting',
        'E-signature valid for commercial transactions',
      ],
      general: [
        'Arabic required for government contracts',
        'E-signature valid under Law No. 16 of 2010',
        'Civil Code Law No. 22 of 2004 applies',
        'QFC operates under English common law framework',
      ],
    },
    kw: {
      employment: [
        'Must comply with Private Sector Labor Law No. 6 of 2010',
        'Arabic is mandatory for legal validity',
        'Probation period maximum 100 days',
        'End of service indemnity as per Labor Law',
        'Working hours limited to 8 hours per day, 48 per week',
        'Annual leave minimum 30 days after one year',
        'Must specify salary and benefits clearly',
        'Social insurance registration required',
      ],
      real_estate: [
        'Arabic mandatory for all real estate contracts',
        'Notarization by Ministry of Justice required',
        'Registration with Real Estate Registration Department',
        'Property ownership restrictions for non-Kuwaitis',
        'Sale contracts require official witnesses',
        'Rental agreements must specify duration and rent',
      ],
      nda: [
        'E-signature valid under Law No. 20 of 2014',
        'Must be in Arabic for legal enforcement',
        'Confidential information clearly identified',
        'Non-compete duration should be reasonable',
        'Penalties for breach must be specified',
      ],
      services: [
        'Arabic version required for legal validity',
        'Clear description of services required',
        'Payment terms and schedule must be detailed',
        'Termination conditions must be specified',
        'Dispute resolution in Kuwaiti courts unless otherwise agreed',
        'E-signature valid under Law No. 20 of 2014',
      ],
      general: [
        'Arabic is the official legal language',
        'E-signature valid under Law No. 20 of 2014',
        'Notarization required for certain contracts',
        'Civil and Commercial Law applies',
      ],
    },
    bh: {
      employment: [
        'Must comply with Labor Law for Private Sector (Law No. 36 of 2012)',
        'Both Arabic and English accepted',
        'Probation period maximum 3 months (extendable to 6)',
        'End of service gratuity as per Labor Law',
        'Working hours maximum 48 hours per week',
        'Annual leave minimum 30 days after one year',
        'Notice period requirements must be specified',
        'LMRA (Labour Market Regulatory Authority) compliance required',
      ],
      real_estate: [
        'Registration with Survey and Land Registration Bureau required',
        'Arabic or English versions acceptable',
        'Sale contracts must be notarized',
        'Rental contracts should specify all terms clearly',
        'Property ownership rules vary by location',
        'Financial Harbour zone has special regulations',
      ],
      nda: [
        'E-signature valid under E-Signature Law of 2002',
        'Both Arabic and English accepted',
        'Confidential information must be clearly defined',
        'Duration and scope must be specified',
        'Non-compete clauses enforceable if reasonable',
        'Financial Harbour contracts may have specific requirements',
      ],
      services: [
        'Both Arabic and English accepted',
        'Clear scope of services required',
        'Payment terms and conditions must be detailed',
        'VAT compliance required (5% VAT)',
        'Liability and insurance requirements should be specified',
        'E-signature valid for commercial contracts',
        'Dispute resolution mechanism recommended',
      ],
      general: [
        'Arabic/English both accepted',
        'E-signature valid under 2002 law',
        'Commercial Companies Law applies to corporate agreements',
        'Financial Harbour operates under special framework',
      ],
    },
    om: {
      employment: [
        'Must comply with Labor Law (Royal Decree 35/2003, amended 113/2011)',
        'Arabic mandatory for legal validity',
        'Probation period maximum 3 months',
        'End of service benefits as per Labor Law',
        'Working hours limited to 45 hours per week (9 hours per day)',
        'Annual leave minimum 30 days after one year',
        'Notice period minimum 30 days (must be specified)',
        'Social security registration required',
      ],
      real_estate: [
        'Arabic mandatory for all real estate documents',
        'Notarization by Ministry of Justice required',
        'Registration with relevant authority required',
        'Property ownership restrictions for non-Omanis',
        'Sale contracts require authentication',
        'Rental contracts must be registered',
        'Integrated Tourism Complexes (ITC) have special rules',
      ],
      nda: [
        'E-signature valid under Royal Decree 69/2008',
        'Arabic required for legal enforcement',
        'Confidential information must be clearly identified',
        'Non-compete duration must be reasonable',
        'Scope and territory must be specified',
        'Free zones may have specific requirements',
      ],
      services: [
        'Arabic mandatory for legal validity',
        'Detailed scope of services required',
        'Payment terms and schedule must be clear',
        'Termination provisions must be specified',
        'Liability and indemnification clauses recommended',
        'E-signature valid under Royal Decree 69/2008',
        'Free zone contracts may have special requirements',
      ],
      general: [
        'Arabic mandatory for legal documents',
        'E-signature valid under Royal Decree 69/2008',
        'Notarization required for certain contracts',
        'Free zones may operate under different regulations',
      ],
    },
  };

  const rules = complianceRules[country]?.[documentType] || config.complianceNotes;

  return c.json({
    success: true,
    data: {
      country: config.name,
      documentType,
      requirements: rules,
      languageRequired: config.languageRequired,
      eSignatureValid: config.eSignatureValid,
    },
  });
});

export { templates, countryConfigs };
export type { CountryCode, CountryConfig };

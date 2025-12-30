/**
 * Document Recommendations System
 *
 * Provides personalized document recommendations based on:
 * - User's document history
 * - Popular document types
 * - Related document suggestions
 * - User role/type
 */

export interface DocumentRecommendation {
  documentType: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  reason: string;
  reasonAr: string;
  priority: number; // 1-10, higher = more recommended
  category: 'history_based' | 'popular' | 'related' | 'role_based' | 'seasonal';
}

// Document type relationships - if user created X, they might need Y
const RELATED_DOCUMENTS: Record<string, string[]> = {
  // Business formation documents
  'company_formation': ['shareholder_agreement', 'articles_of_association', 'board_resolution', 'power_of_attorney'],
  'shareholder_agreement': ['share_transfer', 'board_resolution', 'dividend_resolution'],
  'articles_of_association': ['board_resolution', 'shareholder_agreement', 'company_formation'],

  // Employment documents
  'employment_contract': ['nda', 'non_compete', 'termination_letter', 'salary_certificate'],
  'offer_letter': ['employment_contract', 'nda'],
  'termination_letter': ['final_settlement', 'experience_certificate', 'clearance_certificate'],
  'nda': ['employment_contract', 'consultancy_agreement', 'service_agreement'],

  // Property documents
  'tenancy_contract': ['ejari_registration', 'tenancy_renewal', 'notice_to_vacate'],
  'property_sale': ['mortgage_agreement', 'property_transfer', 'power_of_attorney'],
  'mortgage_agreement': ['property_sale', 'property_transfer'],

  // Commercial documents
  'service_agreement': ['nda', 'invoice_template', 'payment_terms'],
  'consultancy_agreement': ['nda', 'service_agreement', 'invoice_template'],
  'partnership_agreement': ['profit_sharing', 'partnership_dissolution', 'nda'],

  // Legal documents
  'power_of_attorney': ['affidavit', 'authorization_letter'],
  'affidavit': ['statutory_declaration', 'witness_statement'],
  'will': ['trust_deed', 'power_of_attorney', 'beneficiary_designation'],

  // Immigration/visa documents
  'visa_application': ['sponsorship_letter', 'employment_contract', 'salary_certificate'],
  'sponsorship_letter': ['employment_contract', 'salary_certificate'],
};

// Popular documents by user role
const ROLE_RECOMMENDATIONS: Record<string, string[]> = {
  'business_owner': [
    'company_formation',
    'shareholder_agreement',
    'employment_contract',
    'nda',
    'service_agreement',
    'power_of_attorney',
  ],
  'employee': [
    'employment_contract',
    'salary_certificate',
    'experience_certificate',
    'resignation_letter',
    'leave_application',
  ],
  'landlord': [
    'tenancy_contract',
    'tenancy_renewal',
    'notice_to_vacate',
    'rent_receipt',
    'property_management',
  ],
  'tenant': [
    'tenancy_contract',
    'rent_receipt',
    'maintenance_request',
    'notice_to_vacate',
  ],
  'freelancer': [
    'service_agreement',
    'consultancy_agreement',
    'nda',
    'invoice_template',
    'freelance_contract',
  ],
  'investor': [
    'shareholder_agreement',
    'investment_agreement',
    'partnership_agreement',
    'nda',
    'due_diligence',
  ],
  'default': [
    'power_of_attorney',
    'nda',
    'service_agreement',
    'employment_contract',
    'affidavit',
  ],
};

// Document type metadata
const DOCUMENT_METADATA: Record<string, {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
}> = {
  'company_formation': {
    title: 'Company Formation',
    titleAr: 'تأسيس شركة',
    description: 'Start a new business entity in UAE',
    descriptionAr: 'تأسيس كيان تجاري جديد في الإمارات',
  },
  'shareholder_agreement': {
    title: 'Shareholder Agreement',
    titleAr: 'اتفاقية المساهمين',
    description: 'Define rights and obligations between shareholders',
    descriptionAr: 'تحديد الحقوق والالتزامات بين المساهمين',
  },
  'employment_contract': {
    title: 'Employment Contract',
    titleAr: 'عقد العمل',
    description: 'UAE-compliant employment agreement',
    descriptionAr: 'عقد توظيف متوافق مع قوانين الإمارات',
  },
  'nda': {
    title: 'Non-Disclosure Agreement',
    titleAr: 'اتفاقية عدم الإفصاح',
    description: 'Protect confidential business information',
    descriptionAr: 'حماية المعلومات التجارية السرية',
  },
  'tenancy_contract': {
    title: 'Tenancy Contract',
    titleAr: 'عقد الإيجار',
    description: 'Rental agreement for residential or commercial property',
    descriptionAr: 'عقد إيجار للعقارات السكنية أو التجارية',
  },
  'power_of_attorney': {
    title: 'Power of Attorney',
    titleAr: 'توكيل رسمي',
    description: 'Authorize someone to act on your behalf',
    descriptionAr: 'تفويض شخص للتصرف نيابة عنك',
  },
  'service_agreement': {
    title: 'Service Agreement',
    titleAr: 'اتفاقية الخدمات',
    description: 'Contract for professional services',
    descriptionAr: 'عقد للخدمات المهنية',
  },
  'consultancy_agreement': {
    title: 'Consultancy Agreement',
    titleAr: 'اتفاقية الاستشارات',
    description: 'Contract for consulting services',
    descriptionAr: 'عقد لخدمات الاستشارات',
  },
  'board_resolution': {
    title: 'Board Resolution',
    titleAr: 'قرار مجلس الإدارة',
    description: 'Official company board decision',
    descriptionAr: 'قرار رسمي لمجلس إدارة الشركة',
  },
  'affidavit': {
    title: 'Affidavit',
    titleAr: 'إقرار موثق',
    description: 'Sworn statement for legal purposes',
    descriptionAr: 'بيان مُقسَم للأغراض القانونية',
  },
  'will': {
    title: 'Last Will & Testament',
    titleAr: 'الوصية',
    description: 'Estate planning document',
    descriptionAr: 'وثيقة تخطيط الميراث',
  },
  'salary_certificate': {
    title: 'Salary Certificate',
    titleAr: 'شهادة راتب',
    description: 'Official salary confirmation letter',
    descriptionAr: 'خطاب تأكيد الراتب الرسمي',
  },
  'termination_letter': {
    title: 'Termination Letter',
    titleAr: 'خطاب إنهاء الخدمة',
    description: 'Employment termination notice',
    descriptionAr: 'إشعار إنهاء علاقة العمل',
  },
  'resignation_letter': {
    title: 'Resignation Letter',
    titleAr: 'خطاب الاستقالة',
    description: 'Formal resignation notice',
    descriptionAr: 'إشعار الاستقالة الرسمي',
  },
  'invoice_template': {
    title: 'Invoice Template',
    titleAr: 'نموذج فاتورة',
    description: 'Professional billing template',
    descriptionAr: 'نموذج فواتير احترافي',
  },
};

// Get metadata for a document type, with fallback
function getDocumentMetadata(docType: string): {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
} {
  return DOCUMENT_METADATA[docType] || {
    title: docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    titleAr: docType,
    description: `Create a ${docType.replace(/_/g, ' ')} document`,
    descriptionAr: `إنشاء مستند ${docType}`,
  };
}

/**
 * Get related document recommendations based on a document type
 */
export function getRelatedDocuments(documentType: string): DocumentRecommendation[] {
  const related = RELATED_DOCUMENTS[documentType] || [];

  return related.map((docType, index) => {
    const metadata = getDocumentMetadata(docType);
    return {
      documentType: docType,
      ...metadata,
      reason: `Often needed alongside ${documentType.replace(/_/g, ' ')}`,
      reasonAr: `غالباً ما يُطلب مع ${documentType}`,
      priority: 8 - index, // First items have higher priority
      category: 'related' as const,
    };
  });
}

/**
 * Get role-based document recommendations
 */
export function getRoleRecommendations(userRole: string): DocumentRecommendation[] {
  const roleTypes = ROLE_RECOMMENDATIONS[userRole] || ROLE_RECOMMENDATIONS['default'];

  return roleTypes.map((docType, index) => {
    const metadata = getDocumentMetadata(docType);
    return {
      documentType: docType,
      ...metadata,
      reason: `Popular for ${userRole.replace(/_/g, ' ')}s`,
      reasonAr: `شائع لـ ${userRole}`,
      priority: 7 - (index * 0.5),
      category: 'role_based' as const,
    };
  });
}

/**
 * Get personalized recommendations for a user based on their document history
 */
export async function getPersonalizedRecommendations(
  db: D1Database,
  userId: string,
  options: {
    limit?: number;
    excludeTypes?: string[];
    userRole?: string;
  } = {}
): Promise<DocumentRecommendation[]> {
  const { limit = 6, excludeTypes = [], userRole = 'default' } = options;
  const recommendations: DocumentRecommendation[] = [];
  const seenTypes = new Set<string>(excludeTypes);

  // 1. Get user's recent document types
  const userDocsResult = await db
    .prepare(`
      SELECT document_type, COUNT(*) as count
      FROM documents
      WHERE created_by = ?
      GROUP BY document_type
      ORDER BY MAX(created_at) DESC
      LIMIT 5
    `)
    .bind(userId)
    .all();

  const userDocTypes = (userDocsResult.results || []) as { document_type: string; count: number }[];

  // 2. Add related documents based on user's history
  for (const doc of userDocTypes) {
    const related = getRelatedDocuments(doc.document_type);
    for (const rec of related) {
      if (!seenTypes.has(rec.documentType)) {
        seenTypes.add(rec.documentType);
        rec.reason = `Based on your ${doc.document_type.replace(/_/g, ' ')} documents`;
        rec.reasonAr = `بناءً على مستندات ${doc.document_type} الخاصة بك`;
        rec.category = 'history_based';
        recommendations.push(rec);
      }
    }
  }

  // 3. Get popular documents across platform
  const popularResult = await db
    .prepare(`
      SELECT document_type, COUNT(*) as count
      FROM documents
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY document_type
      ORDER BY count DESC
      LIMIT 10
    `)
    .all();

  const popularTypes = (popularResult.results || []) as { document_type: string; count: number }[];

  for (const pop of popularTypes) {
    if (!seenTypes.has(pop.document_type)) {
      seenTypes.add(pop.document_type);
      const metadata = getDocumentMetadata(pop.document_type);
      recommendations.push({
        documentType: pop.document_type,
        ...metadata,
        reason: 'Popular this month',
        reasonAr: 'شائع هذا الشهر',
        priority: 5,
        category: 'popular',
      });
    }
  }

  // 4. Add role-based recommendations if not enough
  if (recommendations.length < limit && userRole) {
    const roleRecs = getRoleRecommendations(userRole);
    for (const rec of roleRecs) {
      if (!seenTypes.has(rec.documentType)) {
        seenTypes.add(rec.documentType);
        recommendations.push(rec);
      }
    }
  }

  // Sort by priority and limit
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/**
 * Get general popular documents (for non-authenticated users)
 */
export async function getPopularDocuments(
  db: D1Database,
  limit: number = 6
): Promise<DocumentRecommendation[]> {
  const popularResult = await db
    .prepare(`
      SELECT document_type, COUNT(*) as count
      FROM documents
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY document_type
      ORDER BY count DESC
      LIMIT ?
    `)
    .bind(limit)
    .all();

  const popularTypes = (popularResult.results || []) as { document_type: string; count: number }[];

  // If no recent documents, return default popular types
  if (popularTypes.length === 0) {
    const defaultPopular = [
      'employment_contract',
      'nda',
      'power_of_attorney',
      'tenancy_contract',
      'service_agreement',
      'company_formation',
    ];

    return defaultPopular.slice(0, limit).map((docType, index) => {
      const metadata = getDocumentMetadata(docType);
      return {
        documentType: docType,
        ...metadata,
        reason: 'Most commonly created document',
        reasonAr: 'المستند الأكثر إنشاءً',
        priority: 10 - index,
        category: 'popular' as const,
      };
    });
  }

  return popularTypes.map((pop, index) => {
    const metadata = getDocumentMetadata(pop.document_type);
    return {
      documentType: pop.document_type,
      ...metadata,
      reason: 'Popular this month',
      reasonAr: 'شائع هذا الشهر',
      priority: 10 - index,
      category: 'popular' as const,
    };
  });
}

/**
 * Get document suggestions based on a specific document
 */
export async function getDocumentSuggestions(
  db: D1Database,
  documentId: string
): Promise<DocumentRecommendation[]> {
  // Get the document type
  const doc = await db
    .prepare('SELECT document_type, created_by FROM documents WHERE id = ?')
    .bind(documentId)
    .first<{ document_type: string; created_by: string }>();

  if (!doc) return [];

  // Get related documents
  const related = getRelatedDocuments(doc.document_type);

  // Filter out documents the user already has
  const existingTypesResult = await db
    .prepare(`
      SELECT DISTINCT document_type FROM documents
      WHERE created_by = ?
    `)
    .bind(doc.created_by)
    .all();

  const existingTypes = new Set(
    ((existingTypesResult.results || []) as { document_type: string }[])
      .map(r => r.document_type)
  );

  return related.filter(rec => !existingTypes.has(rec.documentType));
}

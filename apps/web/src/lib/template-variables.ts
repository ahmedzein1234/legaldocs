/**
 * Template Variables System for Legal Documents
 * Provides placeholder management, variable replacement, and tracking
 */

export interface TemplateVariable {
  id: string;
  name: string;
  nameAr: string;
  category: 'party_a' | 'party_b' | 'document' | 'financial' | 'dates' | 'property' | 'custom';
  placeholder: string;
  description: string;
  descriptionAr: string;
  required: boolean;
  defaultValue?: string;
  format?: 'text' | 'date' | 'currency' | 'number' | 'email' | 'phone';
}

// Standard legal document variables
export const standardVariables: TemplateVariable[] = [
  // Party A Variables
  {
    id: 'party_a_name',
    name: 'Party A Name',
    nameAr: 'اسم الطرف الأول',
    category: 'party_a',
    placeholder: '{{party_a_name}}',
    description: 'Full legal name of the first party',
    descriptionAr: 'الاسم القانوني الكامل للطرف الأول',
    required: true,
    format: 'text',
  },
  {
    id: 'party_a_id',
    name: 'Party A ID Number',
    nameAr: 'رقم هوية الطرف الأول',
    category: 'party_a',
    placeholder: '{{party_a_id}}',
    description: 'ID/Passport/Emirates ID of first party',
    descriptionAr: 'رقم الهوية/جواز السفر/الهوية الإماراتية للطرف الأول',
    required: true,
    format: 'text',
  },
  {
    id: 'party_a_nationality',
    name: 'Party A Nationality',
    nameAr: 'جنسية الطرف الأول',
    category: 'party_a',
    placeholder: '{{party_a_nationality}}',
    description: 'Nationality of first party',
    descriptionAr: 'جنسية الطرف الأول',
    required: false,
    format: 'text',
  },
  {
    id: 'party_a_address',
    name: 'Party A Address',
    nameAr: 'عنوان الطرف الأول',
    category: 'party_a',
    placeholder: '{{party_a_address}}',
    description: 'Full address of first party',
    descriptionAr: 'العنوان الكامل للطرف الأول',
    required: true,
    format: 'text',
  },
  {
    id: 'party_a_phone',
    name: 'Party A Phone',
    nameAr: 'هاتف الطرف الأول',
    category: 'party_a',
    placeholder: '{{party_a_phone}}',
    description: 'Phone number of first party',
    descriptionAr: 'رقم هاتف الطرف الأول',
    required: false,
    format: 'phone',
  },
  {
    id: 'party_a_email',
    name: 'Party A Email',
    nameAr: 'بريد الطرف الأول',
    category: 'party_a',
    placeholder: '{{party_a_email}}',
    description: 'Email address of first party',
    descriptionAr: 'البريد الإلكتروني للطرف الأول',
    required: false,
    format: 'email',
  },

  // Party B Variables
  {
    id: 'party_b_name',
    name: 'Party B Name',
    nameAr: 'اسم الطرف الثاني',
    category: 'party_b',
    placeholder: '{{party_b_name}}',
    description: 'Full legal name of the second party',
    descriptionAr: 'الاسم القانوني الكامل للطرف الثاني',
    required: true,
    format: 'text',
  },
  {
    id: 'party_b_id',
    name: 'Party B ID Number',
    nameAr: 'رقم هوية الطرف الثاني',
    category: 'party_b',
    placeholder: '{{party_b_id}}',
    description: 'ID/Passport/Emirates ID of second party',
    descriptionAr: 'رقم الهوية/جواز السفر/الهوية الإماراتية للطرف الثاني',
    required: true,
    format: 'text',
  },
  {
    id: 'party_b_nationality',
    name: 'Party B Nationality',
    nameAr: 'جنسية الطرف الثاني',
    category: 'party_b',
    placeholder: '{{party_b_nationality}}',
    description: 'Nationality of second party',
    descriptionAr: 'جنسية الطرف الثاني',
    required: false,
    format: 'text',
  },
  {
    id: 'party_b_address',
    name: 'Party B Address',
    nameAr: 'عنوان الطرف الثاني',
    category: 'party_b',
    placeholder: '{{party_b_address}}',
    description: 'Full address of second party',
    descriptionAr: 'العنوان الكامل للطرف الثاني',
    required: true,
    format: 'text',
  },
  {
    id: 'party_b_phone',
    name: 'Party B Phone',
    nameAr: 'هاتف الطرف الثاني',
    category: 'party_b',
    placeholder: '{{party_b_phone}}',
    description: 'Phone number of second party',
    descriptionAr: 'رقم هاتف الطرف الثاني',
    required: false,
    format: 'phone',
  },
  {
    id: 'party_b_email',
    name: 'Party B Email',
    nameAr: 'بريد الطرف الثاني',
    category: 'party_b',
    placeholder: '{{party_b_email}}',
    description: 'Email address of second party',
    descriptionAr: 'البريد الإلكتروني للطرف الثاني',
    required: false,
    format: 'email',
  },

  // Document Variables
  {
    id: 'document_title',
    name: 'Document Title',
    nameAr: 'عنوان الوثيقة',
    category: 'document',
    placeholder: '{{document_title}}',
    description: 'Title of the legal document',
    descriptionAr: 'عنوان الوثيقة القانونية',
    required: true,
    format: 'text',
  },
  {
    id: 'document_ref',
    name: 'Reference Number',
    nameAr: 'رقم المرجع',
    category: 'document',
    placeholder: '{{document_ref}}',
    description: 'Document reference number',
    descriptionAr: 'رقم مرجع الوثيقة',
    required: false,
    format: 'text',
  },
  {
    id: 'jurisdiction',
    name: 'Jurisdiction',
    nameAr: 'الاختصاص القضائي',
    category: 'document',
    placeholder: '{{jurisdiction}}',
    description: 'Legal jurisdiction (e.g., Dubai, DIFC)',
    descriptionAr: 'الاختصاص القضائي (مثل دبي، مركز دبي المالي)',
    required: true,
    format: 'text',
  },
  {
    id: 'governing_law',
    name: 'Governing Law',
    nameAr: 'القانون الحاكم',
    category: 'document',
    placeholder: '{{governing_law}}',
    description: 'The law governing this agreement',
    descriptionAr: 'القانون الذي يحكم هذه الاتفاقية',
    required: true,
    format: 'text',
  },

  // Financial Variables
  {
    id: 'amount',
    name: 'Amount',
    nameAr: 'المبلغ',
    category: 'financial',
    placeholder: '{{amount}}',
    description: 'Primary financial amount',
    descriptionAr: 'المبلغ المالي الأساسي',
    required: false,
    format: 'currency',
  },
  {
    id: 'amount_words',
    name: 'Amount in Words',
    nameAr: 'المبلغ بالحروف',
    category: 'financial',
    placeholder: '{{amount_words}}',
    description: 'Amount written in words',
    descriptionAr: 'المبلغ مكتوبًا بالحروف',
    required: false,
    format: 'text',
  },
  {
    id: 'currency',
    name: 'Currency',
    nameAr: 'العملة',
    category: 'financial',
    placeholder: '{{currency}}',
    description: 'Currency code (e.g., AED, SAR)',
    descriptionAr: 'رمز العملة (مثل درهم، ريال)',
    required: false,
    defaultValue: 'AED',
    format: 'text',
  },
  {
    id: 'deposit_amount',
    name: 'Deposit Amount',
    nameAr: 'مبلغ الإيداع',
    category: 'financial',
    placeholder: '{{deposit_amount}}',
    description: 'Security deposit amount',
    descriptionAr: 'مبلغ التأمين',
    required: false,
    format: 'currency',
  },
  {
    id: 'monthly_rent',
    name: 'Monthly Rent',
    nameAr: 'الإيجار الشهري',
    category: 'financial',
    placeholder: '{{monthly_rent}}',
    description: 'Monthly rental amount',
    descriptionAr: 'مبلغ الإيجار الشهري',
    required: false,
    format: 'currency',
  },
  {
    id: 'annual_rent',
    name: 'Annual Rent',
    nameAr: 'الإيجار السنوي',
    category: 'financial',
    placeholder: '{{annual_rent}}',
    description: 'Annual rental amount',
    descriptionAr: 'مبلغ الإيجار السنوي',
    required: false,
    format: 'currency',
  },

  // Date Variables
  {
    id: 'effective_date',
    name: 'Effective Date',
    nameAr: 'تاريخ السريان',
    category: 'dates',
    placeholder: '{{effective_date}}',
    description: 'Date when agreement becomes effective',
    descriptionAr: 'تاريخ بدء سريان الاتفاقية',
    required: true,
    format: 'date',
  },
  {
    id: 'start_date',
    name: 'Start Date',
    nameAr: 'تاريخ البدء',
    category: 'dates',
    placeholder: '{{start_date}}',
    description: 'Contract start date',
    descriptionAr: 'تاريخ بدء العقد',
    required: false,
    format: 'date',
  },
  {
    id: 'end_date',
    name: 'End Date',
    nameAr: 'تاريخ الانتهاء',
    category: 'dates',
    placeholder: '{{end_date}}',
    description: 'Contract end date',
    descriptionAr: 'تاريخ انتهاء العقد',
    required: false,
    format: 'date',
  },
  {
    id: 'signing_date',
    name: 'Signing Date',
    nameAr: 'تاريخ التوقيع',
    category: 'dates',
    placeholder: '{{signing_date}}',
    description: 'Date of contract signing',
    descriptionAr: 'تاريخ توقيع العقد',
    required: false,
    format: 'date',
  },
  {
    id: 'notice_period',
    name: 'Notice Period',
    nameAr: 'فترة الإشعار',
    category: 'dates',
    placeholder: '{{notice_period}}',
    description: 'Required notice period (e.g., 30 days)',
    descriptionAr: 'فترة الإشعار المطلوبة (مثل 30 يومًا)',
    required: false,
    format: 'text',
  },

  // Property Variables
  {
    id: 'property_address',
    name: 'Property Address',
    nameAr: 'عنوان العقار',
    category: 'property',
    placeholder: '{{property_address}}',
    description: 'Full address of the property',
    descriptionAr: 'العنوان الكامل للعقار',
    required: false,
    format: 'text',
  },
  {
    id: 'property_type',
    name: 'Property Type',
    nameAr: 'نوع العقار',
    category: 'property',
    placeholder: '{{property_type}}',
    description: 'Type of property (apartment, villa, office)',
    descriptionAr: 'نوع العقار (شقة، فيلا، مكتب)',
    required: false,
    format: 'text',
  },
  {
    id: 'property_size',
    name: 'Property Size',
    nameAr: 'مساحة العقار',
    category: 'property',
    placeholder: '{{property_size}}',
    description: 'Size of property in sq ft/m',
    descriptionAr: 'مساحة العقار بالقدم/المتر المربع',
    required: false,
    format: 'text',
  },
  {
    id: 'ejari_number',
    name: 'Ejari Number',
    nameAr: 'رقم إيجاري',
    category: 'property',
    placeholder: '{{ejari_number}}',
    description: 'Dubai Ejari registration number',
    descriptionAr: 'رقم تسجيل إيجاري في دبي',
    required: false,
    format: 'text',
  },
];

// Category labels for UI
export const categoryLabels: Record<string, { en: string; ar: string }> = {
  party_a: { en: 'Party A (First Party)', ar: 'الطرف الأول' },
  party_b: { en: 'Party B (Second Party)', ar: 'الطرف الثاني' },
  document: { en: 'Document Details', ar: 'تفاصيل الوثيقة' },
  financial: { en: 'Financial Terms', ar: 'الشروط المالية' },
  dates: { en: 'Dates & Periods', ar: 'التواريخ والفترات' },
  property: { en: 'Property Details', ar: 'تفاصيل العقار' },
  custom: { en: 'Custom Variables', ar: 'متغيرات مخصصة' },
};

// Variable values mapping
export interface VariableValues {
  [key: string]: string | undefined;
}

/**
 * Replace all template variables in content with their values
 */
export function replaceVariables(content: string, values: VariableValues): string {
  let result = content;

  // Replace each variable placeholder with its value
  for (const variable of standardVariables) {
    const value = values[variable.id];
    if (value !== undefined && value !== '') {
      // Replace the placeholder pattern {{variable_id}}
      const pattern = new RegExp(escapeRegExp(variable.placeholder), 'g');
      result = result.replace(pattern, value);
    }
  }

  // Also replace any custom variables
  const customPattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  result = result.replace(customPattern, (match, varName) => {
    return values[varName] || match;
  });

  return result;
}

/**
 * Find all unreplaced variables in content
 */
export function findUnreplacedVariables(content: string): string[] {
  const pattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
}

/**
 * Highlight variables in content for preview
 */
export function highlightVariables(content: string, isRTL: boolean = false): string {
  const pattern = /(\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\})/g;
  return content.replace(pattern, (match) => {
    return `<span class="variable-highlight" style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; font-weight: 500;" dir="${isRTL ? 'rtl' : 'ltr'}">${match}</span>`;
  });
}

/**
 * Convert form data to variable values
 */
export function formDataToVariables(formData: {
  partyA: { name: string; idNumber: string; nationality?: string; address?: string; phone?: string; email?: string };
  partyB: { name: string; idNumber: string; nationality?: string; address?: string; phone?: string; email?: string };
  amount?: string;
  startDate?: string;
  endDate?: string;
  propertyAddress?: string;
  country?: string;
  jurisdiction?: string;
  language?: string;
}): VariableValues {
  return {
    party_a_name: formData.partyA.name,
    party_a_id: formData.partyA.idNumber,
    party_a_nationality: formData.partyA.nationality,
    party_a_address: formData.partyA.address,
    party_a_phone: formData.partyA.phone,
    party_a_email: formData.partyA.email,
    party_b_name: formData.partyB.name,
    party_b_id: formData.partyB.idNumber,
    party_b_nationality: formData.partyB.nationality,
    party_b_address: formData.partyB.address,
    party_b_phone: formData.partyB.phone,
    party_b_email: formData.partyB.email,
    amount: formData.amount,
    start_date: formData.startDate,
    end_date: formData.endDate,
    property_address: formData.propertyAddress,
    jurisdiction: formData.jurisdiction,
    effective_date: new Date().toISOString().split('T')[0],
    signing_date: new Date().toISOString().split('T')[0],
  };
}

/**
 * Get variables by category
 */
export function getVariablesByCategory(category: TemplateVariable['category']): TemplateVariable[] {
  return standardVariables.filter(v => v.category === category);
}

/**
 * Get required variables that are missing values
 */
export function getMissingRequiredVariables(values: VariableValues): TemplateVariable[] {
  return standardVariables.filter(
    v => v.required && (!values[v.id] || values[v.id] === '')
  );
}

// Utility function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format a value based on variable format type
 */
export function formatVariableValue(value: string, format: TemplateVariable['format'], language: 'en' | 'ar' = 'en'): string {
  switch (format) {
    case 'date':
      try {
        const date = new Date(value);
        return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return value;
      }
    case 'currency':
      try {
        const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
        return num.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } catch {
        return value;
      }
    case 'number':
      try {
        const num = parseFloat(value);
        return num.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-AE');
      } catch {
        return value;
      }
    default:
      return value;
  }
}

export default {
  standardVariables,
  categoryLabels,
  replaceVariables,
  findUnreplacedVariables,
  highlightVariables,
  formDataToVariables,
  getVariablesByCategory,
  getMissingRequiredVariables,
  formatVariableValue,
};

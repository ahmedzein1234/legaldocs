/**
 * AI Contract Negotiation Assistant
 * Real-time suggestions, what-if scenarios, counter-proposals, and risk scoring
 */

// Risk levels for contract clauses
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Clause categories
export type ClauseCategory =
  | 'payment'
  | 'termination'
  | 'liability'
  | 'indemnity'
  | 'confidentiality'
  | 'intellectual_property'
  | 'dispute_resolution'
  | 'force_majeure'
  | 'warranty'
  | 'non_compete'
  | 'penalty'
  | 'renewal'
  | 'notice'
  | 'jurisdiction'
  | 'other';

// Negotiation position
export type NegotiationPosition = 'buyer' | 'seller' | 'landlord' | 'tenant' | 'employer' | 'employee' | 'service_provider' | 'client' | 'neutral';

// Clause analysis result
export interface ClauseAnalysis {
  id: string;
  text: string;
  category: ClauseCategory;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  issues: string[];
  suggestions: string[];
  marketComparison: string;
  legalBasis?: string;
}

// Contract risk summary
export interface ContractRiskSummary {
  overallScore: number; // 0-100 (higher = riskier)
  overallLevel: RiskLevel;
  clauseBreakdown: {
    category: ClauseCategory;
    count: number;
    avgRisk: number;
  }[];
  topRisks: {
    clause: string;
    risk: string;
    severity: RiskLevel;
  }[];
  missingClauses: {
    clause: string;
    importance: 'essential' | 'recommended' | 'optional';
    reason: string;
  }[];
}

// What-if scenario
export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  currentClause: string;
  proposedChange: string;
  impactAnalysis: {
    riskChange: number; // +/- change in risk score
    pros: string[];
    cons: string[];
    likelihood: 'low' | 'medium' | 'high';
    financialImpact?: string;
  };
  recommendation: 'accept' | 'reject' | 'negotiate';
}

// Counter-proposal
export interface CounterProposal {
  id: string;
  originalClause: string;
  proposedClause: string;
  rationale: string;
  negotiationTips: string[];
  fallbackPosition: string;
  redLines: string[]; // Non-negotiable points
  expectedResponse: string;
}

// Negotiation session
export interface NegotiationSession {
  id: string;
  documentId: string;
  documentName: string;
  position: NegotiationPosition;
  country: string;
  clauses: ClauseAnalysis[];
  riskSummary: ContractRiskSummary;
  scenarios: WhatIfScenario[];
  counterProposals: CounterProposal[];
  chatHistory: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Real-time suggestion
export interface RealTimeSuggestion {
  type: 'warning' | 'improvement' | 'risk' | 'compliance' | 'tip';
  message: string;
  messageAr?: string;
  clause?: string;
  suggestion?: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[level];
}

export function getRiskBadgeColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };
  return colors[level];
}

export function getRiskLabel(level: RiskLevel, isArabic: boolean = false): string {
  const labels: Record<RiskLevel, { en: string; ar: string }> = {
    low: { en: 'Low Risk', ar: 'مخاطر منخفضة' },
    medium: { en: 'Medium Risk', ar: 'مخاطر متوسطة' },
    high: { en: 'High Risk', ar: 'مخاطر عالية' },
    critical: { en: 'Critical Risk', ar: 'مخاطر حرجة' },
  };
  return isArabic ? labels[level].ar : labels[level].en;
}

export function getCategoryLabel(category: ClauseCategory, isArabic: boolean = false): string {
  const labels: Record<ClauseCategory, { en: string; ar: string }> = {
    payment: { en: 'Payment Terms', ar: 'شروط الدفع' },
    termination: { en: 'Termination', ar: 'الإنهاء' },
    liability: { en: 'Liability', ar: 'المسؤولية' },
    indemnity: { en: 'Indemnity', ar: 'التعويض' },
    confidentiality: { en: 'Confidentiality', ar: 'السرية' },
    intellectual_property: { en: 'Intellectual Property', ar: 'الملكية الفكرية' },
    dispute_resolution: { en: 'Dispute Resolution', ar: 'حل النزاعات' },
    force_majeure: { en: 'Force Majeure', ar: 'القوة القاهرة' },
    warranty: { en: 'Warranty', ar: 'الضمان' },
    non_compete: { en: 'Non-Compete', ar: 'عدم المنافسة' },
    penalty: { en: 'Penalties', ar: 'الغرامات' },
    renewal: { en: 'Renewal', ar: 'التجديد' },
    notice: { en: 'Notice Period', ar: 'فترة الإشعار' },
    jurisdiction: { en: 'Jurisdiction', ar: 'الاختصاص القضائي' },
    other: { en: 'Other', ar: 'أخرى' },
  };
  return isArabic ? labels[category].ar : labels[category].en;
}

export function getPositionLabel(position: NegotiationPosition, isArabic: boolean = false): string {
  const labels: Record<NegotiationPosition, { en: string; ar: string }> = {
    buyer: { en: 'Buyer', ar: 'المشتري' },
    seller: { en: 'Seller', ar: 'البائع' },
    landlord: { en: 'Landlord', ar: 'المؤجر' },
    tenant: { en: 'Tenant', ar: 'المستأجر' },
    employer: { en: 'Employer', ar: 'صاحب العمل' },
    employee: { en: 'Employee', ar: 'الموظف' },
    service_provider: { en: 'Service Provider', ar: 'مقدم الخدمة' },
    client: { en: 'Client', ar: 'العميل' },
    neutral: { en: 'Neutral', ar: 'محايد' },
  };
  return isArabic ? labels[position].ar : labels[position].en;
}

export function calculateOverallRisk(clauses: ClauseAnalysis[]): { score: number; level: RiskLevel } {
  if (clauses.length === 0) return { score: 0, level: 'low' };

  const avgScore = clauses.reduce((sum, c) => sum + c.riskScore, 0) / clauses.length;

  let level: RiskLevel;
  if (avgScore < 25) level = 'low';
  else if (avgScore < 50) level = 'medium';
  else if (avgScore < 75) level = 'high';
  else level = 'critical';

  return { score: Math.round(avgScore), level };
}

export function generateSessionId(): string {
  return `neg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

// Common risky phrases to highlight
export const riskyPhrases = {
  en: [
    { phrase: 'unlimited liability', risk: 'critical', suggestion: 'Cap liability to contract value or specific amount' },
    { phrase: 'sole discretion', risk: 'high', suggestion: 'Request mutual consent or objective criteria' },
    { phrase: 'without cause', risk: 'high', suggestion: 'Request notice period or severance' },
    { phrase: 'indemnify and hold harmless', risk: 'high', suggestion: 'Limit indemnification scope' },
    { phrase: 'waive all claims', risk: 'critical', suggestion: 'Never waive unknown future claims' },
    { phrase: 'automatic renewal', risk: 'medium', suggestion: 'Add opt-out notice period' },
    { phrase: 'non-refundable', risk: 'medium', suggestion: 'Negotiate partial refund conditions' },
    { phrase: 'entire agreement', risk: 'low', suggestion: 'Ensure all verbal promises are included' },
    { phrase: 'governing law', risk: 'medium', suggestion: 'Prefer local jurisdiction' },
    { phrase: 'arbitration', risk: 'medium', suggestion: 'Consider cost implications' },
  ],
  ar: [
    { phrase: 'مسؤولية غير محدودة', risk: 'critical', suggestion: 'حدد سقف المسؤولية بقيمة العقد أو مبلغ محدد' },
    { phrase: 'وفقاً لتقديره المطلق', risk: 'high', suggestion: 'اطلب موافقة متبادلة أو معايير موضوعية' },
    { phrase: 'دون سبب', risk: 'high', suggestion: 'اطلب فترة إشعار أو تعويض' },
    { phrase: 'التعويض والإبراء', risk: 'high', suggestion: 'حدد نطاق التعويض' },
    { phrase: 'التنازل عن جميع المطالبات', risk: 'critical', suggestion: 'لا تتنازل عن مطالبات مستقبلية غير معروفة' },
    { phrase: 'تجديد تلقائي', risk: 'medium', suggestion: 'أضف فترة إشعار للانسحاب' },
    { phrase: 'غير قابل للاسترداد', risk: 'medium', suggestion: 'تفاوض على شروط استرداد جزئي' },
  ],
};

// UAE-specific legal considerations
export const uaeConsiderations = {
  employment: [
    'Probation period max 6 months (UAE Labor Law)',
    'End of service gratuity is mandatory',
    'Non-compete clauses must be reasonable in scope and duration',
    'Notice period requirements per Article 43',
  ],
  rental: [
    'Ejari registration mandatory in Dubai',
    'RERA rent calculator for rent increases',
    'Security deposit max 5% for unfurnished (Dubai)',
    '90 days notice for eviction',
  ],
  commercial: [
    'Trade license requirements',
    'Local sponsor/agent requirements for certain activities',
    'VAT considerations (5%)',
    'DIFC/ADGM different legal framework',
  ],
};

export default {
  getRiskColor,
  getRiskBadgeColor,
  getRiskLabel,
  getCategoryLabel,
  getPositionLabel,
  calculateOverallRisk,
  generateSessionId,
  riskyPhrases,
  uaeConsiderations,
};

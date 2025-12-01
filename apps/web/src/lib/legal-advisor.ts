/**
 * Legal Advisor System Types and Utilities
 * Comprehensive legal advisory features for GCC jurisdiction
 */

// ============================================
// CASE MANAGEMENT TYPES
// ============================================

export type CaseStatus =
  | 'open'
  | 'in_progress'
  | 'pending_action'
  | 'on_hold'
  | 'closed_won'
  | 'closed_lost'
  | 'closed_settled';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type CaseType =
  | 'contract_dispute'
  | 'employment_dispute'
  | 'real_estate_dispute'
  | 'commercial_litigation'
  | 'debt_collection'
  | 'intellectual_property'
  | 'corporate_matter'
  | 'regulatory_compliance'
  | 'contract_negotiation'
  | 'contract_review'
  | 'legal_opinion'
  | 'other';

export interface Case {
  id: string;
  userId: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  caseType: CaseType;
  status: CaseStatus;
  priority: CasePriority;

  // Parties
  clientName: string;
  clientNameAr?: string;
  opposingParty?: string;
  opposingPartyAr?: string;

  // Jurisdiction
  country: string;
  jurisdiction?: string;
  courtName?: string;
  caseNumber?: string;

  // Financials
  claimAmount?: number;
  currency?: string;
  settledAmount?: number;

  // Dates
  filingDate?: string;
  nextHearingDate?: string;
  deadlines: CaseDeadline[];

  // Documents & Notes
  documents: CaseDocument[];
  notes: CaseNote[];
  tasks: CaseTask[];
  consultations: ConsultationSession[];

  // Analysis
  strengthScore?: number; // 0-100
  riskAssessment?: RiskAssessment;
  strategy?: CaseStrategy;

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface CaseDeadline {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  dueDate: string;
  type: 'court' | 'filing' | 'response' | 'discovery' | 'payment' | 'custom';
  status: 'pending' | 'completed' | 'overdue' | 'extended';
  reminderDays: number[];
}

export interface CaseDocument {
  id: string;
  name: string;
  type: 'contract' | 'evidence' | 'correspondence' | 'court_filing' | 'legal_brief' | 'other';
  uploadId?: string;
  extractionId?: string;
  notes?: string;
  uploadedAt: Date;
  tags: string[];
}

export interface CaseNote {
  id: string;
  content: string;
  type: 'general' | 'strategy' | 'research' | 'meeting' | 'call' | 'court';
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: CasePriority;
  dueDate?: string;
  assignee?: string;
  completedAt?: Date;
  createdAt: Date;
}

// ============================================
// CONSULTATION TYPES
// ============================================

export interface ConsultationSession {
  id: string;
  caseId?: string;
  userId: string;
  title: string;
  topic: ConsultationTopic;
  country: string;
  jurisdiction?: string;
  messages: ConsultationMessage[];
  summary?: string;
  summaryAr?: string;
  keyPoints: string[];
  recommendations: string[];
  citations: LegalCitation[];
  createdAt: Date;
  updatedAt: Date;
}

export type ConsultationTopic =
  | 'general_inquiry'
  | 'contract_review'
  | 'dispute_advice'
  | 'compliance_check'
  | 'risk_assessment'
  | 'strategy_planning'
  | 'document_drafting'
  | 'negotiation_tactics'
  | 'court_procedure'
  | 'settlement_advice';

export interface ConsultationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: LegalCitation[];
  attachments?: string[];
  feedback?: 'helpful' | 'not_helpful';
}

export interface LegalCitation {
  id: string;
  type: 'law' | 'regulation' | 'case' | 'article' | 'decree';
  title: string;
  titleAr?: string;
  reference: string;
  country: string;
  relevance: string;
  url?: string;
}

// ============================================
// CONTRACT REVIEW TYPES
// ============================================

export interface ContractReview {
  id: string;
  userId: string;
  caseId?: string;
  documentId: string;
  documentName: string;
  contractType: string;

  // Analysis Results
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Detailed Analysis
  issues: ContractIssue[];
  strengths: ContractStrength[];
  missingClauses: MissingClause[];
  unusualTerms: UnusualTerm[];
  complianceFlags: ComplianceFlag[];

  // Comparison
  marketComparison?: MarketComparison;

  // Recommendations
  recommendations: ContractRecommendation[];
  suggestedChanges: SuggestedChange[];

  // Summary
  executiveSummary: string;
  executiveSummaryAr?: string;

  createdAt: Date;
}

export interface ContractIssue {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  clause?: string;
  clauseNumber?: string;
  recommendation: string;
  legalBasis?: string;
}

export interface ContractStrength {
  id: string;
  category: string;
  title: string;
  description: string;
  clause?: string;
}

export interface MissingClause {
  id: string;
  clauseType: string;
  title: string;
  titleAr?: string;
  importance: 'optional' | 'recommended' | 'essential';
  description: string;
  suggestedText?: string;
  suggestedTextAr?: string;
}

export interface UnusualTerm {
  id: string;
  title: string;
  description: string;
  clause: string;
  marketStandard: string;
  riskLevel: 'low' | 'medium' | 'high';
  negotiationTip?: string;
}

export interface ComplianceFlag {
  id: string;
  type: 'legal' | 'regulatory' | 'procedural';
  title: string;
  titleAr?: string;
  description: string;
  country: string;
  law?: string;
  consequence?: string;
  remedy: string;
}

export interface MarketComparison {
  overallPosition: 'favorable' | 'standard' | 'unfavorable';
  comparedTo: string; // e.g., "UAE Real Estate Market Standards"
  metrics: {
    category: string;
    yourValue: string;
    marketAverage: string;
    position: 'better' | 'same' | 'worse';
  }[];
}

export interface ContractRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  title: string;
  description: string;
  action: string;
  benefit: string;
}

export interface SuggestedChange {
  id: string;
  type: 'add' | 'modify' | 'remove';
  clauseNumber?: string;
  originalText?: string;
  suggestedText: string;
  suggestedTextAr?: string;
  reason: string;
  priority: 'optional' | 'recommended' | 'critical';
}

// ============================================
// RISK ASSESSMENT TYPES
// ============================================

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  categories: RiskCategory[];
  mitigationStrategies: MitigationStrategy[];
  worstCaseScenario: string;
  bestCaseScenario: string;
  likelyOutcome: string;
  successProbability: number; // 0-100
}

export interface RiskCategory {
  name: string;
  nameAr?: string;
  level: 'low' | 'medium' | 'high';
  score: number;
  factors: string[];
  mitigations: string[];
}

export interface MitigationStrategy {
  id: string;
  title: string;
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
  timeframe: string;
  steps: string[];
}

// ============================================
// CASE STRATEGY TYPES
// ============================================

export interface CaseStrategy {
  id: string;
  approach: 'aggressive' | 'balanced' | 'defensive' | 'settlement_focused';
  objectives: StrategyObjective[];
  phases: StrategyPhase[];
  arguments: LegalArgument[];
  counterArguments: CounterArgument[];
  negotiationPoints: NegotiationPoint[];
  settlementRange?: {
    minimum: number;
    target: number;
    walkAway: number;
    currency: string;
  };
  timeline: StrategyTimeline;
  contingencies: Contingency[];
}

export interface StrategyObjective {
  id: string;
  objective: string;
  priority: 'primary' | 'secondary' | 'fallback';
  measurable: string;
  achievability: 'high' | 'medium' | 'low';
}

export interface StrategyPhase {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  milestones: string[];
  deliverables: string[];
  risks: string[];
}

export interface LegalArgument {
  id: string;
  title: string;
  summary: string;
  supportingFacts: string[];
  legalBasis: string[];
  evidence: string[];
  strength: 'weak' | 'moderate' | 'strong';
  anticipatedCounterArgument?: string;
  rebuttal?: string;
}

export interface CounterArgument {
  id: string;
  anticipatedArgument: string;
  likelihood: 'low' | 'medium' | 'high';
  potentialImpact: 'low' | 'medium' | 'high';
  rebuttalStrategy: string;
  supportingPoints: string[];
}

export interface NegotiationPoint {
  id: string;
  issue: string;
  ourPosition: string;
  theirLikelyPosition: string;
  flexibility: 'none' | 'limited' | 'moderate' | 'high';
  priority: 'must_have' | 'important' | 'nice_to_have';
  tradeable: boolean;
}

export interface StrategyTimeline {
  estimatedDuration: string;
  keyDates: {
    date: string;
    event: string;
    importance: 'critical' | 'important' | 'normal';
  }[];
}

export interface Contingency {
  id: string;
  scenario: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  response: string;
  trigger: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateCaseId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASE-${year}-${random}`;
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCaseStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    pending_action: 'bg-orange-100 text-orange-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800',
    closed_settled: 'bg-purple-100 text-purple-800',
  };
  return colors[status];
}

export function getCasePriorityColor(priority: CasePriority): string {
  const colors: Record<CasePriority, string> = {
    low: 'bg-slate-100 text-slate-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return colors[priority];
}

export function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}

export function formatCaseType(type: CaseType, isArabic: boolean = false): string {
  const labels: Record<CaseType, { en: string; ar: string }> = {
    contract_dispute: { en: 'Contract Dispute', ar: 'نزاع تعاقدي' },
    employment_dispute: { en: 'Employment Dispute', ar: 'نزاع عمالي' },
    real_estate_dispute: { en: 'Real Estate Dispute', ar: 'نزاع عقاري' },
    commercial_litigation: { en: 'Commercial Litigation', ar: 'تقاضي تجاري' },
    debt_collection: { en: 'Debt Collection', ar: 'تحصيل الديون' },
    intellectual_property: { en: 'Intellectual Property', ar: 'ملكية فكرية' },
    corporate_matter: { en: 'Corporate Matter', ar: 'شؤون الشركات' },
    regulatory_compliance: { en: 'Regulatory Compliance', ar: 'الامتثال التنظيمي' },
    contract_negotiation: { en: 'Contract Negotiation', ar: 'تفاوض العقود' },
    contract_review: { en: 'Contract Review', ar: 'مراجعة العقود' },
    legal_opinion: { en: 'Legal Opinion', ar: 'رأي قانوني' },
    other: { en: 'Other', ar: 'أخرى' },
  };
  return isArabic ? labels[type].ar : labels[type].en;
}

export function formatCaseStatus(status: CaseStatus, isArabic: boolean = false): string {
  const labels: Record<CaseStatus, { en: string; ar: string }> = {
    open: { en: 'Open', ar: 'مفتوحة' },
    in_progress: { en: 'In Progress', ar: 'قيد التنفيذ' },
    pending_action: { en: 'Pending Action', ar: 'بانتظار إجراء' },
    on_hold: { en: 'On Hold', ar: 'معلقة' },
    closed_won: { en: 'Closed (Won)', ar: 'مغلقة (فوز)' },
    closed_lost: { en: 'Closed (Lost)', ar: 'مغلقة (خسارة)' },
    closed_settled: { en: 'Settled', ar: 'تسوية' },
  };
  return isArabic ? labels[status].ar : labels[status].en;
}

// GCC Legal Framework References
export const GCC_LEGAL_FRAMEWORKS = {
  ae: {
    name: 'UAE',
    laws: [
      { id: 'civil_code', name: 'Federal Law No. 5 of 1985 (Civil Code)', nameAr: 'القانون الاتحادي رقم 5 لسنة 1985 (القانون المدني)' },
      { id: 'labor_law', name: 'Federal Law No. 33 of 2021 (Labor Law)', nameAr: 'القانون الاتحادي رقم 33 لسنة 2021 (قانون العمل)' },
      { id: 'commercial_transactions', name: 'Federal Law No. 50 of 2022 (Commercial Transactions)', nameAr: 'القانون الاتحادي رقم 50 لسنة 2022' },
      { id: 'rent_law_dubai', name: 'Law No. 26 of 2007 (Dubai Rent Law)', nameAr: 'قانون رقم 26 لسنة 2007 (قانون إيجارات دبي)' },
      { id: 'companies_law', name: 'Federal Law No. 32 of 2021 (Companies Law)', nameAr: 'القانون الاتحادي رقم 32 لسنة 2021' },
    ],
  },
  sa: {
    name: 'Saudi Arabia',
    laws: [
      { id: 'labor_law', name: 'Saudi Labor Law (2005)', nameAr: 'نظام العمل السعودي' },
      { id: 'commercial_court_law', name: 'Commercial Court Law', nameAr: 'نظام المحاكم التجارية' },
      { id: 'companies_law', name: 'Companies Law (2015)', nameAr: 'نظام الشركات' },
      { id: 'civil_transactions', name: 'Civil Transactions Law', nameAr: 'نظام المعاملات المدنية' },
    ],
  },
  qa: {
    name: 'Qatar',
    laws: [
      { id: 'civil_code', name: 'Law No. 22 of 2004 (Civil Code)', nameAr: 'القانون رقم 22 لسنة 2004' },
      { id: 'labor_law', name: 'Law No. 14 of 2004 (Labor Law)', nameAr: 'القانون رقم 14 لسنة 2004' },
      { id: 'rent_law', name: 'Law No. 4 of 2008 (Rent Law)', nameAr: 'القانون رقم 4 لسنة 2008' },
    ],
  },
  kw: {
    name: 'Kuwait',
    laws: [
      { id: 'civil_code', name: 'Civil Code (Law No. 67 of 1980)', nameAr: 'القانون المدني رقم 67 لسنة 1980' },
      { id: 'labor_law', name: 'Labor Law (No. 6 of 2010)', nameAr: 'قانون العمل رقم 6 لسنة 2010' },
      { id: 'commercial_law', name: 'Commercial Law', nameAr: 'القانون التجاري' },
    ],
  },
  bh: {
    name: 'Bahrain',
    laws: [
      { id: 'civil_code', name: 'Civil Code (Law No. 19 of 2001)', nameAr: 'القانون المدني' },
      { id: 'labor_law', name: 'Labor Law (No. 36 of 2012)', nameAr: 'قانون العمل' },
      { id: 'commercial_companies', name: 'Commercial Companies Law', nameAr: 'قانون الشركات التجارية' },
    ],
  },
  om: {
    name: 'Oman',
    laws: [
      { id: 'civil_transactions', name: 'Civil Transactions Law (RD 29/2013)', nameAr: 'قانون المعاملات المدنية' },
      { id: 'labor_law', name: 'Labor Law (RD 35/2003)', nameAr: 'قانون العمل' },
      { id: 'commercial_law', name: 'Commercial Law', nameAr: 'القانون التجاري' },
    ],
  },
};

export default {
  generateCaseId,
  generateSessionId,
  getCaseStatusColor,
  getCasePriorityColor,
  getRiskLevelColor,
  formatCaseType,
  formatCaseStatus,
  GCC_LEGAL_FRAMEWORKS,
};

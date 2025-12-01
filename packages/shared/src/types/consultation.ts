// ============================================
// CONSULTATION BOOKING TYPES
// ============================================

// Consultation Types
export type ConsultationType =
  | 'video'
  | 'phone'
  | 'in_person'
  | 'document_review'
  | 'quick_question';

export type ConsultationStatus =
  | 'pending'           // Awaiting lawyer approval
  | 'confirmed'         // Confirmed by lawyer
  | 'payment_pending'   // Awaiting payment
  | 'paid'             // Payment completed
  | 'in_progress'      // Currently happening
  | 'completed'        // Finished successfully
  | 'cancelled_client' // Cancelled by client
  | 'cancelled_lawyer' // Cancelled by lawyer
  | 'no_show_client'   // Client didn't show
  | 'no_show_lawyer'   // Lawyer didn't show
  | 'refunded';        // Payment refunded

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'refunded'
  | 'failed';

// ============================================
// LAWYER AVAILABILITY
// ============================================

export interface LawyerAvailability {
  id: string;
  lawyerId: string;
  timezone: string;
  bufferMinutes: number;
  instantBookingEnabled: boolean;
  maxAdvanceDays: number;
  minNoticeHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySchedule {
  id: string;
  availabilityId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilityOverride {
  id: string;
  lawyerId: string;
  overrideDate: string; // Date string
  type: 'blocked' | 'custom_hours' | 'holiday';
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: string;
}

export interface AvailabilitySlot {
  date: string;
  startTime: string; // ISO 8601
  endTime: string;
  available: boolean;
  price: number;
}

// ============================================
// CONSULTATION PRICING
// ============================================

export type PricingModel = 'hourly' | 'fixed' | 'package';

export interface ConsultationPricing {
  id: string;
  lawyerId: string;
  consultationType: ConsultationType;
  pricingModel: PricingModel;
  hourlyRate?: number;
  fixedFee?: number;
  durationMinutes?: number;
  isFreeInitial: boolean;
  freeInitialMinutes?: number;
  packageDetails?: ConsultationPackageDetail[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationPackageDetail {
  name: string;
  sessions: number;
  price: number;
  validityDays: number;
  pricePerSession?: number;
}

// ============================================
// CONSULTATION
// ============================================

export interface Consultation {
  id: string;
  consultationNumber: string;
  clientId: string;
  lawyerId: string;
  consultationType: ConsultationType;
  status: ConsultationStatus;

  // Scheduling
  scheduledAt: string; // ISO 8601 in UTC
  scheduledEndAt: string;
  timezoneClient: string;
  timezoneLawyer: string;
  durationMinutes: number;

  // Pricing
  basePrice: number;
  platformFee: number;
  totalPrice: number;
  currency: string;
  isFreeInitial: boolean;

  // Payment
  paymentId?: string;
  paymentStatus?: PaymentStatus;
  paidAt?: string;

  // Meeting details
  meetingLocation?: string;
  meetingLink?: string;
  meetingPhone?: string;
  meetingId?: string;
  meetingPasscode?: string;

  // Client information
  clientPhone?: string;
  clientNotes?: string;

  // Pre-consultation data
  questionnaireResponses?: Record<string, any>;
  documentIds?: string[];

  // Post-consultation data
  consultationNotes?: string;
  consultationSummary?: string;
  followUpRequired: boolean;
  followUpNotes?: string;

  // Actual timing
  startedAt?: string;
  endedAt?: string;
  actualDurationMinutes?: number;

  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationPolicyApplied?: string;
  refundAmount?: number;

  // Reminders
  reminder24hSent: boolean;
  reminder1hSent: boolean;
  reminderWhatsappSent: boolean;

  // Ratings & Review
  clientRating?: number;
  clientReview?: string;
  clientReviewedAt?: string;
  lawyerRating?: number;
  lawyerReview?: string;
  lawyerReviewedAt?: string;

  // Package reference
  packageId?: string;

  // Metadata
  metadata?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

export interface ConsultationWithRelations extends Consultation {
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
    email: string;
    phone?: string;
  };
  lawyer: {
    id: string;
    name: string;
    avatarUrl?: string;
    title: string;
    email: string;
    phone?: string;
  };
  documents?: ConsultationDocument[];
  messages?: ConsultationMessage[];
}

// ============================================
// QUESTIONNAIRES
// ============================================

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'number'
  | 'checkbox';

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  questionAr?: string;
  type: QuestionType;
  required: boolean;
  options?: Array<{
    value: string;
    label: string;
    labelAr?: string;
  }>;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ConsultationQuestionnaire {
  id: string;
  lawyerId: string;
  name: string;
  nameAr?: string;
  description?: string;
  consultationTypes: ConsultationType[];
  questions: QuestionnaireQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DOCUMENTS
// ============================================

export type DocumentPurpose =
  | 'pre_consultation'
  | 'during_consultation'
  | 'follow_up';

export interface ConsultationDocument {
  id: string;
  consultationId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: 'client' | 'lawyer';
  uploadedAt: string;
  purpose: DocumentPurpose;
  notes?: string;
}

// ============================================
// MESSAGES
// ============================================

export type MessageType =
  | 'text'
  | 'system'
  | 'file'
  | 'video_link'
  | 'reminder';

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'client' | 'lawyer' | 'system';
  messageType: MessageType;
  content?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_received'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'consultation_started'
  | 'consultation_ended'
  | 'review_request'
  | 'follow_up';

export type NotificationChannel =
  | 'email'
  | 'whatsapp'
  | 'sms'
  | 'in_app';

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced';

export interface ConsultationNotification {
  id: string;
  consultationId: string;
  notificationType: NotificationType;
  recipientId: string;
  recipientType: 'client' | 'lawyer';
  channel: NotificationChannel;
  status: NotificationStatus;
  subject?: string;
  body?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  externalId?: string;
  createdAt: string;
}

// ============================================
// PACKAGES
// ============================================

export type PackageStatus =
  | 'active'
  | 'expired'
  | 'exhausted'
  | 'refunded';

export interface ConsultationPackage {
  id: string;
  clientId: string;
  lawyerId: string;
  packageName: string;
  totalSessions: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  totalPrice: number;
  pricePerSession: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  status: PackageStatus;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationPackageWithLawyer extends ConsultationPackage {
  lawyer: {
    id: string;
    name: string;
    avatarUrl?: string;
    title: string;
  };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateConsultationRequest {
  lawyerId: string;
  consultationType: ConsultationType;
  scheduledAt: string;
  durationMinutes: number;
  clientTimezone: string;
  clientPhone?: string;
  clientNotes?: string;
  questionnaireResponses?: Record<string, any>;
  documentIds?: string[];
  packageId?: string;
}

export interface CreateConsultationResponse {
  consultation: {
    id: string;
    consultationNumber: string;
    status: ConsultationStatus;
    scheduledAt: string;
    scheduledEndAt: string;
    totalPrice: number;
    currency: string;
    requiresApproval: boolean;
    paymentRequired: boolean;
    paymentUrl?: string;
  };
}

export interface GetAvailableSlotsRequest {
  startDate: string;
  endDate: string;
  consultationType: ConsultationType;
  duration?: number;
  clientTimezone?: string;
}

export interface GetAvailableSlotsResponse {
  slots: AvailabilitySlot[];
  lawyerTimezone: string;
  clientTimezone: string;
}

export interface UpdateAvailabilityRequest {
  timezone?: string;
  bufferMinutes?: number;
  instantBookingEnabled?: boolean;
  maxAdvanceDays?: number;
  minNoticeHours?: number;
  schedules?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

export interface CreateOverrideRequest {
  date: string;
  type: 'blocked' | 'custom_hours' | 'holiday';
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface UpdatePricingRequest {
  pricingModel: PricingModel;
  hourlyRate?: number;
  fixedFee?: number;
  durationMinutes?: number;
  isFreeInitial?: boolean;
  freeInitialMinutes?: number;
  packages?: ConsultationPackageDetail[];
  isAvailable?: boolean;
}

export interface CancelConsultationRequest {
  reason: string;
}

export interface CancelConsultationResponse {
  success: boolean;
  refundAmount?: number;
  refundPolicy: string;
}

export interface RescheduleConsultationRequest {
  newScheduledAt: string;
  reason?: string;
}

export interface CompleteConsultationRequest {
  consultationNotes?: string;
  consultationSummary?: string;
  followUpRequired?: boolean;
  followUpNotes?: string;
  actualDurationMinutes?: number;
}

export interface SubmitReviewRequest {
  rating: number;
  review?: string;
  reviewerType: 'client' | 'lawyer';
}

export interface PurchasePackageRequest {
  lawyerId: string;
  packageName: string;
  totalSessions: number;
  totalPrice: number;
  validityDays: number;
}

// ============================================
// CANCELLATION POLICY
// ============================================

export interface CancellationPolicyRule {
  hoursBeforeConsultation: number;
  refundPercentage: number;
  description: string;
}

export interface CancellationPolicy {
  name: string;
  rules: CancellationPolicyRule[];
}

export interface RefundCalculation {
  refundAmount: number;
  refundPercentage: number;
  policyApplied: string;
}

// ============================================
// VIDEO CALL INTEGRATION
// ============================================

export interface VideoMeeting {
  id: string;
  consultationId: string;
  provider: 'twilio' | 'agora' | 'daily';
  meetingId: string;
  meetingUrl: string;
  hostToken: string;
  guestToken: string;
  passcode?: string;
  status: 'scheduled' | 'active' | 'ended';
  recordingEnabled: boolean;
  recordingUrl?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface JoinMeetingRequest {
  consultationId: string;
  participantType: 'host' | 'guest';
}

export interface JoinMeetingResponse {
  token: string;
  meetingUrl: string;
  roomName: string;
}

// ============================================
// PAYMENT INTEGRATION
// ============================================

export interface PaymentIntent {
  id: string;
  consultationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  paymentUrl?: string;
  provider: 'stripe' | 'paytabs' | 'telr';
  createdAt: string;
}

export interface PaymentCalculation {
  subtotal: number;
  platformFee: number;
  total: number;
  lawyerPayout: number;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: string;
  processedAt?: string;
}

// ============================================
// CALENDAR INTEGRATION
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[];
  reminders: Array<{
    method: 'email' | 'popup' | 'sms';
    minutes: number;
  }>;
}

export interface CalendarInvite {
  icsFile: string;
  googleCalendarUrl: string;
  outlookCalendarUrl: string;
  appleCalendarUrl?: string;
}

// ============================================
// ANALYTICS & STATISTICS
// ============================================

export interface ConsultationStatistics {
  totalConsultations: number;
  completedConsultations: number;
  cancelledConsultations: number;
  averageRating: number;
  totalEarnings: number;
  upcomingConsultations: number;
  consultationsByType: Record<ConsultationType, number>;
  consultationsByMonth: Array<{
    month: string;
    count: number;
    earnings: number;
  }>;
}

export interface LawyerConsultationStats {
  totalRevenue: number;
  consultationsCompleted: number;
  averageRating: number;
  responseRate: number;
  completionRate: number;
  averageResponseTime: number;
  upcomingCount: number;
  popularConsultationType: ConsultationType;
}

// ============================================
// TIMEZONE HELPERS
// ============================================

export interface TimezoneInfo {
  code: string;
  name: string;
  offset: string;
  offsetMinutes: number;
}

export const GCC_TIMEZONES: Record<string, TimezoneInfo> = {
  UAE: {
    code: 'Asia/Dubai',
    name: 'UAE Standard Time',
    offset: 'GMT+4',
    offsetMinutes: 240
  },
  SAUDI: {
    code: 'Asia/Riyadh',
    name: 'Arabia Standard Time',
    offset: 'GMT+3',
    offsetMinutes: 180
  },
  QATAR: {
    code: 'Asia/Qatar',
    name: 'Arabia Standard Time',
    offset: 'GMT+3',
    offsetMinutes: 180
  },
  KUWAIT: {
    code: 'Asia/Kuwait',
    name: 'Arabia Standard Time',
    offset: 'GMT+3',
    offsetMinutes: 180
  },
  BAHRAIN: {
    code: 'Asia/Bahrain',
    name: 'Arabia Standard Time',
    offset: 'GMT+3',
    offsetMinutes: 180
  },
  OMAN: {
    code: 'Asia/Muscat',
    name: 'Gulf Standard Time',
    offset: 'GMT+4',
    offsetMinutes: 240
  }
};

// ============================================
// QUICK QUESTION (ASYNC)
// ============================================

export type QuickQuestionStatus =
  | 'pending'
  | 'answered'
  | 'clarification_needed'
  | 'closed';

export interface QuickQuestion {
  id: string;
  clientId: string;
  lawyerId: string;
  question: string;
  attachments?: string[];
  response?: string;
  responseTime?: string;
  status: QuickQuestionStatus;
  price: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

# Consultation Booking System Design

## Overview
Complete consultation booking system for the lawyer marketplace, supporting video, phone, in-person, document review, and async consultations with full scheduling, payment, and notification capabilities.

---

## 1. Database Schema

### 1.1 Core Consultation Tables

```sql
-- ============================================
-- LAWYER AVAILABILITY & CALENDAR
-- ============================================

-- Lawyer availability configuration
CREATE TABLE lawyer_availability (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Timezone (critical for GCC/UAE)
  timezone TEXT NOT NULL DEFAULT 'Asia/Dubai', -- Asia/Dubai, Asia/Riyadh, Asia/Qatar, etc.

  -- Buffer time between consultations (minutes)
  buffer_minutes INTEGER NOT NULL DEFAULT 15,

  -- Instant booking vs request approval
  instant_booking_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Maximum advance booking days
  max_advance_days INTEGER NOT NULL DEFAULT 60,

  -- Minimum notice hours
  min_notice_hours INTEGER NOT NULL DEFAULT 24,

  -- Active status
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lawyer_availability_lawyer ON lawyer_availability(lawyer_id);

-- Recurring weekly availability schedule
CREATE TABLE availability_schedules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  availability_id TEXT NOT NULL REFERENCES lawyer_availability(id) ON DELETE CASCADE,

  -- Day of week (0 = Sunday, 6 = Saturday)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),

  -- Time slots in lawyer's timezone (24-hour format)
  start_time TEXT NOT NULL, -- Format: "09:00"
  end_time TEXT NOT NULL,   -- Format: "17:00"

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_availability_schedules_availability ON availability_schedules(availability_id);
CREATE INDEX idx_availability_schedules_day ON availability_schedules(day_of_week);

-- Specific date overrides (holidays, special hours, blocked dates)
CREATE TABLE availability_overrides (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Date being overridden
  override_date DATE NOT NULL,

  -- Override type
  type TEXT NOT NULL CHECK (type IN ('blocked', 'custom_hours', 'holiday')),

  -- Custom hours if applicable (lawyer's timezone)
  start_time TEXT,
  end_time TEXT,

  -- Reason/notes
  reason TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_availability_overrides_lawyer ON availability_overrides(lawyer_id);
CREATE INDEX idx_availability_overrides_date ON availability_overrides(override_date);

-- ============================================
-- CONSULTATION PRICING
-- ============================================

CREATE TABLE consultation_pricing (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Consultation type
  consultation_type TEXT NOT NULL CHECK (
    consultation_type IN ('video', 'phone', 'in_person', 'document_review', 'quick_question')
  ),

  -- Pricing model
  pricing_model TEXT NOT NULL CHECK (
    pricing_model IN ('hourly', 'fixed', 'package')
  ),

  -- Pricing details (AED)
  hourly_rate DECIMAL(10, 2),
  fixed_fee DECIMAL(10, 2),

  -- Duration (minutes) - for fixed fee consultations
  duration_minutes INTEGER,

  -- Free initial consultation
  is_free_initial BOOLEAN NOT NULL DEFAULT false,
  free_initial_minutes INTEGER,

  -- Package pricing (JSON)
  package_details TEXT, -- JSON: [{"name": "3 Sessions", "sessions": 3, "price": 1500, "validity_days": 90}]

  -- Availability
  is_available BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(lawyer_id, consultation_type)
);

CREATE INDEX idx_consultation_pricing_lawyer ON consultation_pricing(lawyer_id);

-- ============================================
-- BOOKINGS & CONSULTATIONS
-- ============================================

CREATE TABLE consultations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  consultation_number TEXT UNIQUE NOT NULL, -- CON-2025-001234

  -- Parties
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Consultation details
  consultation_type TEXT NOT NULL CHECK (
    consultation_type IN ('video', 'phone', 'in_person', 'document_review', 'quick_question')
  ),

  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',           -- Awaiting lawyer approval
      'confirmed',         -- Confirmed by lawyer
      'payment_pending',   -- Awaiting payment
      'paid',             -- Payment completed
      'in_progress',      -- Currently happening
      'completed',        -- Finished successfully
      'cancelled_client', -- Cancelled by client
      'cancelled_lawyer', -- Cancelled by lawyer
      'no_show_client',   -- Client didn't show
      'no_show_lawyer',   -- Lawyer didn't show
      'refunded'          -- Payment refunded
    )
  ),

  -- Scheduling (all times in UTC, convert based on timezones)
  scheduled_at TIMESTAMP NOT NULL,
  scheduled_end_at TIMESTAMP,
  timezone_client TEXT NOT NULL DEFAULT 'Asia/Dubai',
  timezone_lawyer TEXT NOT NULL DEFAULT 'Asia/Dubai',

  -- Duration
  duration_minutes INTEGER NOT NULL,

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',

  -- Is this free initial consultation?
  is_free_initial BOOLEAN NOT NULL DEFAULT false,

  -- Payment
  payment_id TEXT, -- Reference to payment system
  payment_status TEXT CHECK (
    payment_status IN ('pending', 'authorized', 'captured', 'refunded', 'failed')
  ),
  paid_at TIMESTAMP,

  -- Meeting details
  meeting_location TEXT, -- Physical address for in-person
  meeting_link TEXT,     -- Video call URL
  meeting_phone TEXT,    -- Phone number for call
  meeting_id TEXT,       -- External meeting ID (Zoom, etc.)
  meeting_passcode TEXT,

  -- Client information
  client_phone TEXT,
  client_notes TEXT,

  -- Pre-consultation data
  questionnaire_responses TEXT, -- JSON: Pre-consultation questionnaire
  document_ids TEXT,            -- JSON: Array of uploaded document IDs

  -- Post-consultation data
  consultation_notes TEXT,      -- Lawyer's notes
  consultation_summary TEXT,    -- Summary for client
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,

  -- Actual timing
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  actual_duration_minutes INTEGER,

  -- Cancellation
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  cancellation_policy_applied TEXT, -- Which policy was used
  refund_amount DECIMAL(10, 2),

  -- Reminders sent
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  reminder_whatsapp_sent BOOLEAN DEFAULT false,

  -- Ratings & Review
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  client_review TEXT,
  client_reviewed_at TIMESTAMP,

  lawyer_rating INTEGER CHECK (lawyer_rating >= 1 AND lawyer_rating <= 5),
  lawyer_review TEXT,
  lawyer_reviewed_at TIMESTAMP,

  -- Metadata
  metadata TEXT, -- JSON: Additional flexible data

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_client ON consultations(client_id);
CREATE INDEX idx_consultations_lawyer ON consultations(lawyer_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled ON consultations(scheduled_at);
CREATE INDEX idx_consultations_number ON consultations(consultation_number);

-- ============================================
-- PRE-CONSULTATION QUESTIONNAIRES
-- ============================================

CREATE TABLE consultation_questionnaires (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Questionnaire details
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,

  -- Apply to which consultation types
  consultation_types TEXT NOT NULL, -- JSON: ["video", "phone", "in_person"]

  -- Questions (JSON array)
  questions TEXT NOT NULL, -- [{"id": "q1", "question": "What is the nature of your legal issue?", "type": "textarea", "required": true}]

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultation_questionnaires_lawyer ON consultation_questionnaires(lawyer_id);

-- ============================================
-- CONSULTATION DOCUMENTS
-- ============================================

CREATE TABLE consultation_documents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

  -- Document info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,

  -- Upload details
  uploaded_by TEXT NOT NULL, -- 'client' or 'lawyer'
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Document purpose
  purpose TEXT CHECK (purpose IN ('pre_consultation', 'during_consultation', 'follow_up')),

  -- Notes
  notes TEXT
);

CREATE INDEX idx_consultation_documents_consultation ON consultation_documents(consultation_id);

-- ============================================
-- CONSULTATION MESSAGES
-- ============================================

CREATE TABLE consultation_messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

  -- Message details
  sender_id TEXT NOT NULL REFERENCES users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'lawyer', 'system')),

  message_type TEXT NOT NULL CHECK (
    message_type IN ('text', 'system', 'file', 'video_link', 'reminder')
  ),

  content TEXT,
  metadata TEXT, -- JSON: Additional data (file info, etc.)

  -- Read status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultation_messages_consultation ON consultation_messages(consultation_id);
CREATE INDEX idx_consultation_messages_sender ON consultation_messages(sender_id);

-- ============================================
-- NOTIFICATION TRACKING
-- ============================================

CREATE TABLE consultation_notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  consultation_id TEXT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (
    notification_type IN (
      'booking_request',
      'booking_confirmed',
      'booking_cancelled',
      'payment_received',
      'reminder_24h',
      'reminder_1h',
      'consultation_started',
      'consultation_ended',
      'review_request',
      'follow_up'
    )
  ),

  -- Recipient
  recipient_id TEXT NOT NULL REFERENCES users(id),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('client', 'lawyer')),

  -- Delivery channels
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'in_app')),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')
  ),

  -- Content
  subject TEXT,
  body TEXT,

  -- Delivery tracking
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,

  -- External IDs
  external_id TEXT, -- Twilio SID, email message ID, etc.

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultation_notifications_consultation ON consultation_notifications(consultation_id);
CREATE INDEX idx_consultation_notifications_recipient ON consultation_notifications(recipient_id);
CREATE INDEX idx_consultation_notifications_status ON consultation_notifications(status);

-- ============================================
-- PACKAGE PURCHASES
-- ============================================

CREATE TABLE consultation_packages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Package details
  package_name TEXT NOT NULL,
  total_sessions INTEGER NOT NULL,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  sessions_remaining INTEGER NOT NULL,

  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,
  price_per_session DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',

  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'exhausted', 'refunded')
  ),

  -- Payment
  payment_id TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultation_packages_client ON consultation_packages(client_id);
CREATE INDEX idx_consultation_packages_lawyer ON consultation_packages(lawyer_id);
CREATE INDEX idx_consultation_packages_status ON consultation_packages(status);

-- Link consultations to packages
ALTER TABLE consultations ADD COLUMN package_id TEXT REFERENCES consultation_packages(id);
CREATE INDEX idx_consultations_package ON consultations(package_id);
```

---

## 2. API Endpoints

### 2.1 Lawyer Availability Management

```typescript
// GET /api/lawyers/:lawyerId/availability
// Get lawyer's availability configuration and schedule
interface GetAvailabilityResponse {
  availability: {
    timezone: string;
    bufferMinutes: number;
    instantBookingEnabled: boolean;
    maxAdvanceDays: number;
    minNoticeHours: number;
  };
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  overrides: Array<{
    date: string;
    type: 'blocked' | 'custom_hours' | 'holiday';
    startTime?: string;
    endTime?: string;
    reason?: string;
  }>;
}

// PUT /api/lawyers/:lawyerId/availability
// Update availability settings
interface UpdateAvailabilityRequest {
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

// POST /api/lawyers/:lawyerId/availability/overrides
// Add date override (holiday, blocked day, custom hours)
interface CreateOverrideRequest {
  date: string;
  type: 'blocked' | 'custom_hours' | 'holiday';
  startTime?: string;
  endTime?: string;
  reason?: string;
}

// GET /api/lawyers/:lawyerId/availability/slots
// Get available time slots for booking
interface GetAvailableSlotsRequest {
  startDate: string;
  endDate: string;
  consultationType: 'video' | 'phone' | 'in_person' | 'document_review';
  duration?: number; // minutes
  clientTimezone?: string;
}

interface GetAvailableSlotsResponse {
  slots: Array<{
    date: string;
    startTime: string; // ISO 8601 in client's timezone
    endTime: string;
    available: boolean;
    price: number;
  }>;
  lawyerTimezone: string;
  clientTimezone: string;
}
```

### 2.2 Consultation Pricing

```typescript
// GET /api/lawyers/:lawyerId/pricing
// Get pricing for all consultation types
interface GetPricingResponse {
  pricing: Array<{
    consultationType: 'video' | 'phone' | 'in_person' | 'document_review' | 'quick_question';
    pricingModel: 'hourly' | 'fixed' | 'package';
    hourlyRate?: number;
    fixedFee?: number;
    durationMinutes?: number;
    isFreeInitial: boolean;
    freeInitialMinutes?: number;
    packages?: Array<{
      name: string;
      sessions: number;
      price: number;
      validityDays: number;
      pricePerSession: number;
    }>;
    isAvailable: boolean;
  }>;
  currency: string;
}

// PUT /api/lawyers/:lawyerId/pricing/:consultationType
// Update pricing for a consultation type
interface UpdatePricingRequest {
  pricingModel: 'hourly' | 'fixed' | 'package';
  hourlyRate?: number;
  fixedFee?: number;
  durationMinutes?: number;
  isFreeInitial?: boolean;
  freeInitialMinutes?: number;
  packages?: Array<{
    name: string;
    sessions: number;
    price: number;
    validityDays: number;
  }>;
  isAvailable?: boolean;
}
```

### 2.3 Consultation Booking (Client)

```typescript
// POST /api/consultations
// Create a new consultation booking
interface CreateConsultationRequest {
  lawyerId: string;
  consultationType: 'video' | 'phone' | 'in_person' | 'document_review' | 'quick_question';
  scheduledAt: string; // ISO 8601
  durationMinutes: number;
  clientTimezone: string;
  clientPhone?: string;
  clientNotes?: string;
  questionnaireResponses?: Record<string, any>;
  documentIds?: string[];
  packageId?: string; // If using a package
}

interface CreateConsultationResponse {
  consultation: {
    id: string;
    consultationNumber: string;
    status: string;
    scheduledAt: string;
    scheduledEndAt: string;
    totalPrice: number;
    currency: string;
    requiresApproval: boolean; // If instant booking disabled
    paymentRequired: boolean;
    paymentUrl?: string;
  };
}

// GET /api/consultations
// List user's consultations
interface ListConsultationsRequest {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface ListConsultationsResponse {
  consultations: Array<{
    id: string;
    consultationNumber: string;
    consultationType: string;
    status: string;
    scheduledAt: string;
    durationMinutes: number;
    lawyer: {
      id: string;
      name: string;
      avatarUrl?: string;
      title: string;
    };
    totalPrice: number;
    currency: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// GET /api/consultations/:id
// Get consultation details
interface GetConsultationResponse {
  consultation: {
    id: string;
    consultationNumber: string;
    consultationType: string;
    status: string;
    scheduledAt: string;
    scheduledEndAt: string;
    timezoneClient: string;
    timezoneLawyer: string;
    durationMinutes: number;
    basePrice: number;
    platformFee: number;
    totalPrice: number;
    currency: string;
    isFreeInitial: boolean;
    meetingLink?: string;
    meetingPhone?: string;
    meetingLocation?: string;
    meetingPasscode?: string;
    clientNotes?: string;
    questionnaireResponses?: Record<string, any>;
    documents: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      uploadedBy: string;
      uploadedAt: string;
    }>;
    consultationNotes?: string;
    consultationSummary?: string;
    followUpRequired: boolean;
    followUpNotes?: string;
    startedAt?: string;
    endedAt?: string;
    actualDurationMinutes?: number;
    lawyer: {
      id: string;
      name: string;
      avatarUrl?: string;
      title: string;
      email: string;
      phone?: string;
    };
    client: {
      id: string;
      name: string;
      avatarUrl?: string;
      email: string;
      phone?: string;
    };
  };
}

// PATCH /api/consultations/:id/cancel
// Cancel a consultation
interface CancelConsultationRequest {
  reason: string;
}

interface CancelConsultationResponse {
  success: boolean;
  refundAmount?: number;
  refundPolicy: string;
}

// POST /api/consultations/:id/reschedule
// Reschedule a consultation
interface RescheduleConsultationRequest {
  newScheduledAt: string;
  reason?: string;
}
```

### 2.4 Consultation Management (Lawyer)

```typescript
// GET /api/lawyers/consultations
// List lawyer's consultations
interface LawyerListConsultationsRequest {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// PATCH /api/lawyers/consultations/:id/confirm
// Confirm a pending consultation (if instant booking disabled)
interface ConfirmConsultationResponse {
  success: boolean;
  consultation: {
    id: string;
    status: string;
    meetingLink?: string;
  };
}

// PATCH /api/lawyers/consultations/:id/reject
// Reject a consultation request
interface RejectConsultationRequest {
  reason: string;
  suggestedAlternatives?: Array<{
    date: string;
    time: string;
  }>;
}

// PATCH /api/lawyers/consultations/:id/start
// Mark consultation as started
interface StartConsultationResponse {
  success: boolean;
  startedAt: string;
}

// PATCH /api/lawyers/consultations/:id/complete
// Complete a consultation
interface CompleteConsultationRequest {
  consultationNotes?: string;
  consultationSummary?: string;
  followUpRequired?: boolean;
  followUpNotes?: string;
  actualDurationMinutes?: number;
}

// POST /api/lawyers/consultations/:id/documents
// Upload document to consultation
interface UploadConsultationDocumentRequest {
  file: File;
  purpose: 'pre_consultation' | 'during_consultation' | 'follow_up';
  notes?: string;
}
```

### 2.5 Questionnaires

```typescript
// GET /api/lawyers/:lawyerId/questionnaires
// Get lawyer's questionnaires
interface ListQuestionnairesResponse {
  questionnaires: Array<{
    id: string;
    name: string;
    description?: string;
    consultationTypes: string[];
    questions: Array<{
      id: string;
      question: string;
      questionAr?: string;
      type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number';
      required: boolean;
      options?: Array<{
        value: string;
        label: string;
        labelAr?: string;
      }>;
    }>;
    isActive: boolean;
  }>;
}

// POST /api/lawyers/:lawyerId/questionnaires
// Create questionnaire
interface CreateQuestionnaireRequest {
  name: string;
  nameAr?: string;
  description?: string;
  consultationTypes: string[];
  questions: Array<{
    question: string;
    questionAr?: string;
    type: string;
    required: boolean;
    options?: Array<{ value: string; label: string; labelAr?: string }>;
  }>;
}
```

### 2.6 Packages

```typescript
// POST /api/consultations/packages/purchase
// Purchase a consultation package
interface PurchasePackageRequest {
  lawyerId: string;
  packageName: string;
  totalSessions: number;
  totalPrice: number;
  validityDays: number;
}

// GET /api/consultations/packages
// List user's packages
interface ListPackagesResponse {
  packages: Array<{
    id: string;
    packageName: string;
    totalSessions: number;
    sessionsUsed: number;
    sessionsRemaining: number;
    validFrom: string;
    validUntil: string;
    status: string;
    lawyer: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
}
```

### 2.7 Reviews & Ratings

```typescript
// POST /api/consultations/:id/review
// Submit review for consultation
interface SubmitReviewRequest {
  rating: number; // 1-5
  review?: string;
  reviewerType: 'client' | 'lawyer';
}

// GET /api/lawyers/:lawyerId/reviews
// Get lawyer's reviews
interface GetLawyerReviewsResponse {
  reviews: Array<{
    id: string;
    consultationType: string;
    rating: number;
    review: string;
    reviewedAt: string;
    client: {
      name: string;
      avatarUrl?: string;
    };
  }>;
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}
```

---

## 3. UI Wireframe Descriptions

### 3.1 Client Booking Flow

#### Step 1: Lawyer Profile - Consultation Options
```
┌─────────────────────────────────────────────────────────┐
│ [Lawyer Profile Header]                                 │
│ Dr. Ahmed Al-Mahmoud - Senior Legal Consultant         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Tabs: Overview | Reviews | Availability | Book]       │
│                                                          │
│ ┌─── Book Consultation ───────────────────────────┐    │
│ │                                                   │    │
│ │  Select Consultation Type:                       │    │
│ │                                                   │    │
│ │  ┌──────────────┐  ┌──────────────┐             │    │
│ │  │ [Video Call] │  │ [Phone Call] │             │    │
│ │  │  500 AED     │  │  400 AED     │             │    │
│ │  │  30-60 min   │  │  30-60 min   │             │    │
│ │  └──────────────┘  └──────────────┘             │    │
│ │                                                   │    │
│ │  ┌──────────────┐  ┌──────────────┐             │    │
│ │  │ [In-Person]  │  │ [Doc Review] │             │    │
│ │  │  800 AED     │  │  From 600    │             │    │
│ │  │  60 min      │  │  2-5 days    │             │    │
│ │  └──────────────┘  └──────────────┘             │    │
│ │                                                   │    │
│ │  [Free 15-min consultation available]           │    │
│ │                                                   │    │
│ │  Package Deals Available:                        │    │
│ │  • 3 Sessions - 1,350 AED (Save 150 AED)       │    │
│ │  • 5 Sessions - 2,100 AED (Save 400 AED)       │    │
│ │                                                   │    │
│ └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

#### Step 2: Date & Time Selection
```
┌─────────────────────────────────────────────────────────┐
│ Book Video Consultation with Dr. Ahmed Al-Mahmoud      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Your Timezone: [Asia/Dubai (GMT+4) ▼]                  │
│                                                          │
│ ┌─── Select Date & Time ────────────────────────┐      │
│ │                                                 │      │
│ │  December 2025                    [< >]        │      │
│ │  ┌──────────────────────────────────────┐     │      │
│ │  │ Sun Mon Tue Wed Thu Fri Sat         │     │      │
│ │  │  1   2   3   4   5   6   7          │     │      │
│ │  │  8   9  [10] 11  12  13  14         │     │      │
│ │  │ 15  16  17  18  19  20  21          │     │      │
│ │  └──────────────────────────────────────┘     │      │
│ │                                                 │      │
│ │  Available Times (Your Time - GMT+4):          │      │
│ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │      │
│ │  │ 9:00 │ │10:30 │ │14:00 │ │16:00 │         │      │
│ │  └──────┘ └──────┘ └──────┘ └──────┘         │      │
│ │                                                 │      │
│ │  Duration: [⚪ 30 min  ⚫ 60 min]              │      │
│ │                                                 │      │
│ │  Selected: Wed, Dec 10, 2025 at 2:00 PM       │      │
│ │  (Lawyer's time: 2:00 PM GMT+4)                │      │
│ │                                                 │      │
│ └─────────────────────────────────────────────────┘      │
│                                                          │
│ [< Back]                          [Continue to Details >]│
└─────────────────────────────────────────────────────────┘
```

#### Step 3: Pre-Consultation Details
```
┌─────────────────────────────────────────────────────────┐
│ Consultation Details                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Contact Information:                                    │
│ ┌─────────────────────────────────────────┐            │
│ │ Phone Number: [+971 50 123 4567____]   │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Pre-Consultation Questionnaire:                         │
│                                                          │
│ 1. What is the nature of your legal issue? *           │
│ ┌─────────────────────────────────────────┐            │
│ │ [Employment contract dispute...]        │            │
│ │                                          │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ 2. Have you consulted a lawyer about this before?      │
│ ( ) Yes  (•) No                                         │
│                                                          │
│ 3. Urgency Level:                                       │
│ [Medium urgency ▼]                                      │
│                                                          │
│ Upload Related Documents (Optional):                    │
│ ┌─────────────────────────────────────────┐            │
│ │ [📎 Drag files here or click to browse] │            │
│ │                                          │            │
│ │ ✓ employment_contract.pdf (2.4 MB)      │            │
│ │ ✓ termination_letter.pdf (1.1 MB)       │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Additional Notes:                                       │
│ ┌─────────────────────────────────────────┐            │
│ │ [Any specific concerns you want to      │            │
│ │  discuss...]                             │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ [< Back]                          [Continue to Payment >]│
└─────────────────────────────────────────────────────────┘
```

#### Step 4: Payment & Confirmation
```
┌─────────────────────────────────────────────────────────┐
│ Review & Payment                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Consultation Summary:                                   │
│ ┌─────────────────────────────────────────┐            │
│ │ Type: Video Consultation                │            │
│ │ Lawyer: Dr. Ahmed Al-Mahmoud            │            │
│ │ Date: Wednesday, Dec 10, 2025           │            │
│ │ Time: 2:00 PM - 3:00 PM (Your time)     │            │
│ │ Duration: 60 minutes                     │            │
│ │                                          │            │
│ │ ─────────────────────────────────────   │            │
│ │ Consultation Fee:          500.00 AED   │            │
│ │ Platform Fee (10%):         50.00 AED   │            │
│ │ ─────────────────────────────────────   │            │
│ │ Total:                     550.00 AED   │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Payment Method:                                         │
│ (•) Credit/Debit Card                                   │
│ ( ) Apple Pay                                           │
│ ( ) Google Pay                                          │
│                                                          │
│ ┌─────────────────────────────────────────┐            │
│ │ Card Number: [____ ____ ____ ____]      │            │
│ │ Expiry: [MM/YY]  CVV: [___]             │            │
│ │ Name: [________________]                 │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Cancellation Policy:                                    │
│ • Free cancellation up to 24h before                    │
│ • 50% refund if cancelled within 24h                    │
│ • No refund for no-shows                                │
│                                                          │
│ [☑] I agree to the terms and cancellation policy       │
│                                                          │
│ [< Back]               [Confirm & Pay 550.00 AED >]    │
└─────────────────────────────────────────────────────────┘
```

#### Step 5: Booking Confirmation
```
┌─────────────────────────────────────────────────────────┐
│ ✓ Consultation Booked Successfully!                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Confirmation #: CON-2025-001234                         │
│                                                          │
│ ┌─────────────────────────────────────────┐            │
│ │ 📅 Wednesday, December 10, 2025         │            │
│ │ 🕐 2:00 PM - 3:00 PM (Dubai Time)       │            │
│ │ 💼 Dr. Ahmed Al-Mahmoud                 │            │
│ │ 🎥 Video Consultation                   │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ What's Next:                                            │
│ 1. ✓ Payment confirmed                                  │
│ 2. ✓ Lawyer will review your questionnaire             │
│ 3. 📧 Meeting link will be sent 24h before             │
│ 4. 📱 You'll receive reminders via WhatsApp & Email    │
│                                                          │
│ Actions:                                                │
│ [📥 Add to Calendar]  [📄 View Details]                │
│                                                          │
│ Need to make changes?                                   │
│ [Reschedule]  [Cancel Booking]                         │
│                                                          │
│ A confirmation email has been sent to your email.      │
│                                                          │
│ [← Back to Dashboard]      [Join Waiting Room (Soon)]  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Lawyer Calendar Management

```
┌─────────────────────────────────────────────────────────┐
│ My Calendar & Availability                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Week View] [Day View] [Month View]  [⚙️ Settings]     │
│                                                          │
│ Week of Dec 8 - Dec 14, 2025          [< Today >]      │
│                                                          │
│ ┌───┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐       │
│ │   │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │       │
│ ├───┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤       │
│ │9am│     │[B]  │     │[B]  │     │     │     │       │
│ │10 │     │[B]  │[A]  │     │[A]  │[B]  │     │       │
│ │11 │     │     │[A]  │     │[A]  │[B]  │     │       │
│ │12 │     │     │     │     │     │     │     │       │
│ │1pm│     │     │     │     │     │     │     │       │
│ │2  │     │[B]  │[B]  │[B]  │     │[A]  │     │       │
│ │3  │     │[B]  │[B]  │     │     │[A]  │     │       │
│ │4  │     │     │     │     │[B]  │     │     │       │
│ └───┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘       │
│                                                          │
│ Legend:                                                 │
│ [A] Available   [B] Booked   [ ] Blocked               │
│                                                          │
│ Upcoming Consultations:                                 │
│ ┌─────────────────────────────────────────┐            │
│ │ 🎥 Mon, 9:00 AM - Sarah K.              │            │
│ │    Employment Contract Review            │            │
│ │    [Prepare] [Join] [Reschedule]        │            │
│ ├─────────────────────────────────────────┤            │
│ │ 📞 Wed, 2:00 PM - Ahmed M.              │            │
│ │    Real Estate Consultation              │            │
│ │    [Prepare] [Details]                   │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ [+ Block Time]  [+ Add Custom Hours]  [+ Mark Holiday] │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Active Consultation Interface (Video Call)

```
┌─────────────────────────────────────────────────────────┐
│ 🎥 Video Consultation - Sarah Khan                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌───────────────────────────────────────────────┐      │
│ │                                                 │      │
│ │          [Live Video Feed]                     │      │
│ │                                                 │      │
│ │                                                 │      │
│ │         [Sarah Khan - Client]                  │      │
│ │                                                 │      │
│ │                                                 │      │
│ │  ┌─────────────┐                               │      │
│ │  │ [Your       │                               │      │
│ │  │  Camera]    │  ⏱️ 23:45 / 60:00             │      │
│ │  └─────────────┘                               │      │
│ └───────────────────────────────────────────────┘      │
│                                                          │
│ [🎤 Mute] [📹 Video] [💬 Chat] [📎 Share] [⏹️ End]    │
│                                                          │
│ ┌─── Session Info & Tools ─────────────────────┐      │
│ │                                                │      │
│ │ 📋 Case: Employment Contract Dispute          │      │
│ │                                                │      │
│ │ [View Questionnaire] [View Documents]         │      │
│ │                                                │      │
│ │ Live Notes:                                    │      │
│ │ ┌────────────────────────────────────┐        │      │
│ │ │ - Non-compete clause concerns      │        │      │
│ │ │ - Review termination conditions    │        │      │
│ │ │ - Check notice period compliance   │        │      │
│ │ └────────────────────────────────────┘        │      │
│ │                                                │      │
│ │ Quick Actions:                                 │      │
│ │ [📄 Share Document] [✉️ Send Follow-up]       │      │
│ │ [➕ Extend Time] [⏰ Schedule Next]            │      │
│ └────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 3.4 Post-Consultation Summary

```
┌─────────────────────────────────────────────────────────┐
│ Complete Consultation                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Consultation Details:                                   │
│ Client: Sarah Khan                                      │
│ Type: Video Consultation                                │
│ Duration: 58 minutes (Scheduled: 60 min)               │
│                                                          │
│ Session Notes (For your records):                       │
│ ┌─────────────────────────────────────────┐            │
│ │ - Reviewed employment contract          │            │
│ │ - Non-compete clause needs revision     │            │
│ │ - Advised on termination procedures     │            │
│ │ - Recommended additional documentation  │            │
│ │                                          │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Client Summary (Sent to client):                        │
│ ┌─────────────────────────────────────────┐            │
│ │ Key Discussion Points:                  │            │
│ │ • Employment contract review completed  │            │
│ │ • Identified issues with non-compete   │            │
│ │   clause - needs legal challenge       │            │
│ │ • Next steps: Gather supporting docs   │            │
│ │                                          │            │
│ │ Recommendations:                         │            │
│ │ 1. Request revised contract from        │            │
│ │    employer                              │            │
│ │ 2. Document all communications          │            │
│ │ 3. Schedule follow-up in 2 weeks        │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Follow-Up Required:                                     │
│ [☑] Yes  [ ] No                                         │
│                                                          │
│ Follow-up Notes:                                        │
│ ┌─────────────────────────────────────────┐            │
│ │ Schedule follow-up after client         │            │
│ │ receives revised contract               │            │
│ └─────────────────────────────────────────┘            │
│                                                          │
│ Attach Documents:                                       │
│ [📎 Upload Documents for Client]                       │
│                                                          │
│ [Save Draft]              [Complete & Send Summary >]   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Integration Requirements

### 4.1 Video Call Integration

**Recommended Solutions:**
- **Primary:** Twilio Video (MENA region support, scalable, WebRTC)
- **Alternative:** Agora.io (excellent MENA connectivity)
- **Fallback:** Daily.co (simple integration)

**Integration Steps:**

```typescript
// Video call service
interface VideoCallConfig {
  provider: 'twilio' | 'agora' | 'daily';
  region: 'uae' | 'gcc';
  recordingEnabled: boolean;
  maxParticipants: number;
}

class VideoCallService {
  // Generate meeting room
  async createMeeting(consultationId: string): Promise<{
    meetingId: string;
    meetingUrl: string;
    hostToken: string;
    guestToken: string;
    expiresAt: Date;
  }>;

  // Join meeting
  async joinMeeting(meetingId: string, participantType: 'host' | 'guest'): Promise<{
    token: string;
    roomName: string;
  }>;

  // End meeting
  async endMeeting(meetingId: string): Promise<void>;

  // Get recording (if enabled)
  async getRecording(meetingId: string): Promise<{
    recordingUrl: string;
    duration: number;
  }>;
}

// Twilio Video Implementation
class TwilioVideoService implements VideoCallService {
  private twilioClient: Twilio;

  async createMeeting(consultationId: string) {
    // Create room
    const room = await this.twilioClient.video.rooms.create({
      uniqueName: consultationId,
      type: 'group',
      recordParticipantsOnConnect: true,
      maxParticipants: 2,
      region: 'uae1' // UAE datacenter
    });

    // Generate tokens
    const hostToken = this.generateToken(room.sid, 'host');
    const guestToken = this.generateToken(room.sid, 'guest');

    return {
      meetingId: room.sid,
      meetingUrl: `${process.env.APP_URL}/consultations/${consultationId}/meeting`,
      hostToken,
      guestToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    };
  }

  private generateToken(roomSid: string, identity: string): string {
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity, ttl: 86400 } // 24h
    );

    const videoGrant = new VideoGrant({ room: roomSid });
    token.addGrant(videoGrant);

    return token.toJwt();
  }
}
```

**Features Required:**
- P2P video/audio communication
- Screen sharing
- Chat messaging
- Recording (optional, with consent)
- UAE/GCC region servers
- Mobile & desktop support
- Network quality indicators
- Automatic reconnection

### 4.2 Calendar Integration

**Options:**
1. **Google Calendar API** - Most common
2. **Microsoft Graph API** - For Outlook/Office 365
3. **CalDAV** - Standard protocol

```typescript
// Calendar sync service
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[];
  reminders: Array<{ method: string; minutes: number }>;
}

class CalendarSyncService {
  // Sync lawyer's calendar with external calendar
  async syncToExternalCalendar(
    lawyerId: string,
    provider: 'google' | 'microsoft',
    consultationId: string
  ): Promise<void>;

  // Check for conflicts with external calendar
  async checkConflicts(
    lawyerId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean>;

  // Create calendar invite for participants
  async createCalendarInvite(
    consultation: Consultation
  ): Promise<{
    icsFile: string;
    googleCalendarUrl: string;
    outlookCalendarUrl: string;
  }>;
}

// Implementation
class GoogleCalendarService implements CalendarSyncService {
  async createCalendarInvite(consultation: Consultation) {
    const event: CalendarEvent = {
      id: consultation.id,
      title: `Legal Consultation - ${consultation.consultationType}`,
      description: `
        Consultation with ${consultation.lawyer.name}
        Type: ${consultation.consultationType}
        ${consultation.meetingLink ? `Join: ${consultation.meetingLink}` : ''}

        Questions or concerns? Reply to this email.
      `,
      startTime: new Date(consultation.scheduledAt),
      endTime: new Date(consultation.scheduledEndAt),
      location: consultation.meetingLocation || consultation.meetingLink,
      attendees: [consultation.client.email, consultation.lawyer.email],
      reminders: [
        { method: 'email', minutes: 1440 }, // 24h
        { method: 'popup', minutes: 60 }    // 1h
      ]
    };

    // Generate ICS file for download
    const icsFile = this.generateICS(event);

    // Generate Google Calendar URL
    const googleUrl = this.generateGoogleCalendarUrl(event);

    // Generate Outlook URL
    const outlookUrl = this.generateOutlookCalendarUrl(event);

    return {
      icsFile,
      googleCalendarUrl: googleUrl,
      outlookCalendarUrl: outlookUrl
    };
  }

  private generateICS(event: CalendarEvent): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${this.formatICSDate(new Date())}
DTSTART:${this.formatICSDate(event.startTime)}
DTEND:${this.formatICSDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
ATTENDEE:${event.attendees.join(',')}
END:VEVENT
END:VCALENDAR`;
  }

  private formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}
```

### 4.3 Payment Integration

**Recommended for UAE/GCC:**
- **Stripe** (supports AED, SAR, etc.)
- **PayTabs** (MENA-focused)
- **Telr** (UAE-based)
- **Network International** (major UAE acquirer)

```typescript
// Payment service
interface PaymentConfig {
  provider: 'stripe' | 'paytabs' | 'telr';
  currency: 'AED' | 'SAR' | 'QAR';
  platformFeePercentage: number;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  clientSecret?: string;
  paymentUrl?: string;
}

class PaymentService {
  // Create payment for consultation
  async createPayment(
    consultationId: string,
    amount: number,
    currency: string
  ): Promise<PaymentIntent>;

  // Capture authorized payment
  async capturePayment(paymentId: string): Promise<void>;

  // Refund payment
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }>;

  // Calculate platform fee and lawyer payout
  calculateFees(amount: number): {
    subtotal: number;
    platformFee: number;
    total: number;
    lawyerPayout: number;
  };
}

// Stripe implementation
class StripePaymentService implements PaymentService {
  private stripe: Stripe;

  async createPayment(consultationId: string, amount: number, currency: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        consultationId,
        type: 'consultation'
      },
      capture_method: 'manual', // Authorize now, capture after consultation
      payment_method_types: ['card'],
    });

    return {
      id: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
      clientSecret: paymentIntent.client_secret || undefined
    };
  }

  calculateFees(amount: number) {
    const platformFeePercentage = 0.10; // 10%
    const platformFee = amount * platformFeePercentage;
    const total = amount + platformFee;
    const lawyerPayout = amount;

    return {
      subtotal: amount,
      platformFee,
      total,
      lawyerPayout
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any
    });

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
  }
}
```

### 4.4 WhatsApp Integration (via Twilio)

Already exists in your codebase - extend for consultation notifications:

```typescript
// Extend existing WhatsApp service
class ConsultationWhatsAppService {
  // Send booking confirmation
  async sendBookingConfirmation(
    phone: string,
    consultation: Consultation,
    language: 'en' | 'ar'
  ): Promise<void>;

  // Send reminder
  async sendReminder(
    phone: string,
    consultation: Consultation,
    hoursUntil: number,
    language: 'en' | 'ar'
  ): Promise<void>;

  // Send meeting link
  async sendMeetingLink(
    phone: string,
    consultation: Consultation,
    language: 'en' | 'ar'
  ): Promise<void>;

  // Send post-consultation summary
  async sendSummary(
    phone: string,
    consultation: Consultation,
    summary: string,
    language: 'en' | 'ar'
  ): Promise<void>;
}
```

---

## 5. Notification Triggers

### 5.1 Notification Events & Timing

```typescript
interface NotificationTrigger {
  event: string;
  timing: string;
  channels: Array<'email' | 'whatsapp' | 'sms' | 'in_app'>;
  recipients: Array<'client' | 'lawyer'>;
  template: string;
}

const NOTIFICATION_TRIGGERS: NotificationTrigger[] = [
  // Booking Flow
  {
    event: 'consultation_requested',
    timing: 'immediate',
    channels: ['email', 'in_app'],
    recipients: ['lawyer'],
    template: 'new_consultation_request'
  },
  {
    event: 'consultation_confirmed',
    timing: 'immediate',
    channels: ['email', 'whatsapp', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'consultation_confirmed'
  },
  {
    event: 'payment_received',
    timing: 'immediate',
    channels: ['email', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'payment_confirmation'
  },

  // Reminders
  {
    event: 'consultation_reminder_24h',
    timing: '24 hours before',
    channels: ['email', 'whatsapp'],
    recipients: ['client', 'lawyer'],
    template: 'reminder_24h'
  },
  {
    event: 'consultation_reminder_1h',
    timing: '1 hour before',
    channels: ['whatsapp', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'reminder_1h'
  },
  {
    event: 'meeting_link_available',
    timing: '30 minutes before',
    channels: ['email', 'whatsapp'],
    recipients: ['client', 'lawyer'],
    template: 'meeting_link'
  },

  // During Consultation
  {
    event: 'consultation_started',
    timing: 'immediate',
    channels: ['in_app'],
    recipients: ['client', 'lawyer'],
    template: 'consultation_started'
  },
  {
    event: 'consultation_ending_soon',
    timing: '5 minutes before end',
    channels: ['in_app'],
    recipients: ['client', 'lawyer'],
    template: 'consultation_ending'
  },

  // Post-Consultation
  {
    event: 'consultation_completed',
    timing: 'immediate',
    channels: ['email', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'consultation_completed'
  },
  {
    event: 'summary_available',
    timing: 'immediate',
    channels: ['email', 'whatsapp', 'in_app'],
    recipients: ['client'],
    template: 'consultation_summary'
  },
  {
    event: 'review_request',
    timing: '24 hours after completion',
    channels: ['email', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'review_request'
  },

  // Cancellations
  {
    event: 'consultation_cancelled',
    timing: 'immediate',
    channels: ['email', 'whatsapp', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'consultation_cancelled'
  },
  {
    event: 'refund_processed',
    timing: 'immediate',
    channels: ['email', 'in_app'],
    recipients: ['client'],
    template: 'refund_confirmation'
  },

  // Rescheduling
  {
    event: 'reschedule_requested',
    timing: 'immediate',
    channels: ['email', 'in_app'],
    recipients: ['lawyer'],
    template: 'reschedule_request'
  },
  {
    event: 'reschedule_confirmed',
    timing: 'immediate',
    channels: ['email', 'whatsapp', 'in_app'],
    recipients: ['client', 'lawyer'],
    template: 'reschedule_confirmed'
  },

  // Follow-up
  {
    event: 'follow_up_scheduled',
    timing: 'immediate',
    channels: ['email', 'in_app'],
    recipients: ['client'],
    template: 'follow_up_scheduled'
  },
  {
    event: 'document_shared',
    timing: 'immediate',
    channels: ['email', 'whatsapp', 'in_app'],
    recipients: ['client'],
    template: 'document_shared'
  }
];
```

### 5.2 Notification Templates

```typescript
// WhatsApp template (24h reminder) - English
const WHATSAPP_REMINDER_24H_EN = `
Hello {{clientName}}! 👋

This is a reminder about your upcoming consultation:

📅 Date: {{date}}
🕐 Time: {{time}} ({{timezone}})
👨‍⚖️ Lawyer: {{lawyerName}}
💼 Type: {{consultationType}}

{{#if meetingLink}}
📹 Meeting Link: {{meetingLink}}
{{/if}}

{{#if meetingLocation}}
📍 Location: {{meetingLocation}}
{{/if}}

Need to reschedule? Reply RESCHEDULE
Have questions? Reply HELP

See you tomorrow! ✨
`;

// WhatsApp template (24h reminder) - Arabic
const WHATSAPP_REMINDER_24H_AR = `
مرحباً {{clientName}}! 👋

هذا تذكير باستشارتك القادمة:

📅 التاريخ: {{date}}
🕐 الوقت: {{time}} ({{timezone}})
👨‍⚖️ المحامي: {{lawyerName}}
💼 النوع: {{consultationType}}

{{#if meetingLink}}
📹 رابط الاجتماع: {{meetingLink}}
{{/if}}

{{#if meetingLocation}}
📍 الموقع: {{meetingLocation}}
{{/if}}

تريد إعادة الجدولة؟ أرسل: إعادة جدولة
لديك أسئلة؟ أرسل: مساعدة

نراك غداً! ✨
`;

// Email template (confirmation) - English
const EMAIL_CONFIRMATION_EN = `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Email styles */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Consultation Confirmed</h1>
    </div>

    <div class="content">
      <p>Dear {{clientName}},</p>

      <p>Your consultation has been confirmed!</p>

      <div class="details-box">
        <h3>Consultation Details</h3>
        <table>
          <tr>
            <td><strong>Confirmation #:</strong></td>
            <td>{{consultationNumber}}</td>
          </tr>
          <tr>
            <td><strong>Date:</strong></td>
            <td>{{date}}</td>
          </tr>
          <tr>
            <td><strong>Time:</strong></td>
            <td>{{time}} ({{timezone}})</td>
          </tr>
          <tr>
            <td><strong>Lawyer:</strong></td>
            <td>{{lawyerName}}</td>
          </tr>
          <tr>
            <td><strong>Type:</strong></td>
            <td>{{consultationType}}</td>
          </tr>
          <tr>
            <td><strong>Duration:</strong></td>
            <td>{{duration}} minutes</td>
          </tr>
        </table>
      </div>

      <div class="action-buttons">
        <a href="{{addToCalendarUrl}}" class="button">📅 Add to Calendar</a>
        <a href="{{viewDetailsUrl}}" class="button button-secondary">View Details</a>
      </div>

      <h3>What to Expect:</h3>
      <ol>
        <li>You'll receive a meeting link 30 minutes before</li>
        <li>Please join 5 minutes early for tech check</li>
        <li>Have your documents ready</li>
        <li>A summary will be sent after the call</li>
      </ol>

      <div class="info-box">
        <h4>Need to Make Changes?</h4>
        <p>You can reschedule or cancel up to 24 hours before without penalty.</p>
        <a href="{{rescheduleUrl}}">Reschedule</a> |
        <a href="{{cancelUrl}}">Cancel Booking</a>
      </div>
    </div>

    <div class="footer">
      <p>Questions? Contact us at support@legaldocs.ae</p>
    </div>
  </div>
</body>
</html>
`;
```

### 5.3 Notification Scheduler

```typescript
// Background job for sending scheduled notifications
class NotificationScheduler {
  // Check and send due reminders every minute
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();

    // Find consultations needing 24h reminders
    const consultations24h = await db.query(`
      SELECT * FROM consultations
      WHERE status = 'confirmed'
        AND reminder_24h_sent = false
        AND scheduled_at BETWEEN $1 AND $2
    `, [
      new Date(now.getTime() + 23.5 * 60 * 60 * 1000),
      new Date(now.getTime() + 24.5 * 60 * 60 * 1000)
    ]);

    for (const consultation of consultations24h) {
      await this.send24HourReminder(consultation);
    }

    // Find consultations needing 1h reminders
    const consultations1h = await db.query(`
      SELECT * FROM consultations
      WHERE status = 'confirmed'
        AND reminder_1h_sent = false
        AND scheduled_at BETWEEN $1 AND $2
    `, [
      new Date(now.getTime() + 0.5 * 60 * 60 * 1000),
      new Date(now.getTime() + 1.5 * 60 * 60 * 1000)
    ]);

    for (const consultation of consultations1h) {
      await this.send1HourReminder(consultation);
    }

    // Find consultations needing meeting links (30 min before)
    const consultationsMeetingLink = await db.query(`
      SELECT * FROM consultations
      WHERE status = 'confirmed'
        AND consultation_type IN ('video', 'phone')
        AND scheduled_at BETWEEN $1 AND $2
    `, [
      new Date(now.getTime() + 25 * 60 * 1000),
      new Date(now.getTime() + 35 * 60 * 1000)
    ]);

    for (const consultation of consultationsMeetingLink) {
      await this.sendMeetingLink(consultation);
    }
  }

  private async send24HourReminder(consultation: Consultation) {
    // Send to client
    await Promise.all([
      emailService.send({
        to: consultation.client.email,
        template: 'reminder_24h',
        data: consultation
      }),
      whatsappService.send({
        to: consultation.clientPhone,
        template: 'reminder_24h',
        language: consultation.client.language,
        data: consultation
      })
    ]);

    // Send to lawyer
    await emailService.send({
      to: consultation.lawyer.email,
      template: 'reminder_24h_lawyer',
      data: consultation
    });

    // Mark as sent
    await db.query(`
      UPDATE consultations
      SET reminder_24h_sent = true
      WHERE id = $1
    `, [consultation.id]);
  }
}
```

---

## 6. Additional Features

### 6.1 Cancellation Policies

```typescript
interface CancellationPolicy {
  name: string;
  rules: Array<{
    hoursBeforeConsultation: number;
    refundPercentage: number;
    description: string;
  }>;
}

const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = {
  name: 'Standard Cancellation Policy',
  rules: [
    {
      hoursBeforeConsultation: 48,
      refundPercentage: 100,
      description: 'Full refund if cancelled 48+ hours before'
    },
    {
      hoursBeforeConsultation: 24,
      refundPercentage: 50,
      description: '50% refund if cancelled 24-48 hours before'
    },
    {
      hoursBeforeConsultation: 0,
      refundPercentage: 0,
      description: 'No refund if cancelled less than 24 hours before'
    }
  ]
};

function calculateRefund(
  consultation: Consultation,
  cancellationTime: Date
): { refundAmount: number; refundPercentage: number; policyApplied: string } {
  const hoursUntilConsultation =
    (new Date(consultation.scheduledAt).getTime() - cancellationTime.getTime()) /
    (1000 * 60 * 60);

  const policy = DEFAULT_CANCELLATION_POLICY;

  // Find applicable rule
  const applicableRule = policy.rules
    .sort((a, b) => a.hoursBeforeConsultation - b.hoursBeforeConsultation)
    .find(rule => hoursUntilConsultation >= rule.hoursBeforeConsultation);

  if (!applicableRule) {
    return {
      refundAmount: 0,
      refundPercentage: 0,
      policyApplied: 'No refund - cancellation too close to consultation time'
    };
  }

  const refundAmount = (consultation.totalPrice * applicableRule.refundPercentage) / 100;

  return {
    refundAmount,
    refundPercentage: applicableRule.refundPercentage,
    policyApplied: applicableRule.description
  };
}
```

### 6.2 Timezone Handling

```typescript
import { DateTime } from 'luxon';

class TimezoneService {
  // GCC timezones
  static readonly TIMEZONES = {
    UAE: 'Asia/Dubai',        // GMT+4
    SAUDI: 'Asia/Riyadh',     // GMT+3
    QATAR: 'Asia/Qatar',      // GMT+3
    KUWAIT: 'Asia/Kuwait',    // GMT+3
    BAHRAIN: 'Asia/Bahrain',  // GMT+3
    OMAN: 'Asia/Muscat'       // GMT+4
  };

  // Convert consultation time between timezones
  static convertTime(
    time: Date | string,
    fromTimezone: string,
    toTimezone: string
  ): DateTime {
    return DateTime.fromISO(time.toString(), { zone: fromTimezone })
      .setZone(toTimezone);
  }

  // Display time in user's timezone
  static displayTime(
    time: Date | string,
    timezone: string,
    format: 'full' | 'short' = 'full'
  ): string {
    const dt = DateTime.fromISO(time.toString(), { zone: timezone });

    if (format === 'full') {
      return dt.toFormat('EEEE, MMMM d, yyyy \'at\' h:mm a ZZZZ');
    } else {
      return dt.toFormat('MMM d, h:mm a');
    }
  }

  // Get available slots in client's timezone
  static getAvailableSlots(
    lawyerAvailability: AvailabilitySchedule[],
    lawyerTimezone: string,
    clientTimezone: string,
    date: Date
  ): Array<{ startTime: DateTime; endTime: DateTime; label: string }> {
    // Implementation for converting lawyer's availability to client's timezone
    // and generating available slots
  }
}
```

### 6.3 Quick Question (Async) Workflow

```typescript
// Quick question is an async text-based consultation
interface QuickQuestion {
  id: string;
  clientId: string;
  lawyerId: string;
  question: string;
  attachments?: string[];
  response?: string;
  responseTime?: Date;
  status: 'pending' | 'answered' | 'clarification_needed' | 'closed';
  price: number;
  paidAt?: Date;
  createdAt: Date;
}

// Quick question has different workflow:
// 1. Client pays upfront (lower fee, e.g., 100-200 AED)
// 2. Lawyer has 24-48h to respond
// 3. One follow-up question allowed
// 4. No video/call, just text + documents
```

---

## 7. Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Create database tables and migrations
- [ ] Set up API endpoints for availability management
- [ ] Implement timezone handling service
- [ ] Create lawyer availability UI
- [ ] Build calendar view component

### Phase 2: Booking Flow (Week 3-4)
- [ ] Implement consultation pricing management
- [ ] Build client booking UI (steps 1-5)
- [ ] Create pre-consultation questionnaire system
- [ ] Integrate payment gateway (Stripe)
- [ ] Implement booking confirmation flow

### Phase 3: Video Integration (Week 5)
- [ ] Integrate Twilio Video API
- [ ] Build video call interface
- [ ] Implement screen sharing
- [ ] Add chat functionality
- [ ] Create waiting room

### Phase 4: Notifications (Week 6)
- [ ] Set up notification scheduler
- [ ] Create email templates (EN/AR)
- [ ] Extend WhatsApp integration
- [ ] Implement reminder system
- [ ] Add calendar invite generation

### Phase 5: Consultation Management (Week 7)
- [ ] Build lawyer consultation dashboard
- [ ] Implement start/complete consultation flow
- [ ] Create note-taking interface
- [ ] Build summary generation
- [ ] Add document sharing

### Phase 6: Post-Consultation (Week 8)
- [ ] Implement review system
- [ ] Create follow-up scheduling
- [ ] Build package management
- [ ] Add analytics dashboard
- [ ] Implement refund processing

---

## Summary

This comprehensive consultation booking system provides:

1. **Complete booking workflow** from availability setup to post-consultation follow-up
2. **Multi-timezone support** critical for GCC operations
3. **Multiple consultation types** (video, phone, in-person, document review, async)
4. **Flexible pricing** (hourly, fixed, packages, free initial)
5. **Integrated video calling** via Twilio/Agora
6. **Automated notifications** via WhatsApp, Email, SMS
7. **Payment processing** with proper escrow and refunds
8. **Calendar integration** with Google/Outlook
9. **Pre and post-consultation** features for better service
10. **Full Arabic/English support** for UAE market

The system is designed to scale, handles edge cases (cancellations, no-shows, rescheduling), and provides excellent UX for both lawyers and clients.

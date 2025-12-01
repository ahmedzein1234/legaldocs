# Consultation Booking System - Visual Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                        │
├──────────────────────────┬──────────────────────────────────────────┤
│   CLIENT SIDE            │         LAWYER SIDE                       │
├──────────────────────────┼──────────────────────────────────────────┤
│ 1. Browse Lawyers        │ 1. Set Availability                       │
│ 2. View Pricing          │ 2. Manage Pricing                         │
│ 3. Check Availability    │ 3. View Booking Requests                  │
│ 4. Book Consultation     │ 4. Accept/Reject Bookings                 │
│ 5. Fill Questionnaire    │ 5. Prepare for Consultation               │
│ 6. Upload Documents      │ 6. Join Video Call                        │
│ 7. Make Payment          │ 7. Take Notes                             │
│ 8. Join Video Call       │ 8. Complete & Summarize                   │
│ 9. Receive Summary       │ 9. Manage Follow-ups                      │
│ 10. Leave Review         │ 10. Track Earnings                        │
└──────────────────────────┴──────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Hono/Cloudflare)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Availability   │  │    Booking       │  │    Payment      │  │
│  │   Management     │  │    Management    │  │    Processing   │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Video Call     │  │   Notifications  │  │    Calendar     │  │
│  │   Management     │  │   System         │  │    Sync         │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • Slot Generation (timezone-aware)                                 │
│  • Fee Calculation (base + platform fee)                            │
│  • Cancellation Policy Application                                  │
│  • Reminder Scheduling                                              │
│  • Conflict Detection                                               │
│  • Access Control                                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                             │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│              │              │              │                        │
│   Twilio     │   Stripe     │  SendGrid    │   Google/Outlook     │
│   Video      │   Payments   │  Email       │   Calendar           │
│              │              │              │                        │
│  • Create    │  • Authorize │  • Send      │  • Create Invite     │
│    Rooms     │    Payment   │    Emails    │  • Check Conflicts   │
│  • Generate  │  • Capture   │  • Track     │  • Sync Events       │
│    Tokens    │    Funds     │    Opens     │                        │
│  • Record    │  • Refund    │              │                        │
│              │              │              │                        │
│   Twilio     │              │              │                        │
│   Messaging  │              │              │                        │
│              │              │              │                        │
│  • WhatsApp  │              │              │                        │
│  • SMS       │              │              │                        │
│              │              │              │                        │
└──────────────┴──────────────┴──────────────┴──────────────────────┘
```

---

## Booking Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BOOKING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────┐
│ Browse Lawyers  │
│ - Filter by     │
│   specialization│
│ - View profiles │
│ - Read reviews  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select          │
│ Consultation    │
│ Type            │
│                 │
│ ○ Video Call    │
│ ○ Phone Call    │
│ ○ In-Person     │
│ ○ Doc Review    │
│ ○ Quick Q       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Choose Package  │
│ or Single       │
│                 │
│ ○ Single (500)  │
│ ○ 3-Pack (1350) │
│ ○ 5-Pack (2100) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ View Available  │
│ Slots           │
│                 │
│ Calendar shows: │
│ - Your timezone │
│ - Available hrs │
│ - Pricing       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Date &   │
│ Time            │
│                 │
│ Selected:       │
│ Wed, Dec 10     │
│ 2:00 PM GMT+4   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fill Pre-       │
│ Consultation    │
│ Questionnaire   │
│                 │
│ - Legal issue   │
│ - Urgency       │
│ - Background    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload          │
│ Documents       │
│ (Optional)      │
│                 │
│ ✓ contract.pdf  │
│ ✓ letter.pdf    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Review &        │
│ Confirm         │
│                 │
│ Total: 550 AED  │
│ (500 + 50 fee)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Make Payment    │
│                 │
│ ○ Card          │
│ ○ Apple Pay     │
│ ○ Google Pay    │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │INSTANT?│
    └───┬────┘
        │
    Yes │ No (Requires Approval)
        │
    ┌───▼────────┐     ┌──────────────┐
    │ CONFIRMED  │     │   PENDING    │
    └───┬────────┘     └──────┬───────┘
        │                     │
        │                     ▼
        │              ┌──────────────┐
        │              │ Lawyer       │
        │              │ Reviews      │
        │              └──────┬───────┘
        │                     │
        │              ┌──────▼───────┐
        │              │ Accept/Reject│
        │              └──────┬───────┘
        │                     │
        └─────────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │ Notifications    │
         │ Sent:            │
         │ - Email ✓        │
         │ - WhatsApp ✓     │
         │ - Calendar ✓     │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ 24h Reminder     │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ 1h Reminder      │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ Join Video Call  │
         │                  │
         │ [Live Video]     │
         │ [Chat]           │
         │ [Screen Share]   │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ Consultation     │
         │ Completed        │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ Receive Summary  │
         │ - Key points     │
         │ - Recommendations│
         │ - Next steps     │
         └─────────┬────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ Leave Review     │
         │ ⭐⭐⭐⭐⭐       │
         └──────────────────┘
                   │
                   ▼
                 END
```

---

## Database Entity Relationship Diagram

```
┌────────────────────────┐
│        Users           │
│────────────────────────│
│ id (PK)                │
│ email                  │
│ full_name              │
│ phone                  │
│ role                   │
│ timezone               │
└───────┬────────────────┘
        │
        │ 1:1 (if lawyer)
        │
        ▼
┌────────────────────────┐
│ LawyerAvailability     │
│────────────────────────│
│ id (PK)                │
│ lawyer_id (FK)         │
│ timezone               │
│ buffer_minutes         │
│ instant_booking        │
│ max_advance_days       │
│ min_notice_hours       │
└───┬────────────────────┘
    │
    │ 1:N
    │
    ▼
┌────────────────────────┐         ┌────────────────────────┐
│ AvailabilitySchedules  │         │ AvailabilityOverrides  │
│────────────────────────│         │────────────────────────│
│ id (PK)                │         │ id (PK)                │
│ availability_id (FK)   │         │ lawyer_id (FK)         │
│ day_of_week (0-6)      │         │ override_date          │
│ start_time             │         │ type (blocked/custom)  │
│ end_time               │         │ start_time             │
└────────────────────────┘         │ end_time               │
                                   │ reason                 │
                                   └────────────────────────┘


┌────────────────────────┐
│ ConsultationPricing    │
│────────────────────────│
│ id (PK)                │
│ lawyer_id (FK)         │
│ consultation_type      │
│ pricing_model          │
│ hourly_rate            │
│ fixed_fee              │
│ is_free_initial        │
│ package_details (JSON) │
└────────────────────────┘


┌────────────────────────┐
│    Consultations       │
│────────────────────────│
│ id (PK)                │
│ consultation_number    │
│ client_id (FK)         │──────┐
│ lawyer_id (FK)         │      │ N:1
│ consultation_type      │      │
│ status                 │      │
│ scheduled_at           │      ▼
│ scheduled_end_at       │  ┌────────────────────────┐
│ timezone_client        │  │        Users           │
│ timezone_lawyer        │  │        (Client)        │
│ duration_minutes       │  └────────────────────────┘
│ base_price             │
│ platform_fee           │      N:1
│ total_price            │      │
│ payment_id             │      │
│ payment_status         │      ▼
│ meeting_link           │  ┌────────────────────────┐
│ meeting_location       │  │        Users           │
│ client_notes           │  │       (Lawyer)         │
│ questionnaire (JSON)   │  └────────────────────────┘
│ consultation_notes     │
│ consultation_summary   │
│ follow_up_required     │
│ client_rating          │
│ lawyer_rating          │
│ package_id (FK)        │
└───┬────────────────────┘
    │
    │ 1:N
    │
    ├──────────────────┬──────────────────┬──────────────────┐
    │                  │                  │                  │
    ▼                  ▼                  ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
│Consultation  │ │Consultation  │ │Consultation  │ │Consultation │
│Documents     │ │Messages      │ │Notifications │ │Questionnaire│
│──────────────│ │──────────────│ │──────────────│ │─────────────│
│id (PK)       │ │id (PK)       │ │id (PK)       │ │id (PK)      │
│consultation  │ │consultation  │ │consultation  │ │lawyer_id    │
│  _id (FK)    │ │  _id (FK)    │ │  _id (FK)    │ │name         │
│file_name     │ │sender_id     │ │type          │ │questions    │
│file_url      │ │sender_type   │ │channel       │ │  (JSON)     │
│uploaded_by   │ │content       │ │status        │ │consultation │
│purpose       │ │is_read       │ │sent_at       │ │  _types     │
└──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘


┌────────────────────────┐
│ ConsultationPackages   │
│────────────────────────│
│ id (PK)                │
│ client_id (FK)         │
│ lawyer_id (FK)         │
│ package_name           │
│ total_sessions         │
│ sessions_used          │
│ sessions_remaining     │
│ total_price            │
│ valid_from             │
│ valid_until            │
│ status                 │
└────────────────────────┘
```

---

## Notification Flow Timeline

```
TIME          CLIENT                              LAWYER
─────────────────────────────────────────────────────────────

Booking
  │
  ├─────────► Booking Confirmation Email     ──► New Request Email
  │           Booking Confirmation WhatsApp      In-App Notification
  │           Add to Calendar Link
  │

24h Before
  │
  ├─────────► 24h Reminder Email             ──► 24h Reminder Email
  │           24h Reminder WhatsApp               24h Reminder WhatsApp
  │           "Prepare your documents"            "Review questionnaire"
  │

1h Before
  │
  ├─────────► 1h Reminder WhatsApp           ──► 1h Reminder WhatsApp
  │           1h Reminder SMS                     In-App Notification
  │           "Join soon!"
  │

30m Before
  │
  ├─────────► Meeting Link Email             ──► Meeting Link Email
  │           Meeting Link WhatsApp               Meeting Link WhatsApp
  │           Ready to Join                       Ready to Join
  │

15m Before
  │
  ├─────────► In-App "Starting Soon"         ──► In-App "Starting Soon"
  │           Push Notification                   Push Notification
  │

Start Time
  │
  ├─────────► Join Waiting Room              ──► Join Meeting
  │           In-App Status: "Waiting"            In-App Status: "Active"
  │

During
  │
  │           [Video Call in Progress]            [Taking Notes]
  │

5m to End
  │
  ├─────────► In-App "Ending Soon"           ──► In-App "Ending Soon"
  │           "Wrap up questions"                 "Prepare summary"
  │

End Time
  │
  ├─────────► Thank You Message              ──► Summary Form
  │           "Summary coming soon"               "Add notes & next steps"
  │

Post-Call
  │
  ├─────────► Summary Email                  ──► Summary Saved
  │           Summary WhatsApp                    Payment Released
  │           Summary In-App
  │           Attached Documents
  │

+24h
  │
  ├─────────► Review Request Email           ──► Review Request Email
  │           Review Request In-App               (to review client)
  │           "Rate your experience"
  │

+7d (if follow-up needed)
  │
  └─────────► Follow-up Reminder             ──► Follow-up Reminder
              "Schedule your follow-up"          "Client needs follow-up"
```

---

## Payment & Refund Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW                              │
└─────────────────────────────────────────────────────────────┘

    Booking Created
         │
         ▼
    ┌─────────────────┐
    │ Create Payment  │
    │ Intent          │
    │                 │
    │ Amount: 550 AED │
    │ Status: Pending │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Client Enters   │
    │ Card Details    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Authorize       │
    │ Payment         │
    │ (Hold funds)    │
    └────────┬────────┘
             │
        ┌────▼─────┐
        │ Success? │
        └────┬─────┘
             │
    ┌────────┴────────┐
    │                 │
   Yes               No
    │                 │
    ▼                 ▼
┌────────────┐   ┌────────────┐
│ Status:    │   │ Status:    │
│ Authorized │   │ Failed     │
│            │   │            │
│ Booking:   │   │ Booking:   │
│ Confirmed  │   │ Cancelled  │
└─────┬──────┘   └────────────┘
      │
      │ Consultation Happens
      │
      ▼
┌────────────┐
│ Capture    │
│ Payment    │
│ (Transfer  │
│  funds)    │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ Calculate  │
│ Split:     │
│            │
│ Lawyer:    │
│  500 AED   │
│            │
│ Platform:  │
│  50 AED    │
└────────────┘


┌─────────────────────────────────────────────────────────────┐
│                   REFUND SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

Cancellation Time     Refund %    Amount        Policy
───────────────────────────────────────────────────────────────
48+ hours before       100%       550 AED       Full refund

24-48 hours before     50%        275 AED       Partial refund

< 24 hours before      0%         0 AED         No refund

No-show (client)       0%         0 AED         No refund

No-show (lawyer)       120%       660 AED       Full refund +
                                                 20% credit

Technical issues       100%       550 AED       Full refund
───────────────────────────────────────────────────────────────


Refund Processing:
    Cancellation
         │
         ▼
    Calculate Refund
    (based on policy)
         │
         ▼
    Create Refund
    Request
         │
         ▼
    Stripe Processes
    (5-10 business days)
         │
         ▼
    Refund Complete
    Email Sent
```

---

## Timezone Handling Example

```
SCENARIO: Dubai client books with Riyadh lawyer

Client Location: Dubai (GMT+4)
Lawyer Location: Riyadh (GMT+3)

┌─────────────────────────────────────────────────────────┐
│              CLIENT VIEW (Dubai Time)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Available Slots:                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐                            │
│  │ 9:00 │ │10:30 │ │14:00 │  ◄── Displayed in          │
│  │  AM  │ │  AM  │ │  PM  │      Dubai time (GMT+4)    │
│  └──────┘ └──────┘ └──────┘                            │
│                                                          │
│  Selected: 2:00 PM Dubai Time                           │
│                                                          │
└─────────────────────────────────────────────────────────┘

               │
               │ Booking Request
               │ (Stored in UTC: 10:00 AM UTC)
               ▼

┌─────────────────────────────────────────────────────────┐
│               LAWYER VIEW (Riyadh Time)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  New Booking:                                           │
│  Client: Ahmed M. (Dubai)                               │
│  Time: 1:00 PM Riyadh Time  ◄── Displayed in           │
│                                  Lawyer's timezone      │
│  (Client's time: 2:00 PM)                               │
│                                                          │
└─────────────────────────────────────────────────────────┘

               │
               │ Notifications Sent
               ▼

┌─────────────────────────────────────────────────────────┐
│                   NOTIFICATIONS                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  To Client (Dubai):                                     │
│  "Your consultation is tomorrow at 2:00 PM GMT+4"       │
│                                                          │
│  To Lawyer (Riyadh):                                    │
│  "Your consultation is tomorrow at 1:00 PM GMT+3"       │
│                                                          │
│  Both receive at correct local times!                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Complete Feature Matrix

| Feature | Client | Lawyer | Status |
|---------|--------|--------|--------|
| Browse marketplace | ✅ | ❌ | Phase 1 |
| Set availability | ❌ | ✅ | Phase 1 |
| View available slots | ✅ | ❌ | Phase 1 |
| Timezone conversion | ✅ | ✅ | Phase 1 |
| Instant booking | ✅ | ✅ | Phase 2 |
| Request approval | ✅ | ✅ | Phase 2 |
| Pre-consultation form | ✅ | ✅ | Phase 2 |
| Document upload | ✅ | ✅ | Phase 2 |
| Payment processing | ✅ | ❌ | Phase 3 |
| Package purchases | ✅ | ✅ | Phase 3 |
| Video consultation | ✅ | ✅ | Phase 4 |
| Phone consultation | ✅ | ✅ | Phase 4 |
| In-person booking | ✅ | ✅ | Phase 4 |
| Document review | ✅ | ✅ | Phase 5 |
| Quick questions | ✅ | ✅ | Phase 5 |
| Email notifications | ✅ | ✅ | Phase 6 |
| WhatsApp notifications | ✅ | ✅ | Phase 6 |
| SMS notifications | ✅ | ✅ | Phase 6 |
| Calendar sync | ✅ | ✅ | Phase 6 |
| Reminders (24h, 1h) | ✅ | ✅ | Phase 6 |
| Post-consultation summary | ✅ | ✅ | Phase 7 |
| Reviews & ratings | ✅ | ✅ | Phase 7 |
| Follow-up scheduling | ✅ | ✅ | Phase 7 |
| Cancellation & refunds | ✅ | ✅ | Phase 7 |
| Analytics dashboard | ❌ | ✅ | Phase 8 |
| Package management | ✅ | ✅ | Phase 8 |

---

## Files Created

1. **Main Design Document**: `CONSULTATION_BOOKING_SYSTEM.md`
   - Complete database schema (SQL)
   - API endpoint specifications
   - UI wireframe descriptions
   - Integration requirements
   - Notification triggers

2. **Type Definitions**: `packages/shared/src/types/consultation.ts`
   - TypeScript interfaces
   - Type definitions
   - Enums and constants
   - API request/response types

3. **Implementation Guide**: `CONSULTATION_IMPLEMENTATION_GUIDE.md`
   - Phase-by-phase implementation plan
   - Code examples
   - Testing checklist
   - Deployment instructions

4. **Notification Templates**: `apps/api/src/templates/consultation-notifications.ts`
   - WhatsApp templates (EN/AR)
   - Email templates (EN/AR)
   - SMS templates
   - In-app notification templates

5. **Visual Overview**: `CONSULTATION_SYSTEM_OVERVIEW.md` (this file)
   - Architecture diagrams
   - Flow diagrams
   - ERD
   - Feature matrix

---

## Quick Start

```bash
# 1. Review the design
cat CONSULTATION_BOOKING_SYSTEM.md

# 2. Check type definitions
cat packages/shared/src/types/consultation.ts

# 3. Follow implementation guide
cat CONSULTATION_IMPLEMENTATION_GUIDE.md

# 4. Create database
psql < apps/api/migrations/005_consultation_system.sql

# 5. Install dependencies
npm install twilio @twilio/video stripe luxon

# 6. Set environment variables
cp .env.example .env
# Add Twilio, Stripe, SendGrid keys

# 7. Start development
npm run dev
```

---

## Support Contacts

- **Technical Questions**: Review implementation guide
- **Business Logic**: Review main design document
- **Database Schema**: See ERD in this file
- **API Specs**: See CONSULTATION_BOOKING_SYSTEM.md Section 2

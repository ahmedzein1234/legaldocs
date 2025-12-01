# Consultation Booking System - Quick Reference

## At a Glance

**What is it?** Complete consultation booking system for lawyer marketplace with video calls, scheduling, payments, and notifications.

**Technologies:**
- Backend: Hono (Cloudflare Workers) + PostgreSQL
- Frontend: Next.js + React
- Video: Twilio Video
- Payments: Stripe
- Notifications: Twilio (WhatsApp/SMS) + SendGrid (Email)

---

## 5 Consultation Types

| Type | Description | Duration | Pricing Model | Key Features |
|------|-------------|----------|---------------|--------------|
| **Video Call** | Live video consultation | 30-90 min | Fixed/Hourly | Screen share, recording, chat |
| **Phone Call** | Voice-only consultation | 30-60 min | Fixed/Hourly | Simple, reliable, no camera needed |
| **In-Person** | Physical meeting | 60-120 min | Fixed/Hourly | Location-based, personal interaction |
| **Document Review** | Async document analysis | 2-5 days | Fixed | Detailed written feedback |
| **Quick Question** | Async text consultation | 24-48h | Fixed (low) | One question, one follow-up |

---

## Key Database Tables

```
Core Tables:
├── lawyer_availability         # Timezone, buffer time, booking settings
├── availability_schedules      # Recurring weekly schedule
├── availability_overrides      # Holidays, blocked dates
├── consultation_pricing        # Pricing for each consultation type
├── consultations              # Main booking records
├── consultation_documents     # Uploaded files
├── consultation_messages      # In-app messaging
├── consultation_notifications # Notification tracking
└── consultation_packages      # Multi-session packages
```

---

## Critical Endpoints

### Client APIs
```
POST   /api/consultations                    # Create booking
GET    /api/consultations                    # List bookings
GET    /api/consultations/:id               # Get details
PATCH  /api/consultations/:id/cancel        # Cancel booking
POST   /api/consultations/:id/reschedule    # Reschedule
POST   /api/consultations/:id/review        # Submit review
GET    /api/lawyers/:id/availability/slots  # Get available times
```

### Lawyer APIs
```
GET    /api/lawyers/:id/availability         # Get availability settings
PUT    /api/lawyers/:id/availability         # Update availability
POST   /api/lawyers/:id/availability/overrides # Block dates
GET    /api/lawyers/:id/pricing              # Get pricing
PUT    /api/lawyers/:id/pricing/:type        # Update pricing
PATCH  /api/lawyers/consultations/:id/confirm # Confirm booking
PATCH  /api/lawyers/consultations/:id/complete # Mark complete
```

---

## Notification Schedule

| Trigger | Timing | Channels | Recipients |
|---------|--------|----------|------------|
| Booking confirmed | Immediate | Email, WhatsApp, In-app | Client, Lawyer |
| Payment received | Immediate | Email, In-app | Client, Lawyer |
| 24h reminder | 24h before | Email, WhatsApp | Both |
| 1h reminder | 1h before | WhatsApp, SMS, In-app | Both |
| Meeting link | 30min before | Email, WhatsApp | Both |
| Starting soon | 15min before | In-app, Push | Both |
| Summary ready | After completion | Email, WhatsApp, In-app | Client |
| Review request | 24h after | Email, In-app | Both |

---

## Timezone Handling

**Storage:** All times stored in UTC in database

**Display:** Convert to user's timezone for display

**Example:**
```typescript
// Stored in DB (UTC)
scheduledAt: "2025-12-10T10:00:00Z"

// Displayed to Dubai client (GMT+4)
"Wed, Dec 10 at 2:00 PM GST"

// Displayed to Riyadh lawyer (GMT+3)
"Wed, Dec 10 at 1:00 PM AST"
```

**Implementation:**
```typescript
import { DateTime } from 'luxon';

// Convert for display
const userTime = DateTime.fromISO(scheduledAt, { zone: 'UTC' })
  .setZone(userTimezone)
  .toFormat('EEEE, MMMM d \'at\' h:mm a ZZZZ');
```

---

## Payment Flow

```
1. Create booking → Payment Intent (Authorize)
2. Client pays → Status: Authorized
3. Consultation happens → Capture payment
4. Split funds:
   - Lawyer receives: basePrice
   - Platform keeps: platformFee (10%)
```

**Refund Policy:**
- 48+ hours: 100% refund
- 24-48 hours: 50% refund
- < 24 hours: No refund
- Lawyer no-show: 120% refund (100% + 20% credit)

---

## Video Call Integration (Twilio)

**Setup:**
```typescript
// Create room
const room = await twilio.video.v1.rooms.create({
  uniqueName: consultationId,
  type: 'group',
  maxParticipants: 2,
  recordParticipantsOnConnect: false
});

// Generate tokens
const token = new AccessToken(accountSid, apiKey, apiSecret, {
  identity: userId,
  ttl: 86400 // 24 hours
});

const videoGrant = new VideoGrant({ room: room.sid });
token.addGrant(videoGrant);

return token.toJwt();
```

**Client Usage:**
```typescript
import { connect } from 'twilio-video';

const room = await connect(token, {
  name: consultationId,
  audio: true,
  video: { width: 1280 }
});

// Handle participants
room.on('participantConnected', participant => {
  attachParticipantTracks(participant);
});
```

---

## Availability Slot Generation

**Algorithm:**
```
1. Get lawyer's recurring schedule (e.g., Mon-Fri 9am-5pm)
2. Get date overrides (holidays, custom hours)
3. Get existing bookings
4. For each day in range:
   a. Check if day has override (blocked/holiday → skip)
   b. Get schedule for day of week
   c. Generate slots from start to end time
   d. Skip slots that:
      - Conflict with existing bookings
      - Are in the past
      - Are within minimum notice period
   e. Convert to client's timezone
5. Return available slots
```

**Example:**
```typescript
// Lawyer schedule: Mon 9am-5pm Dubai time
// Client timezone: Riyadh (1 hour behind)

Slots shown to client:
- 8:00 AM AST (9:00 AM GST)
- 9:30 AM AST (10:30 AM GST)
- 1:00 PM AST (2:00 PM GST)
```

---

## Package System

**Concept:** Buy multiple sessions upfront at discounted rate

**Example Packages:**
```
Single Session:    500 AED
3-Session Package: 1,350 AED (450/session, save 150 AED)
5-Session Package: 2,100 AED (420/session, save 400 AED)
```

**Workflow:**
1. Client purchases package
2. Package credits created (e.g., 5 sessions)
3. Each booking deducts 1 credit
4. Package expires after validity period (e.g., 90 days)

**Database:**
```sql
consultation_packages:
- total_sessions: 5
- sessions_used: 2
- sessions_remaining: 3
- valid_until: 2025-03-15
```

---

## Environment Variables

```bash
# Twilio Video
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_API_KEY=SKxxxxx
TWILIO_API_SECRET=xxxxx

# Twilio Messaging (WhatsApp/SMS)
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_PHONE_NUMBER=+1234567890

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@legaldocs.ae

# App URLs
APP_URL=https://app.legaldocs.ae
API_URL=https://api.legaldocs.ae

# Database
DATABASE_URL=postgresql://user:pass@host/db
```

---

## Common Code Snippets

### Calculate Fees
```typescript
function calculateFees(basePrice: number): {
  subtotal: number;
  platformFee: number;
  total: number;
  lawyerPayout: number;
} {
  const platformFeePercentage = 0.10; // 10%
  const platformFee = basePrice * platformFeePercentage;
  const total = basePrice + platformFee;

  return {
    subtotal: basePrice,
    platformFee,
    total,
    lawyerPayout: basePrice
  };
}
```

### Calculate Refund
```typescript
function calculateRefund(
  consultation: Consultation,
  cancellationTime: Date
): RefundCalculation {
  const hoursUntil =
    (new Date(consultation.scheduledAt).getTime() - cancellationTime.getTime()) /
    (1000 * 60 * 60);

  if (hoursUntil >= 48) {
    return {
      refundAmount: consultation.totalPrice,
      refundPercentage: 100,
      policyApplied: 'Full refund - cancelled 48+ hours before'
    };
  } else if (hoursUntil >= 24) {
    return {
      refundAmount: consultation.totalPrice * 0.5,
      refundPercentage: 50,
      policyApplied: 'Partial refund - cancelled 24-48 hours before'
    };
  } else {
    return {
      refundAmount: 0,
      refundPercentage: 0,
      policyApplied: 'No refund - cancelled less than 24 hours before'
    };
  }
}
```

### Format for WhatsApp
```typescript
function formatWhatsAppMessage(
  template: string,
  data: Record<string, any>,
  language: 'en' | 'ar'
): string {
  let message = language === 'ar'
    ? WHATSAPP_TEMPLATES[`${template}_ar`](data)
    : WHATSAPP_TEMPLATES[`${template}_en`](data);

  return message;
}

// Usage
const message = formatWhatsAppMessage('booking_confirmed', {
  clientName: 'Ahmed',
  consultationNumber: 'CON-2025-001234',
  date: 'Wednesday, December 10',
  time: '2:00 PM',
  timezone: 'GST',
  lawyerName: 'Dr. Sarah Khan',
  consultationType: 'Video Call'
}, 'en');
```

---

## Testing Checklist

### Unit Tests
- [ ] Slot generation with various schedules
- [ ] Timezone conversion accuracy
- [ ] Fee calculation
- [ ] Refund policy application
- [ ] Notification template rendering

### Integration Tests
- [ ] Complete booking flow
- [ ] Payment authorization & capture
- [ ] Video room creation
- [ ] Notification delivery
- [ ] Calendar invite generation

### E2E Tests
- [ ] Client books consultation
- [ ] Lawyer approves/rejects
- [ ] Video call works
- [ ] Notifications received
- [ ] Summary delivered
- [ ] Review submitted

### Manual Tests
- [ ] Cross-timezone booking
- [ ] Payment processing
- [ ] WhatsApp notifications
- [ ] Video quality
- [ ] Mobile responsiveness
- [ ] Arabic language support

---

## Performance Considerations

**Database Indexes:**
```sql
-- Critical for slot generation
CREATE INDEX idx_consultations_lawyer_scheduled ON consultations(lawyer_id, scheduled_at);

-- Critical for notifications
CREATE INDEX idx_consultations_status_scheduled ON consultations(status, scheduled_at);

-- Critical for client history
CREATE INDEX idx_consultations_client_created ON consultations(client_id, created_at DESC);
```

**Caching Strategy:**
```typescript
// Cache lawyer availability (TTL: 5 minutes)
const availability = await cache.get(`lawyer:${lawyerId}:availability`);

// Cache available slots (TTL: 1 minute)
const slots = await cache.get(`slots:${lawyerId}:${date}`);

// Invalidate on changes
await cache.delete(`lawyer:${lawyerId}:availability`);
```

---

## Common Issues & Solutions

### Issue: Slots not showing
**Solution:** Check timezone conversion, ensure lawyer has availability set, verify no conflicts

### Issue: Notifications not sending
**Solution:** Check Twilio credentials, verify phone numbers are E.164 format, check SendGrid API key

### Issue: Video call not connecting
**Solution:** Verify Twilio tokens not expired, check CORS settings, ensure HTTPS

### Issue: Payment failing
**Solution:** Check Stripe test/live mode, verify webhook secret, ensure 3D Secure supported

### Issue: Wrong timezone displayed
**Solution:** Ensure storing UTC in DB, use Luxon for conversion, pass timezone in API calls

---

## Security Best Practices

1. **Authentication:**
   - Verify user owns booking before showing details
   - Check lawyer can only access their consultations
   - Validate video call tokens

2. **Payment Security:**
   - Never log full card numbers
   - Use Stripe's client-side tokenization
   - Validate webhooks with signature

3. **Data Privacy:**
   - Anonymize data in logs
   - Encrypt sensitive fields (notes)
   - Implement data retention policy

4. **Video Calls:**
   - Generate unique tokens per session
   - Set token expiration (24h)
   - Disable recording by default (get consent)

---

## Monitoring Metrics

**Key Metrics:**
```
- Booking conversion rate
- Payment success rate
- Video call connection success
- Average call duration
- Notification delivery rate
- Cancellation rate
- Review submission rate
- Average lawyer earnings
```

**Alerts:**
```
- Payment failure > 5%
- Video call failure > 2%
- Notification failure > 10%
- API error rate > 1%
```

---

## Quick Deployment

```bash
# 1. Database
psql $DATABASE_URL < migrations/005_consultation_system.sql

# 2. Environment
cp .env.example .env
# Fill in Twilio, Stripe, SendGrid credentials

# 3. Install
npm install

# 4. Build
npm run build

# 5. Deploy API
cd apps/api
wrangler deploy

# 6. Deploy Web
cd apps/web
vercel --prod

# 7. Test
curl https://api.legaldocs.ae/health
curl https://app.legaldocs.ae/api/health
```

---

## Support Resources

**Documentation:**
- Main Design: `CONSULTATION_BOOKING_SYSTEM.md`
- Implementation: `CONSULTATION_IMPLEMENTATION_GUIDE.md`
- Visual Overview: `CONSULTATION_SYSTEM_OVERVIEW.md`
- Quick Reference: `CONSULTATION_QUICK_REFERENCE.md` (this file)

**Code:**
- Types: `packages/shared/src/types/consultation.ts`
- Templates: `apps/api/src/templates/consultation-notifications.ts`

**External Docs:**
- Twilio Video: https://www.twilio.com/docs/video
- Stripe Payments: https://stripe.com/docs/payments
- Luxon (Timezone): https://moment.github.io/luxon/

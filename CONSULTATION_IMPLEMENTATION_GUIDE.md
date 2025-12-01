# Consultation Booking System - Implementation Guide

## Quick Start Guide

This guide provides step-by-step instructions for implementing the consultation booking system in your lawyer marketplace.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)          │     Mobile App (Future)       │
│  - Lawyer Dashboard         │     - Client Booking          │
│  - Client Booking Flow      │     - Notifications           │
│  - Video Call Interface     │     - Video Calls             │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Hono)                        │
├─────────────────────────────────────────────────────────────┤
│  /api/consultations     │  /api/lawyers/:id/availability   │
│  /api/lawyers/pricing   │  /api/notifications              │
│  /api/payments         │  /api/video/meetings              │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                            │
├─────────────────────────────────────────────────────────────┤
│  Booking Service    │  Availability Service                 │
│  Payment Service    │  Notification Service                 │
│  Video Service      │  Calendar Service                     │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA & INTEGRATIONS                        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL      │  Twilio Video    │  Stripe Payments     │
│  (Consultations) │  (Video Calls)   │  (Transactions)      │
│                  │                   │                       │
│  Twilio API      │  SendGrid        │  Calendar APIs       │
│  (WhatsApp/SMS)  │  (Email)         │  (Google/Outlook)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase-by-Phase Implementation

### Phase 1: Database & Core Models (Week 1)

#### Step 1.1: Create Database Migration

Create file: `legaldocs/apps/api/migrations/005_consultation_system.sql`

```sql
-- Copy the complete SQL schema from CONSULTATION_BOOKING_SYSTEM.md
-- Section 1: Database Schema

-- Run migration:
-- npm run db:migrate
```

#### Step 1.2: Generate Prisma Schema

Update `legaldocs/apps/api/prisma/schema.prisma`:

```prisma
// Add consultation models
model LawyerAvailability {
  id                     String   @id @default(cuid())
  lawyerId               String   @map("lawyer_id")
  timezone               String   @default("Asia/Dubai")
  bufferMinutes          Int      @default(15) @map("buffer_minutes")
  instantBookingEnabled  Boolean  @default(true) @map("instant_booking_enabled")
  maxAdvanceDays         Int      @default(60) @map("max_advance_days")
  minNoticeHours         Int      @default(24) @map("min_notice_hours")
  isActive               Boolean  @default(true) @map("is_active")
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  lawyer                 User     @relation(fields: [lawyerId], references: [id], onDelete: Cascade)
  schedules              AvailabilitySchedule[]

  @@map("lawyer_availability")
}

// Add remaining models...
// See full schema in CONSULTATION_BOOKING_SYSTEM.md
```

Run:
```bash
cd legaldocs/apps/api
npx prisma generate
npx prisma db push
```

#### Step 1.3: Create TypeScript Types

Already created at: `legaldocs/packages/shared/src/types/consultation.ts`

Update `legaldocs/packages/shared/src/types/index.ts`:

```typescript
// Add export
export * from './consultation';
```

---

### Phase 2: Lawyer Availability Management (Week 2)

#### Step 2.1: Create API Routes

Create `legaldocs/apps/api/src/routes/consultations.ts`:

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const consultationsRouter = new Hono();

// GET /api/lawyers/:lawyerId/availability
consultationsRouter.get(
  '/lawyers/:lawyerId/availability',
  async (c) => {
    const lawyerId = c.req.param('lawyerId');

    // Fetch availability from database
    const availability = await c.env.DB.prepare(`
      SELECT * FROM lawyer_availability
      WHERE lawyer_id = ?
    `).bind(lawyerId).first();

    const schedules = await c.env.DB.prepare(`
      SELECT * FROM availability_schedules
      WHERE availability_id = ?
    `).bind(availability.id).all();

    const overrides = await c.env.DB.prepare(`
      SELECT * FROM availability_overrides
      WHERE lawyer_id = ?
      AND override_date >= date('now')
    `).bind(lawyerId).all();

    return c.json({
      availability,
      schedules: schedules.results,
      overrides: overrides.results
    });
  }
);

// PUT /api/lawyers/:lawyerId/availability
const updateAvailabilitySchema = z.object({
  timezone: z.string().optional(),
  bufferMinutes: z.number().optional(),
  instantBookingEnabled: z.boolean().optional(),
  schedules: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string()
  })).optional()
});

consultationsRouter.put(
  '/lawyers/:lawyerId/availability',
  zValidator('json', updateAvailabilitySchema),
  async (c) => {
    const lawyerId = c.req.param('lawyerId');
    const data = c.req.valid('json');

    // Update availability
    await c.env.DB.prepare(`
      UPDATE lawyer_availability
      SET timezone = ?,
          buffer_minutes = ?,
          instant_booking_enabled = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE lawyer_id = ?
    `).bind(
      data.timezone,
      data.bufferMinutes,
      data.instantBookingEnabled,
      lawyerId
    ).run();

    // Update schedules if provided
    if (data.schedules) {
      // Delete existing schedules
      await c.env.DB.prepare(`
        DELETE FROM availability_schedules
        WHERE availability_id IN (
          SELECT id FROM lawyer_availability WHERE lawyer_id = ?
        )
      `).bind(lawyerId).run();

      // Insert new schedules
      for (const schedule of data.schedules) {
        await c.env.DB.prepare(`
          INSERT INTO availability_schedules
          (availability_id, day_of_week, start_time, end_time)
          VALUES (
            (SELECT id FROM lawyer_availability WHERE lawyer_id = ?),
            ?, ?, ?
          )
        `).bind(lawyerId, schedule.dayOfWeek, schedule.startTime, schedule.endTime).run();
      }
    }

    return c.json({ success: true });
  }
);

// GET /api/lawyers/:lawyerId/availability/slots
consultationsRouter.get(
  '/lawyers/:lawyerId/availability/slots',
  async (c) => {
    const lawyerId = c.req.param('lawyerId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const consultationType = c.req.query('consultationType');
    const clientTimezone = c.req.query('clientTimezone') || 'Asia/Dubai';

    // Implementation for generating available slots
    // Consider: lawyer schedule, existing bookings, buffer time, timezone conversion

    const slots = await generateAvailableSlots(
      c.env.DB,
      lawyerId,
      startDate,
      endDate,
      consultationType,
      clientTimezone
    );

    return c.json({ slots, clientTimezone });
  }
);

export default consultationsRouter;
```

#### Step 2.2: Create Availability Service

Create `legaldocs/apps/api/src/services/availability.ts`:

```typescript
import { DateTime } from 'luxon';

export class AvailabilityService {
  constructor(private db: any) {}

  async generateAvailableSlots(
    lawyerId: string,
    startDate: string,
    endDate: string,
    consultationType: string,
    clientTimezone: string,
    durationMinutes: number = 60
  ) {
    // 1. Get lawyer's availability settings
    const availability = await this.getLawyerAvailability(lawyerId);

    // 2. Get recurring schedule
    const schedules = await this.getSchedules(availability.id);

    // 3. Get date overrides (holidays, blocked dates)
    const overrides = await this.getOverrides(lawyerId, startDate, endDate);

    // 4. Get existing bookings
    const bookings = await this.getExistingBookings(lawyerId, startDate, endDate);

    // 5. Generate slots
    const slots = [];
    let currentDate = DateTime.fromISO(startDate, { zone: availability.timezone });
    const end = DateTime.fromISO(endDate, { zone: availability.timezone });

    while (currentDate <= end) {
      const dayOfWeek = currentDate.weekday % 7; // Convert to 0-6 format

      // Check if date is overridden
      const override = overrides.find(o => o.overrideDate === currentDate.toISODate());

      if (override?.type === 'blocked' || override?.type === 'holiday') {
        currentDate = currentDate.plus({ days: 1 });
        continue;
      }

      // Get schedule for this day
      const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek);

      if (!schedule && !override) {
        currentDate = currentDate.plus({ days: 1 });
        continue;
      }

      // Generate time slots for this day
      const daySlots = this.generateDaySlots(
        currentDate,
        override || schedule,
        durationMinutes,
        availability.bufferMinutes,
        bookings,
        clientTimezone,
        availability.timezone
      );

      slots.push(...daySlots);
      currentDate = currentDate.plus({ days: 1 });
    }

    return slots;
  }

  private generateDaySlots(
    date: DateTime,
    schedule: any,
    durationMinutes: number,
    bufferMinutes: number,
    bookings: any[],
    clientTimezone: string,
    lawyerTimezone: string
  ) {
    const slots = [];
    const startTime = DateTime.fromFormat(
      `${date.toISODate()} ${schedule.startTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: lawyerTimezone }
    );
    const endTime = DateTime.fromFormat(
      `${date.toISODate()} ${schedule.endTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: lawyerTimezone }
    );

    let currentSlot = startTime;

    while (currentSlot.plus({ minutes: durationMinutes }) <= endTime) {
      const slotEnd = currentSlot.plus({ minutes: durationMinutes });

      // Check if slot conflicts with existing booking
      const hasConflict = bookings.some(booking => {
        const bookingStart = DateTime.fromISO(booking.scheduledAt);
        const bookingEnd = DateTime.fromISO(booking.scheduledEndAt);
        return currentSlot < bookingEnd && slotEnd > bookingStart;
      });

      if (!hasConflict && currentSlot > DateTime.now()) {
        // Convert to client timezone
        const clientSlotStart = currentSlot.setZone(clientTimezone);
        const clientSlotEnd = slotEnd.setZone(clientTimezone);

        slots.push({
          date: clientSlotStart.toISODate(),
          startTime: clientSlotStart.toISO(),
          endTime: clientSlotEnd.toISO(),
          available: true,
          lawyerTime: currentSlot.toISO()
        });
      }

      currentSlot = slotEnd.plus({ minutes: bufferMinutes });
    }

    return slots;
  }

  // Helper methods...
  private async getLawyerAvailability(lawyerId: string) { /* ... */ }
  private async getSchedules(availabilityId: string) { /* ... */ }
  private async getOverrides(lawyerId: string, start: string, end: string) { /* ... */ }
  private async getExistingBookings(lawyerId: string, start: string, end: string) { /* ... */ }
}
```

---

### Phase 3: Booking Flow (Week 3-4)

#### Step 3.1: Create Booking API

Add to `legaldocs/apps/api/src/routes/consultations.ts`:

```typescript
// POST /api/consultations
const createConsultationSchema = z.object({
  lawyerId: z.string(),
  consultationType: z.enum(['video', 'phone', 'in_person', 'document_review', 'quick_question']),
  scheduledAt: z.string(),
  durationMinutes: z.number(),
  clientTimezone: z.string(),
  clientPhone: z.string().optional(),
  clientNotes: z.string().optional(),
  questionnaireResponses: z.record(z.any()).optional(),
  documentIds: z.array(z.string()).optional()
});

consultationsRouter.post(
  '/consultations',
  zValidator('json', createConsultationSchema),
  async (c) => {
    const userId = c.get('userId'); // From auth middleware
    const data = c.req.valid('json');

    // 1. Get pricing
    const pricing = await getPricing(c.env.DB, data.lawyerId, data.consultationType);

    // 2. Calculate fees
    const fees = calculateFees(pricing.fixedFee || pricing.hourlyRate);

    // 3. Create consultation
    const consultationNumber = generateConsultationNumber();

    const consultation = await c.env.DB.prepare(`
      INSERT INTO consultations (
        consultation_number, client_id, lawyer_id, consultation_type,
        scheduled_at, duration_minutes, timezone_client, timezone_lawyer,
        base_price, platform_fee, total_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      consultationNumber,
      userId,
      data.lawyerId,
      data.consultationType,
      data.scheduledAt,
      data.durationMinutes,
      data.clientTimezone,
      'Asia/Dubai', // Get from lawyer settings
      fees.subtotal,
      fees.platformFee,
      fees.total,
      'payment_pending'
    ).first();

    // 4. Create payment intent
    const paymentIntent = await createPaymentIntent(
      c.env.STRIPE_SECRET_KEY,
      fees.total,
      'AED',
      consultation.id
    );

    return c.json({
      consultation: {
        id: consultation.id,
        consultationNumber: consultation.consultation_number,
        status: consultation.status,
        scheduledAt: consultation.scheduled_at,
        totalPrice: fees.total,
        paymentUrl: paymentIntent.paymentUrl
      }
    });
  }
);

// GET /api/consultations
consultationsRouter.get('/consultations', async (c) => {
  const userId = c.get('userId');
  const status = c.req.query('status');

  const query = `
    SELECT c.*,
           l.first_name || ' ' || l.last_name as lawyer_name,
           l.avatar_url as lawyer_avatar
    FROM consultations c
    JOIN users l ON c.lawyer_id = l.id
    WHERE c.client_id = ?
    ${status ? 'AND c.status = ?' : ''}
    ORDER BY c.scheduled_at DESC
  `;

  const consultations = await c.env.DB.prepare(query)
    .bind(userId, status)
    .all();

  return c.json({ consultations: consultations.results });
});

// GET /api/consultations/:id
consultationsRouter.get('/consultations/:id', async (c) => {
  const id = c.req.param('id');

  const consultation = await c.env.DB.prepare(`
    SELECT c.*,
           json_object(
             'id', l.id,
             'name', l.first_name || ' ' || l.last_name,
             'email', l.email,
             'phone', l.phone,
             'avatarUrl', l.avatar_url,
             'title', lawyer.title
           ) as lawyer,
           json_object(
             'id', cl.id,
             'name', cl.full_name,
             'email', cl.email,
             'phone', cl.phone,
             'avatarUrl', cl.avatar_url
           ) as client
    FROM consultations c
    JOIN users l ON c.lawyer_id = l.id
    LEFT JOIN lawyers lawyer ON l.id = lawyer.user_id
    JOIN users cl ON c.client_id = cl.id
    WHERE c.id = ?
  `).bind(id).first();

  // Get documents
  const documents = await c.env.DB.prepare(`
    SELECT * FROM consultation_documents WHERE consultation_id = ?
  `).bind(id).all();

  return c.json({
    consultation: {
      ...consultation,
      documents: documents.results
    }
  });
});
```

#### Step 3.2: Create React Booking Component

Create `legaldocs/apps/web/src/components/consultation/booking-flow.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface BookingFlowProps {
  lawyerId: string;
  pricing: ConsultationPricing[];
}

export function ConsultationBookingFlow({ lawyerId, pricing }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState({});
  const router = useRouter();

  // Step 1: Select consultation type
  if (step === 1) {
    return (
      <div className="space-y-4">
        <h2>Select Consultation Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {pricing.map((p) => (
            <ConsultationTypeCard
              key={p.consultationType}
              pricing={p}
              selected={selectedType === p.consultationType}
              onSelect={() => {
                setSelectedType(p.consultationType);
                setStep(2);
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Select date & time
  if (step === 2) {
    return (
      <DateTimeSelector
        lawyerId={lawyerId}
        consultationType={selectedType!}
        onSelect={(slot) => {
          setSelectedSlot(slot);
          setStep(3);
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  // Step 3: Pre-consultation details
  if (step === 3) {
    return (
      <PreConsultationForm
        lawyerId={lawyerId}
        consultationType={selectedType!}
        onSubmit={(data) => {
          setQuestionnaireData(data);
          setStep(4);
        }}
        onBack={() => setStep(2)}
      />
    );
  }

  // Step 4: Payment & confirmation
  if (step === 4) {
    return (
      <PaymentConfirmation
        lawyerId={lawyerId}
        consultationType={selectedType!}
        slot={selectedSlot!}
        questionnaireData={questionnaireData}
        onConfirm={async (paymentMethod) => {
          // Create consultation
          const result = await createConsultation({
            lawyerId,
            consultationType: selectedType!,
            scheduledAt: selectedSlot!.startTime,
            durationMinutes: 60,
            clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            questionnaireResponses: questionnaireData
          });

          // Redirect to payment or confirmation
          router.push(`/consultations/${result.consultation.id}`);
        }}
        onBack={() => setStep(3)}
      />
    );
  }

  return null;
}
```

---

### Phase 4: Video Integration (Week 5)

#### Step 4.1: Set up Twilio Video

```bash
npm install twilio @twilio/video-room-monitor
```

Create `legaldocs/apps/api/src/services/video.ts`:

```typescript
import Twilio from 'twilio';
import { AccessToken } from 'twilio';

export class VideoService {
  private client: Twilio.Twilio;

  constructor(
    private accountSid: string,
    private apiKey: string,
    private apiSecret: string
  ) {
    this.client = Twilio(apiKey, apiSecret, { accountSid });
  }

  async createMeeting(consultationId: string): Promise<VideoMeeting> {
    // Create Twilio video room
    const room = await this.client.video.v1.rooms.create({
      uniqueName: consultationId,
      type: 'group',
      recordParticipantsOnConnect: false, // Set based on consent
      maxParticipants: 2,
      statusCallback: `${process.env.API_URL}/api/video/webhook`,
      statusCallbackMethod: 'POST'
    });

    // Generate access tokens
    const hostToken = this.generateToken(room.sid, 'host');
    const guestToken = this.generateToken(room.sid, 'guest');

    return {
      id: room.sid,
      consultationId,
      provider: 'twilio',
      meetingId: room.sid,
      meetingUrl: `${process.env.APP_URL}/consultations/${consultationId}/meeting`,
      hostToken,
      guestToken,
      status: 'scheduled',
      recordingEnabled: false,
      createdAt: new Date().toISOString()
    };
  }

  private generateToken(roomSid: string, identity: string): string {
    const token = new AccessToken(
      this.accountSid,
      this.apiKey,
      this.apiSecret,
      {
        identity,
        ttl: 86400 // 24 hours
      }
    );

    const videoGrant = new AccessToken.VideoGrant({
      room: roomSid
    });

    token.addGrant(videoGrant);
    return token.toJwt();
  }

  async endMeeting(meetingId: string): Promise<void> {
    await this.client.video.v1.rooms(meetingId).update({
      status: 'completed'
    });
  }
}
```

#### Step 4.2: Create Video Call Component

Create `legaldocs/apps/web/src/components/consultation/video-call.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { connect, Room, RemoteParticipant } from 'twilio-video';

interface VideoCallProps {
  consultationId: string;
  token: string;
  isHost: boolean;
}

export function VideoCall({ consultationId, token, isHost }: VideoCallProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    connectToRoom();
    return () => {
      room?.disconnect();
    };
  }, []);

  const connectToRoom = async () => {
    const room = await connect(token, {
      name: consultationId,
      audio: true,
      video: { width: 1280 }
    });

    setRoom(room);

    // Attach local video
    room.localParticipant.videoTracks.forEach(publication => {
      if (localVideoRef.current && publication.track) {
        localVideoRef.current.appendChild(publication.track.attach());
      }
    });

    // Handle remote participants
    room.on('participantConnected', participant => {
      setParticipants(prev => [...prev, participant]);
      attachParticipantTracks(participant);
    });

    room.on('participantDisconnected', participant => {
      setParticipants(prev => prev.filter(p => p !== participant));
    });

    // Attach existing participants
    room.participants.forEach(attachParticipantTracks);
  };

  const attachParticipantTracks = (participant: RemoteParticipant) => {
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        remoteVideoRef.current?.appendChild(publication.track.attach());
      }
    });

    participant.on('trackSubscribed', track => {
      remoteVideoRef.current?.appendChild(track.attach());
    });
  };

  const toggleMute = () => {
    room?.localParticipant.audioTracks.forEach(publication => {
      publication.track.isEnabled
        ? publication.track.disable()
        : publication.track.enable();
    });
  };

  const toggleVideo = () => {
    room?.localParticipant.videoTracks.forEach(publication => {
      publication.track.isEnabled
        ? publication.track.disable()
        : publication.track.enable();
    });
  };

  return (
    <div className="video-call-container">
      <div className="remote-video">
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <div className="local-video">
        <video ref={localVideoRef} autoPlay muted />
      </div>
      <div className="controls">
        <button onClick={toggleMute}>Mute</button>
        <button onClick={toggleVideo}>Video</button>
        <button onClick={() => room?.disconnect()}>End Call</button>
      </div>
    </div>
  );
}
```

---

### Phase 5: Notifications (Week 6)

See notification implementation in the main design document.

Key files to create:
- `legaldocs/apps/api/src/services/notifications.ts`
- `legaldocs/apps/api/src/jobs/consultation-reminders.ts`
- `legaldocs/apps/api/src/templates/email/consultation-*.html`

---

## Testing Checklist

### Unit Tests
- [ ] Availability slot generation
- [ ] Timezone conversion
- [ ] Fee calculation
- [ ] Cancellation policy logic

### Integration Tests
- [ ] End-to-end booking flow
- [ ] Payment processing
- [ ] Video call creation
- [ ] Notification sending

### Manual Testing
- [ ] Book consultation as client
- [ ] Manage availability as lawyer
- [ ] Join video call
- [ ] Receive WhatsApp/email notifications
- [ ] Cancel and refund flow
- [ ] Multi-timezone booking

---

## Deployment

### Environment Variables

Add to `.env`:

```bash
# Twilio Video
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_API_KEY=SKxxxxx
TWILIO_API_SECRET=xxxxx

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Notifications
SENDGRID_API_KEY=SG.xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# Calendar
GOOGLE_CALENDAR_CLIENT_ID=xxxxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxx
```

### Database Migration

```bash
# Production migration
npm run db:migrate:prod

# Verify tables created
npm run db:verify
```

### Deploy API

```bash
cd legaldocs/apps/api
wrangler deploy
```

### Deploy Web App

```bash
cd legaldocs/apps/web
vercel --prod
```

---

## Monitoring & Maintenance

### Key Metrics to Track
- Booking conversion rate
- Video call quality/duration
- Payment success rate
- Notification delivery rate
- Cancellation rate
- Average lawyer response time

### Regular Tasks
- Monitor video call quality
- Review failed payments
- Check notification delivery
- Update timezone data
- Review cancellation patterns

---

## Support & Documentation

For questions or issues:
1. Check the main design document: `CONSULTATION_BOOKING_SYSTEM.md`
2. Review type definitions: `packages/shared/src/types/consultation.ts`
3. Consult API documentation (auto-generated from routes)

---

## Next Steps

After completing the basic implementation:

1. **Advanced Features**
   - AI-powered questionnaire generation
   - Automatic meeting summaries (GPT-4)
   - Smart scheduling suggestions
   - Recurring consultation packages

2. **Mobile App**
   - React Native implementation
   - Push notifications
   - Native calendar integration

3. **Analytics Dashboard**
   - Lawyer performance metrics
   - Revenue analytics
   - Client satisfaction tracking

4. **Compliance**
   - GDPR compliance for call recordings
   - UAE legal compliance
   - Data retention policies

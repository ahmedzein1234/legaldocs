/**
 * Consultation Calls Routes
 *
 * Enhanced video and phone consultation handling:
 * - Video room creation and management
 * - Phone call initiation and tracking
 * - Pre-consultation preparation
 * - In-call features
 * - Post-consultation follow-up
 */

import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import {
  createVideoRoom,
  generateMeetingLink,
  getRoomStatus,
  endVideoRoom,
  getRecordingUrl,
  getConnectionTestInstructions,
  type VideoRoom,
  type VideoRoomConfig,
  type ParticipantInfo,
} from '../lib/video-consultation.js';
import {
  createPhoneService,
  getCallReminderMessage,
  getPhoneConsultationChecklist,
  type PhoneCall,
  type CallParticipant,
} from '../lib/phone-consultation.js';
import {
  getReminderTemplates,
  calculateReminderTimes,
  formatPushNotification,
  createReminderSchedule,
  type ConsultationDetails,
} from '../lib/consultation-reminders.js';

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_FROM?: string;
  APP_URL?: string;
};

type Variables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// VIDEO CONSULTATION ROUTES
// ============================================

/**
 * POST /api/consultation-calls/video/:consultationId/room
 * Create or get video room for consultation
 */
app.post('/video/:consultationId/room', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const {
      enableRecording = false,
      enableScreenShare = true,
      enableWaitingRoom = true,
      language = 'en',
    } = body;

    // Get consultation
    const consultation = await db
      .prepare(`
        SELECT c.*, l.first_name as lawyer_first_name, l.last_name as lawyer_last_name,
               l.user_id as lawyer_user_id, u.name as client_name
        FROM consultations c
        JOIN lawyers l ON l.id = c.lawyer_id
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ? AND c.consultation_type = 'video'
      `)
      .bind(consultationId)
      .first<{
        id: string;
        user_id: string;
        lawyer_id: string;
        lawyer_user_id: string;
        lawyer_first_name: string;
        lawyer_last_name: string;
        client_name: string;
        status: string;
        meeting_link: string;
        meeting_room_id: string;
        duration_minutes: number;
        scheduled_at: string;
      }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Video consultation not found' },
      }, 404);
    }

    // Verify authorization
    if (consultation.user_id !== userId && consultation.lawyer_user_id !== userId) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authorized' },
      }, 403);
    }

    // Check consultation status
    if (!['confirmed', 'in_progress'].includes(consultation.status)) {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Consultation must be confirmed to join' },
      }, 400);
    }

    // Determine participant role
    const isLawyer = consultation.lawyer_user_id === userId;
    const participantInfo: ParticipantInfo = {
      id: userId,
      name: isLawyer
        ? `${consultation.lawyer_first_name} ${consultation.lawyer_last_name}`
        : consultation.client_name,
      role: isLawyer ? 'host' : 'participant',
    };

    // Check if room already exists
    let roomData: VideoRoom;

    if (consultation.meeting_room_id) {
      // Get existing room - in production, verify it's still active
      const cachedRoom = await c.env.CACHE.get(`video_room:${consultation.meeting_room_id}`);
      if (cachedRoom) {
        roomData = JSON.parse(cachedRoom);
      } else {
        // Room expired, create new one
        roomData = await createVideoRoom(consultationId, {
          enableRecording,
          enableScreenShare,
          enableWaitingRoom,
          autoEndAfterMinutes: consultation.duration_minutes + 15,
          language: language as 'en' | 'ar',
        });
      }
    } else {
      // Create new room
      const config: Partial<VideoRoomConfig> = {
        enableRecording,
        enableScreenShare,
        enableWaitingRoom,
        autoEndAfterMinutes: consultation.duration_minutes + 15, // Buffer time
        language: language as 'en' | 'ar',
      };

      roomData = await createVideoRoom(consultationId, config);

      // Save room info
      await db
        .prepare(`
          UPDATE consultations
          SET meeting_room_id = ?, meeting_link = ?, meeting_provider = ?, updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(roomData.roomId, roomData.roomUrl, roomData.provider, consultationId)
        .run();

      // Cache room data
      await c.env.CACHE.put(
        `video_room:${roomData.roomId}`,
        JSON.stringify(roomData),
        { expirationTtl: consultation.duration_minutes * 60 + 900 } // Duration + 15min buffer
      );
    }

    // Generate participant-specific meeting link
    const meetingLink = generateMeetingLink(roomData, participantInfo, language as 'en' | 'ar');

    // Log room join
    await db
      .prepare(`
        INSERT INTO consultation_call_logs (
          id, consultation_id, user_id, action, call_type, room_id, created_at
        ) VALUES (?, ?, ?, 'room_created', 'video', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), consultationId, userId, roomData.roomId)
      .run();

    return c.json({
      success: true,
      data: {
        roomId: roomData.roomId,
        roomUrl: roomData.roomUrl,
        meetingLink,
        provider: roomData.provider,
        token: isLawyer ? roomData.hostToken : roomData.participantToken,
        config: roomData.config,
        expiresAt: roomData.expiresAt,
        participant: participantInfo,
        connectionTestInstructions: getConnectionTestInstructions(language as 'en' | 'ar'),
      },
    });
  } catch (error: any) {
    console.error('Error creating video room:', error);
    return c.json({
      success: false,
      error: { code: 'ROOM_CREATION_FAILED', message: 'Failed to create video room' },
    }, 500);
  }
});

/**
 * POST /api/consultation-calls/video/:consultationId/join
 * Join an existing video room
 */
app.post('/video/:consultationId/join', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    // Get consultation with room info
    const consultation = await db
      .prepare(`
        SELECT c.*, l.first_name as lawyer_first_name, l.last_name as lawyer_last_name,
               l.user_id as lawyer_user_id, u.name as client_name
        FROM consultations c
        JOIN lawyers l ON l.id = c.lawyer_id
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ? AND c.meeting_room_id IS NOT NULL
      `)
      .bind(consultationId)
      .first<{
        id: string;
        user_id: string;
        lawyer_user_id: string;
        lawyer_first_name: string;
        lawyer_last_name: string;
        client_name: string;
        meeting_room_id: string;
        meeting_link: string;
        meeting_provider: string;
        status: string;
      }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Video room not found' },
      }, 404);
    }

    // Verify authorization
    if (consultation.user_id !== userId && consultation.lawyer_user_id !== userId) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authorized' },
      }, 403);
    }

    // Get cached room data
    const cachedRoom = await c.env.CACHE.get(`video_room:${consultation.meeting_room_id}`);
    if (!cachedRoom) {
      return c.json({
        success: false,
        error: { code: 'ROOM_EXPIRED', message: 'Video room has expired. Please create a new one.' },
      }, 400);
    }

    const roomData: VideoRoom = JSON.parse(cachedRoom);
    const isLawyer = consultation.lawyer_user_id === userId;

    const participantInfo: ParticipantInfo = {
      id: userId,
      name: isLawyer
        ? `${consultation.lawyer_first_name} ${consultation.lawyer_last_name}`
        : consultation.client_name,
      role: isLawyer ? 'host' : 'participant',
    };

    // Update consultation status to in_progress if first join
    if (consultation.status === 'confirmed') {
      await db
        .prepare(`
          UPDATE consultations
          SET status = 'in_progress', started_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(consultationId)
        .run();
    }

    // Log join
    await db
      .prepare(`
        INSERT INTO consultation_call_logs (
          id, consultation_id, user_id, action, call_type, room_id, created_at
        ) VALUES (?, ?, ?, 'joined', 'video', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), consultationId, userId, consultation.meeting_room_id)
      .run();

    return c.json({
      success: true,
      data: {
        roomUrl: roomData.roomUrl,
        meetingLink: generateMeetingLink(roomData, participantInfo),
        token: isLawyer ? roomData.hostToken : roomData.participantToken,
        participant: participantInfo,
      },
    });
  } catch (error: any) {
    console.error('Error joining video room:', error);
    return c.json({
      success: false,
      error: { code: 'JOIN_FAILED', message: 'Failed to join video room' },
    }, 500);
  }
});

/**
 * POST /api/consultation-calls/video/:consultationId/end
 * End video consultation
 */
app.post('/video/:consultationId/end', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first<{
        id: string;
        meeting_room_id: string;
        meeting_provider: string;
        started_at: string;
        lawyer_user_id: string;
      }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // Only host (lawyer) can end the call
    if (consultation.lawyer_user_id !== userId) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only the lawyer can end the consultation' },
      }, 403);
    }

    // Calculate duration
    const startedAt = consultation.started_at ? new Date(consultation.started_at) : new Date();
    const duration = Math.round((Date.now() - startedAt.getTime()) / 1000 / 60); // In minutes

    // End the video room
    if (consultation.meeting_room_id) {
      await endVideoRoom(
        consultation.meeting_room_id,
        consultation.meeting_provider as 'daily' | 'jitsi'
      );

      // Get recording if available
      const recordingUrl = await getRecordingUrl(
        consultation.meeting_room_id,
        consultation.meeting_provider as 'daily' | 'jitsi'
      );

      // Update consultation
      await db
        .prepare(`
          UPDATE consultations
          SET status = 'completed', completed_at = datetime('now'),
              actual_duration_minutes = ?, recording_url = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(duration, recordingUrl, consultationId)
        .run();

      // Clear cached room
      await c.env.CACHE.delete(`video_room:${consultation.meeting_room_id}`);
    }

    // Log end
    await db
      .prepare(`
        INSERT INTO consultation_call_logs (
          id, consultation_id, user_id, action, call_type, duration_seconds, created_at
        ) VALUES (?, ?, ?, 'ended', 'video', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), consultationId, userId, duration * 60)
      .run();

    return c.json({
      success: true,
      data: {
        consultationId,
        status: 'completed',
        duration,
        message: 'Video consultation ended successfully',
      },
    });
  } catch (error: any) {
    console.error('Error ending video consultation:', error);
    return c.json({
      success: false,
      error: { code: 'END_FAILED', message: 'Failed to end consultation' },
    }, 500);
  }
});

// ============================================
// PHONE CONSULTATION ROUTES
// ============================================

/**
 * POST /api/consultation-calls/phone/:consultationId/initiate
 * Initiate a phone call for consultation
 */
app.post('/phone/:consultationId/initiate', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const { recordingConsent = false } = body;

    // Get consultation
    const consultation = await db
      .prepare(`
        SELECT c.*, l.first_name as lawyer_first_name, l.last_name as lawyer_last_name,
               l.phone as lawyer_phone, l.user_id as lawyer_user_id,
               u.name as client_name, u.phone as client_phone
        FROM consultations c
        JOIN lawyers l ON l.id = c.lawyer_id
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ? AND c.consultation_type = 'phone'
      `)
      .bind(consultationId)
      .first<{
        id: string;
        user_id: string;
        lawyer_id: string;
        lawyer_user_id: string;
        lawyer_first_name: string;
        lawyer_last_name: string;
        lawyer_phone: string;
        client_name: string;
        client_phone: string;
        status: string;
        preferred_language: string;
      }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Phone consultation not found' },
      }, 404);
    }

    // Only lawyer can initiate the call
    if (consultation.lawyer_user_id !== userId) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only the lawyer can initiate the call' },
      }, 403);
    }

    if (consultation.status !== 'confirmed') {
      return c.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Consultation must be confirmed' },
      }, 400);
    }

    // Create phone service
    const phoneService = createPhoneService(c.env);

    if (!phoneService.isConfigured()) {
      return c.json({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Phone service not configured' },
      }, 503);
    }

    // Initiate call to client
    const caller: CallParticipant = {
      id: consultation.lawyer_user_id,
      name: `${consultation.lawyer_first_name} ${consultation.lawyer_last_name}`,
      phone: consultation.lawyer_phone,
      role: 'lawyer',
      preferredLanguage: (consultation.preferred_language || 'en') as 'en' | 'ar' | 'ur',
    };

    const callee: CallParticipant = {
      id: consultation.user_id,
      name: consultation.client_name,
      phone: consultation.client_phone,
      role: 'client',
      preferredLanguage: (consultation.preferred_language || 'en') as 'en' | 'ar' | 'ur',
    };

    const call = await phoneService.initiateCall(consultationId, caller, callee, {
      recordingConsent,
      callbackUrl: `${c.env.APP_URL}/api/consultation-calls/phone/webhook`,
      timeout: 60,
    });

    // Update consultation
    await db
      .prepare(`
        UPDATE consultations
        SET status = 'in_progress', call_sid = ?, started_at = datetime('now'),
            recording_consent = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(call.callId, recordingConsent ? 1 : 0, consultationId)
      .run();

    // Log call initiation
    await db
      .prepare(`
        INSERT INTO consultation_call_logs (
          id, consultation_id, user_id, action, call_type, call_sid, created_at
        ) VALUES (?, ?, ?, 'initiated', 'phone', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), consultationId, userId, call.callId)
      .run();

    return c.json({
      success: true,
      data: {
        callId: call.callId,
        status: call.status,
        callingTo: consultation.client_name,
        message: 'Call initiated. Waiting for client to answer.',
      },
    });
  } catch (error: any) {
    console.error('Error initiating phone call:', error);
    return c.json({
      success: false,
      error: { code: 'CALL_FAILED', message: 'Failed to initiate phone call' },
    }, 500);
  }
});

/**
 * POST /api/consultation-calls/phone/webhook
 * Twilio webhook for call status updates
 */
app.post('/phone/webhook', async (c) => {
  try {
    const db = c.env.DB;
    const formData = await c.req.formData();

    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;

    // Find consultation by call SID
    const consultation = await db
      .prepare('SELECT id FROM consultations WHERE call_sid = ?')
      .bind(callSid)
      .first<{ id: string }>();

    if (!consultation) {
      return c.text('OK');
    }

    // Map Twilio status to our status
    const statusMap: Record<string, string> = {
      queued: 'initiated',
      ringing: 'ringing',
      'in-progress': 'in_progress',
      completed: 'completed',
      busy: 'failed',
      failed: 'failed',
      'no-answer': 'no_answer',
      canceled: 'cancelled',
    };

    const newStatus = statusMap[callStatus] || callStatus;

    // Update consultation
    const updates: string[] = ['call_status = ?', 'updated_at = datetime("now")'];
    const values: any[] = [newStatus];

    if (callStatus === 'completed' && callDuration) {
      updates.push('actual_duration_minutes = ?');
      values.push(Math.ceil(parseInt(callDuration) / 60));
      updates.push('status = "completed"');
      updates.push('completed_at = datetime("now")');
    }

    if (['busy', 'failed', 'no-answer', 'canceled'].includes(callStatus)) {
      updates.push('status = "failed"');
    }

    values.push(consultation.id);

    await db
      .prepare(`UPDATE consultations SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    // Log status change
    await db
      .prepare(`
        INSERT INTO consultation_call_logs (
          id, consultation_id, action, call_type, call_sid, metadata, created_at
        ) VALUES (?, ?, ?, 'phone', ?, ?, datetime('now'))
      `)
      .bind(
        crypto.randomUUID(),
        consultation.id,
        `status_${callStatus}`,
        callSid,
        JSON.stringify({ callDuration, callStatus })
      )
      .run();

    return c.text('OK');
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return c.text('OK'); // Always return OK to Twilio
  }
});

/**
 * POST /api/consultation-calls/phone/:consultationId/end
 * End phone consultation
 */
app.post('/phone/:consultationId/end', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND lawyer_user_id = ?
      `)
      .bind(consultationId, userId)
      .first<{ call_sid: string; started_at: string }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // End call via Twilio
    const phoneService = createPhoneService(c.env);
    if (consultation.call_sid) {
      await phoneService.endCall(consultation.call_sid);
    }

    // Calculate duration
    const startedAt = consultation.started_at ? new Date(consultation.started_at) : new Date();
    const duration = Math.round((Date.now() - startedAt.getTime()) / 1000 / 60);

    // Update consultation
    await db
      .prepare(`
        UPDATE consultations
        SET status = 'completed', completed_at = datetime('now'),
            actual_duration_minutes = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(duration, consultationId)
      .run();

    return c.json({
      success: true,
      data: {
        consultationId,
        status: 'completed',
        duration,
      },
    });
  } catch (error: any) {
    console.error('Error ending phone call:', error);
    return c.json({
      success: false,
      error: { code: 'END_FAILED', message: 'Failed to end call' },
    }, 500);
  }
});

// ============================================
// PRE-CONSULTATION FEATURES
// ============================================

/**
 * GET /api/consultation-calls/:consultationId/checklist
 * Get pre-consultation checklist
 */
app.get('/:consultationId/checklist', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const language = (c.req.query('lang') || 'en') as 'en' | 'ar';

    const consultation = await db
      .prepare(`
        SELECT c.*, u.name as client_name
        FROM consultations c
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ? AND (c.user_id = ? OR c.lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first<{ consultation_type: string; user_id: string }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // Get saved checklist progress
    const progress = await db
      .prepare(`
        SELECT checklist_progress FROM consultation_preparation
        WHERE consultation_id = ? AND user_id = ?
      `)
      .bind(consultationId, userId)
      .first<{ checklist_progress: string }>();

    const completedItems = progress?.checklist_progress
      ? JSON.parse(progress.checklist_progress)
      : [];

    // Get appropriate checklist
    let checklist;
    if (consultation.consultation_type === 'phone') {
      checklist = getPhoneConsultationChecklist(language);
    } else {
      // Video checklist
      checklist = {
        title: language === 'ar' ? 'قبل استشارتك بالفيديو' : 'Before Your Video Consultation',
        items: [
          { id: 'camera_working', text: language === 'ar' ? 'تأكد من أن الكاميرا تعمل' : 'Ensure your camera is working', required: true },
          { id: 'microphone_working', text: language === 'ar' ? 'تأكد من أن الميكروفون يعمل' : 'Ensure your microphone is working', required: true },
          { id: 'internet_stable', text: language === 'ar' ? 'تأكد من استقرار الإنترنت' : 'Ensure stable internet connection', required: true },
          { id: 'quiet_place', text: language === 'ar' ? 'اختر مكاناً هادئاً ومضاءً جيداً' : 'Find a quiet, well-lit place', required: true },
          { id: 'browser_updated', text: language === 'ar' ? 'استخدم متصفح حديث' : 'Use an updated browser (Chrome/Firefox)', required: false },
          { id: 'documents_ready', text: language === 'ar' ? 'جهز المستندات ذات الصلة' : 'Have relevant documents ready', required: false },
          { id: 'questions_prepared', text: language === 'ar' ? 'حضر أسئلتك مسبقاً' : 'Prepare your questions in advance', required: false },
          { id: 'recording_consent', text: language === 'ar' ? 'قرر موافقتك على التسجيل' : 'Decide on recording consent', required: true },
        ],
      };
    }

    // Mark completed items
    const itemsWithStatus = checklist.items.map((item) => ({
      ...item,
      completed: completedItems.includes(item.id),
    }));

    return c.json({
      success: true,
      data: {
        consultationType: consultation.consultation_type,
        checklist: {
          ...checklist,
          items: itemsWithStatus,
        },
        readyToJoin: itemsWithStatus.filter((i) => i.required).every((i) => i.completed),
      },
    });
  } catch (error: any) {
    console.error('Error fetching checklist:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch checklist' },
    }, 500);
  }
});

/**
 * POST /api/consultation-calls/:consultationId/checklist
 * Update checklist progress
 */
app.post('/:consultationId/checklist', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const { completedItems } = body;

    // Upsert checklist progress
    await db
      .prepare(`
        INSERT INTO consultation_preparation (id, consultation_id, user_id, checklist_progress, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(consultation_id, user_id) DO UPDATE SET
          checklist_progress = ?, updated_at = datetime('now')
      `)
      .bind(
        crypto.randomUUID(),
        consultationId,
        userId,
        JSON.stringify(completedItems),
        JSON.stringify(completedItems)
      )
      .run();

    return c.json({
      success: true,
      data: { completedItems },
    });
  } catch (error: any) {
    console.error('Error updating checklist:', error);
    return c.json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: 'Failed to update checklist' },
    }, 500);
  }
});

/**
 * POST /api/consultation-calls/:consultationId/documents
 * Share documents for consultation
 */
app.post('/:consultationId/documents', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const { documentIds, notes } = body;

    // Verify consultation access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // Link documents to consultation
    for (const docId of documentIds) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO consultation_documents (
            id, consultation_id, document_id, shared_by, notes, shared_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'))
        `)
        .bind(crypto.randomUUID(), consultationId, docId, userId, notes || null)
        .run();
    }

    return c.json({
      success: true,
      data: {
        message: `${documentIds.length} document(s) shared for consultation`,
      },
    });
  } catch (error: any) {
    console.error('Error sharing documents:', error);
    return c.json({
      success: false,
      error: { code: 'SHARE_FAILED', message: 'Failed to share documents' },
    }, 500);
  }
});

/**
 * GET /api/consultation-calls/:consultationId/documents
 * Get documents shared for consultation
 */
app.get('/:consultationId/documents', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    // Verify access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    const documents = await db
      .prepare(`
        SELECT cd.*, d.title, d.document_type, d.status as doc_status,
               u.name as shared_by_name
        FROM consultation_documents cd
        JOIN documents d ON d.id = cd.document_id
        JOIN users u ON u.id = cd.shared_by
        WHERE cd.consultation_id = ?
        ORDER BY cd.shared_at DESC
      `)
      .bind(consultationId)
      .all();

    return c.json({
      success: true,
      data: { documents: documents.results || [] },
    });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch documents' },
    }, 500);
  }
});

// ============================================
// POST-CONSULTATION FEATURES
// ============================================

/**
 * POST /api/consultation-calls/:consultationId/summary
 * Add post-consultation summary (lawyer only)
 */
app.post('/:consultationId/summary', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const {
      summary,
      recommendations,
      actionItems,
      followUpRequired,
      followUpDate,
      attachments,
    } = body;

    // Verify lawyer access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND lawyer_user_id = ?
      `)
      .bind(consultationId, userId)
      .first<{ status: string; user_id: string }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only the lawyer can add summary' },
      }, 403);
    }

    // Update consultation with summary
    await db
      .prepare(`
        UPDATE consultations
        SET
          consultation_summary = ?,
          recommendations = ?,
          action_items = ?,
          follow_up_required = ?,
          follow_up_date = ?,
          summary_created_at = datetime('now'),
          updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(
        summary,
        recommendations || null,
        JSON.stringify(actionItems || []),
        followUpRequired ? 1 : 0,
        followUpDate || null,
        consultationId
      )
      .run();

    // Notify client
    await db
      .prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id, created_at)
        VALUES (?, ?, 'consultation_summary', 'Consultation Summary Available',
                'Your lawyer has shared a summary from your recent consultation.',
                'consultation', ?, datetime('now'))
      `)
      .bind(crypto.randomUUID(), consultation.user_id, consultationId)
      .run();

    return c.json({
      success: true,
      data: {
        message: 'Summary saved and shared with client',
      },
    });
  } catch (error: any) {
    console.error('Error saving summary:', error);
    return c.json({
      success: false,
      error: { code: 'SAVE_FAILED', message: 'Failed to save summary' },
    }, 500);
  }
});

/**
 * GET /api/consultation-calls/:consultationId/summary
 * Get consultation summary
 */
app.get('/:consultationId/summary', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    const consultation = await db
      .prepare(`
        SELECT
          consultation_summary, recommendations, action_items,
          follow_up_required, follow_up_date, summary_created_at,
          recording_url, actual_duration_minutes
        FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        summary: (consultation as any).consultation_summary,
        recommendations: (consultation as any).recommendations,
        actionItems: (consultation as any).action_items
          ? JSON.parse((consultation as any).action_items)
          : [],
        followUpRequired: (consultation as any).follow_up_required,
        followUpDate: (consultation as any).follow_up_date,
        summaryCreatedAt: (consultation as any).summary_created_at,
        recordingUrl: (consultation as any).recording_url,
        durationMinutes: (consultation as any).actual_duration_minutes,
      },
    });
  } catch (error: any) {
    console.error('Error fetching summary:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch summary' },
    }, 500);
  }
});

// ============================================
// REMINDERS ROUTES
// ============================================

/**
 * POST /api/consultation-calls/:consultationId/reminders
 * Schedule reminders for a consultation
 */
app.post('/:consultationId/reminders', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const { channels = ['email', 'push'] } = body;

    // Get consultation details
    const consultation = await db
      .prepare(`
        SELECT c.*, l.first_name as lawyer_first_name, l.last_name as lawyer_last_name,
               u.name as client_name
        FROM consultations c
        JOIN lawyers l ON l.id = c.lawyer_id
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ? AND (c.user_id = ? OR c.lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first<{
        id: string;
        scheduled_at: string;
        user_id: string;
        lawyer_user_id: string;
      }>();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // Create reminder schedule
    const reminders = createReminderSchedule(
      consultationId,
      userId,
      consultation.scheduled_at,
      channels
    );

    // Save reminders to database
    for (const reminder of reminders) {
      await db
        .prepare(`
          INSERT INTO consultation_reminders (
            id, consultation_id, user_id, reminder_type, channel, scheduled_for, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', datetime('now'))
          ON CONFLICT(consultation_id, user_id, reminder_type, channel) DO UPDATE SET
            scheduled_for = ?, status = 'scheduled', updated_at = datetime('now')
        `)
        .bind(
          crypto.randomUUID(),
          reminder.consultationId,
          reminder.userId,
          reminder.reminderType,
          reminder.channel,
          reminder.scheduledFor,
          reminder.scheduledFor
        )
        .run();
    }

    return c.json({
      success: true,
      data: {
        scheduledReminders: reminders.length,
        channels,
        message: 'Reminders scheduled successfully',
      },
    });
  } catch (error: any) {
    console.error('Error scheduling reminders:', error);
    return c.json({
      success: false,
      error: { code: 'SCHEDULE_FAILED', message: 'Failed to schedule reminders' },
    }, 500);
  }
});

/**
 * GET /api/consultation-calls/:consultationId/reminders
 * Get scheduled reminders for a consultation
 */
app.get('/:consultationId/reminders', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    const reminders = await db
      .prepare(`
        SELECT * FROM consultation_reminders
        WHERE consultation_id = ? AND user_id = ?
        ORDER BY scheduled_for ASC
      `)
      .bind(consultationId, userId)
      .all();

    return c.json({
      success: true,
      data: { reminders: reminders.results || [] },
    });
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch reminders' },
    }, 500);
  }
});

/**
 * DELETE /api/consultation-calls/:consultationId/reminders
 * Cancel all reminders for a consultation
 */
app.delete('/:consultationId/reminders', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    await db
      .prepare(`
        DELETE FROM consultation_reminders
        WHERE consultation_id = ? AND user_id = ? AND status = 'scheduled'
      `)
      .bind(consultationId, userId)
      .run();

    return c.json({
      success: true,
      data: { message: 'Reminders cancelled' },
    });
  } catch (error: any) {
    console.error('Error cancelling reminders:', error);
    return c.json({
      success: false,
      error: { code: 'CANCEL_FAILED', message: 'Failed to cancel reminders' },
    }, 500);
  }
});

// ============================================
// ACTION ITEMS ROUTES
// ============================================

/**
 * GET /api/consultation-calls/:consultationId/action-items
 * Get action items for a consultation
 */
app.get('/:consultationId/action-items', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();

    // Verify access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    const actionItems = await db
      .prepare(`
        SELECT * FROM consultation_action_items
        WHERE consultation_id = ?
        ORDER BY priority DESC, created_at ASC
      `)
      .bind(consultationId)
      .all();

    return c.json({
      success: true,
      data: actionItems.results || [],
    });
  } catch (error: any) {
    console.error('Error fetching action items:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch action items' },
    }, 500);
  }
});

/**
 * POST /api/consultation-calls/:consultationId/action-items
 * Add an action item (lawyer only)
 */
app.post('/:consultationId/action-items', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const { title, description, assignedTo, dueDate, priority = 'medium' } = body;

    // Verify lawyer access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations WHERE id = ? AND lawyer_user_id = ?
      `)
      .bind(consultationId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Only the lawyer can add action items' },
      }, 403);
    }

    const actionItemId = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO consultation_action_items (
          id, consultation_id, title, description, assigned_to, due_date, priority, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
      `)
      .bind(actionItemId, consultationId, title, description || null, assignedTo, dueDate || null, priority)
      .run();

    return c.json({
      success: true,
      data: {
        id: actionItemId,
        title,
        description,
        assignedTo,
        dueDate,
        priority,
        status: 'pending',
      },
    });
  } catch (error: any) {
    console.error('Error adding action item:', error);
    return c.json({
      success: false,
      error: { code: 'ADD_FAILED', message: 'Failed to add action item' },
    }, 500);
  }
});

/**
 * PATCH /api/consultation-calls/:consultationId/action-items/:itemId
 * Update an action item
 */
app.patch('/:consultationId/action-items/:itemId', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId, itemId } = c.req.param();
    const body = await c.req.json();

    const { status, completedAt } = body;

    // Verify access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    await db
      .prepare(`
        UPDATE consultation_action_items
        SET status = ?, completed_at = ?, updated_at = datetime('now')
        WHERE id = ? AND consultation_id = ?
      `)
      .bind(status, status === 'completed' ? (completedAt || new Date().toISOString()) : null, itemId, consultationId)
      .run();

    return c.json({
      success: true,
      data: { itemId, status },
    });
  } catch (error: any) {
    console.error('Error updating action item:', error);
    return c.json({
      success: false,
      error: { code: 'UPDATE_FAILED', message: 'Failed to update action item' },
    }, 500);
  }
});

// ============================================
// FEEDBACK ROUTES
// ============================================

/**
 * POST /api/consultation-calls/:consultationId/feedback
 * Submit feedback for a consultation
 */
app.post('/:consultationId/feedback', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const { consultationId } = c.req.param();
    const body = await c.req.json();

    const {
      overall_rating,
      audio_quality,
      video_quality,
      had_technical_issues,
      technical_issues,
      feedback_text,
    } = body;

    // Verify consultation access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // Insert or update feedback
    await db
      .prepare(`
        INSERT INTO consultation_feedback (
          id, consultation_id, user_id, overall_rating, audio_quality, video_quality,
          had_technical_issues, technical_issues, feedback_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(consultation_id, user_id) DO UPDATE SET
          overall_rating = ?, audio_quality = ?, video_quality = ?,
          had_technical_issues = ?, technical_issues = ?, feedback_text = ?,
          created_at = datetime('now')
      `)
      .bind(
        crypto.randomUUID(),
        consultationId,
        userId,
        overall_rating,
        audio_quality || null,
        video_quality || null,
        had_technical_issues ? 1 : 0,
        technical_issues ? JSON.stringify(technical_issues) : null,
        feedback_text || null,
        overall_rating,
        audio_quality || null,
        video_quality || null,
        had_technical_issues ? 1 : 0,
        technical_issues ? JSON.stringify(technical_issues) : null,
        feedback_text || null
      )
      .run();

    return c.json({
      success: true,
      data: { message: 'Feedback submitted successfully' },
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return c.json({
      success: false,
      error: { code: 'SUBMIT_FAILED', message: 'Failed to submit feedback' },
    }, 500);
  }
});

/**
 * GET /api/consultation-calls/:consultationId/feedback
 * Get feedback for a consultation
 */
app.get('/:consultationId/feedback', requireAuth, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const { consultationId } = c.req.param();

    // Verify access
    const consultation = await db
      .prepare(`
        SELECT * FROM consultations
        WHERE id = ? AND (user_id = ? OR lawyer_user_id = ?)
      `)
      .bind(consultationId, userId, userId)
      .first();

    if (!consultation) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Consultation not found' },
      }, 404);
    }

    // Lawyers and admins can see all feedback, users only their own
    let query = `
      SELECT cf.*, u.name as user_name
      FROM consultation_feedback cf
      JOIN users u ON u.id = cf.user_id
      WHERE cf.consultation_id = ?
    `;
    const bindings: any[] = [consultationId];

    if (userRole !== 'admin' && userRole !== 'lawyer') {
      query += ' AND cf.user_id = ?';
      bindings.push(userId);
    }

    const feedback = await db
      .prepare(query)
      .bind(...bindings)
      .all();

    return c.json({
      success: true,
      data: feedback.results || [],
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return c.json({
      success: false,
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch feedback' },
    }, 500);
  }
});

export { app as consultationCalls };

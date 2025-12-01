/**
 * Video Consultation Service
 *
 * Handles video call room management with support for:
 * - Daily.co integration (primary)
 * - Twilio Video (fallback)
 * - Jitsi (self-hosted option)
 *
 * Features:
 * - Room creation and management
 * - Participant tokens
 * - Recording management
 * - Waiting room
 * - Screen sharing controls
 */

export interface VideoRoom {
  roomId: string;
  roomName: string;
  roomUrl: string;
  hostToken: string;
  participantToken: string;
  provider: 'daily' | 'twilio' | 'jitsi';
  createdAt: string;
  expiresAt: string;
  config: VideoRoomConfig;
}

export interface VideoRoomConfig {
  maxParticipants: number;
  enableRecording: boolean;
  enableScreenShare: boolean;
  enableChat: boolean;
  enableWaitingRoom: boolean;
  autoEndAfterMinutes: number;
  language: 'en' | 'ar';
}

export interface ParticipantInfo {
  id: string;
  name: string;
  role: 'host' | 'participant';
  avatarUrl?: string;
}

export interface VideoCallSession {
  sessionId: string;
  consultationId: string;
  roomId: string;
  status: 'waiting' | 'in_progress' | 'ended';
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  recordingUrl?: string;
  participants: ParticipantInfo[];
}

// Default room configuration
const DEFAULT_ROOM_CONFIG: VideoRoomConfig = {
  maxParticipants: 2,
  enableRecording: false, // Must be enabled by user consent
  enableScreenShare: true,
  enableChat: true,
  enableWaitingRoom: true,
  autoEndAfterMinutes: 60,
  language: 'en',
};

/**
 * Generate a unique room name
 */
function generateRoomName(consultationId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `legaldocs-${consultationId.slice(0, 8)}-${timestamp}-${random}`;
}

/**
 * Generate JWT token for Daily.co
 */
async function generateDailyToken(
  roomName: string,
  participant: ParticipantInfo,
  expiresInMinutes: number = 120
): Promise<string> {
  // In production, this would use Daily.co's API
  // For now, generate a placeholder token
  const payload = {
    r: roomName,
    u: participant.id,
    n: participant.name,
    o: participant.role === 'host',
    exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60,
  };

  // This would be signed with DAILY_API_KEY in production
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Create a video room using Daily.co
 */
async function createDailyRoom(
  consultationId: string,
  config: VideoRoomConfig,
  apiKey?: string
): Promise<VideoRoom> {
  const roomName = generateRoomName(consultationId);
  const expiresAt = new Date(Date.now() + config.autoEndAfterMinutes * 60 * 1000);

  // In production, this would call Daily.co API:
  // POST https://api.daily.co/v1/rooms
  // Headers: Authorization: Bearer {DAILY_API_KEY}

  const roomConfig = {
    name: roomName,
    privacy: 'private',
    properties: {
      max_participants: config.maxParticipants,
      enable_screenshare: config.enableScreenShare,
      enable_chat: config.enableChat,
      enable_knocking: config.enableWaitingRoom,
      exp: Math.floor(expiresAt.getTime() / 1000),
      eject_at_room_exp: true,
      lang: config.language,
    },
  };

  // Simulated response - in production this comes from Daily.co API
  const roomUrl = `https://legaldocs.daily.co/${roomName}`;

  return {
    roomId: crypto.randomUUID(),
    roomName,
    roomUrl,
    hostToken: await generateDailyToken(roomName, { id: 'host', name: 'Host', role: 'host' }),
    participantToken: await generateDailyToken(roomName, { id: 'participant', name: 'Participant', role: 'participant' }),
    provider: 'daily',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    config,
  };
}

/**
 * Create a video room using Jitsi (self-hosted fallback)
 */
async function createJitsiRoom(
  consultationId: string,
  config: VideoRoomConfig
): Promise<VideoRoom> {
  const roomName = generateRoomName(consultationId);
  const expiresAt = new Date(Date.now() + config.autoEndAfterMinutes * 60 * 1000);

  // Jitsi Meet URL - can be self-hosted or use meet.jit.si
  const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
  const roomUrl = `https://${jitsiDomain}/${roomName}`;

  // Generate JWT for Jitsi (if using JWT auth)
  const jwtPayload = {
    context: {
      user: {
        avatar: '',
        name: '',
        email: '',
      },
    },
    aud: 'jitsi',
    iss: 'legaldocs',
    sub: jitsiDomain,
    room: roomName,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  return {
    roomId: crypto.randomUUID(),
    roomName,
    roomUrl,
    hostToken: Buffer.from(JSON.stringify({ ...jwtPayload, moderator: true })).toString('base64'),
    participantToken: Buffer.from(JSON.stringify(jwtPayload)).toString('base64'),
    provider: 'jitsi',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    config,
  };
}

/**
 * Main function to create a video consultation room
 */
export async function createVideoRoom(
  consultationId: string,
  customConfig?: Partial<VideoRoomConfig>,
  preferredProvider?: 'daily' | 'jitsi'
): Promise<VideoRoom> {
  const config: VideoRoomConfig = {
    ...DEFAULT_ROOM_CONFIG,
    ...customConfig,
  };

  const provider = preferredProvider || 'jitsi'; // Default to Jitsi (free)

  try {
    if (provider === 'daily') {
      return await createDailyRoom(consultationId, config);
    } else {
      return await createJitsiRoom(consultationId, config);
    }
  } catch (error) {
    console.error(`Failed to create ${provider} room, falling back to Jitsi:`, error);
    return await createJitsiRoom(consultationId, config);
  }
}

/**
 * Generate a meeting link with embedded participant info
 */
export function generateMeetingLink(
  room: VideoRoom,
  participant: ParticipantInfo,
  language: 'en' | 'ar' = 'en'
): string {
  const params = new URLSearchParams({
    token: participant.role === 'host' ? room.hostToken : room.participantToken,
    name: participant.name,
    lang: language,
  });

  if (room.provider === 'jitsi') {
    // Jitsi config via URL params
    const jitsiConfig = {
      'config.prejoinPageEnabled': 'true',
      'config.startWithAudioMuted': 'false',
      'config.startWithVideoMuted': 'false',
      'config.disableDeepLinking': 'true',
      'userInfo.displayName': participant.name,
    };

    Object.entries(jitsiConfig).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  return `${room.roomUrl}?${params.toString()}`;
}

/**
 * Get room status and participant info
 */
export async function getRoomStatus(roomId: string, provider: 'daily' | 'jitsi'): Promise<{
  active: boolean;
  participantCount: number;
  participants: string[];
}> {
  // In production, this would query the video provider's API
  // For now, return simulated data
  return {
    active: true,
    participantCount: 0,
    participants: [],
  };
}

/**
 * End a video room
 */
export async function endVideoRoom(roomId: string, provider: 'daily' | 'jitsi'): Promise<boolean> {
  // In production, this would call the provider's API to end the room
  // Daily.co: DELETE https://api.daily.co/v1/rooms/{room_name}
  console.log(`Ending room ${roomId} on ${provider}`);
  return true;
}

/**
 * Get recording URL if available
 */
export async function getRecordingUrl(
  roomId: string,
  provider: 'daily' | 'jitsi'
): Promise<string | null> {
  // In production, this would fetch from the provider's recording service
  // Daily.co: GET https://api.daily.co/v1/recordings
  return null;
}

/**
 * Video consultation connection test
 */
export interface ConnectionTestResult {
  browser: boolean;
  camera: boolean;
  microphone: boolean;
  speaker: boolean;
  bandwidth: 'excellent' | 'good' | 'poor';
  recommendations: string[];
}

export function getConnectionTestInstructions(language: 'en' | 'ar'): string[] {
  const instructions = {
    en: [
      'Allow camera and microphone access when prompted',
      'Ensure you have a stable internet connection',
      'Use headphones to prevent echo',
      'Find a quiet, well-lit location',
      'Close other applications using your camera',
    ],
    ar: [
      'اسمح بالوصول إلى الكاميرا والميكروفون عند المطالبة',
      'تأكد من وجود اتصال إنترنت مستقر',
      'استخدم سماعات الرأس لمنع الصدى',
      'اختر مكاناً هادئاً ومضاءً جيداً',
      'أغلق التطبيقات الأخرى التي تستخدم الكاميرا',
    ],
  };

  return instructions[language];
}

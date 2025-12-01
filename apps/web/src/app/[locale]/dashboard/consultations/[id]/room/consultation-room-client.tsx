'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MessageSquare,
  FileText,
  Clock,
  Users,
  Settings,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  ExternalLink,
  Camera,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legaldocs-api.a-m-zein.workers.dev';

interface ConsultationRoomClientProps {
  locale: string;
  consultationId: string;
}

interface Consultation {
  id: string;
  consultation_type: 'video' | 'phone' | 'in_person';
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  lawyer: {
    id: string;
    name: string;
    avatar_url?: string;
    specialization: string;
  };
  client: {
    id: string;
    name: string;
  };
  meeting_room_id?: string;
  meeting_url?: string;
}

interface VideoRoom {
  roomId: string;
  roomName: string;
  roomUrl: string;
  hostToken: string;
  participantToken: string;
  provider: 'daily' | 'jitsi';
}

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  completed: boolean;
}

const translations = {
  en: {
    consultationRoom: 'Consultation Room',
    waitingRoom: 'Waiting Room',
    waitingForParticipant: 'Waiting for the other participant to join...',
    joinCall: 'Join Call',
    endCall: 'End Call',
    mute: 'Mute',
    unmute: 'Unmute',
    cameraOn: 'Camera On',
    cameraOff: 'Camera Off',
    shareScreen: 'Share Screen',
    stopSharing: 'Stop Sharing',
    chat: 'Chat',
    documents: 'Documents',
    settings: 'Settings',
    callDuration: 'Call Duration',
    participants: 'Participants',
    copyLink: 'Copy Meeting Link',
    linkCopied: 'Link Copied!',
    openInNewTab: 'Open in New Tab',
    preparationChecklist: 'Preparation Checklist',
    connectionTest: 'Connection Test',
    testCamera: 'Test Camera',
    testMicrophone: 'Test Microphone',
    testSpeaker: 'Test Speaker',
    excellent: 'Excellent',
    good: 'Good',
    poor: 'Poor',
    videoConsultation: 'Video Consultation',
    phoneConsultation: 'Phone Consultation',
    phoneCallInfo: 'Phone Call Information',
    callWillStart: 'The call will start at the scheduled time.',
    ensureAvailable: 'Please ensure you are available to receive the call.',
    phoneNumber: 'Phone Number',
    recordingConsent: 'Recording Consent',
    consentToRecord: 'I consent to this call being recorded',
    privacyNote: 'Recording is optional and requires consent from all parties.',
    back: 'Back',
    joining: 'Joining...',
    loading: 'Loading consultation...',
    error: 'Error loading consultation',
    retry: 'Retry',
    scheduled: 'Scheduled',
    inProgress: 'In Progress',
    completed: 'Completed',
    consultationEnded: 'Consultation Ended',
    thankYou: 'Thank you for your consultation.',
    viewSummary: 'View Summary',
    provideFeedback: 'Provide Feedback',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    connectionStatus: 'Connection Status',
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
  },
  ar: {
    consultationRoom: 'غرفة الاستشارة',
    waitingRoom: 'غرفة الانتظار',
    waitingForParticipant: 'في انتظار انضمام المشارك الآخر...',
    joinCall: 'انضم للمكالمة',
    endCall: 'إنهاء المكالمة',
    mute: 'كتم الصوت',
    unmute: 'إلغاء كتم الصوت',
    cameraOn: 'الكاميرا مفعلة',
    cameraOff: 'الكاميرا معطلة',
    shareScreen: 'مشاركة الشاشة',
    stopSharing: 'إيقاف المشاركة',
    chat: 'محادثة',
    documents: 'مستندات',
    settings: 'إعدادات',
    callDuration: 'مدة المكالمة',
    participants: 'المشاركون',
    copyLink: 'نسخ رابط الاجتماع',
    linkCopied: 'تم نسخ الرابط!',
    openInNewTab: 'فتح في تبويب جديد',
    preparationChecklist: 'قائمة التحضير',
    connectionTest: 'اختبار الاتصال',
    testCamera: 'اختبار الكاميرا',
    testMicrophone: 'اختبار الميكروفون',
    testSpeaker: 'اختبار السماعة',
    excellent: 'ممتاز',
    good: 'جيد',
    poor: 'ضعيف',
    videoConsultation: 'استشارة فيديو',
    phoneConsultation: 'استشارة هاتفية',
    phoneCallInfo: 'معلومات المكالمة الهاتفية',
    callWillStart: 'ستبدأ المكالمة في الوقت المحدد.',
    ensureAvailable: 'يرجى التأكد من توفرك لاستقبال المكالمة.',
    phoneNumber: 'رقم الهاتف',
    recordingConsent: 'الموافقة على التسجيل',
    consentToRecord: 'أوافق على تسجيل هذه المكالمة',
    privacyNote: 'التسجيل اختياري ويتطلب موافقة جميع الأطراف.',
    back: 'رجوع',
    joining: 'جاري الانضمام...',
    loading: 'جاري تحميل الاستشارة...',
    error: 'خطأ في تحميل الاستشارة',
    retry: 'إعادة المحاولة',
    scheduled: 'مجدولة',
    inProgress: 'قيد التقدم',
    completed: 'مكتملة',
    consultationEnded: 'انتهت الاستشارة',
    thankYou: 'شكراً لك على استشارتك.',
    viewSummary: 'عرض الملخص',
    provideFeedback: 'تقديم ملاحظات',
    fullscreen: 'ملء الشاشة',
    exitFullscreen: 'الخروج من ملء الشاشة',
    connectionStatus: 'حالة الاتصال',
    connected: 'متصل',
    connecting: 'جاري الاتصال...',
    disconnected: 'غير متصل',
  },
};

export function ConsultationRoomClient({ locale, consultationId }: ConsultationRoomClientProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';
  const router = useRouter();

  // State
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [videoRoom, setVideoRoom] = useState<VideoRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  // Media controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);

  // Side panels
  const [showChat, setShowChat] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Connection test
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Refs
  const videoRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch consultation details
  useEffect(() => {
    async function fetchConsultation() {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_URL}/api/consultations/${consultationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch consultation');

        const data = await response.json();
        setConsultation(data.data);

        // Fetch checklist
        const checklistRes = await fetch(
          `${API_URL}/api/consultation-calls/${consultationId}/checklist?type=${data.data.consultation_type}&language=${locale}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (checklistRes.ok) {
          const checklistData = await checklistRes.json();
          setChecklist(
            checklistData.data.items.map((item: any) => ({
              ...item,
              completed: false,
            }))
          );
        }

        setConnectionStatus('connected');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnectionStatus('disconnected');
      } finally {
        setLoading(false);
      }
    }

    fetchConsultation();
  }, [consultationId, locale]);

  // Call duration timer
  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [inCall]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Join video call
  const joinVideoCall = async () => {
    try {
      setJoining(true);
      const token = localStorage.getItem('auth_token');

      // Create/join video room
      const response = await fetch(`${API_URL}/api/consultation-calls/video/${consultationId}/room`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            enableRecording: recordingConsent,
            language: locale,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create video room');

      const data = await response.json();
      setVideoRoom(data.data.room);
      setInCall(true);
      setShowChecklist(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join call');
    } finally {
      setJoining(false);
    }
  };

  // End call
  const endCall = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/api/consultation-calls/video/${consultationId}/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInCall(false);
      setVideoRoom(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Redirect to summary page
      router.push(`/${locale}/dashboard/consultations/${consultationId}/summary`);
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  // Copy meeting link
  const copyMeetingLink = async () => {
    if (videoRoom?.roomUrl) {
      await navigator.clipboard.writeText(videoRoom.roomUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="mb-4">{t.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) return null;

  // Phone consultation view
  if (consultation.consultation_type === 'phone') {
    return (
      <div className={`min-h-screen bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">{t.phoneConsultation}</h1>
          </div>

          {/* Phone info card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{consultation.lawyer.name}</h2>
                <p className="text-gray-500">{consultation.lawyer.specialization}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t.scheduled}</p>
                  <p className="font-medium">
                    {new Date(consultation.scheduled_at).toLocaleString(
                      locale === 'ar' ? 'ar-AE' : 'en-US',
                      {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{t.callWillStart}</p>
                <p className="text-sm text-blue-600 mt-1">{t.ensureAvailable}</p>
              </div>
            </div>

            {/* Recording consent */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">{t.recordingConsent}</h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordingConsent}
                  onChange={(e) => setRecordingConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300"
                />
                <div>
                  <span className="font-medium">{t.consentToRecord}</span>
                  <p className="text-sm text-gray-500 mt-1">{t.privacyNote}</p>
                </div>
              </label>
            </div>

            {/* Checklist */}
            {showChecklist && checklist.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-4">{t.preparationChecklist}</h3>
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="mt-1 h-5 w-5 rounded border-gray-300"
                      />
                      <span className={item.completed ? 'text-gray-400 line-through' : ''}>
                        {item.text}
                        {item.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Video consultation view
  return (
    <div className={`min-h-screen bg-gray-900 flex ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-white font-semibold">{t.consultationRoom}</h1>
              <p className="text-gray-400 text-sm">{consultation.lawyer.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-gray-400">
                {connectionStatus === 'connected'
                  ? t.connected
                  : connectionStatus === 'connecting'
                  ? t.connecting
                  : t.disconnected}
              </span>
            </div>

            {/* Call duration */}
            {inCall && (
              <div className="flex items-center gap-2 text-white bg-red-600 px-3 py-1.5 rounded-lg">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Video container */}
        <div className="flex-1 relative">
          {!inCall ? (
            /* Pre-call / Waiting room */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 mx-4">
                {/* Preview camera */}
                <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>{t.testCamera}</p>
                  </div>
                </div>

                {/* Checklist */}
                {showChecklist && checklist.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">{t.preparationChecklist}</h3>
                    <div className="space-y-2">
                      {checklist.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 text-gray-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700"
                          />
                          <span className={item.completed ? 'text-gray-500 line-through' : ''}>
                            {item.text}
                            {item.required && (
                              <span className="text-red-400 ml-1">*</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recording consent */}
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                  <label className="flex items-start gap-3 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recordingConsent}
                      onChange={(e) => setRecordingConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700"
                    />
                    <div>
                      <span className="font-medium">{t.consentToRecord}</span>
                      <p className="text-sm text-gray-400 mt-1">{t.privacyNote}</p>
                    </div>
                  </label>
                </div>

                {/* Join button */}
                <button
                  onClick={joinVideoCall}
                  disabled={joining}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.joining}
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5" />
                      {t.joinCall}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Active video call */
            <>
              {/* Jitsi iframe */}
              {videoRoom && (
                <iframe
                  ref={videoRef}
                  src={`${videoRoom.roomUrl}?lang=${locale}&config.prejoinPageEnabled=false&config.startWithAudioMuted=${isMuted}&config.startWithVideoMuted=${isCameraOff}`}
                  className="absolute inset-0 w-full h-full"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                />
              )}

              {/* Floating controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-center gap-4">
                  {/* Mic toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full ${
                      isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={isMuted ? t.unmute : t.mute}
                  >
                    {isMuted ? (
                      <MicOff className="h-6 w-6 text-white" />
                    ) : (
                      <Mic className="h-6 w-6 text-white" />
                    )}
                  </button>

                  {/* Camera toggle */}
                  <button
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className={`p-4 rounded-full ${
                      isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={isCameraOff ? t.cameraOn : t.cameraOff}
                  >
                    {isCameraOff ? (
                      <VideoOff className="h-6 w-6 text-white" />
                    ) : (
                      <Video className="h-6 w-6 text-white" />
                    )}
                  </button>

                  {/* Screen share */}
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-4 rounded-full ${
                      isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={isScreenSharing ? t.stopSharing : t.shareScreen}
                  >
                    <Monitor className="h-6 w-6 text-white" />
                  </button>

                  {/* End call */}
                  <button
                    onClick={endCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700"
                    title={t.endCall}
                  >
                    <PhoneOff className="h-6 w-6 text-white" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-4 rounded-full bg-gray-700 hover:bg-gray-600"
                    title={isFullscreen ? t.exitFullscreen : t.fullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize className="h-6 w-6 text-white" />
                    ) : (
                      <Maximize className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Meeting link info */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={copyMeetingLink}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white text-sm"
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      {t.linkCopied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.copyLink}
                    </>
                  )}
                </button>
                <a
                  href={videoRoom?.roomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white"
                  title={t.openInNewTab}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side panel */}
      {(showChat || showDocuments || showSettings) && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Side panel tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => {
                setShowChat(true);
                setShowDocuments(false);
                setShowSettings(false);
              }}
              className={`flex-1 p-3 text-sm font-medium ${
                showChat ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4 mx-auto mb-1" />
              {t.chat}
            </button>
            <button
              onClick={() => {
                setShowChat(false);
                setShowDocuments(true);
                setShowSettings(false);
              }}
              className={`flex-1 p-3 text-sm font-medium ${
                showDocuments ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4 mx-auto mb-1" />
              {t.documents}
            </button>
            <button
              onClick={() => {
                setShowChat(false);
                setShowDocuments(false);
                setShowSettings(true);
              }}
              className={`flex-1 p-3 text-sm font-medium ${
                showSettings ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4 mx-auto mb-1" />
              {t.settings}
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showChat && (
              <div className="text-gray-400 text-center py-8">
                Chat feature coming soon
              </div>
            )}
            {showDocuments && (
              <div className="text-gray-400 text-center py-8">
                Document sharing coming soon
              </div>
            )}
            {showSettings && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">{t.connectionTest}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 text-white">
                      <Camera className="h-5 w-5" />
                      {t.testCamera}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 text-white">
                      <Mic className="h-5 w-5" />
                      {t.testMicrophone}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 text-white">
                      <Volume2 className="h-5 w-5" />
                      {t.testSpeaker}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle side panel buttons */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={() => {
            setShowChat(!showChat);
            setShowDocuments(false);
            setShowSettings(false);
          }}
          className={`p-3 rounded-lg ${
            showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={t.chat}
        >
          <MessageSquare className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => {
            setShowChat(false);
            setShowDocuments(!showDocuments);
            setShowSettings(false);
          }}
          className={`p-3 rounded-lg ${
            showDocuments ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={t.documents}
        >
          <FileText className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => {
            setShowChat(false);
            setShowDocuments(false);
            setShowSettings(!showSettings);
          }}
          className={`p-3 rounded-lg ${
            showSettings ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={t.settings}
        >
          <Settings className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}

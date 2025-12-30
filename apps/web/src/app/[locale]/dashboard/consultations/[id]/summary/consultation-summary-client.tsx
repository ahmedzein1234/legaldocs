'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  Download,
  ChevronLeft,
  AlertCircle,
  Loader2,
  User,
  Video,
  Phone,
  Calendar,
  ListTodo,
  ThumbsUp,
  ThumbsDown,
  Send,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { captureError } from '@/lib/error-tracking';

interface ConsultationSummaryClientProps {
  locale: string;
  consultationId: string;
}

interface Consultation {
  id: string;
  consultation_type: 'video' | 'phone' | 'in_person';
  status: string;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes: number;
  actual_duration_minutes?: number;
  consultation_summary?: string;
  recommendations?: string;
  action_items?: string[];
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
}

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assigned_to: 'lawyer' | 'client';
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

interface Feedback {
  overall_rating: number;
  audio_quality?: number;
  video_quality?: number;
  had_technical_issues: boolean;
  technical_issues?: string[];
  feedback_text?: string;
}

const translations = {
  en: {
    consultationSummary: 'Consultation Summary',
    back: 'Back',
    completed: 'Completed',
    duration: 'Duration',
    minutes: 'minutes',
    with: 'with',
    summary: 'Summary',
    recommendations: 'Recommendations',
    actionItems: 'Action Items',
    noSummaryYet: 'Summary will be available shortly after the consultation.',
    assignedTo: 'Assigned to',
    lawyer: 'Lawyer',
    client: 'You',
    dueDate: 'Due',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    pending: 'Pending',
    inProgress: 'In Progress',
    markComplete: 'Mark Complete',
    downloadSummary: 'Download Summary',
    shareWithLawyer: 'Share with Lawyer',
    bookFollowUp: 'Book Follow-up',
    provideFeedback: 'Provide Feedback',
    feedback: 'Your Feedback',
    overallRating: 'Overall Rating',
    audioQuality: 'Audio Quality',
    videoQuality: 'Video Quality',
    technicalIssues: 'Did you experience any technical issues?',
    yes: 'Yes',
    no: 'No',
    selectIssues: 'Select issues you experienced',
    additionalFeedback: 'Additional Feedback',
    feedbackPlaceholder: 'Share your thoughts about the consultation...',
    submitFeedback: 'Submit Feedback',
    feedbackSubmitted: 'Thank you for your feedback!',
    loading: 'Loading summary...',
    error: 'Error loading summary',
    retry: 'Retry',
    consultationDate: 'Consultation Date',
    consultationType: 'Type',
    videoConsultation: 'Video Consultation',
    phoneConsultation: 'Phone Consultation',
    inPersonConsultation: 'In-Person Consultation',
    issueTypes: {
      audio_echo: 'Audio Echo',
      audio_dropouts: 'Audio Dropouts',
      video_freeze: 'Video Freezing',
      video_quality: 'Poor Video Quality',
      connection_lost: 'Connection Lost',
      call_dropped: 'Call Dropped',
      other: 'Other',
    },
  },
  ar: {
    consultationSummary: 'ملخص الاستشارة',
    back: 'رجوع',
    completed: 'مكتملة',
    duration: 'المدة',
    minutes: 'دقيقة',
    with: 'مع',
    summary: 'الملخص',
    recommendations: 'التوصيات',
    actionItems: 'المهام المطلوبة',
    noSummaryYet: 'سيتوفر الملخص قريباً بعد انتهاء الاستشارة.',
    assignedTo: 'مُسند إلى',
    lawyer: 'المحامي',
    client: 'أنت',
    dueDate: 'تاريخ الاستحقاق',
    priority: 'الأولوية',
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    pending: 'قيد الانتظار',
    inProgress: 'قيد التنفيذ',
    markComplete: 'وضع علامة مكتمل',
    downloadSummary: 'تحميل الملخص',
    shareWithLawyer: 'مشاركة مع المحامي',
    bookFollowUp: 'حجز متابعة',
    provideFeedback: 'تقديم ملاحظات',
    feedback: 'ملاحظاتك',
    overallRating: 'التقييم العام',
    audioQuality: 'جودة الصوت',
    videoQuality: 'جودة الفيديو',
    technicalIssues: 'هل واجهت أي مشاكل تقنية؟',
    yes: 'نعم',
    no: 'لا',
    selectIssues: 'اختر المشاكل التي واجهتها',
    additionalFeedback: 'ملاحظات إضافية',
    feedbackPlaceholder: 'شاركنا رأيك حول الاستشارة...',
    submitFeedback: 'إرسال الملاحظات',
    feedbackSubmitted: 'شكراً لك على ملاحظاتك!',
    loading: 'جاري تحميل الملخص...',
    error: 'خطأ في تحميل الملخص',
    retry: 'إعادة المحاولة',
    consultationDate: 'تاريخ الاستشارة',
    consultationType: 'النوع',
    videoConsultation: 'استشارة فيديو',
    phoneConsultation: 'استشارة هاتفية',
    inPersonConsultation: 'استشارة حضورية',
    issueTypes: {
      audio_echo: 'صدى صوت',
      audio_dropouts: 'انقطاع الصوت',
      video_freeze: 'تجمد الفيديو',
      video_quality: 'جودة فيديو ضعيفة',
      connection_lost: 'فقدان الاتصال',
      call_dropped: 'انقطاع المكالمة',
      other: 'أخرى',
    },
  },
};

export function ConsultationSummaryClient({ locale, consultationId }: ConsultationSummaryClientProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';
  const router = useRouter();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({
    overall_rating: 0,
    audio_quality: undefined,
    video_quality: undefined,
    had_technical_issues: false,
    technical_issues: [],
    feedback_text: '',
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);

        // Fetch consultation details
        const data = await apiClient.get<{ data: Consultation }>(`/api/consultations/${consultationId}`);
        setConsultation(data.data);

        // Fetch action items
        try {
          const actionsData = await apiClient.get<{ data: ActionItem[] }>(
            `/api/consultation-calls/${consultationId}/action-items`
          );
          setActionItems(actionsData.data || []);
        } catch {
          // Action items are optional
        }
      } catch (err) {
        captureError(err, { component: 'ConsultationSummary', action: 'fetchSummary' });
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [consultationId]);

  const submitFeedback = async () => {
    try {
      setSubmittingFeedback(true);

      await apiClient.post(`/api/consultation-calls/${consultationId}/feedback`, feedback);

      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
    } catch (err) {
      captureError(err, { component: 'ConsultationSummary', action: 'submitFeedback' });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const markActionItemComplete = async (itemId: string) => {
    try {
      await apiClient.patch(`/api/consultation-calls/${consultationId}/action-items/${itemId}`, {
        status: 'completed',
      });

      setActionItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: 'completed' } : item
        )
      );
    } catch (err) {
      captureError(err, { component: 'ConsultationSummary', action: 'markComplete' });
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  if (!consultation) return null;

  const consultationTypeLabel =
    consultation.consultation_type === 'video'
      ? t.videoConsultation
      : consultation.consultation_type === 'phone'
      ? t.phoneConsultation
      : t.inPersonConsultation;

  const ConsultationTypeIcon =
    consultation.consultation_type === 'video'
      ? Video
      : consultation.consultation_type === 'phone'
      ? Phone
      : User;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">{t.consultationSummary}</h1>
        </div>

        {/* Consultation info card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {consultation.lawyer.avatar_url ? (
                <img
                  src={consultation.lawyer.avatar_url}
                  alt={consultation.lawyer.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{consultation.lawyer.name}</h2>
                <p className="text-gray-500">{consultation.lawyer.specialization}</p>
              </div>
            </div>
            <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="h-4 w-4" />
              {t.completed}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">{t.consultationDate}</p>
                <p className="font-medium">
                  {new Date(consultation.scheduled_at).toLocaleDateString(
                    locale === 'ar' ? 'ar-AE' : 'en-US',
                    {
                      dateStyle: 'medium',
                    }
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ConsultationTypeIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">{t.consultationType}</p>
                <p className="font-medium">{consultationTypeLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">{t.duration}</p>
                <p className="font-medium">
                  {consultation.actual_duration_minutes || consultation.duration_minutes}{' '}
                  {t.minutes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t.summary}
          </h3>
          {consultation.consultation_summary ? (
            <p className="text-gray-700 whitespace-pre-wrap">
              {consultation.consultation_summary}
            </p>
          ) : (
            <p className="text-gray-500 italic">{t.noSummaryYet}</p>
          )}
        </div>

        {/* Recommendations */}
        {consultation.recommendations && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {t.recommendations}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {consultation.recommendations}
            </p>
          </div>
        )}

        {/* Action Items */}
        {actionItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-600" />
              {t.actionItems}
            </h3>
            <div className="space-y-4">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${
                    item.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          item.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-500">
                          {t.assignedTo}:{' '}
                          <span className="font-medium">
                            {item.assigned_to === 'lawyer' ? t.lawyer : t.client}
                          </span>
                        </span>
                        {item.due_date && (
                          <span className="text-gray-500">
                            {t.dueDate}:{' '}
                            <span className="font-medium">
                              {new Date(item.due_date).toLocaleDateString(
                                locale === 'ar' ? 'ar-AE' : 'en-US'
                              )}
                            </span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            item.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : item.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {t[item.priority]}
                        </span>
                      </div>
                    </div>
                    {item.status !== 'completed' && item.assigned_to === 'client' && (
                      <button
                        onClick={() => markActionItemComplete(item.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                      >
                        {t.markComplete}
                      </button>
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5" />
            {t.downloadSummary}
          </button>
          <Link
            href={`/${locale}/dashboard/lawyers/${consultation.lawyer.id}/book`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Calendar className="h-5 w-5" />
            {t.bookFollowUp}
          </Link>
          {!feedbackSubmitted && (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              <Star className="h-5 w-5" />
              {t.provideFeedback}
            </button>
          )}
        </div>

        {/* Feedback success message */}
        {feedbackSubmitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-800">{t.feedbackSubmitted}</span>
          </div>
        )}

        {/* Feedback form */}
        {showFeedbackForm && !feedbackSubmitted && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-6">{t.feedback}</h3>

            <div className="space-y-6">
              {/* Overall rating */}
              <StarRating
                value={feedback.overall_rating}
                onChange={(v) => setFeedback({ ...feedback, overall_rating: v })}
                label={t.overallRating}
              />

              {/* Audio quality */}
              <StarRating
                value={feedback.audio_quality || 0}
                onChange={(v) => setFeedback({ ...feedback, audio_quality: v })}
                label={t.audioQuality}
              />

              {/* Video quality (only for video consultations) */}
              {consultation.consultation_type === 'video' && (
                <StarRating
                  value={feedback.video_quality || 0}
                  onChange={(v) => setFeedback({ ...feedback, video_quality: v })}
                  label={t.videoQuality}
                />
              )}

              {/* Technical issues */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  {t.technicalIssues}
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFeedback({ ...feedback, had_technical_issues: true })
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      feedback.had_technical_issues
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    {t.yes}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedback({
                        ...feedback,
                        had_technical_issues: false,
                        technical_issues: [],
                      })
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      !feedback.had_technical_issues
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    {t.no}
                  </button>
                </div>
              </div>

              {/* Issue types */}
              {feedback.had_technical_issues && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    {t.selectIssues}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(t.issueTypes).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const issues = feedback.technical_issues || [];
                          if (issues.includes(key)) {
                            setFeedback({
                              ...feedback,
                              technical_issues: issues.filter((i) => i !== key),
                            });
                          } else {
                            setFeedback({
                              ...feedback,
                              technical_issues: [...issues, key],
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          feedback.technical_issues?.includes(key)
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t.additionalFeedback}
                </label>
                <textarea
                  value={feedback.feedback_text}
                  onChange={(e) =>
                    setFeedback({ ...feedback, feedback_text: e.target.value })
                  }
                  placeholder={t.feedbackPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                onClick={submitFeedback}
                disabled={submittingFeedback || feedback.overall_rating === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {submittingFeedback ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {t.submitFeedback}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

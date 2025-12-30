'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  Phone,
  User,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Star,
  Bell,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { captureError } from '@/lib/error-tracking';

interface ConsultationsListClientProps {
  locale: string;
}

interface Consultation {
  id: string;
  consultation_type: 'video' | 'phone' | 'in_person';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  duration_minutes: number;
  topic: string;
  lawyer: {
    id: string;
    name: string;
    avatar_url?: string;
    specialization: string;
    rating?: number;
  };
  has_unread_messages?: boolean;
  reminder_sent?: boolean;
}

const translations = {
  en: {
    myConsultations: 'My Consultations',
    upcoming: 'Upcoming',
    past: 'Past',
    all: 'All',
    search: 'Search consultations...',
    filter: 'Filter',
    bookNew: 'Book Consultation',
    noConsultations: 'No consultations found',
    noUpcoming: 'No upcoming consultations',
    noPast: 'No past consultations',
    findLawyer: 'Find a Lawyer',
    joinCall: 'Join Call',
    viewSummary: 'View Summary',
    sendMessage: 'Message',
    reschedule: 'Reschedule',
    cancel: 'Cancel',
    videoConsultation: 'Video',
    phoneConsultation: 'Phone',
    inPersonConsultation: 'In-Person',
    pending: 'Pending',
    confirmed: 'Confirmed',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    minutes: 'min',
    today: 'Today',
    tomorrow: 'Tomorrow',
    startsIn: 'Starts in',
    hours: 'hours',
    mins: 'mins',
    now: 'Starting now',
    loading: 'Loading consultations...',
    error: 'Error loading consultations',
    retry: 'Retry',
    reminderSet: 'Reminder set',
    newMessages: 'New messages',
  },
  ar: {
    myConsultations: 'استشاراتي',
    upcoming: 'القادمة',
    past: 'السابقة',
    all: 'الكل',
    search: 'البحث في الاستشارات...',
    filter: 'تصفية',
    bookNew: 'حجز استشارة',
    noConsultations: 'لم يتم العثور على استشارات',
    noUpcoming: 'لا توجد استشارات قادمة',
    noPast: 'لا توجد استشارات سابقة',
    findLawyer: 'البحث عن محامي',
    joinCall: 'انضم للمكالمة',
    viewSummary: 'عرض الملخص',
    sendMessage: 'رسالة',
    reschedule: 'إعادة جدولة',
    cancel: 'إلغاء',
    videoConsultation: 'فيديو',
    phoneConsultation: 'هاتف',
    inPersonConsultation: 'حضوري',
    pending: 'قيد الانتظار',
    confirmed: 'مؤكدة',
    inProgress: 'قيد التقدم',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    minutes: 'دقيقة',
    today: 'اليوم',
    tomorrow: 'غداً',
    startsIn: 'تبدأ خلال',
    hours: 'ساعات',
    mins: 'دقائق',
    now: 'تبدأ الآن',
    loading: 'جاري تحميل الاستشارات...',
    error: 'خطأ في تحميل الاستشارات',
    retry: 'إعادة المحاولة',
    reminderSet: 'تم تعيين تذكير',
    newMessages: 'رسائل جديدة',
  },
};

export function ConsultationsListClient({ locale }: ConsultationsListClientProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';
  const router = useRouter();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchConsultations() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (activeTab === 'upcoming') {
          params.append('status', 'pending,confirmed');
          params.append('upcoming', 'true');
        } else if (activeTab === 'past') {
          params.append('status', 'completed,cancelled');
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const data = await apiClient.get<{ data: Consultation[] }>(
          `/api/consultations?${params.toString()}`
        );
        setConsultations(data.data || []);
      } catch (err) {
        captureError(err, { component: 'ConsultationsList', action: 'fetch' });
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchConsultations();
  }, [activeTab, searchQuery]);

  const getTimeUntil = (dateStr: string) => {
    const scheduledTime = new Date(dateStr);
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins <= 0) return t.now;
    if (diffMins < 60) return `${t.startsIn} ${diffMins} ${t.mins}`;
    if (diffHours < 24) return `${t.startsIn} ${diffHours} ${t.hours}`;

    const isToday = scheduledTime.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = scheduledTime.toDateString() === tomorrow.toDateString();

    if (isToday) return t.today;
    if (isTomorrow) return t.tomorrow;

    return scheduledTime.toLocaleDateString(
      locale === 'ar' ? 'ar-AE' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: t.pending,
      confirmed: t.confirmed,
      in_progress: t.inProgress,
      completed: t.completed,
      cancelled: t.cancelled,
    };
    return statusLabels[status] || status;
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'video') return <Video className="h-4 w-4" />;
    if (type === 'phone') return <Phone className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'video') return t.videoConsultation;
    if (type === 'phone') return t.phoneConsultation;
    return t.inPersonConsultation;
  };

  const canJoin = (consultation: Consultation) => {
    if (consultation.status !== 'confirmed') return false;
    const scheduledTime = new Date(consultation.scheduled_at);
    const now = new Date();
    const diffMins = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMins <= 15 && diffMins > -consultation.duration_minutes;
  };

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

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t.myConsultations}</h1>
          <Link
            href={`/${locale}/dashboard/lawyers`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            {t.bookNew}
          </Link>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex items-center justify-between border-b">
            <div className="flex">
              {(['upcoming', 'past', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t[tab]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consultations list */}
        {consultations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              {activeTab === 'upcoming'
                ? t.noUpcoming
                : activeTab === 'past'
                ? t.noPast
                : t.noConsultations}
            </p>
            <Link
              href={`/${locale}/dashboard/lawyers`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t.findLawyer}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Lawyer info */}
                    <div className="flex items-start gap-4">
                      {consultation.lawyer.avatar_url ? (
                        <img
                          src={consultation.lawyer.avatar_url}
                          alt={consultation.lawyer.name}
                          className="w-14 h-14 rounded-full"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-7 w-7 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {consultation.lawyer.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {consultation.lawyer.specialization}
                        </p>
                        {consultation.lawyer.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600">
                              {consultation.lawyer.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status and type */}
                    <div className="flex items-center gap-2">
                      {consultation.has_unread_messages && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <MessageSquare className="h-3 w-3" />
                          {t.newMessages}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          consultation.status
                        )}`}
                      >
                        {getStatusLabel(consultation.status)}
                      </span>
                    </div>
                  </div>

                  {/* Topic */}
                  {consultation.topic && (
                    <p className="mt-4 text-gray-700 line-clamp-2">
                      {consultation.topic}
                    </p>
                  )}

                  {/* Time and details */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(consultation.scheduled_at).toLocaleDateString(
                          locale === 'ar' ? 'ar-AE' : 'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(consultation.scheduled_at).toLocaleTimeString(
                          locale === 'ar' ? 'ar-AE' : 'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <TypeIcon type={consultation.consultation_type} />
                        {getTypeLabel(consultation.consultation_type)}
                      </span>
                      <span>
                        {consultation.duration_minutes} {t.minutes}
                      </span>
                    </div>

                    {/* Time until */}
                    {consultation.status === 'confirmed' && (
                      <span
                        className={`text-sm font-medium ${
                          canJoin(consultation) ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {getTimeUntil(consultation.scheduled_at)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-end gap-3">
                    {consultation.status === 'completed' ? (
                      <Link
                        href={`/${locale}/dashboard/consultations/${consultation.id}/summary`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        {t.viewSummary}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : consultation.status === 'confirmed' && canJoin(consultation) ? (
                      <Link
                        href={`/${locale}/dashboard/consultations/${consultation.id}/room`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        {consultation.consultation_type === 'video' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <Phone className="h-4 w-4" />
                        )}
                        {t.joinCall}
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={`/${locale}/dashboard/messages?lawyer=${consultation.lawyer.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {t.sendMessage}
                        </Link>
                        {consultation.status === 'pending' && (
                          <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                            {t.cancel}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

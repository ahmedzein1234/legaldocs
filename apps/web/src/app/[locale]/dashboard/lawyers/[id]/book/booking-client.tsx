'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  CreditCard,
} from 'lucide-react';

interface TimeSlot {
  date: string;
  time: string;
  datetime: string;
  available: boolean;
  duration: number;
}

interface Lawyer {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  avatar_url: string | null;
  emirate: string;
  consultation_fee: number;
  average_rating: number;
  total_reviews: number;
  response_time_hours: number;
  specializations: string[];
}

export default function ConsultationBookingClient() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const lawyerId = params.id as string;

  const [step, setStep] = useState(1); // 1: Select Time, 2: Details, 3: Confirm
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'phone'>('video');

  // Form data
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'urgent' | 'express'>('standard');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // Booking result
  const [bookingResult, setBookingResult] = useState<{
    consultationId: string;
    meetingLink?: string;
    scheduledAt: string;
    fee: { amount: number; platformFee: number; total: number };
  } | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const translations = {
    back: isArabic ? 'رجوع' : 'Back',
    bookConsultation: isArabic ? 'حجز استشارة' : 'Book Consultation',
    step1Title: isArabic ? 'اختر الوقت' : 'Select Time',
    step2Title: isArabic ? 'تفاصيل الاستشارة' : 'Consultation Details',
    step3Title: isArabic ? 'تأكيد الحجز' : 'Confirm Booking',
    selectDate: isArabic ? 'اختر التاريخ' : 'Select Date',
    selectTime: isArabic ? 'اختر الوقت' : 'Select Time',
    consultationType: isArabic ? 'نوع الاستشارة' : 'Consultation Type',
    videoCall: isArabic ? 'مكالمة فيديو' : 'Video Call',
    phoneCall: isArabic ? 'مكالمة هاتفية' : 'Phone Call',
    topic: isArabic ? 'الموضوع' : 'Topic',
    topicPlaceholder: isArabic ? 'ما هو موضوع استشارتك؟' : 'What is your consultation about?',
    description: isArabic ? 'التفاصيل' : 'Details',
    descriptionPlaceholder: isArabic
      ? 'قدم المزيد من التفاصيل حول استشارتك...'
      : 'Provide more details about your consultation...',
    urgency: isArabic ? 'الأولوية' : 'Urgency',
    standard: isArabic ? 'عادي' : 'Standard',
    urgent: isArabic ? 'عاجل' : 'Urgent',
    express: isArabic ? 'سريع جداً' : 'Express',
    language: isArabic ? 'اللغة المفضلة' : 'Preferred Language',
    next: isArabic ? 'التالي' : 'Next',
    previous: isArabic ? 'السابق' : 'Previous',
    confirmBooking: isArabic ? 'تأكيد الحجز' : 'Confirm Booking',
    bookingSummary: isArabic ? 'ملخص الحجز' : 'Booking Summary',
    date: isArabic ? 'التاريخ' : 'Date',
    time: isArabic ? 'الوقت' : 'Time',
    duration: isArabic ? 'المدة' : 'Duration',
    minutes: isArabic ? 'دقيقة' : 'minutes',
    consultationFee: isArabic ? 'رسوم الاستشارة' : 'Consultation Fee',
    platformFee: isArabic ? 'رسوم المنصة' : 'Platform Fee',
    total: isArabic ? 'المجموع' : 'Total',
    noSlotsAvailable: isArabic ? 'لا توجد مواعيد متاحة' : 'No available slots',
    tryAnotherDate: isArabic ? 'جرب تاريخ آخر' : 'Try another date',
    loading: isArabic ? 'جاري التحميل...' : 'Loading...',
    processing: isArabic ? 'جاري المعالجة...' : 'Processing...',
    bookingSuccess: isArabic ? 'تم الحجز بنجاح!' : 'Booking Successful!',
    bookingSuccessMessage: isArabic
      ? 'تم إرسال طلب الحجز. سيقوم المحامي بالتأكيد قريباً.'
      : 'Your booking request has been sent. The lawyer will confirm shortly.',
    viewBooking: isArabic ? 'عرض الحجز' : 'View Booking',
    bookAnother: isArabic ? 'حجز آخر' : 'Book Another',
    error: isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.',
    reviews: isArabic ? 'تقييم' : 'reviews',
    respondsIn: isArabic ? 'يرد خلال' : 'Responds in',
    hours: isArabic ? 'ساعات' : 'hours',
    today: isArabic ? 'اليوم' : 'Today',
    tomorrow: isArabic ? 'غداً' : 'Tomorrow',
  };

  // Fetch lawyer and availability
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch lawyer profile
        const lawyerRes = await fetch(`${apiBaseUrl}/api/lawyers/${lawyerId}`);
        if (!lawyerRes.ok) throw new Error('Lawyer not found');
        const lawyerData = await lawyerRes.json();
        setLawyer(lawyerData.data.lawyer);

        // Fetch availability
        const today = new Date().toISOString().split('T')[0];
        const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const availRes = await fetch(
          `${apiBaseUrl}/api/consultations/lawyers/${lawyerId}/availability?start=${today}&end=${twoWeeksLater}&type=${consultationType}`
        );
        if (availRes.ok) {
          const availData = await availRes.json();
          setSlots(availData.data.slots || []);
          // Set first available date
          const firstAvailable = availData.data.slots?.find((s: TimeSlot) => s.available);
          if (firstAvailable) {
            setSelectedDate(firstAvailable.date);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(translations.error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lawyerId, consultationType]);

  // Get unique dates with available slots
  const availableDates = [...new Set(slots.filter((s) => s.available).map((s) => s.date))];

  // Get slots for selected date
  const slotsForDate = slots.filter((s) => s.date === selectedDate);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return translations.today;
    }
    if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return translations.tomorrow;
    }

    return date.toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedSlot) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/consultations/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          lawyerId,
          scheduledAt: selectedSlot.datetime,
          durationMinutes: selectedSlot.duration,
          consultationType,
          topic,
          description,
          urgency,
          preferredLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingResult(data.data);
        setSuccess(true);
      } else {
        throw new Error(data.error?.message || 'Booking failed');
      }
    } catch (err: any) {
      setError(err.message || translations.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success && bookingResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{translations.bookingSuccess}</h2>
            <p className="text-muted-foreground mb-6">{translations.bookingSuccessMessage}</p>

            <Card className="bg-muted/50 mb-6 text-start">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.date}</span>
                  <span className="font-medium">
                    {new Date(bookingResult.scheduledAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.time}</span>
                  <span className="font-medium">
                    {new Date(bookingResult.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{translations.total}</span>
                  <span className="font-semibold text-primary">
                    {bookingResult.fee.total} AED
                  </span>
                </div>
                {bookingResult.meetingLink && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Meeting Link</p>
                    <a
                      href={bookingResult.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-sm"
                    >
                      {bookingResult.meetingLink}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center">
              <Link href={`/${locale}/dashboard/consultations`}>
                <Button>{translations.viewBooking}</Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                {translations.bookAnother}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href={`/${locale}/dashboard/lawyers/${lawyerId}`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {translations.back}
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{translations.bookConsultation}</h1>
          {lawyer && (
            <p className="text-muted-foreground">
              {lawyer.first_name} {lawyer.last_name}
            </p>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  'w-12 h-1 mx-1 rounded-full transition-colors',
                  step > s ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Step 1: Select Time */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {translations.step1Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Consultation Type */}
                <div className="space-y-2">
                  <Label>{translations.consultationType}</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={consultationType === 'video' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setConsultationType('video')}
                    >
                      <Video className="h-4 w-4" />
                      {translations.videoCall}
                    </Button>
                    <Button
                      variant={consultationType === 'phone' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setConsultationType('phone')}
                    >
                      <Phone className="h-4 w-4" />
                      {translations.phoneCall}
                    </Button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>{translations.selectDate}</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {availableDates.slice(0, 7).map((date) => (
                      <Button
                        key={date}
                        variant={selectedDate === date ? 'default' : 'outline'}
                        className="flex-col h-auto py-3 px-4 min-w-[80px]"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                      >
                        <span className="text-xs">{formatDate(date)}</span>
                        <span className="text-lg font-bold">
                          {new Date(date).getDate()}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <Label>{translations.selectTime}</Label>
                  {slotsForDate.filter((s) => s.available).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {translations.noSlotsAvailable}
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slotsForDate
                        .filter((s) => s.available)
                        .map((slot) => (
                          <Button
                            key={slot.datetime}
                            variant={selectedSlot?.datetime === slot.datetime ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                >
                  {translations.next}
                  <ChevronRight className="h-4 w-4 ms-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {translations.step2Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{translations.topic}</Label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={translations.topicPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{translations.description}</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={translations.descriptionPlaceholder}
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{translations.urgency}</Label>
                    <Select
                      value={urgency}
                      onValueChange={(v) => setUrgency(v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">{translations.standard}</SelectItem>
                        <SelectItem value="urgent">{translations.urgent}</SelectItem>
                        <SelectItem value="express">{translations.express}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{translations.language}</Label>
                    <Select
                      value={preferredLanguage}
                      onValueChange={setPreferredLanguage}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="ur">اردو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4 me-2" />
                    {translations.previous}
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    {translations.next}
                    <ChevronRight className="h-4 w-4 ms-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {translations.step3Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold">{translations.bookingSummary}</h4>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{translations.date}</span>
                      <span>
                        {selectedSlot &&
                          new Date(selectedSlot.datetime).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{translations.time}</span>
                      <span>{selectedSlot?.time}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{translations.duration}</span>
                      <span>
                        {selectedSlot?.duration} {translations.minutes}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {translations.consultationType}
                      </span>
                      <span className="flex items-center gap-1">
                        {consultationType === 'video' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <Phone className="h-4 w-4" />
                        )}
                        {consultationType === 'video'
                          ? translations.videoCall
                          : translations.phoneCall}
                      </span>
                    </div>

                    {topic && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{translations.topic}</span>
                        <span>{topic}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {translations.consultationFee}
                        </span>
                        <span>{lawyer?.consultation_fee || 0} AED</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {translations.platformFee}
                        </span>
                        <span>{Math.round((lawyer?.consultation_fee || 0) * 0.1)} AED</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>{translations.total}</span>
                        <span className="text-primary">
                          {Math.round((lawyer?.consultation_fee || 0) * 1.1)} AED
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft className="h-4 w-4 me-2" />
                    {translations.previous}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBooking}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        {translations.processing}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 me-2" />
                        {translations.confirmBooking}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Lawyer Info */}
        <div>
          {lawyer && (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
                    {lawyer.first_name.charAt(0)}
                    {lawyer.last_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {lawyer.first_name} {lawyer.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{lawyer.title}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{lawyer.emirate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>
                      {lawyer.average_rating} ({lawyer.total_reviews}{' '}
                      {translations.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {translations.respondsIn} {lawyer.response_time_hours}{' '}
                      {translations.hours}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {translations.consultationFee}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {lawyer.consultation_fee} AED
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

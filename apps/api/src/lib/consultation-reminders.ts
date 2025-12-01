/**
 * Consultation Reminders Service
 *
 * Handles scheduling and sending reminders for upcoming consultations:
 * - 24 hours before
 * - 1 hour before
 * - 15 minutes before
 * - At start time
 *
 * Supports multiple channels:
 * - Email
 * - SMS
 * - WhatsApp
 * - Push notifications
 */

export interface Reminder {
  id: string;
  consultationId: string;
  userId: string;
  reminderType: '24h' | '1h' | '15m' | 'starting';
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  scheduledFor: string;
  sentAt?: string;
  deliveredAt?: string;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
}

export interface ReminderTemplate {
  subject: string;
  body: string;
  sms: string;
}

export interface ConsultationDetails {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  consultationType: 'video' | 'phone' | 'in_person';
  lawyerName: string;
  clientName: string;
  topic?: string;
  meetingUrl?: string;
}

/**
 * Get reminder templates in different languages
 */
export function getReminderTemplates(
  language: 'en' | 'ar' | 'ur',
  reminderType: '24h' | '1h' | '15m' | 'starting',
  consultation: ConsultationDetails,
  isForLawyer: boolean
): ReminderTemplate {
  const scheduledTime = new Date(consultation.scheduledAt);
  const timeStr = scheduledTime.toLocaleTimeString(
    language === 'ar' ? 'ar-AE' : language === 'ur' ? 'ur-PK' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  );
  const dateStr = scheduledTime.toLocaleDateString(
    language === 'ar' ? 'ar-AE' : language === 'ur' ? 'ur-PK' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  );

  const otherPartyName = isForLawyer ? consultation.clientName : consultation.lawyerName;
  const consultationType = {
    video: language === 'ar' ? 'فيديو' : 'video',
    phone: language === 'ar' ? 'هاتفية' : 'phone',
    in_person: language === 'ar' ? 'حضورية' : 'in-person',
  }[consultation.consultationType];

  const templates = {
    en: {
      '24h': {
        subject: `Reminder: Consultation Tomorrow with ${otherPartyName}`,
        body: `
Dear ${isForLawyer ? 'Counselor' : 'Client'},

This is a reminder that you have a ${consultationType} legal consultation scheduled for tomorrow:

Date: ${dateStr}
Time: ${timeStr}
Duration: ${consultation.durationMinutes} minutes
${isForLawyer ? 'Client' : 'Lawyer'}: ${otherPartyName}
${consultation.topic ? `Topic: ${consultation.topic}` : ''}

Please ensure you:
- Are in a quiet, private location
- Have all relevant documents ready
- Test your ${consultation.consultationType === 'video' ? 'camera and microphone' : 'phone connection'}

${consultation.meetingUrl ? `Join the consultation: ${consultation.meetingUrl}` : ''}

Best regards,
LegalDocs Team
        `.trim(),
        sms: `LegalDocs: Reminder - Your ${consultationType} consultation with ${otherPartyName} is tomorrow at ${timeStr}. Please be prepared.`,
      },
      '1h': {
        subject: `Starting Soon: Consultation in 1 Hour`,
        body: `
Your ${consultationType} consultation with ${otherPartyName} starts in 1 hour.

Time: ${timeStr}
${consultation.meetingUrl ? `Join link: ${consultation.meetingUrl}` : ''}

Please be ready 5 minutes early.

LegalDocs Team
        `.trim(),
        sms: `LegalDocs: Your consultation with ${otherPartyName} starts in 1 hour at ${timeStr}. Please be ready.`,
      },
      '15m': {
        subject: `Starting in 15 Minutes: Consultation with ${otherPartyName}`,
        body: `
Your ${consultationType} consultation with ${otherPartyName} starts in 15 minutes.

${consultation.meetingUrl ? `Click here to join: ${consultation.meetingUrl}` : 'Please be available for the call.'}

LegalDocs Team
        `.trim(),
        sms: `LegalDocs: 15 min reminder - Your consultation with ${otherPartyName} starts soon. ${consultation.meetingUrl || 'Be ready for the call.'}`,
      },
      starting: {
        subject: `Your Consultation is Starting Now`,
        body: `
Your ${consultationType} consultation with ${otherPartyName} is starting now.

${consultation.meetingUrl ? `Join now: ${consultation.meetingUrl}` : 'Please answer the call.'}

LegalDocs Team
        `.trim(),
        sms: `LegalDocs: Your consultation with ${otherPartyName} is starting now. ${consultation.meetingUrl || 'Answer the call.'}`,
      },
    },
    ar: {
      '24h': {
        subject: `تذكير: استشارة غداً مع ${otherPartyName}`,
        body: `
عزيزي ${isForLawyer ? 'المحامي' : 'العميل'},

هذا تذكير بأن لديك استشارة قانونية ${consultationType} مجدولة غداً:

التاريخ: ${dateStr}
الوقت: ${timeStr}
المدة: ${consultation.durationMinutes} دقيقة
${isForLawyer ? 'العميل' : 'المحامي'}: ${otherPartyName}
${consultation.topic ? `الموضوع: ${consultation.topic}` : ''}

يرجى التأكد من:
- التواجد في مكان هادئ وخاص
- تجهيز جميع المستندات ذات الصلة
- اختبار ${consultation.consultationType === 'video' ? 'الكاميرا والميكروفون' : 'اتصال الهاتف'}

${consultation.meetingUrl ? `رابط الانضمام: ${consultation.meetingUrl}` : ''}

مع أطيب التحيات،
فريق LegalDocs
        `.trim(),
        sms: `LegalDocs: تذكير - استشارتك ${consultationType} مع ${otherPartyName} غداً الساعة ${timeStr}. يرجى الاستعداد.`,
      },
      '1h': {
        subject: `تبدأ قريباً: الاستشارة بعد ساعة واحدة`,
        body: `
استشارتك ${consultationType} مع ${otherPartyName} تبدأ بعد ساعة واحدة.

الوقت: ${timeStr}
${consultation.meetingUrl ? `رابط الانضمام: ${consultation.meetingUrl}` : ''}

يرجى الاستعداد قبل 5 دقائق.

فريق LegalDocs
        `.trim(),
        sms: `LegalDocs: استشارتك مع ${otherPartyName} تبدأ بعد ساعة الساعة ${timeStr}. يرجى الاستعداد.`,
      },
      '15m': {
        subject: `تبدأ بعد 15 دقيقة: الاستشارة مع ${otherPartyName}`,
        body: `
استشارتك ${consultationType} مع ${otherPartyName} تبدأ بعد 15 دقيقة.

${consultation.meetingUrl ? `انقر هنا للانضمام: ${consultation.meetingUrl}` : 'يرجى التواجد لاستقبال المكالمة.'}

فريق LegalDocs
        `.trim(),
        sms: `LegalDocs: تذكير 15 دقيقة - استشارتك مع ${otherPartyName} تبدأ قريباً. ${consultation.meetingUrl || 'كن مستعداً للمكالمة.'}`,
      },
      starting: {
        subject: `استشارتك تبدأ الآن`,
        body: `
استشارتك ${consultationType} مع ${otherPartyName} تبدأ الآن.

${consultation.meetingUrl ? `انضم الآن: ${consultation.meetingUrl}` : 'يرجى الرد على المكالمة.'}

فريق LegalDocs
        `.trim(),
        sms: `LegalDocs: استشارتك مع ${otherPartyName} تبدأ الآن. ${consultation.meetingUrl || 'أجب على المكالمة.'}`,
      },
    },
    ur: {
      '24h': {
        subject: `یاد دہانی: کل ${otherPartyName} کے ساتھ مشاورت`,
        body: `
محترم ${isForLawyer ? 'وکیل صاحب' : 'مؤکل'},

یہ یاد دہانی ہے کہ آپ کی کل ${consultationType} قانونی مشاورت ہے:

تاریخ: ${dateStr}
وقت: ${timeStr}
دورانیہ: ${consultation.durationMinutes} منٹ
${isForLawyer ? 'مؤکل' : 'وکیل'}: ${otherPartyName}
${consultation.topic ? `موضوع: ${consultation.topic}` : ''}

براہ کرم یقینی بنائیں:
- پرسکون، نجی جگہ پر ہوں
- تمام متعلقہ دستاویزات تیار ہوں
- ${consultation.consultationType === 'video' ? 'کیمرہ اور مائیکروفون' : 'فون کنکشن'} چیک کریں

${consultation.meetingUrl ? `شامل ہونے کا لنک: ${consultation.meetingUrl}` : ''}

نیک تمناؤں کے ساتھ،
LegalDocs ٹیم
        `.trim(),
        sms: `LegalDocs: یاد دہانی - ${otherPartyName} کے ساتھ آپ کی ${consultationType} مشاورت کل ${timeStr} بجے ہے۔`,
      },
      '1h': {
        subject: `جلد شروع ہو رہی ہے: 1 گھنٹے میں مشاورت`,
        body: `
${otherPartyName} کے ساتھ آپ کی ${consultationType} مشاورت 1 گھنٹے میں شروع ہو رہی ہے۔

وقت: ${timeStr}
${consultation.meetingUrl ? `لنک: ${consultation.meetingUrl}` : ''}

براہ کرم 5 منٹ پہلے تیار رہیں۔

LegalDocs ٹیم
        `.trim(),
        sms: `LegalDocs: ${otherPartyName} کے ساتھ آپ کی مشاورت 1 گھنٹے میں ${timeStr} بجے شروع ہو رہی ہے۔`,
      },
      '15m': {
        subject: `15 منٹ میں شروع: ${otherPartyName} کے ساتھ مشاورت`,
        body: `
${otherPartyName} کے ساتھ آپ کی ${consultationType} مشاورت 15 منٹ میں شروع ہو رہی ہے۔

${consultation.meetingUrl ? `شامل ہونے کے لیے کلک کریں: ${consultation.meetingUrl}` : 'براہ کرم کال کے لیے دستیاب رہیں۔'}

LegalDocs ٹیم
        `.trim(),
        sms: `LegalDocs: 15 منٹ کی یاد دہانی - ${otherPartyName} کے ساتھ مشاورت جلد شروع ہو رہی ہے۔`,
      },
      starting: {
        subject: `آپ کی مشاورت ابھی شروع ہو رہی ہے`,
        body: `
${otherPartyName} کے ساتھ آپ کی ${consultationType} مشاورت ابھی شروع ہو رہی ہے۔

${consultation.meetingUrl ? `ابھی شامل ہوں: ${consultation.meetingUrl}` : 'براہ کرم کال کا جواب دیں۔'}

LegalDocs ٹیم
        `.trim(),
        sms: `LegalDocs: ${otherPartyName} کے ساتھ آپ کی مشاورت ابھی شروع ہو رہی ہے۔`,
      },
    },
  };

  return templates[language][reminderType];
}

/**
 * Calculate reminder send times based on consultation time
 */
export function calculateReminderTimes(scheduledAt: string): {
  type: '24h' | '1h' | '15m' | 'starting';
  sendAt: Date;
}[] {
  const consultationTime = new Date(scheduledAt);
  const now = new Date();

  const reminders: { type: '24h' | '1h' | '15m' | 'starting'; sendAt: Date }[] = [];

  // 24 hours before
  const twentyFourHours = new Date(consultationTime.getTime() - 24 * 60 * 60 * 1000);
  if (twentyFourHours > now) {
    reminders.push({ type: '24h', sendAt: twentyFourHours });
  }

  // 1 hour before
  const oneHour = new Date(consultationTime.getTime() - 60 * 60 * 1000);
  if (oneHour > now) {
    reminders.push({ type: '1h', sendAt: oneHour });
  }

  // 15 minutes before
  const fifteenMin = new Date(consultationTime.getTime() - 15 * 60 * 1000);
  if (fifteenMin > now) {
    reminders.push({ type: '15m', sendAt: fifteenMin });
  }

  // At start time
  if (consultationTime > now) {
    reminders.push({ type: 'starting', sendAt: consultationTime });
  }

  return reminders;
}

/**
 * Check if a reminder should be sent now
 */
export function shouldSendReminder(
  scheduledAt: string,
  reminderType: '24h' | '1h' | '15m' | 'starting',
  toleranceMinutes: number = 5
): boolean {
  const consultationTime = new Date(scheduledAt);
  const now = new Date();

  const offsets = {
    '24h': 24 * 60 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    starting: 0,
  };

  const targetTime = new Date(consultationTime.getTime() - offsets[reminderType]);
  const diffMs = Math.abs(now.getTime() - targetTime.getTime());
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= toleranceMinutes;
}

/**
 * Format reminder for push notification
 */
export function formatPushNotification(
  language: 'en' | 'ar' | 'ur',
  reminderType: '24h' | '1h' | '15m' | 'starting',
  otherPartyName: string
): { title: string; body: string } {
  const notifications = {
    en: {
      '24h': {
        title: 'Consultation Tomorrow',
        body: `Your consultation with ${otherPartyName} is scheduled for tomorrow.`,
      },
      '1h': {
        title: 'Consultation in 1 Hour',
        body: `Your consultation with ${otherPartyName} starts in 1 hour.`,
      },
      '15m': {
        title: 'Starting in 15 Minutes',
        body: `Your consultation with ${otherPartyName} is about to start.`,
      },
      starting: {
        title: 'Consultation Starting',
        body: `Your consultation with ${otherPartyName} is starting now. Join the call!`,
      },
    },
    ar: {
      '24h': {
        title: 'استشارة غداً',
        body: `استشارتك مع ${otherPartyName} مجدولة غداً.`,
      },
      '1h': {
        title: 'استشارة بعد ساعة',
        body: `استشارتك مع ${otherPartyName} تبدأ بعد ساعة.`,
      },
      '15m': {
        title: 'تبدأ بعد 15 دقيقة',
        body: `استشارتك مع ${otherPartyName} على وشك البدء.`,
      },
      starting: {
        title: 'الاستشارة تبدأ',
        body: `استشارتك مع ${otherPartyName} تبدأ الآن. انضم للمكالمة!`,
      },
    },
    ur: {
      '24h': {
        title: 'کل مشاورت',
        body: `${otherPartyName} کے ساتھ آپ کی مشاورت کل ہے۔`,
      },
      '1h': {
        title: '1 گھنٹے میں مشاورت',
        body: `${otherPartyName} کے ساتھ آپ کی مشاورت 1 گھنٹے میں شروع ہو رہی ہے۔`,
      },
      '15m': {
        title: '15 منٹ میں شروع',
        body: `${otherPartyName} کے ساتھ آپ کی مشاورت شروع ہونے والی ہے۔`,
      },
      starting: {
        title: 'مشاورت شروع ہو رہی ہے',
        body: `${otherPartyName} کے ساتھ آپ کی مشاورت ابھی شروع ہو رہی ہے۔ کال میں شامل ہوں!`,
      },
    },
  };

  return notifications[language][reminderType];
}

/**
 * Create reminder schedule for a consultation
 */
export function createReminderSchedule(
  consultationId: string,
  userId: string,
  scheduledAt: string,
  channels: ('email' | 'sms' | 'whatsapp' | 'push')[] = ['email', 'push']
): Omit<Reminder, 'id'>[] {
  const reminderTimes = calculateReminderTimes(scheduledAt);
  const reminders: Omit<Reminder, 'id'>[] = [];

  for (const { type, sendAt } of reminderTimes) {
    for (const channel of channels) {
      reminders.push({
        consultationId,
        userId,
        reminderType: type,
        channel,
        scheduledFor: sendAt.toISOString(),
        status: 'scheduled',
      });
    }
  }

  return reminders;
}

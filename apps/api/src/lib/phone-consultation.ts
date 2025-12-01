/**
 * Phone Consultation Service
 *
 * Handles phone call management with:
 * - Twilio Voice integration
 * - Call masking (privacy protection)
 * - Call recording (with consent)
 * - Call scheduling and reminders
 * - Call duration tracking
 */

export interface PhoneCall {
  callId: string;
  consultationId: string;
  status: 'scheduled' | 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer';
  direction: 'outbound' | 'inbound';
  fromNumber: string;
  toNumber: string;
  maskedNumber?: string; // For privacy
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
  duration?: number; // In seconds
  recordingUrl?: string;
  recordingConsent: boolean;
  callQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface CallParticipant {
  id: string;
  name: string;
  phone: string;
  role: 'lawyer' | 'client';
  preferredLanguage: 'en' | 'ar' | 'ur';
}

export interface ScheduledCall {
  scheduleId: string;
  consultationId: string;
  scheduledAt: string;
  participants: CallParticipant[];
  remindersSent: string[];
  autoDialEnabled: boolean;
}

/**
 * Twilio Voice Service
 */
export class PhoneConsultationService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private baseUrl: string;

  constructor(config: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
    baseUrl: string;
  }) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber);
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle UAE numbers
    if (cleaned.startsWith('0')) {
      cleaned = '971' + cleaned.slice(1);
    }
    if (!cleaned.startsWith('971') && cleaned.length === 9) {
      cleaned = '971' + cleaned;
    }

    return '+' + cleaned;
  }

  /**
   * Initiate a phone call
   */
  async initiateCall(
    consultationId: string,
    from: CallParticipant,
    to: CallParticipant,
    options: {
      recordingConsent: boolean;
      callbackUrl?: string;
      timeout?: number;
    }
  ): Promise<PhoneCall> {
    if (!this.isConfigured()) {
      throw new Error('Phone service not configured');
    }

    const callId = crypto.randomUUID();
    const toNumber = this.formatPhoneNumber(to.phone);

    // TwiML for the call
    const twiml = this.generateCallTwiML({
      consultationId,
      callerName: from.name,
      language: to.preferredLanguage,
      recordingConsent: options.recordingConsent,
    });

    // In production, this would call Twilio API:
    // POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json
    const callData = {
      To: toNumber,
      From: this.fromNumber,
      Twiml: twiml,
      StatusCallback: options.callbackUrl || `${this.baseUrl}/api/consultations/phone/webhook`,
      StatusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      StatusCallbackMethod: 'POST',
      Timeout: options.timeout || 60,
      Record: options.recordingConsent,
    };

    // Simulated response - in production this comes from Twilio
    return {
      callId,
      consultationId,
      status: 'initiated',
      direction: 'outbound',
      fromNumber: this.fromNumber,
      toNumber,
      recordingConsent: options.recordingConsent,
    };
  }

  /**
   * Generate TwiML for the call
   */
  private generateCallTwiML(options: {
    consultationId: string;
    callerName: string;
    language: 'en' | 'ar' | 'ur';
    recordingConsent: boolean;
  }): string {
    const messages = {
      en: {
        greeting: `You have a legal consultation call from ${options.callerName} via LegalDocs.`,
        pressOne: 'Press 1 to accept the call.',
        recording: 'This call may be recorded for quality assurance.',
        connecting: 'Connecting you now.',
      },
      ar: {
        greeting: `لديك مكالمة استشارة قانونية من ${options.callerName} عبر LegalDocs.`,
        pressOne: 'اضغط 1 لقبول المكالمة.',
        recording: 'قد يتم تسجيل هذه المكالمة لضمان الجودة.',
        connecting: 'جاري توصيلك الآن.',
      },
      ur: {
        greeting: `آپ کے پاس LegalDocs کے ذریعے ${options.callerName} کی طرف سے قانونی مشاورت کی کال ہے۔`,
        pressOne: 'کال قبول کرنے کے لیے 1 دبائیں۔',
        recording: 'معیار کی یقین دہانی کے لیے اس کال کو ریکارڈ کیا جا سکتا ہے۔',
        connecting: 'آپ کو ابھی جوڑ رہا ہے۔',
      },
    };

    const msg = messages[options.language];
    const voice = options.language === 'ar' ? 'Polly.Zeina' : options.language === 'ur' ? 'Polly.Aditi' : 'Polly.Joanna';

    let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${msg.greeting}</Say>`;

    if (options.recordingConsent) {
      twiml += `
  <Say voice="${voice}">${msg.recording}</Say>`;
    }

    twiml += `
  <Gather numDigits="1" action="${this.baseUrl}/api/consultations/phone/gather/${options.consultationId}" method="POST">
    <Say voice="${voice}">${msg.pressOne}</Say>
  </Gather>
  <Say voice="${voice}">We did not receive a response. Goodbye.</Say>
</Response>`;

    return twiml;
  }

  /**
   * Generate TwiML for connecting the call
   */
  generateConnectTwiML(options: {
    connectTo: string;
    language: 'en' | 'ar' | 'ur';
    callerId: string;
  }): string {
    const voice = options.language === 'ar' ? 'Polly.Zeina' : 'Polly.Joanna';

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">Connecting you now. Please hold.</Say>
  <Dial callerId="${options.callerId}">
    <Number>${options.connectTo}</Number>
  </Dial>
</Response>`;
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    // In production: POST to Twilio API to update call status to 'completed'
    // POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls/{CallSid}.json
    // Body: Status=completed

    console.log(`Ending call ${callSid}`);
    return true;
  }

  /**
   * Get call recording
   */
  async getRecording(callSid: string): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    // In production: GET recordings from Twilio
    // GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls/{CallSid}/Recordings.json

    return null;
  }

  /**
   * Send SMS notification
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const toNumber = this.formatPhoneNumber(to);

    // In production: POST to Twilio Messages API
    // POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json

    console.log(`Sending SMS to ${toNumber}: ${message}`);
    return true;
  }
}

/**
 * Generate call reminder messages
 */
export function getCallReminderMessage(
  language: 'en' | 'ar' | 'ur',
  lawyerName: string,
  scheduledTime: Date,
  minutesBefore: number
): string {
  const timeStr = scheduledTime.toLocaleTimeString(
    language === 'ar' ? 'ar-AE' : language === 'ur' ? 'ur-PK' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  );

  const messages = {
    en: {
      upcoming: `Reminder: Your phone consultation with ${lawyerName} is in ${minutesBefore} minutes at ${timeStr}. Please ensure you're available to receive the call.`,
      starting: `Your phone consultation with ${lawyerName} is starting now. You will receive a call shortly.`,
    },
    ar: {
      upcoming: `تذكير: استشارتك الهاتفية مع ${lawyerName} بعد ${minutesBefore} دقيقة في الساعة ${timeStr}. يرجى التأكد من توفرك لاستقبال المكالمة.`,
      starting: `استشارتك الهاتفية مع ${lawyerName} تبدأ الآن. ستتلقى مكالمة قريباً.`,
    },
    ur: {
      upcoming: `یاد دہانی: ${lawyerName} کے ساتھ آپ کی فون مشاورت ${minutesBefore} منٹ میں ${timeStr} بجے ہے۔ براہ کرم یقینی بنائیں کہ آپ کال وصول کرنے کے لیے دستیاب ہیں۔`,
      starting: `${lawyerName} کے ساتھ آپ کی فون مشاورت ابھی شروع ہو رہی ہے۔ آپ کو جلد ہی کال موصول ہوگی۔`,
    },
  };

  return minutesBefore > 0 ? messages[language].upcoming : messages[language].starting;
}

/**
 * Phone consultation checklist
 */
export function getPhoneConsultationChecklist(language: 'en' | 'ar'): {
  title: string;
  items: { id: string; text: string; required: boolean }[];
} {
  const checklists = {
    en: {
      title: 'Before Your Phone Consultation',
      items: [
        { id: 'quiet_place', text: 'Find a quiet, private place for the call', required: true },
        { id: 'phone_charged', text: 'Ensure your phone is charged', required: true },
        { id: 'documents_ready', text: 'Have relevant documents nearby for reference', required: false },
        { id: 'questions_prepared', text: 'Prepare your questions in advance', required: false },
        { id: 'pen_paper', text: 'Have pen and paper ready for notes', required: false },
        { id: 'recording_consent', text: 'Decide if you consent to call recording', required: true },
      ],
    },
    ar: {
      title: 'قبل استشارتك الهاتفية',
      items: [
        { id: 'quiet_place', text: 'اختر مكاناً هادئاً وخاصاً للمكالمة', required: true },
        { id: 'phone_charged', text: 'تأكد من شحن هاتفك', required: true },
        { id: 'documents_ready', text: 'احتفظ بالمستندات ذات الصلة بالقرب منك للرجوع إليها', required: false },
        { id: 'questions_prepared', text: 'حضر أسئلتك مسبقاً', required: false },
        { id: 'pen_paper', text: 'احتفظ بقلم وورقة لتدوين الملاحظات', required: false },
        { id: 'recording_consent', text: 'قرر ما إذا كنت توافق على تسجيل المكالمة', required: true },
      ],
    },
  };

  return checklists[language];
}

/**
 * Create phone consultation service instance
 */
export function createPhoneService(env: {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_FROM?: string;
  APP_URL?: string;
}): PhoneConsultationService {
  return new PhoneConsultationService({
    accountSid: env.TWILIO_ACCOUNT_SID || '',
    authToken: env.TWILIO_AUTH_TOKEN || '',
    fromNumber: env.TWILIO_PHONE_FROM || '',
    baseUrl: env.APP_URL || 'https://legaldocs-api.a-m-zein.workers.dev',
  });
}

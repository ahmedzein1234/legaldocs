/**
 * Consultation Notification Templates
 *
 * Email, WhatsApp, and SMS templates for consultation booking system
 * Supports English and Arabic
 */

// ============================================
// WHATSAPP TEMPLATES
// ============================================

export const WHATSAPP_TEMPLATES = {
  // Booking Confirmation - English
  booking_confirmed_en: (data: {
    clientName: string;
    consultationNumber: string;
    date: string;
    time: string;
    timezone: string;
    lawyerName: string;
    consultationType: string;
    meetingLink?: string;
    meetingLocation?: string;
  }) => `
Hello ${data.clientName}! 👋

Your consultation has been confirmed! ✅

📋 Confirmation #: ${data.consultationNumber}
📅 Date: ${data.date}
🕐 Time: ${data.time} (${data.timezone})
👨‍⚖️ Lawyer: ${data.lawyerName}
💼 Type: ${data.consultationType}

${data.meetingLink ? `📹 Meeting Link: ${data.meetingLink}` : ''}
${data.meetingLocation ? `📍 Location: ${data.meetingLocation}` : ''}

You'll receive reminders before your consultation.

Need to make changes? Visit: app.legaldocs.ae

LegalDocs - Your Legal Partner 🤝
`.trim(),

  // Booking Confirmation - Arabic
  booking_confirmed_ar: (data: {
    clientName: string;
    consultationNumber: string;
    date: string;
    time: string;
    timezone: string;
    lawyerName: string;
    consultationType: string;
    meetingLink?: string;
    meetingLocation?: string;
  }) => `
مرحباً ${data.clientName}! 👋

تم تأكيد استشارتك! ✅

📋 رقم التأكيد: ${data.consultationNumber}
📅 التاريخ: ${data.date}
🕐 الوقت: ${data.time} (${data.timezone})
👨‍⚖️ المحامي: ${data.lawyerName}
💼 النوع: ${data.consultationType}

${data.meetingLink ? `📹 رابط الاجتماع: ${data.meetingLink}` : ''}
${data.meetingLocation ? `📍 الموقع: ${data.meetingLocation}` : ''}

ستتلقى تذكيرات قبل استشارتك.

تريد إجراء تغييرات؟ قم بزيارة: app.legaldocs.ae

LegalDocs - شريكك القانوني 🤝
`.trim(),

  // 24 Hour Reminder - English
  reminder_24h_en: (data: {
    clientName: string;
    date: string;
    time: string;
    timezone: string;
    lawyerName: string;
    consultationType: string;
    meetingLink?: string;
  }) => `
Hello ${data.clientName}! ⏰

Reminder: Your consultation is tomorrow!

📅 Date: ${data.date}
🕐 Time: ${data.time} (${data.timezone})
👨‍⚖️ Lawyer: ${data.lawyerName}
💼 Type: ${data.consultationType}

${data.meetingLink ? `📹 Meeting Link: ${data.meetingLink}` : ''}

✅ Prepare your documents
✅ Test your camera/microphone (for video calls)
✅ Be ready 5 minutes early

Need to reschedule? Reply RESCHEDULE

See you tomorrow! ✨
`.trim(),

  // 24 Hour Reminder - Arabic
  reminder_24h_ar: (data: {
    clientName: string;
    date: string;
    time: string;
    timezone: string;
    lawyerName: string;
    consultationType: string;
    meetingLink?: string;
  }) => `
مرحباً ${data.clientName}! ⏰

تذكير: استشارتك غداً!

📅 التاريخ: ${data.date}
🕐 الوقت: ${data.time} (${data.timezone})
👨‍⚖️ المحامي: ${data.lawyerName}
💼 النوع: ${data.consultationType}

${data.meetingLink ? `📹 رابط الاجتماع: ${data.meetingLink}` : ''}

✅ جهّز مستنداتك
✅ اختبر الكاميرا/الميكروفون (للمكالمات المرئية)
✅ كن جاهزاً قبل 5 دقائق

تريد إعادة الجدولة؟ أرسل: إعادة جدولة

نراك غداً! ✨
`.trim(),

  // 1 Hour Reminder - English
  reminder_1h_en: (data: {
    clientName: string;
    time: string;
    lawyerName: string;
    meetingLink?: string;
  }) => `
${data.clientName}, your consultation with ${data.lawyerName} starts in 1 hour! ⏰

Time: ${data.time}

${data.meetingLink ? `Join here: ${data.meetingLink}` : 'Check your email for meeting details'}

Prepare your questions and be ready! 📝
`.trim(),

  // 1 Hour Reminder - Arabic
  reminder_1h_ar: (data: {
    clientName: string;
    time: string;
    lawyerName: string;
    meetingLink?: string;
  }) => `
${data.clientName}، تبدأ استشارتك مع ${data.lawyerName} خلال ساعة واحدة! ⏰

الوقت: ${data.time}

${data.meetingLink ? `انضم هنا: ${data.meetingLink}` : 'راجع بريدك الإلكتروني لتفاصيل الاجتماع'}

جهّز أسئلتك وكن جاهزاً! 📝
`.trim(),

  // Consultation Starting Soon
  starting_soon_en: (data: {
    clientName: string;
    lawyerName: string;
    meetingLink: string;
  }) => `
${data.clientName}, your consultation is starting now! 🎬

Join the meeting: ${data.meetingLink}

${data.lawyerName} is waiting for you.
`.trim(),

  // Summary Available - English
  summary_available_en: (data: {
    clientName: string;
    lawyerName: string;
    consultationId: string;
  }) => `
Hello ${data.clientName}! 📄

Your consultation summary with ${data.lawyerName} is ready!

View summary: app.legaldocs.ae/consultations/${data.consultationId}

The summary includes:
✓ Discussion points
✓ Lawyer's recommendations
✓ Next steps
✓ Follow-up actions

How was your experience? Please leave a review! ⭐

LegalDocs Team
`.trim(),

  // Cancellation Confirmation
  cancelled_en: (data: {
    clientName: string;
    consultationNumber: string;
    refundAmount?: number;
  }) => `
Hello ${data.clientName},

Your consultation #${data.consultationNumber} has been cancelled.

${data.refundAmount ? `Refund: ${data.refundAmount} AED will be processed within 5-7 business days.` : 'No refund applicable as per cancellation policy.'}

Need to book again? Visit app.legaldocs.ae

LegalDocs Team
`.trim()
};

// ============================================
// EMAIL TEMPLATES
// ============================================

export const EMAIL_TEMPLATES = {
  // Booking Confirmation
  booking_confirmed_en: (data: {
    clientName: string;
    consultationNumber: string;
    date: string;
    time: string;
    timezone: string;
    lawyerName: string;
    lawyerTitle: string;
    lawyerAvatar?: string;
    consultationType: string;
    duration: number;
    totalPrice: number;
    meetingLink?: string;
    meetingLocation?: string;
    addToCalendarUrl: string;
    viewDetailsUrl: string;
    rescheduleUrl: string;
    cancelUrl: string;
  }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Confirmed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .check-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .details-box {
      background: #f9fafb;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table td {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-table td:first-child {
      font-weight: 600;
      width: 40%;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .lawyer-profile {
      display: flex;
      align-items: center;
      padding: 15px;
      background: #f3f4f6;
      border-radius: 8px;
      margin: 20px 0;
    }
    .lawyer-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 15px;
    }
    .lawyer-info h3 {
      margin: 0;
      font-size: 18px;
    }
    .lawyer-info p {
      margin: 5px 0 0;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 10px 10px 0;
    }
    .button-secondary {
      background: white;
      color: #667eea !important;
      border: 2px solid #667eea;
    }
    .info-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .checklist {
      list-style: none;
      padding: 0;
    }
    .checklist li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }
    .checklist li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
    .meeting-link {
      background: #dbeafe;
      border: 2px solid #3b82f6;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .meeting-link a {
      color: #1d4ed8;
      font-weight: 600;
      font-size: 16px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="check-icon">✓</div>
    <h1>Consultation Confirmed!</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">Confirmation #${data.consultationNumber}</p>
  </div>

  <div class="content">
    <p>Dear ${data.clientName},</p>

    <p>Great news! Your consultation has been confirmed and payment received.</p>

    <div class="lawyer-profile">
      ${data.lawyerAvatar
        ? `<img src="${data.lawyerAvatar}" alt="${data.lawyerName}" class="lawyer-avatar">`
        : `<div class="lawyer-avatar" style="background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">${data.lawyerName.charAt(0)}</div>`
      }
      <div class="lawyer-info">
        <h3>${data.lawyerName}</h3>
        <p>${data.lawyerTitle}</p>
      </div>
    </div>

    <div class="details-box">
      <h3 style="margin-top: 0; color: #667eea;">Consultation Details</h3>
      <table class="details-table">
        <tr>
          <td>Date & Time</td>
          <td><strong>${data.date} at ${data.time}</strong></td>
        </tr>
        <tr>
          <td>Timezone</td>
          <td>${data.timezone}</td>
        </tr>
        <tr>
          <td>Type</td>
          <td>${data.consultationType}</td>
        </tr>
        <tr>
          <td>Duration</td>
          <td>${data.duration} minutes</td>
        </tr>
        <tr>
          <td>Total Paid</td>
          <td><strong>${data.totalPrice} AED</strong></td>
        </tr>
      </table>
    </div>

    ${data.meetingLink ? `
    <div class="meeting-link">
      <p style="margin: 0 0 10px;"><strong>📹 Video Meeting Link</strong></p>
      <a href="${data.meetingLink}">${data.meetingLink}</a>
      <p style="margin: 10px 0 0; font-size: 14px; color: #6b7280;">Link will be active 30 minutes before consultation</p>
    </div>
    ` : ''}

    ${data.meetingLocation ? `
    <div class="meeting-link">
      <p style="margin: 0 0 10px;"><strong>📍 Meeting Location</strong></p>
      <p style="margin: 0; font-size: 16px; color: #1d4ed8;">${data.meetingLocation}</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.addToCalendarUrl}" class="button">📅 Add to Calendar</a>
      <a href="${data.viewDetailsUrl}" class="button button-secondary">View Full Details</a>
    </div>

    <h3>What to Expect:</h3>
    <ul class="checklist">
      <li>You'll receive reminders 24 hours and 1 hour before</li>
      <li>Join the meeting 5 minutes early for tech check</li>
      <li>Have your documents and questions ready</li>
      <li>A summary will be sent after the consultation</li>
    </ul>

    <div class="info-box">
      <h4 style="margin-top: 0;">Need to Make Changes?</h4>
      <p>You can reschedule or cancel up to 24 hours before without penalty.</p>
      <p style="margin-bottom: 0;">
        <a href="${data.rescheduleUrl}" style="color: #1d4ed8; font-weight: 600;">Reschedule</a> |
        <a href="${data.cancelUrl}" style="color: #1d4ed8; font-weight: 600;">Cancel Booking</a>
      </p>
    </div>

    <p>If you have any questions before the consultation, feel free to message ${data.lawyerName} through the platform.</p>

    <p>Best regards,<br>The LegalDocs Team</p>
  </div>

  <div class="footer">
    <p>LegalDocs - Your Trusted Legal Platform</p>
    <p>
      <a href="https://legaldocs.ae" style="color: #6b7280;">Website</a> |
      <a href="mailto:support@legaldocs.ae" style="color: #6b7280;">Support</a> |
      <a href="https://legaldocs.ae/terms" style="color: #6b7280;">Terms</a>
    </p>
  </div>
</body>
</html>
`.trim(),

  // Summary Email
  consultation_summary_en: (data: {
    clientName: string;
    lawyerName: string;
    consultationNumber: string;
    date: string;
    duration: number;
    summary: string;
    recommendations: string[];
    nextSteps: string[];
    followUpRequired: boolean;
    followUpDate?: string;
    attachments?: Array<{ name: string; url: string }>;
    reviewUrl: string;
  }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    /* Similar styles as above */
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 Consultation Summary</h1>
    <p>Consultation #${data.consultationNumber}</p>
  </div>

  <div class="content">
    <p>Dear ${data.clientName},</p>

    <p>Thank you for your consultation with ${data.lawyerName}. Here's a summary of your session:</p>

    <div class="details-box">
      <h3 style="margin-top: 0;">Session Information</h3>
      <table class="details-table">
        <tr>
          <td>Date</td>
          <td>${data.date}</td>
        </tr>
        <tr>
          <td>Duration</td>
          <td>${data.duration} minutes</td>
        </tr>
      </table>
    </div>

    <h3>Discussion Summary</h3>
    <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
      ${data.summary}
    </div>

    <h3>Lawyer's Recommendations</h3>
    <ul class="checklist">
      ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>

    <h3>Next Steps</h3>
    <ol style="padding-left: 20px;">
      ${data.nextSteps.map(step => `<li style="margin: 10px 0;">${step}</li>`).join('')}
    </ol>

    ${data.followUpRequired ? `
    <div class="info-box">
      <h4 style="margin-top: 0;">Follow-Up Required</h4>
      <p>A follow-up consultation is recommended${data.followUpDate ? ` on ${data.followUpDate}` : ''}.</p>
      <a href="#" class="button">Schedule Follow-Up</a>
    </div>
    ` : ''}

    ${data.attachments && data.attachments.length > 0 ? `
    <h3>Attached Documents</h3>
    <ul>
      ${data.attachments.map(att => `
        <li><a href="${att.url}" style="color: #667eea;">${att.name}</a></li>
      `).join('')}
    </ul>
    ` : ''}

    <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
      <h3>How was your experience?</h3>
      <p>Your feedback helps us improve our service</p>
      <a href="${data.reviewUrl}" class="button">Leave a Review ⭐</a>
    </div>

    <p>If you have any questions about this summary, please don't hesitate to reach out.</p>

    <p>Best regards,<br>${data.lawyerName}</p>
  </div>

  <div class="footer">
    <p>This summary is confidential and for your personal use only.</p>
  </div>
</body>
</html>
`.trim()
};

// ============================================
// SMS TEMPLATES (Shorter for SMS length limits)
// ============================================

export const SMS_TEMPLATES = {
  reminder_1h_en: (data: { clientName: string; time: string; lawyerName: string }) =>
    `Hi ${data.clientName}, your consultation with ${data.lawyerName} starts in 1 hour at ${data.time}. Check your email for meeting details. -LegalDocs`,

  reminder_1h_ar: (data: { clientName: string; time: string; lawyerName: string }) =>
    `مرحباً ${data.clientName}، تبدأ استشارتك مع ${data.lawyerName} خلال ساعة واحدة في ${data.time}. راجع بريدك للتفاصيل. -LegalDocs`,

  starting_now_en: (data: { clientName: string; meetingLink: string }) =>
    `Your consultation is starting now! Join: ${data.meetingLink} -LegalDocs`,

  cancelled_en: (data: { consultationNumber: string }) =>
    `Consultation #${data.consultationNumber} has been cancelled. Check your email for details. -LegalDocs`
};

// ============================================
// IN-APP NOTIFICATION TEMPLATES
// ============================================

export const IN_APP_TEMPLATES = {
  booking_confirmed: (data: { lawyerName: string; date: string; time: string }) => ({
    title: 'Consultation Confirmed',
    body: `Your consultation with ${data.lawyerName} is confirmed for ${data.date} at ${data.time}`,
    icon: '✓',
    color: 'success',
    action: 'View Details'
  }),

  reminder_24h: (data: { lawyerName: string; date: string }) => ({
    title: 'Consultation Tomorrow',
    body: `Reminder: Your consultation with ${data.lawyerName} is tomorrow`,
    icon: '⏰',
    color: 'info',
    action: 'View Details'
  }),

  starting_soon: (data: { lawyerName: string }) => ({
    title: 'Consultation Starting Soon',
    body: `Your consultation with ${data.lawyerName} is starting in 15 minutes`,
    icon: '🔔',
    color: 'warning',
    action: 'Join Now'
  }),

  summary_ready: (data: { lawyerName: string }) => ({
    title: 'Summary Available',
    body: `Your consultation summary from ${data.lawyerName} is ready`,
    icon: '📄',
    color: 'success',
    action: 'View Summary'
  })
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatConsultationType(type: string, language: 'en' | 'ar'): string {
  const types: Record<string, { en: string; ar: string }> = {
    video: { en: 'Video Call', ar: 'مكالمة فيديو' },
    phone: { en: 'Phone Call', ar: 'مكالمة هاتفية' },
    in_person: { en: 'In-Person Meeting', ar: 'اجتماع شخصي' },
    document_review: { en: 'Document Review', ar: 'مراجعة مستند' },
    quick_question: { en: 'Quick Question', ar: 'سؤال سريع' }
  };

  return types[type]?.[language] || type;
}

export function formatDate(date: string, language: 'en' | 'ar'): string {
  const d = new Date(date);

  if (language === 'ar') {
    return d.toLocaleDateString('ar-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return d.toLocaleDateString('en-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(date: string, timezone: string, language: 'en' | 'ar'): string {
  const d = new Date(date);

  return d.toLocaleTimeString(language === 'ar' ? 'ar-AE' : 'en-AE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    hour12: true
  });
}

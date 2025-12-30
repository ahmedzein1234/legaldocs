/**
 * Email Templates - Professional multilingual templates for Qannoni
 *
 * Provides HTML and plain text versions of all email templates
 * with support for English, Arabic, and Urdu languages.
 */

// ============================================
// TEMPLATE TYPES
// ============================================

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  language: 'en' | 'ar' | 'ur';
}

export interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiresInHours: number;
  language: 'en' | 'ar' | 'ur';
}

export interface DocumentSharedEmailData {
  recipientName: string;
  senderName: string;
  documentName: string;
  documentType: string;
  viewLink: string;
  message?: string;
  language: 'en' | 'ar' | 'ur';
}

export interface SignatureRequestEmailData {
  signerName: string;
  senderName: string;
  documentName: string;
  documentType: string;
  signingLink: string;
  message?: string;
  expiresAt: string;
  role: string;
  language: 'en' | 'ar' | 'ur';
}

export interface SignatureCompletedEmailData {
  recipientName: string;
  documentName: string;
  signerName: string;
  completedAt: string;
  downloadLink: string;
  language: 'en' | 'ar' | 'ur';
}

export interface DocumentReminderEmailData {
  signerName: string;
  documentName: string;
  signingLink: string;
  expiresAt: string;
  language: 'en' | 'ar' | 'ur';
}

// ============================================
// BASE TEMPLATE STRUCTURE
// ============================================

const getBaseTemplate = (content: string, language: 'en' | 'ar' | 'ur') => `
<!DOCTYPE html>
<html lang="${language}" dir="${language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Qannoni</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${language === 'ar' || language === 'ur' ? "'Segoe UI', Tahoma, Arial, sans-serif" : "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"};
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .tagline {
      color: #dbeafe;
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.7;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.3s;
    }
    .button:hover {
      background: #1e40af;
    }
    .info-box {
      background: #f3f4f6;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .info-box-text {
      color: #6b7280;
      font-size: 14px;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 30px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 15px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #2563eb;
      text-decoration: none;
      margin: 0 10px;
      font-size: 13px;
    }
    .copyright {
      color: #9ca3af;
      font-size: 12px;
      margin-top: 15px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Qannoni</div>
      <div class="tagline">${language === 'ar' ? 'منصة الوثائق القانونية الذكية' : language === 'ur' ? 'سمارٹ قانونی دستاویز پلیٹ فارم' : 'Smart Legal Document Platform'}</div>
    </div>
    ${content}
    <div class="footer">
      <div class="footer-text">
        ${language === 'ar'
          ? 'هذا البريد الإلكتروني مرسل من Qannoni، منصة إدارة الوثائق القانونية الرائدة في دول الخليج.'
          : language === 'ur'
          ? 'یہ ای میل Qannoni کی جانب سے بھیجی گئی ہے، جو خلیجی ممالک میں قانونی دستاویزات کے انتظام کا سرکردہ پلیٹ فارم ہے۔'
          : 'This email was sent by Qannoni, the leading legal document management platform in the GCC.'}
      </div>
      <div class="social-links">
        <a href="https://www.qannoni.com">${language === 'ar' ? 'زيارة الموقع' : language === 'ur' ? 'ویب سائٹ دیکھیں' : 'Visit Website'}</a>
        <span style="color: #d1d5db;">|</span>
        <a href="https://www.qannoni.com/support">${language === 'ar' ? 'الدعم' : language === 'ur' ? 'سپورٹ' : 'Support'}</a>
        <span style="color: #d1d5db;">|</span>
        <a href="https://www.qannoni.com/privacy">${language === 'ar' ? 'الخصوصية' : language === 'ur' ? 'رازداری' : 'Privacy'}</a>
      </div>
      <div class="copyright">
        ${new Date().getFullYear()} Qannoni. ${language === 'ar' ? 'جميع الحقوق محفوظة.' : language === 'ur' ? 'تمام حقوق محفوظ ہیں۔' : 'All rights reserved.'}
      </div>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// WELCOME EMAIL
// ============================================

export function getWelcomeEmail(data: WelcomeEmailData) {
  const { userName, language } = data;

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${userName}،` : language === 'ur' ? `${userName} خوش آمدید،` : `Hello ${userName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? 'مرحباً بك في Qannoni! نحن سعداء بانضمامك إلى منصتنا.'
          : language === 'ur'
          ? 'Qannoni میں خوش آمدید! ہمیں آپ کو اپنے پلیٹ فارم پر شامل کر کے خوشی ہے۔'
          : 'Welcome to Qannoni! We\'re excited to have you on board.'}
      </div>
      <div class="message">
        ${language === 'ar'
          ? 'Qannoni هي منصة شاملة لإدارة الوثائق القانونية مصممة خصيصاً لأسواق الإمارات ودول مجلس التعاون الخليجي. مع Qannoni، يمكنك:'
          : language === 'ur'
          ? 'Qannoni ایک جامع قانونی دستاویزات کے انتظام کا پلیٹ فارم ہے جو خاص طور پر متحدہ عرب امارات اور خلیجی ممالک کی مارکیٹوں کے لیے ڈیزائن کیا گیا ہے۔ Qannoni کے ساتھ، آپ یہ کر سکتے ہیں:'
          : 'Qannoni is a comprehensive legal document management platform designed specifically for UAE and GCC markets. With Qannoni, you can:'}
      </div>
      <div class="info-box">
        <div class="info-box-text">
          ${language === 'ar' ? '✓ إنشاء وثائق قانونية احترافية بدقائق' : language === 'ur' ? '✓ منٹوں میں پیشہ ورانہ قانونی دستاویزات بنائیں' : '✓ Create professional legal documents in minutes'}<br>
          ${language === 'ar' ? '✓ الحصول على توقيعات رقمية آمنة' : language === 'ur' ? '✓ محفوظ ڈیجیٹل دستخط حاصل کریں' : '✓ Get secure digital signatures'}<br>
          ${language === 'ar' ? '✓ الاستفادة من مساعد الذكاء الاصطناعي القانوني' : language === 'ur' ? '✓ AI سے چلنے والے قانونی مشیر تک رسائی حاصل کریں' : '✓ Access AI-powered legal advisor'}<br>
          ${language === 'ar' ? '✓ التأكد من الامتثال القانوني في دول الخليج' : language === 'ur' ? '✓ خلیجی ممالک کی قانونی تعمیل کو یقینی بنائیں' : '✓ Ensure GCC legal compliance'}<br>
          ${language === 'ar' ? '✓ إدارة المستندات بأمان وكفاءة' : language === 'ur' ? '✓ دستاویزات کو محفوظ اور مؤثر طریقے سے منظم کریں' : '✓ Manage documents securely and efficiently'}
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.qannoni.com/dashboard" class="button">
          ${language === 'ar' ? 'انتقل إلى لوحة التحكم' : language === 'ur' ? 'ڈیش بورڈ پر جائیں' : 'Go to Dashboard'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message">
        ${language === 'ar'
          ? 'إذا كانت لديك أي أسئلة أو كنت بحاجة إلى المساعدة، فلا تتردد في التواصل مع فريق الدعم لدينا.'
          : language === 'ur'
          ? 'اگر آپ کے کوئی سوالات ہیں یا آپ کو مدد کی ضرورت ہے، تو ہماری سپورٹ ٹیم سے رابطہ کرنے میں ہچکچاہٹ محسوس نہ کریں۔'
          : 'If you have any questions or need assistance, don\'t hesitate to reach out to our support team.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${userName},\n\nمرحباً بك في Qannoni! نحن سعداء بانضمامك إلى منصتنا.\n\nيمكنك الآن البدء في إنشاء وإدارة وثائقك القانونية بكل سهولة.\n\nانتقل إلى لوحة التحكم: https://www.qannoni.com/dashboard\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${userName} خوش آمدید،\n\nQannoni میں خوش آمدید! ہمیں آپ کو اپنے پلیٹ فارم پر شامل کر کے خوشی ہے۔\n\nاب آپ آسانی سے اپنی قانونی دستاویزات بنانا اور ان کا انتظام شروع کر سکتے ہیں۔\n\nڈیش بورڈ پر جائیں: https://www.qannoni.com/dashboard\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${userName},\n\nWelcome to Qannoni! We're excited to have you on board.\n\nYou can now start creating and managing your legal documents with ease.\n\nGo to Dashboard: https://www.qannoni.com/dashboard\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: language === 'ar' ? 'مرحباً بك في Qannoni' : language === 'ur' ? 'Qannoni میں خوش آمدید' : 'Welcome to Qannoni',
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// PASSWORD RESET EMAIL
// ============================================

export function getPasswordResetEmail(data: PasswordResetEmailData) {
  const { userName, resetLink, expiresInHours, language } = data;

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${userName},` : language === 'ur' ? `${userName} خوش آمدید،` : `Hello ${userName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? 'تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في Qannoni.'
          : language === 'ur'
          ? 'ہمیں آپ کے Qannoni اکاؤنٹ کے لیے پاس ورڈ ری سیٹ کرنے کی درخواست موصول ہوئی ہے۔'
          : 'We received a request to reset your password for your Qannoni account.'}
      </div>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">
          ${language === 'ar' ? 'إعادة تعيين كلمة المرور' : language === 'ur' ? 'پاس ورڈ ری سیٹ کریں' : 'Reset Password'}
        </a>
      </div>
      <div class="info-box">
        <div class="info-box-title">
          ${language === 'ar' ? 'معلومات مهمة:' : language === 'ur' ? 'اہم معلومات:' : 'Important Information:'}
        </div>
        <div class="info-box-text">
          ${language === 'ar'
            ? `هذا الرابط صالح لمدة ${expiresInHours} ساعة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.`
            : language === 'ur'
            ? `یہ لنک صرف ${expiresInHours} گھنٹے کے لیے درست ہے۔ اگر آپ نے پاس ورڈ ری سیٹ کی درخواست نہیں کی، تو براہ کرم اس ای میل کو نظر انداز کریں۔`
            : `This link is valid for ${expiresInHours} hours only. If you didn't request a password reset, please ignore this email.`}
        </div>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #9ca3af;">
        ${language === 'ar'
          ? 'إذا كنت تواجه مشكلة في النقر على الزر، انسخ الرابط التالي والصقه في متصفحك:'
          : language === 'ur'
          ? 'اگر آپ کو بٹن پر کلک کرنے میں مسئلہ ہو رہا ہے، تو اس لنک کو کاپی کریں اور اپنے براؤزر میں پیسٹ کریں:'
          : 'If you\'re having trouble clicking the button, copy and paste this link into your browser:'}
        <br><br>
        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${userName},\n\nتلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.\n\nانقر على الرابط التالي لإعادة تعيين كلمة المرور:\n${resetLink}\n\nهذا الرابط صالح لمدة ${expiresInHours} ساعة فقط.\n\nإذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${userName} خوش آمدید،\n\nہمیں آپ کے پاس ورڈ کو ری سیٹ کرنے کی درخواست موصول ہوئی ہے۔\n\nاپنا پاس ورڈ ری سیٹ کرنے کے لیے نیچے دیے گئے لنک پر کلک کریں:\n${resetLink}\n\nیہ لنک صرف ${expiresInHours} گھنٹے کے لیے درست ہے۔\n\nاگر آپ نے پاس ورڈ ری سیٹ کی درخواست نہیں کی، تو براہ کرم اس ای میل کو نظر انداز کریں۔\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${userName},\n\nWe received a request to reset your password.\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link is valid for ${expiresInHours} hours only.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: language === 'ar' ? 'إعادة تعيين كلمة المرور - Qannoni' : language === 'ur' ? 'پاس ورڈ ری سیٹ - Qannoni' : 'Password Reset - Qannoni',
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// DOCUMENT SHARED EMAIL
// ============================================

export function getDocumentSharedEmail(data: DocumentSharedEmailData) {
  const { recipientName, senderName, documentName, documentType, viewLink, message, language } = data;

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${recipientName},` : language === 'ur' ? `${recipientName} خوش آمدید،` : `Hello ${recipientName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? `قام ${senderName} بمشاركة وثيقة معك على Qannoni.`
          : language === 'ur'
          ? `${senderName} نے Qannoni پر آپ کے ساتھ ایک دستاویز شیئر کی ہے۔`
          : `${senderName} has shared a document with you on Qannoni.`}
      </div>
      <div class="info-box">
        <div class="info-box-title">
          ${language === 'ar' ? 'تفاصيل الوثيقة:' : language === 'ur' ? 'دستاویز کی تفصیلات:' : 'Document Details:'}
        </div>
        <div class="info-box-text">
          <strong>${language === 'ar' ? 'اسم الوثيقة:' : language === 'ur' ? 'دستاویز کا نام:' : 'Document Name:'}</strong> ${documentName}<br>
          <strong>${language === 'ar' ? 'النوع:' : language === 'ur' ? 'قسم:' : 'Type:'}</strong> ${documentType}
        </div>
      </div>
      ${message ? `
      <div class="message">
        <strong>${language === 'ar' ? 'رسالة من ' + senderName + ':' : language === 'ur' ? senderName + ' کی طرف سے پیغام:' : 'Message from ' + senderName + ':'}</strong><br>
        "${message}"
      </div>
      ` : ''}
      <div style="text-align: center;">
        <a href="${viewLink}" class="button">
          ${language === 'ar' ? 'عرض الوثيقة' : language === 'ur' ? 'دستاویز دیکھیں' : 'View Document'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #6b7280;">
        ${language === 'ar'
          ? 'يمكنك عرض هذه الوثيقة وتنزيلها من خلال لوحة التحكم في Qannoni.'
          : language === 'ur'
          ? 'آپ اپنے Qannoni ڈیش بورڈ سے اس دستاویز کو دیکھ اور ڈاؤن لوڈ کر سکتے ہیں۔'
          : 'You can view and download this document from your Qannoni dashboard.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${recipientName},\n\nقام ${senderName} بمشاركة وثيقة معك: ${documentName}\nالنوع: ${documentType}\n\n${message ? `رسالة: "${message}"\n\n` : ''}اعرض الوثيقة: ${viewLink}\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${recipientName} خوش آمدید،\n\n${senderName} نے آپ کے ساتھ ایک دستاویز شیئر کی ہے: ${documentName}\nقسم: ${documentType}\n\n${message ? `پیغام: "${message}"\n\n` : ''}دستاویز دیکھیں: ${viewLink}\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${recipientName},\n\n${senderName} has shared a document with you: ${documentName}\nType: ${documentType}\n\n${message ? `Message: "${message}"\n\n` : ''}View Document: ${viewLink}\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: language === 'ar'
      ? `تمت مشاركة وثيقة معك: ${documentName}`
      : language === 'ur'
      ? `دستاویز شیئر کی گئی: ${documentName}`
      : `Document Shared: ${documentName}`,
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// SIGNATURE REQUEST EMAIL
// ============================================

export function getSignatureRequestEmail(data: SignatureRequestEmailData) {
  const { signerName, senderName, documentName, documentType, signingLink, message, expiresAt, role, language } = data;

  const roleText = {
    en: {
      signer: 'Signer',
      approver: 'Approver',
      witness: 'Witness',
      cc: 'Copy Recipient',
    },
    ar: {
      signer: 'موقّع',
      approver: 'مُصادق',
      witness: 'شاهد',
      cc: 'نسخة',
    },
    ur: {
      signer: 'دستخط کنندہ',
      approver: 'منظور کنندہ',
      witness: 'گواہ',
      cc: 'نقل وصول کنندہ',
    },
  };

  const expiryDate = new Date(expiresAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ur' ? 'ur-PK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${signerName},` : language === 'ur' ? `${signerName} خوش آمدید،` : `Hello ${signerName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? `يطلب منك ${senderName} التوقيع على وثيقة على Qannoni.`
          : language === 'ur'
          ? `${senderName} نے Qannoni کے ذریعے ایک دستاویز پر آپ کے دستخط کی درخواست کی ہے۔`
          : `${senderName} has requested your signature on a document via Qannoni.`}
      </div>
      <div class="info-box">
        <div class="info-box-title">
          ${language === 'ar' ? 'تفاصيل الوثيقة:' : language === 'ur' ? 'دستاویز کی تفصیلات:' : 'Document Details:'}
        </div>
        <div class="info-box-text">
          <strong>${language === 'ar' ? 'اسم الوثيقة:' : language === 'ur' ? 'دستاویز کا نام:' : 'Document Name:'}</strong> ${documentName}<br>
          <strong>${language === 'ar' ? 'النوع:' : language === 'ur' ? 'قسم:' : 'Type:'}</strong> ${documentType}<br>
          <strong>${language === 'ar' ? 'دورك:' : language === 'ur' ? 'آپ کا کردار:' : 'Your Role:'}</strong> ${language === 'ar' ? roleText.ar[role as keyof typeof roleText.ar] : language === 'ur' ? roleText.ur[role as keyof typeof roleText.ur] : roleText.en[role as keyof typeof roleText.en]}<br>
          <strong>${language === 'ar' ? 'تنتهي الصلاحية:' : language === 'ur' ? 'میعاد ختم:' : 'Expires:'}</strong> ${expiryDate}
        </div>
      </div>
      ${message ? `
      <div class="message">
        <strong>${language === 'ar' ? 'رسالة من ' + senderName + ':' : language === 'ur' ? senderName + ' کی طرف سے پیغام:' : 'Message from ' + senderName + ':'}</strong><br>
        "${message}"
      </div>
      ` : ''}
      <div style="text-align: center;">
        <a href="${signingLink}" class="button">
          ${language === 'ar' ? 'مراجعة والتوقيع' : language === 'ur' ? 'جائزہ لیں اور دستخط کریں' : 'Review & Sign'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #6b7280;">
        ${language === 'ar'
          ? 'يرجى مراجعة الوثيقة بعناية قبل التوقيع. توقيعك ملزم قانوناً.'
          : language === 'ur'
          ? 'براہ کرم دستخط کرنے سے پہلے دستاویز کا بغور جائزہ لیں۔ آپ کے دستخط قانونی طور پر پابند ہیں۔'
          : 'Please review the document carefully before signing. Your signature is legally binding.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${signerName},\n\nيطلب منك ${senderName} التوقيع على وثيقة.\n\nالوثيقة: ${documentName}\nالنوع: ${documentType}\nدورك: ${roleText.ar[role as keyof typeof roleText.ar]}\nتنتهي الصلاحية: ${expiryDate}\n\n${message ? `رسالة: "${message}"\n\n` : ''}مراجعة والتوقيع: ${signingLink}\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${signerName} خوش آمدید،\n\n${senderName} نے ایک دستاویز پر آپ کے دستخط کی درخواست کی ہے۔\n\nدستاویز: ${documentName}\nقسم: ${documentType}\nآپ کا کردار: ${roleText.ur[role as keyof typeof roleText.ur]}\nمیعاد ختم: ${expiryDate}\n\n${message ? `پیغام: "${message}"\n\n` : ''}جائزہ لیں اور دستخط کریں: ${signingLink}\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${signerName},\n\n${senderName} has requested your signature on a document.\n\nDocument: ${documentName}\nType: ${documentType}\nYour Role: ${roleText.en[role as keyof typeof roleText.en]}\nExpires: ${expiryDate}\n\n${message ? `Message: "${message}"\n\n` : ''}Review & Sign: ${signingLink}\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: language === 'ar'
      ? `طلب توقيع: ${documentName}`
      : language === 'ur'
      ? `دستخط کی درخواست: ${documentName}`
      : `Signature Request: ${documentName}`,
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// SIGNATURE COMPLETED EMAIL
// ============================================

export function getSignatureCompletedEmail(data: SignatureCompletedEmailData) {
  const { recipientName, documentName, signerName, completedAt, downloadLink, language } = data;

  const completedDate = new Date(completedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ur' ? 'ur-PK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${recipientName},` : language === 'ur' ? `${recipientName} خوش آمدید،` : `Hello ${recipientName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? `تم التوقيع على وثيقتك "${documentName}" بنجاح!`
          : language === 'ur'
          ? `آپ کی دستاویز "${documentName}" پر کامیابی سے دستخط ہو گئے ہیں!`
          : `Your document "${documentName}" has been successfully signed!`}
      </div>
      <div class="info-box">
        <div class="info-box-title">
          ${language === 'ar' ? 'تفاصيل التوقيع:' : language === 'ur' ? 'دستخط کی تفصیلات:' : 'Signature Details:'}
        </div>
        <div class="info-box-text">
          <strong>${language === 'ar' ? 'الموقّع:' : language === 'ur' ? 'دستخط کنندہ:' : 'Signed by:'}</strong> ${signerName}<br>
          <strong>${language === 'ar' ? 'التاريخ:' : language === 'ur' ? 'تاریخ:' : 'Date:'}</strong> ${completedDate}
        </div>
      </div>
      <div class="message">
        ${language === 'ar'
          ? 'تم إكمال جميع التوقيعات المطلوبة. يمكنك الآن تنزيل الوثيقة النهائية الموقعة.'
          : language === 'ur'
          ? 'تمام مطلوبہ دستخط مکمل ہو گئے ہیں۔ اب آپ حتمی دستخط شدہ دستاویز ڈاؤن لوڈ کر سکتے ہیں۔'
          : 'All required signatures have been completed. You can now download the final signed document.'}
      </div>
      <div style="text-align: center;">
        <a href="${downloadLink}" class="button">
          ${language === 'ar' ? 'تنزيل الوثيقة' : language === 'ur' ? 'دستاویز ڈاؤن لوڈ کریں' : 'Download Document'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #6b7280;">
        ${language === 'ar'
          ? 'يتم تخزين الوثيقة الموقعة بشكل آمن في حسابك على Qannoni.'
          : language === 'ur'
          ? 'دستخط شدہ دستاویز آپ کے Qannoni اکاؤنٹ میں محفوظ طریقے سے محفوظ ہے۔'
          : 'The signed document is securely stored in your Qannoni account.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${recipientName},\n\nتم التوقيع على وثيقتك "${documentName}" بنجاح!\n\nالموقّع: ${signerName}\nالتاريخ: ${completedDate}\n\nتنزيل الوثيقة: ${downloadLink}\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${recipientName} خوش آمدید،\n\nآپ کی دستاویز "${documentName}" پر کامیابی سے دستخط ہو گئے ہیں!\n\nدستخط کنندہ: ${signerName}\nتاریخ: ${completedDate}\n\nدستاویز ڈاؤن لوڈ کریں: ${downloadLink}\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${recipientName},\n\nYour document "${documentName}" has been successfully signed!\n\nSigned by: ${signerName}\nDate: ${completedDate}\n\nDownload Document: ${downloadLink}\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: language === 'ar'
      ? `تم التوقيع على الوثيقة: ${documentName}`
      : language === 'ur'
      ? `دستاویز پر دستخط ہو گئے: ${documentName}`
      : `Document Signed: ${documentName}`,
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// DOCUMENT REMINDER EMAIL
// ============================================

// ============================================
// VERIFICATION EXPIRY EMAIL
// ============================================

export interface VerificationExpiryEmailData {
  lawyerName: string;
  email: string;
  verificationType: string;
  daysUntilExpiry: number;
  renewalLink: string;
  language: 'en' | 'ar' | 'ur';
}

export function getVerificationExpiryEmail(data: VerificationExpiryEmailData) {
  const { lawyerName, verificationType, daysUntilExpiry, renewalLink, language } = data;

  const verificationTypeText = {
    en: {
      basic: 'Basic Verification',
      identity: 'Identity Verification',
      professional: 'Professional Verification',
      enhanced: 'Enhanced Verification',
    },
    ar: {
      basic: 'التحقق الأساسي',
      identity: 'التحقق من الهوية',
      professional: 'التحقق المهني',
      enhanced: 'التحقق المعزز',
    },
    ur: {
      basic: 'بنیادی تصدیق',
      identity: 'شناختی تصدیق',
      professional: 'پیشہ ورانہ تصدیق',
      enhanced: 'بہتر تصدیق',
    },
  };

  const typeLabel = verificationTypeText[language][verificationType as keyof typeof verificationTypeText.en] || verificationType;
  const isUrgent = daysUntilExpiry <= 7;

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${lawyerName},` : language === 'ur' ? `${lawyerName} خوش آمدید،` : `Hello ${lawyerName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? `تنبيه: سينتهي ${typeLabel} الخاص بك خلال ${daysUntilExpiry} يوم.`
          : language === 'ur'
          ? `انتباہ: آپ کی ${typeLabel} ${daysUntilExpiry} دنوں میں ختم ہو جائے گی۔`
          : `Alert: Your ${typeLabel} will expire in ${daysUntilExpiry} days.`}
      </div>
      <div class="info-box" style="${isUrgent ? 'border-left-color: #dc2626; background: #fef2f2;' : ''}">
        <div class="info-box-title">
          ${isUrgent
            ? language === 'ar' ? '⚠️ إجراء عاجل مطلوب' : language === 'ur' ? '⚠️ فوری کارروائی درکار' : '⚠️ Urgent Action Required'
            : language === 'ar' ? 'تجديد مطلوب' : language === 'ur' ? 'تجدید درکار' : 'Renewal Required'}
        </div>
        <div class="info-box-text">
          ${language === 'ar'
            ? `يرجى تجديد التحقق الخاص بك للحفاظ على حالة ملفك الشخصي النشطة والاستمرار في تلقي الاستشارات.`
            : language === 'ur'
            ? `براہ کرم اپنی تصدیق کی تجدید کریں تاکہ آپ کی پروفائل کی فعال حیثیت برقرار رہے اور مشاورت حاصل کرنا جاری رکھ سکیں۔`
            : `Please renew your verification to maintain your active profile status and continue receiving consultations.`}
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${renewalLink}" class="button" style="${isUrgent ? 'background: #dc2626;' : ''}">
          ${language === 'ar' ? 'تجديد التحقق' : language === 'ur' ? 'تصدیق کی تجدید کریں' : 'Renew Verification'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #6b7280;">
        ${language === 'ar'
          ? 'إذا انتهت صلاحية التحقق الخاص بك، فسيتم تعليق ملفك الشخصي تلقائياً حتى التجديد.'
          : language === 'ur'
          ? 'اگر آپ کی تصدیق کی میعاد ختم ہو جاتی ہے، تو آپ کا پروفائل تجدید تک خود بخود معطل ہو جائے گا۔'
          : 'If your verification expires, your profile will be automatically suspended until renewal.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${lawyerName},\n\nتنبيه: سينتهي ${typeLabel} الخاص بك خلال ${daysUntilExpiry} يوم.\n\nيرجى تجديد التحقق الخاص بك: ${renewalLink}\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${lawyerName} خوش آمدید،\n\nانتباہ: آپ کی ${typeLabel} ${daysUntilExpiry} دنوں میں ختم ہو جائے گی۔\n\nبراہ کرم اپنی تصدیق کی تجدید کریں: ${renewalLink}\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${lawyerName},\n\nAlert: Your ${typeLabel} will expire in ${daysUntilExpiry} days.\n\nPlease renew your verification: ${renewalLink}\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: isUrgent
      ? language === 'ar' ? `⚠️ عاجل: ${typeLabel} ينتهي قريباً` : language === 'ur' ? `⚠️ فوری: ${typeLabel} جلد ختم ہو رہی ہے` : `⚠️ Urgent: ${typeLabel} Expiring Soon`
      : language === 'ar' ? `تذكير: ${typeLabel} ينتهي خلال ${daysUntilExpiry} يوم` : language === 'ur' ? `یاد دہانی: ${typeLabel} ${daysUntilExpiry} دنوں میں ختم ہو رہی ہے` : `Reminder: ${typeLabel} Expires in ${daysUntilExpiry} Days`,
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// LICENSE RENEWAL EMAIL
// ============================================

export interface LicenseRenewalEmailData {
  lawyerName: string;
  email: string;
  daysUntilExpiry: number;
  renewalLink: string;
  language: 'en' | 'ar' | 'ur';
}

export function getLicenseRenewalEmail(data: LicenseRenewalEmailData) {
  const { lawyerName, daysUntilExpiry, renewalLink, language } = data;

  const isUrgent = daysUntilExpiry <= 7;

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${lawyerName},` : language === 'ur' ? `${lawyerName} خوش آمدید،` : `Hello ${lawyerName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? `تنبيه: ستنتهي رخصة المحاماة الخاصة بك خلال ${daysUntilExpiry} يوم.`
          : language === 'ur'
          ? `انتباہ: آپ کا بار لائسنس ${daysUntilExpiry} دنوں میں ختم ہو جائے گا۔`
          : `Alert: Your bar license will expire in ${daysUntilExpiry} days.`}
      </div>
      <div class="info-box" style="${isUrgent ? 'border-left-color: #dc2626; background: #fef2f2;' : ''}">
        <div class="info-box-title">
          ${isUrgent
            ? language === 'ar' ? '⚠️ إجراء عاجل مطلوب' : language === 'ur' ? '⚠️ فوری کارروائی درکار' : '⚠️ Urgent Action Required'
            : language === 'ar' ? 'تجديد الرخصة مطلوب' : language === 'ur' ? 'لائسنس کی تجدید درکار' : 'License Renewal Required'}
        </div>
        <div class="info-box-text">
          ${language === 'ar'
            ? `يرجى تجديد رخصة المحاماة الخاصة بك وتحديث معلوماتك على Qannoni للحفاظ على حالة التحقق الخاصة بك.`
            : language === 'ur'
            ? `براہ کرم اپنے بار لائسنس کی تجدید کریں اور اپنی تصدیق کی حیثیت برقرار رکھنے کے لیے Qannoni پر اپنی معلومات اپ ڈیٹ کریں۔`
            : `Please renew your bar license and update your information on Qannoni to maintain your verified status.`}
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${renewalLink}" class="button" style="${isUrgent ? 'background: #dc2626;' : ''}">
          ${language === 'ar' ? 'تحديث الرخصة' : language === 'ur' ? 'لائسنس اپ ڈیٹ کریں' : 'Update License'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #6b7280;">
        ${language === 'ar'
          ? 'رخصة المحاماة السارية مطلوبة للحفاظ على حالة التحقق الخاصة بك على Qannoni.'
          : language === 'ur'
          ? 'Qannoni پر اپنی تصدیق شدہ حیثیت برقرار رکھنے کے لیے ایک فعال بار لائسنس درکار ہے۔'
          : 'A valid bar license is required to maintain your verified status on Qannoni.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${lawyerName},\n\nتنبيه: ستنتهي رخصة المحاماة الخاصة بك خلال ${daysUntilExpiry} يوم.\n\nيرجى تحديث رخصتك: ${renewalLink}\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${lawyerName} خوش آمدید،\n\nانتباہ: آپ کا بار لائسنس ${daysUntilExpiry} دنوں میں ختم ہو جائے گا۔\n\nبراہ کرم اپنا لائسنس اپ ڈیٹ کریں: ${renewalLink}\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${lawyerName},\n\nAlert: Your bar license will expire in ${daysUntilExpiry} days.\n\nPlease update your license: ${renewalLink}\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: isUrgent
      ? language === 'ar' ? '⚠️ عاجل: رخصة المحاماة تنتهي قريباً' : language === 'ur' ? '⚠️ فوری: بار لائسنس جلد ختم ہو رہا ہے' : '⚠️ Urgent: Bar License Expiring Soon'
      : language === 'ar' ? `تذكير: رخصة المحاماة تنتهي خلال ${daysUntilExpiry} يوم` : language === 'ur' ? `یاد دہانی: بار لائسنس ${daysUntilExpiry} دنوں میں ختم ہو رہا ہے` : `Reminder: Bar License Expires in ${daysUntilExpiry} Days`,
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

// ============================================
// DOCUMENT REMINDER EMAIL
// ============================================

export function getDocumentReminderEmail(data: DocumentReminderEmailData) {
  const { signerName, documentName, signingLink, expiresAt, language } = data;

  const expiryDate = new Date(expiresAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'ur' ? 'ur-PK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const content = `
    <div class="content">
      <div class="greeting">
        ${language === 'ar' ? `مرحباً ${signerName},` : language === 'ur' ? `${signerName} خوش آمدید،` : `Hello ${signerName},`}
      </div>
      <div class="message">
        ${language === 'ar'
          ? 'هذا تذكير بأن لديك وثيقة تنتظر توقيعك على Qannoni.'
          : language === 'ur'
          ? 'یہ ایک یاد دہانی ہے کہ Qannoni پر آپ کے دستخط کے منتظر ایک دستاویز موجود ہے۔'
          : 'This is a reminder that you have a document waiting for your signature on Qannoni.'}
      </div>
      <div class="info-box">
        <div class="info-box-title">
          ${language === 'ar' ? 'الوثيقة:' : language === 'ur' ? 'دستاویز:' : 'Document:'}
        </div>
        <div class="info-box-text">
          <strong>${documentName}</strong><br>
          ${language === 'ar' ? 'تنتهي الصلاحية في:' : language === 'ur' ? 'میعاد ختم:' : 'Expires on:'} ${expiryDate}
          ${daysUntilExpiry > 0
            ? language === 'ar'
              ? `(${daysUntilExpiry} يوم متبقي)`
              : language === 'ur'
              ? `(${daysUntilExpiry} دن باقی)`
              : `(${daysUntilExpiry} days remaining)`
            : language === 'ar'
              ? '(انتهت الصلاحية)'
              : language === 'ur'
              ? '(میعاد ختم ہو گئی)'
              : '(Expired)'}
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${signingLink}" class="button">
          ${language === 'ar' ? 'التوقيع الآن' : language === 'ur' ? 'ابھی دستخط کریں' : 'Sign Now'}
        </a>
      </div>
      <div class="divider"></div>
      <div class="message" style="font-size: 13px; color: #6b7280;">
        ${language === 'ar'
          ? 'يرجى التوقيع على الوثيقة في أقرب وقت ممكن لتجنب التأخير.'
          : language === 'ur'
          ? 'براہ کرم تاخیر سے بچنے کے لیے جلد از جلد دستاویز پر دستخط کریں۔'
          : 'Please sign the document as soon as possible to avoid delays.'}
      </div>
    </div>
  `;

  const plainText = language === 'ar'
    ? `مرحباً ${signerName},\n\nتذكير: لديك وثيقة تنتظر توقيعك.\n\nالوثيقة: ${documentName}\nتنتهي الصلاحية: ${expiryDate}\n\nالتوقيع الآن: ${signingLink}\n\nشكراً،\nفريق Qannoni`
    : language === 'ur'
    ? `${signerName} خوش آمدید،\n\nیاد دہانی: آپ کے دستخط کے منتظر ایک دستاویز موجود ہے۔\n\nدستاویز: ${documentName}\nمیعاد ختم: ${expiryDate}\n\nابھی دستخط کریں: ${signingLink}\n\nشکریہ،\nQannoni ٹیم`
    : `Hello ${signerName},\n\nReminder: You have a document waiting for your signature.\n\nDocument: ${documentName}\nExpires: ${expiryDate}\n\nSign Now: ${signingLink}\n\nBest regards,\nThe Qannoni Team`;

  return {
    subject: language === 'ar'
      ? `تذكير: انتظار توقيعك - ${documentName}`
      : language === 'ur'
      ? `یاد دہانی: آپ کے دستخط کے منتظر - ${documentName}`
      : `Reminder: Awaiting Your Signature - ${documentName}`,
    html: getBaseTemplate(content, language),
    text: plainText,
  };
}

# Email Templates Usage Guide

This guide shows how to use the LegalDocs email templates in your application.

## Installation

The package is already part of the LegalDocs monorepo workspace. Import from `@legaldocs/emails`:

```typescript
import { WelcomeEmail, VerifyEmail, etc. } from '@legaldocs/emails';
```

## Sending Emails with Resend

```typescript
import { Resend } from 'resend';
import { WelcomeEmail } from '@legaldocs/emails';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(userEmail: string, userName: string, locale: 'en' | 'ar') {
  const { data, error } = await resend.emails.send({
    from: 'LegalDocs <noreply@legaldocs.app>',
    to: userEmail,
    subject: locale === 'ar' ? 'مرحباً بك في LegalDocs' : 'Welcome to LegalDocs',
    react: WelcomeEmail({
      name: userName,
      locale: locale,
      dashboardUrl: 'https://legaldocs.app/dashboard'
    }),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
```

## Example: User Registration Flow

```typescript
import { WelcomeEmail, VerifyEmail } from '@legaldocs/emails';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handleUserRegistration(user: {
  email: string;
  name: string;
  locale: 'en' | 'ar';
  verificationToken: string;
}) {
  // Send welcome email
  await resend.emails.send({
    from: 'LegalDocs <noreply@legaldocs.app>',
    to: user.email,
    subject: user.locale === 'ar' ? 'مرحباً بك في LegalDocs' : 'Welcome to LegalDocs',
    react: WelcomeEmail({
      name: user.name,
      locale: user.locale,
      dashboardUrl: 'https://legaldocs.app/dashboard'
    }),
  });

  // Send verification email
  await resend.emails.send({
    from: 'LegalDocs <noreply@legaldocs.app>',
    to: user.email,
    subject: user.locale === 'ar'
      ? 'تحقق من عنوان بريدك الإلكتروني'
      : 'Verify your email address',
    react: VerifyEmail({
      name: user.name,
      locale: user.locale,
      verificationUrl: `https://legaldocs.app/verify?token=${user.verificationToken}`,
      verificationCode: user.verificationToken.slice(0, 6).toUpperCase()
    }),
  });
}
```

## Example: Document Signature Flow

```typescript
import { SignatureRequest, DocumentSigned, SignatureComplete } from '@legaldocs/emails';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Step 1: Request signature
async function requestDocumentSignature(data: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  documentName: string;
  documentId: string;
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <signatures@legaldocs.app>',
    to: data.recipientEmail,
    subject: data.locale === 'ar'
      ? `طلب توقيع: ${data.documentName}`
      : `Signature Request: ${data.documentName}`,
    react: SignatureRequest({
      recipientName: data.recipientName,
      senderName: data.senderName,
      documentName: data.documentName,
      locale: data.locale,
      signUrl: `https://legaldocs.app/sign/${data.documentId}`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }),
  });
}

// Step 2: Notify when someone signs
async function notifyDocumentSigned(data: {
  recipientEmail: string;
  recipientName: string;
  signerName: string;
  documentName: string;
  documentId: string;
  remainingSigners: string[];
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <signatures@legaldocs.app>',
    to: data.recipientEmail,
    subject: data.locale === 'ar'
      ? `تم التوقيع: ${data.documentName}`
      : `Document Signed: ${data.documentName}`,
    react: DocumentSigned({
      recipientName: data.recipientName,
      signerName: data.signerName,
      documentName: data.documentName,
      locale: data.locale,
      documentUrl: `https://legaldocs.app/documents/${data.documentId}`,
      remainingSigners: data.remainingSigners,
    }),
  });
}

// Step 3: Notify when all signatures complete
async function notifySignatureComplete(data: {
  recipientEmail: string;
  recipientName: string;
  documentName: string;
  documentId: string;
  signers: Array<{ name: string; signedAt: string }>;
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <signatures@legaldocs.app>',
    to: data.recipientEmail,
    subject: data.locale === 'ar'
      ? `اكتمل: ${data.documentName}`
      : `Complete: ${data.documentName}`,
    react: SignatureComplete({
      recipientName: data.recipientName,
      documentName: data.documentName,
      locale: data.locale,
      documentUrl: `https://legaldocs.app/documents/${data.documentId}`,
      downloadUrl: `https://legaldocs.app/documents/${data.documentId}/download`,
      signers: data.signers,
    }),
  });
}
```

## Example: Consultation Booking Flow

```typescript
import { ConsultationBooked, ConsultationReminder } from '@legaldocs/emails';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Book consultation
async function sendConsultationBooking(data: {
  clientEmail: string;
  clientName: string;
  lawyerName: string;
  lawyerSpecialty: string;
  consultationId: string;
  date: string;
  time: string;
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <consultations@legaldocs.app>',
    to: data.clientEmail,
    subject: data.locale === 'ar'
      ? 'تم تأكيد استشارتك القانونية'
      : 'Your Legal Consultation is Confirmed',
    react: ConsultationBooked({
      clientName: data.clientName,
      lawyerName: data.lawyerName,
      lawyerSpecialty: data.lawyerSpecialty,
      locale: data.locale,
      consultationDate: data.date,
      consultationTime: data.time,
      duration: '30 minutes',
      meetingUrl: `https://legaldocs.app/consultation/${data.consultationId}`,
      consultationType: 'video',
    }),
  });
}

// Send reminder (schedule this 24 hours before)
async function sendConsultationReminder(data: {
  clientEmail: string;
  clientName: string;
  lawyerName: string;
  consultationId: string;
  date: string;
  time: string;
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <consultations@legaldocs.app>',
    to: data.clientEmail,
    subject: data.locale === 'ar'
      ? 'تذكير: استشارتك القانونية غداً'
      : 'Reminder: Your Legal Consultation Tomorrow',
    react: ConsultationReminder({
      clientName: data.clientName,
      lawyerName: data.lawyerName,
      locale: data.locale,
      consultationDate: data.date,
      consultationTime: data.time,
      timeUntil: '24 hours',
      meetingUrl: `https://legaldocs.app/consultation/${data.consultationId}`,
      consultationType: 'video',
    }),
  });
}
```

## Example: Password Reset Flow

```typescript
import { PasswordReset } from '@legaldocs/emails';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(data: {
  email: string;
  name: string;
  resetToken: string;
  ipAddress: string;
  location: string;
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <security@legaldocs.app>',
    to: data.email,
    subject: data.locale === 'ar'
      ? 'إعادة تعيين كلمة المرور'
      : 'Reset your password',
    react: PasswordReset({
      name: data.name,
      locale: data.locale,
      resetUrl: `https://legaldocs.app/reset-password?token=${data.resetToken}`,
      ipAddress: data.ipAddress,
      location: data.location,
    }),
  });
}
```

## Example: Case Updates

```typescript
import { CaseUpdate } from '@legaldocs/emails';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendCaseStatusUpdate(data: {
  clientEmail: string;
  clientName: string;
  caseName: string;
  caseNumber: string;
  caseId: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  locale: 'en' | 'ar';
}) {
  await resend.emails.send({
    from: 'LegalDocs <cases@legaldocs.app>',
    to: data.clientEmail,
    subject: data.locale === 'ar'
      ? `تحديث القضية: ${data.caseName}`
      : `Case Update: ${data.caseName}`,
    react: CaseUpdate({
      clientName: data.clientName,
      caseName: data.caseName,
      caseNumber: data.caseNumber,
      updateType: 'status_change',
      locale: data.locale,
      updateTitle: data.locale === 'ar' ? 'تغيرت حالة القضية' : 'Case Status Changed',
      updateMessage: data.locale === 'ar'
        ? `تم تحديث حالة قضيتك من "${data.previousStatus}" إلى "${data.newStatus}".`
        : `Your case status has been updated from "${data.previousStatus}" to "${data.newStatus}".`,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      updatedBy: data.updatedBy,
      caseUrl: `https://legaldocs.app/cases/${data.caseId}`,
      actionRequired: false,
    }),
  });
}
```

## Testing Emails Locally

To preview and test emails locally:

```bash
cd packages/emails
npm run dev
```

This starts a preview server at `http://localhost:3001` where you can:
- View all email templates
- Test different props
- See how emails look in different email clients
- Preview both English and Arabic versions

## Integration with API

In your API routes (Cloudflare Workers):

```typescript
import { Resend } from 'resend';
import { WelcomeEmail } from '@legaldocs/emails';

export default {
  async fetch(request: Request, env: Env) {
    const resend = new Resend(env.RESEND_API_KEY);

    // ... your logic

    await resend.emails.send({
      from: 'LegalDocs <noreply@legaldocs.app>',
      to: user.email,
      subject: 'Welcome to LegalDocs',
      react: WelcomeEmail({
        name: user.name,
        locale: user.locale || 'en',
        dashboardUrl: 'https://legaldocs.app/dashboard'
      }),
    });

    return new Response('Email sent');
  }
};
```

## Environment Variables

Make sure to set these environment variables:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## Best Practices

1. **Always specify locale**: Default to user's preference or fallback to 'en'
2. **Error handling**: Wrap email sending in try-catch blocks
3. **Logging**: Log email sending for debugging and tracking
4. **Rate limiting**: Implement rate limiting to prevent abuse
5. **Unsubscribe**: Include unsubscribe links for marketing emails
6. **Testing**: Test emails with real email addresses before going live
7. **Personalization**: Use recipient names and relevant details

## Email Delivery Tips

- Use a verified domain for the `from` address
- Keep subject lines under 50 characters
- Test emails in multiple clients (Gmail, Outlook, Apple Mail)
- Monitor bounce rates and spam complaints
- Use proper SPF, DKIM, and DMARC records
- Avoid spam trigger words in subject lines

## Troubleshooting

### Email not sending
- Check RESEND_API_KEY is set correctly
- Verify domain is verified in Resend dashboard
- Check Resend API logs for errors

### Email looks broken
- Test in React Email preview server first
- Check for console errors
- Verify all required props are provided

### RTL not working for Arabic
- Ensure `locale="ar"` is set
- Check email client supports RTL
- Test in multiple Arabic-supporting clients

## Support

For issues or questions:
- Check the README.md for template documentation
- Review examples in this file
- Contact the LegalDocs development team

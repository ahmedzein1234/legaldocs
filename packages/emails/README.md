# @legaldocs/emails

Email templates package for the LegalDocs platform. Built with React Email components for beautiful, responsive emails with bilingual support (English and Arabic with RTL layout).

## Features

- 10 professional email templates
- Bilingual support (English and Arabic)
- RTL layout support for Arabic
- Responsive design for mobile and desktop
- TypeScript types included
- Built with @react-email/components
- LegalDocs branding (primary color: #2563eb)

## Available Templates

### 1. Welcome Email (`welcome.tsx`)
Welcome email for new users with platform features overview.

```typescript
import { WelcomeEmail } from '@legaldocs/emails';

<WelcomeEmail
  name="John Doe"
  locale="en"
  dashboardUrl="https://legaldocs.app/dashboard"
/>
```

### 2. Email Verification (`verify-email.tsx`)
Email verification with code and link.

```typescript
import { VerifyEmail } from '@legaldocs/emails';

<VerifyEmail
  name="John Doe"
  locale="en"
  verificationUrl="https://legaldocs.app/verify?token=..."
  verificationCode="123456"
/>
```

### 3. Password Reset (`password-reset.tsx`)
Password reset request with security information.

```typescript
import { PasswordReset } from '@legaldocs/emails';

<PasswordReset
  name="John Doe"
  locale="en"
  resetUrl="https://legaldocs.app/reset?token=..."
  ipAddress="192.168.1.1"
  location="Dubai, UAE"
/>
```

### 4. Signature Request (`signature-request.tsx`)
Request to sign a document with document details.

```typescript
import { SignatureRequest } from '@legaldocs/emails';

<SignatureRequest
  recipientName="John Doe"
  senderName="Jane Smith"
  documentName="Service Agreement"
  documentType="Contract"
  locale="en"
  signUrl="https://legaldocs.app/sign/..."
  dueDate="December 31, 2025"
  message="Please review and sign this agreement."
/>
```

### 5. Document Signed (`document-signed.tsx`)
Notification that a party has signed a document.

```typescript
import { DocumentSigned } from '@legaldocs/emails';

<DocumentSigned
  recipientName="John Doe"
  signerName="Jane Smith"
  documentName="Service Agreement"
  locale="en"
  documentUrl="https://legaldocs.app/documents/..."
  signedAt="2025-12-01 14:30"
  remainingSigners={["Bob Johnson"]}
/>
```

### 6. Signature Complete (`signature-complete.tsx`)
All parties have signed the document - final notification.

```typescript
import { SignatureComplete } from '@legaldocs/emails';

<SignatureComplete
  recipientName="John Doe"
  documentName="Service Agreement"
  locale="en"
  documentUrl="https://legaldocs.app/documents/..."
  downloadUrl="https://legaldocs.app/download/..."
  completedAt="2025-12-01 14:30"
  signers={[
    { name: "John Doe", signedAt: "2025-12-01 10:00" },
    { name: "Jane Smith", signedAt: "2025-12-01 14:30" }
  ]}
/>
```

### 7. Consultation Booked (`consultation-booked.tsx`)
Legal consultation booking confirmation.

```typescript
import { ConsultationBooked } from '@legaldocs/emails';

<ConsultationBooked
  clientName="John Doe"
  lawyerName="Attorney Smith"
  lawyerSpecialty="Corporate Law"
  locale="en"
  consultationDate="December 15, 2025"
  consultationTime="10:00 AM"
  duration="30 minutes"
  meetingUrl="https://legaldocs.app/consultation/..."
  consultationType="video"
  notes="Please prepare contract documents"
/>
```

### 8. Consultation Reminder (`consultation-reminder.tsx`)
Reminder before a scheduled consultation.

```typescript
import { ConsultationReminder } from '@legaldocs/emails';

<ConsultationReminder
  clientName="John Doe"
  lawyerName="Attorney Smith"
  locale="en"
  consultationDate="December 15, 2025"
  consultationTime="10:00 AM"
  timeUntil="24 hours"
  meetingUrl="https://legaldocs.app/consultation/..."
  consultationType="video"
/>
```

### 9. Lawyer Verification (`lawyer-verification.tsx`)
Lawyer account verification and welcome.

```typescript
import { LawyerVerification } from '@legaldocs/emails';

<LawyerVerification
  lawyerName="Attorney Smith"
  locale="en"
  dashboardUrl="https://legaldocs.app/lawyer-portal"
  licenseNumber="LAW-2025-12345"
  specialties={["Corporate Law", "Contract Law"]}
  verificationDate="December 1, 2025"
/>
```

### 10. Case Update (`case-update.tsx`)
Case status update notification with various update types.

```typescript
import { CaseUpdate } from '@legaldocs/emails';

<CaseUpdate
  clientName="John Doe"
  caseName="Contract Dispute Resolution"
  caseNumber="CASE-2025-001"
  updateType="status_change"
  locale="en"
  updateTitle="Case Status Updated"
  updateMessage="Your case has moved to the next phase."
  previousStatus="Under Review"
  newStatus="In Negotiation"
  updatedBy="Attorney Smith"
  caseUrl="https://legaldocs.app/cases/..."
  actionRequired={false}
/>
```

## Localization

All templates support English (`en`) and Arabic (`ar`) locales:

```typescript
// English
<WelcomeEmail name="John" locale="en" />

// Arabic (with RTL layout)
<WelcomeEmail name="أحمد" locale="ar" />
```

## Development

### Preview Emails

Run the React Email dev server to preview all templates:

```bash
npm run dev
```

This will start a local server at `http://localhost:3000` where you can preview and test all email templates.

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Export

Export templates as static HTML:

```bash
npm run export
```

## Design System

### Colors

- Primary: `#2563eb` (Blue)
- Success: `#27ae60` (Green)
- Warning: `#f39c12` (Orange)
- Error: `#e74c3c` (Red)
- Text Primary: `#1a1a1a`
- Text Secondary: `#525f7f`
- Text Muted: `#8898aa`
- Background: `#f6f9fc`
- Border: `#e6ebf1`

### Typography

- Font Family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif`
- Title: 28px, bold
- Heading: 18-20px, semi-bold
- Body: 16px, regular
- Small: 14px, regular

### Spacing

- Container max-width: 600px
- Content padding: 48px (horizontal)
- Section margin: 32px (vertical)
- Element margin: 16px

## Best Practices

1. Always provide the `locale` prop for proper language support
2. Use descriptive `name` values for personalization
3. Include all relevant URLs for CTAs
4. Test emails in both English and Arabic
5. Preview on multiple email clients (Gmail, Outlook, etc.)
6. Keep email content concise and scannable
7. Use clear call-to-action buttons

## License

Private - LegalDocs Platform

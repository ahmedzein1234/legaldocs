# Email Notification System

Complete email notification implementation for LegalDocs using Resend API.

## Overview

The email notification system provides professional, bilingual (English/Arabic) email templates for all user-facing notifications including:

- Welcome emails for new users
- Password reset requests
- Document sharing notifications
- Signature requests
- Signature completion notifications
- Document reminders

## Architecture

### Components

1. **Email Templates** (`src/lib/email-templates.ts`)
   - Professional HTML and plain text templates
   - Bilingual support (English/Arabic)
   - Responsive design
   - LegalDocs branding

2. **Email Service** (`src/lib/email.ts`)
   - Resend API wrapper
   - Typed email sending functions
   - Batch email support
   - Error handling

3. **Notification Routes** (`src/routes/notifications.ts`)
   - REST API endpoints for notifications
   - Integration with signature workflows
   - Document sharing notifications

## Configuration

### Environment Variables

Set the Resend API key using Wrangler:

```bash
# For development
wrangler secret put RESEND_API_KEY --env development

# For production
wrangler secret put RESEND_API_KEY --env production
```

Get your API key from: https://resend.com/api-keys

### Email Domain

Update the default sender email in `src/lib/email.ts`:

```typescript
const DEFAULT_FROM_EMAIL = 'LegalDocs <noreply@legaldocs.app>';
const DEFAULT_REPLY_TO = 'support@legaldocs.app';
```

**Important**: You must verify your domain in Resend before sending emails from a custom domain.

## Email Templates

### Available Templates

1. **Welcome Email**
   - Sent on user registration
   - Includes dashboard link
   - Lists platform features

2. **Password Reset**
   - Secure reset link with expiration
   - Security warnings
   - Bilingual support

3. **Document Shared**
   - Sender information
   - Document details
   - View link

4. **Signature Request**
   - Document information
   - Signer role
   - Expiration date
   - Review & sign link

5. **Signature Completed**
   - Completion notification
   - Signer details
   - Download link

6. **Document Reminder**
   - Reminder for pending signatures
   - Expiration warning
   - Quick action link

### Template Customization

All templates are in `src/lib/email-templates.ts`. Each template has:

- **HTML version**: Responsive, professionally designed
- **Plain text version**: Fallback for email clients
- **Bilingual content**: English and Arabic support

Example template data:

```typescript
const welcomeEmailData: WelcomeEmailData = {
  userName: 'Ahmed Ali',
  userEmail: 'ahmed@example.com',
  language: 'ar', // or 'en'
};
```

## API Endpoints

### POST /api/notifications/send-signature-request

Send signature request emails to signers.

**Authentication**: Required

**Request Body**:
```json
{
  "requestId": "sig_123",
  "signers": [
    {
      "email": "signer@example.com",
      "name": "John Doe",
      "role": "signer",
      "signingLink": "https://legaldocs.app/sign/token",
      "language": "en"
    }
  ],
  "documentName": "Employment Contract",
  "documentType": "Contract",
  "message": "Please review and sign",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "sig_123",
    "sent": 1,
    "failed": 0
  }
}
```

### POST /api/notifications/send-reminder

Send reminder emails to pending signers.

**Authentication**: Required

**Request Body**:
```json
{
  "requestId": "sig_123",
  "signerIds": ["signer_456"] // Optional - omit to send to all pending
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "sig_123",
    "remindersSent": 1,
    "failed": 0,
    "signers": ["John Doe"]
  }
}
```

### POST /api/notifications/send-document-shared

Send document sharing notifications.

**Authentication**: Required

**Request Body**:
```json
{
  "recipients": [
    {
      "email": "recipient@example.com",
      "name": "Jane Smith",
      "language": "en"
    }
  ],
  "documentName": "Contract.pdf",
  "documentType": "Contract",
  "viewLink": "https://legaldocs.app/documents/123",
  "message": "Please review this document"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sent": 1,
    "failed": 0
  }
}
```

### GET /api/notifications/test

Test email configuration.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Email service is configured",
    "provider": "Resend"
  }
}
```

## Usage Examples

### Sending Welcome Email (Auto-triggered)

Welcome emails are automatically sent when a user registers via `/api/auth/register`. No additional code needed.

### Sending Signature Request Manually

```typescript
import { sendSignatureRequestEmail } from './lib/email.js';

const result = await sendSignatureRequestEmail(
  env.RESEND_API_KEY,
  'signer@example.com',
  {
    signerName: 'Ahmed Ali',
    senderName: 'Legal Team',
    documentName: 'Employment Contract',
    documentType: 'Contract',
    signingLink: 'https://legaldocs.app/sign/abc123',
    message: 'Please review and sign',
    expiresAt: '2024-12-31T23:59:59Z',
    role: 'signer',
    language: 'ar',
  }
);

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### Batch Sending

```typescript
import { sendSignatureRequestBatch } from './lib/email.js';

const results = await sendSignatureRequestBatch(env.RESEND_API_KEY, [
  {
    email: 'signer1@example.com',
    data: { /* ... */ },
  },
  {
    email: 'signer2@example.com',
    data: { /* ... */ },
  },
]);

// Check results
results.forEach((result, index) => {
  if (result.success) {
    console.log(`Email ${index + 1} sent`);
  } else {
    console.error(`Email ${index + 1} failed:`, result.error);
  }
});
```

## Error Handling

All email functions return a `SendEmailResult`:

```typescript
interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

Handle errors gracefully:

```typescript
const result = await sendEmail(apiKey, options);

if (!result.success) {
  // Log error but don't fail the main operation
  console.error('Email failed:', result.error);

  // Optionally store in database for retry
  await logFailedEmail(result.error);
}
```

## Best Practices

1. **Non-blocking**: Send emails asynchronously, don't block main operations
2. **Error handling**: Always catch email errors, don't fail main flows
3. **Language detection**: Use user's preferred language when available
4. **Rate limiting**: Batch emails have built-in delays to avoid rate limits
5. **Testing**: Use the `/api/notifications/test` endpoint to verify configuration

## Integration with Signature Workflow

The signature request workflow automatically sends emails:

1. User creates signature request via `/api/signatures/request`
2. Frontend calls `/api/notifications/send-signature-request` with signer details
3. System sends initial emails to all signers
4. For reminders, call `/api/notifications/send-reminder`
5. On completion, system can send completion emails

## Cloudflare Workers Compatibility

This implementation is fully compatible with Cloudflare Workers:

- ✅ Uses `fetch` API (not Node.js modules)
- ✅ No file system operations
- ✅ No external dependencies beyond Hono and Zod
- ✅ Works with Cloudflare's runtime
- ✅ Efficient and fast

## Monitoring

Monitor email delivery in the Resend dashboard:
- https://resend.com/emails

Track:
- Delivery rates
- Bounce rates
- Open rates (if tracking enabled)
- Click rates
- Spam complaints

## Future Enhancements

Potential improvements:

1. **Email Templates CMS**: Allow admins to customize templates
2. **Email Tracking**: Track opens and clicks
3. **Email Scheduling**: Schedule emails for specific times
4. **Email Preferences**: Allow users to manage notification preferences
5. **WhatsApp Integration**: Send notifications via WhatsApp (already planned)
6. **SMS Fallback**: SMS notifications when email fails
7. **Email Queue**: Queue system for high-volume sending
8. **A/B Testing**: Test different email templates

## Support

For issues or questions:
- Email: support@legaldocs.app
- Resend Docs: https://resend.com/docs
- Resend Support: https://resend.com/support

# Email Notifications - Quick Reference

## Quick Start

### 1. Setup (One-time)
```bash
wrangler secret put RESEND_API_KEY
# Enter your Resend API key from https://resend.com/api-keys
```

### 2. Test Configuration
```bash
curl https://your-api.workers.dev/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Available Email Templates

| Template | Trigger | Language Support |
|----------|---------|------------------|
| Welcome | User registration | EN, AR |
| Password Reset | Password reset request | EN, AR |
| Document Shared | Document sharing | EN, AR |
| Signature Request | Signature workflow | EN, AR |
| Signature Completed | All parties signed | EN, AR |
| Document Reminder | Pending signatures | EN, AR |

## API Endpoints

### Send Signature Request
```typescript
POST /api/notifications/send-signature-request
{
  "requestId": "sig_xxx",
  "signers": [{ "email": "...", "name": "...", "role": "signer", "signingLink": "...", "language": "en" }],
  "documentName": "...",
  "documentType": "...",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Send Reminder
```typescript
POST /api/notifications/send-reminder
{
  "requestId": "sig_xxx",
  "signerIds": ["signer_123"] // Optional
}
```

### Send Document Shared
```typescript
POST /api/notifications/send-document-shared
{
  "recipients": [{ "email": "...", "name": "...", "language": "en" }],
  "documentName": "...",
  "documentType": "...",
  "viewLink": "..."
}
```

## Code Examples

### Send Welcome Email (Manual)
```typescript
import { sendWelcomeEmail } from './lib/email.js';

const result = await sendWelcomeEmail(env.RESEND_API_KEY, {
  userName: 'Ahmed Ali',
  userEmail: 'ahmed@example.com',
  language: 'ar', // or 'en'
});

if (result.success) {
  console.log('✓ Welcome email sent:', result.messageId);
}
```

### Send Signature Request (Manual)
```typescript
import { sendSignatureRequestEmail } from './lib/email.js';

await sendSignatureRequestEmail(env.RESEND_API_KEY, 'signer@example.com', {
  signerName: 'John Doe',
  senderName: 'Legal Team',
  documentName: 'Contract',
  documentType: 'Agreement',
  signingLink: 'https://legaldocs.app/sign/abc123',
  expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  role: 'signer',
  language: 'en',
});
```

### Batch Send
```typescript
import { sendSignatureRequestBatch } from './lib/email.js';

const results = await sendSignatureRequestBatch(env.RESEND_API_KEY, [
  { email: 'signer1@example.com', data: { /* ... */ } },
  { email: 'signer2@example.com', data: { /* ... */ } },
]);

// Check results
const successful = results.filter(r => r.success).length;
console.log(`Sent ${successful}/${results.length} emails`);
```

## Language Selection

```typescript
// Get user's language preference
import { getEmailLanguage } from './lib/email.js';

const language = getEmailLanguage(user.ui_language); // 'en' | 'ar'
```

## Error Handling Pattern

```typescript
// Always use non-blocking email sending
sendEmail(apiKey, options)
  .catch(error => {
    console.error('Email failed:', error);
    // Log for later retry, but don't break main flow
  });
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "API key not configured" | Run `wrangler secret put RESEND_API_KEY` |
| "Domain not verified" | Use your Resend signup email for testing OR verify domain |
| "Authentication required" | Include valid token in `Authorization: Bearer {token}` header |

## File Locations

```
src/
  lib/
    email.ts              # Email service functions
    email-templates.ts    # HTML/text templates
  routes/
    notifications.ts      # API endpoints
    auth.ts              # Welcome email on registration
```

## Environment Variables

```bash
# Development (.dev.vars)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Production (Wrangler secret)
wrangler secret put RESEND_API_KEY
```

## Template Data Types

```typescript
type WelcomeEmailData = {
  userName: string;
  userEmail: string;
  language: 'en' | 'ar';
};

type SignatureRequestEmailData = {
  signerName: string;
  senderName: string;
  documentName: string;
  documentType: string;
  signingLink: string;
  message?: string;
  expiresAt: string;
  role: 'signer' | 'approver' | 'witness' | 'cc';
  language: 'en' | 'ar';
};

type DocumentSharedEmailData = {
  recipientName: string;
  senderName: string;
  documentName: string;
  documentType: string;
  viewLink: string;
  message?: string;
  language: 'en' | 'ar';
};

type DocumentReminderEmailData = {
  signerName: string;
  documentName: string;
  signingLink: string;
  expiresAt: string;
  language: 'en' | 'ar';
};
```

## Testing Commands

```bash
# Test configuration
curl https://your-api.workers.dev/api/notifications/test \
  -H "Authorization: Bearer TOKEN"

# Test signature request
curl -X POST https://your-api.workers.dev/api/notifications/send-signature-request \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"sig_test","signers":[...],"documentName":"Test","documentType":"Contract","expiresAt":"2024-12-31T23:59:59Z"}'

# Test reminder
curl -X POST https://your-api.workers.dev/api/notifications/send-reminder \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"sig_test"}'
```

## Monitoring

View sent emails: https://resend.com/emails

Check:
- ✓ Delivery status
- ✓ Bounce rates
- ✓ Error messages
- ✓ Email preview

## Best Practices

1. **Always use async/await with .catch()** for email sending
2. **Never block user flows** on email delivery
3. **Log failures** for later retry
4. **Use user's preferred language** when available
5. **Include batch delays** to avoid rate limits
6. **Verify domain** before production use
7. **Test with real email addresses**
8. **Monitor Resend dashboard** regularly

## Quick Checklist

- [ ] RESEND_API_KEY is set
- [ ] Test endpoint returns success
- [ ] Welcome emails send on registration
- [ ] Signature request emails work
- [ ] Reminders are sent
- [ ] Both EN and AR templates work
- [ ] Emails appear correctly in Gmail/Outlook
- [ ] Domain is verified (production)

## Support Links

- Resend Dashboard: https://resend.com
- API Docs: https://resend.com/docs
- Get API Key: https://resend.com/api-keys
- Domain Setup: https://resend.com/domains

---

**Need help?** Check `EMAIL_NOTIFICATIONS.md` for detailed documentation or `TESTING_EMAILS.md` for testing guide.

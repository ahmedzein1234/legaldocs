# Testing Email Notifications

Quick guide for testing the email notification system.

## Prerequisites

1. Get a Resend API key from https://resend.com
2. Set it as a secret in Wrangler:

```bash
wrangler secret put RESEND_API_KEY
# Enter your API key when prompted
```

For development, you can also add it to `.dev.vars` file:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## Testing with Resend Development Mode

Resend allows testing without a verified domain by sending to the same email you used to sign up.

## Test Endpoints

### 1. Test Email Configuration

```bash
curl -X GET https://your-api.workers.dev/api/notifications/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "Email service is configured",
    "provider": "Resend"
  }
}
```

### 2. Test Welcome Email (Automatic)

Register a new user to trigger welcome email:

```bash
curl -X POST https://your-api.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "fullName": "Test User"
  }'
```

The welcome email will be sent automatically.

### 3. Test Signature Request Email

```bash
curl -X POST https://your-api.workers.dev/api/notifications/send-signature-request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "sig_test_123",
    "signers": [
      {
        "email": "signer@example.com",
        "name": "John Doe",
        "role": "signer",
        "signingLink": "https://legaldocs-web.pages.dev/en/sign/test_token",
        "language": "en"
      }
    ],
    "documentName": "Test Employment Contract",
    "documentType": "Contract",
    "message": "Please review and sign this test document",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

### 4. Test Document Shared Email

```bash
curl -X POST https://your-api.workers.dev/api/notifications/send-document-shared \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      {
        "email": "recipient@example.com",
        "name": "Jane Smith",
        "language": "en"
      }
    ],
    "documentName": "Test Contract.pdf",
    "documentType": "Legal Contract",
    "viewLink": "https://legaldocs-web.pages.dev/en/documents/123",
    "message": "Please review this important document"
  }'
```

### 5. Test Reminder Email

First, create a signature request, then send a reminder:

```bash
curl -X POST https://your-api.workers.dev/api/notifications/send-reminder \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "sig_test_123"
  }'
```

## Testing Different Languages

### Arabic Email Test

```bash
curl -X POST https://your-api.workers.dev/api/notifications/send-signature-request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "sig_test_ar",
    "signers": [
      {
        "email": "signer@example.com",
        "name": "أحمد علي",
        "role": "signer",
        "signingLink": "https://legaldocs-web.pages.dev/ar/sign/test_token",
        "language": "ar"
      }
    ],
    "documentName": "عقد عمل",
    "documentType": "عقد",
    "message": "يرجى المراجعة والتوقيع",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

## Testing Complete Workflow

### Full Signature Request Flow

1. **Create a signature request**:

```bash
curl -X POST https://your-api.workers.dev/api/signatures/request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc_123",
    "documentName": "Employment Agreement",
    "documentType": "Contract",
    "title": "Employment Agreement for John Doe",
    "message": "Please review and sign",
    "signers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "signer",
        "deliveryMethod": "email"
      }
    ],
    "signingOrder": "sequential",
    "expiresInDays": 7,
    "reminderFrequency": "daily"
  }'
```

2. **Extract the requestId and signing URLs from response**

3. **Send signature request emails**:

```bash
curl -X POST https://your-api.workers.dev/api/notifications/send-signature-request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "EXTRACTED_REQUEST_ID",
    "signers": [
      {
        "email": "john@example.com",
        "name": "John Doe",
        "role": "signer",
        "signingLink": "EXTRACTED_SIGNING_URL",
        "language": "en"
      }
    ],
    "documentName": "Employment Agreement",
    "documentType": "Contract",
    "message": "Please review and sign",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'
```

4. **Wait a day, then send reminder**:

```bash
curl -X POST https://your-api.workers.dev/api/notifications/send-reminder \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "EXTRACTED_REQUEST_ID"
  }'
```

## Checking Email Delivery

1. Log in to Resend dashboard: https://resend.com/emails
2. View all sent emails
3. Check delivery status
4. Preview email content
5. View any errors

## Common Issues

### Issue: "RESEND_API_KEY is not configured"

**Solution**: Set the secret using `wrangler secret put RESEND_API_KEY`

### Issue: "Email failed: Domain not verified"

**Solution**:
- Use your Resend account email for testing, OR
- Verify your domain in Resend settings

### Issue: "Authentication required"

**Solution**: Include a valid access token in the Authorization header:
```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Get a token by logging in:
```bash
curl -X POST https://your-api.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "YourPassword123!"
  }'
```

## Development Tips

1. **Use Resend's test mode**: All emails sent in development go to your Resend account email
2. **Check spam folder**: Some test emails might end up in spam
3. **Monitor the console**: Email errors are logged to console but don't break the flow
4. **Use real email addresses**: Don't use fake emails, they'll bounce

## Email Template Preview

To preview email templates locally, you can use the email templates directly:

```typescript
import { getWelcomeEmail } from './src/lib/email-templates';

const { html, text } = getWelcomeEmail({
  userName: 'Test User',
  userEmail: 'test@example.com',
  language: 'en',
});

console.log(html); // Copy this to an HTML file and open in browser
```

## Next Steps

After testing:

1. Verify your custom domain in Resend
2. Update `DEFAULT_FROM_EMAIL` in `src/lib/email.ts`
3. Set up SPF, DKIM, and DMARC records
4. Monitor email deliverability
5. Adjust templates based on user feedback

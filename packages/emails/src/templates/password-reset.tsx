import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetProps {
  name: string;
  locale?: "en" | "ar";
  resetUrl?: string;
  ipAddress?: string;
  location?: string;
}

export const PasswordReset = ({
  name,
  locale = "en",
  resetUrl = "https://legaldocs.app/reset-password",
  ipAddress = "192.168.1.1",
  location = "Unknown",
}: PasswordResetProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: "Reset your LegalDocs password",
      greeting: `Hi ${name},`,
      title: "Reset Your Password",
      paragraph1:
        "We received a request to reset your password for your LegalDocs account. If you made this request, click the button below to reset your password.",
      paragraph2:
        "For your security, this link will expire in 1 hour and can only be used once.",
      cta: "Reset Password",
      alternativeText: "Or copy and paste this URL into your browser:",
      requestInfo: "Request Information:",
      ipLabel: "IP Address:",
      locationLabel: "Location:",
      timeLabel: "Time:",
      securityTitle: "Didn't Request This?",
      securityText:
        "If you didn't request a password reset, please ignore this email. Your password will remain unchanged. However, if you're concerned about your account security, please contact our support team immediately.",
      supportText: "Need help? Contact our support team at support@legaldocs.app",
      footer: "LegalDocs - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: "إعادة تعيين كلمة مرور LegalDocs الخاصة بك",
      greeting: `مرحباً ${name}،`,
      title: "إعادة تعيين كلمة المرور",
      paragraph1:
        "تلقينا طلباً لإعادة تعيين كلمة المرور لحساب LegalDocs الخاص بك. إذا قمت بهذا الطلب، انقر على الزر أدناه لإعادة تعيين كلمة المرور.",
      paragraph2:
        "لأمانك، سينتهي صلاحية هذا الرابط خلال ساعة واحدة ويمكن استخدامه مرة واحدة فقط.",
      cta: "إعادة تعيين كلمة المرور",
      alternativeText: "أو انسخ والصق هذا الرابط في متصفحك:",
      requestInfo: "معلومات الطلب:",
      ipLabel: "عنوان IP:",
      locationLabel: "الموقع:",
      timeLabel: "الوقت:",
      securityTitle: "لم تطلب هذا؟",
      securityText:
        "إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني. ستظل كلمة المرور الخاصة بك دون تغيير. ومع ذلك، إذا كانت لديك مخاوف بشأن أمان حسابك، يرجى الاتصال بفريق الدعم لدينا على الفور.",
      supportText: "هل تحتاج إلى مساعدة؟ اتصل بفريق الدعم لدينا على support@legaldocs.app",
      footer: "LegalDocs - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const currentTime = new Date().toLocaleString(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <Html dir={isRTL ? "rtl" : "ltr"} lang={locale}>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://legaldocs.app/logo.png"
              width="150"
              height="50"
              alt="LegalDocs"
              style={logo}
            />
          </Section>
          <Section style={content}>
            <Text style={greeting}>{t.greeting}</Text>
            <Text style={title}>{t.title}</Text>
            <Text style={paragraph}>{t.paragraph1}</Text>
            <Text style={paragraph}>{t.paragraph2}</Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                {t.cta}
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={alternativeText}>{t.alternativeText}</Text>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>

            <Hr style={hr} />

            <Section style={infoSection}>
              <Text style={infoTitle}>{t.requestInfo}</Text>
              <Text style={infoText}>
                {t.ipLabel} {ipAddress}
              </Text>
              <Text style={infoText}>
                {t.locationLabel} {location}
              </Text>
              <Text style={infoText}>
                {t.timeLabel} {currentTime}
              </Text>
            </Section>

            <Section style={securitySection}>
              <Text style={securityTitle}>{t.securityTitle}</Text>
              <Text style={securityText}>{t.securityText}</Text>
            </Section>

            <Text style={supportText}>{t.supportText}</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>{t.footer}</Text>
            <Text style={footerText}>{t.footerAddress}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordReset;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "0 48px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
};

const title = {
  fontSize: "28px",
  lineHeight: "36px",
  fontWeight: "700",
  color: "#1a1a1a",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
  marginBottom: "16px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const alternativeText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
  marginBottom: "8px",
};

const link = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const infoSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "24px",
};

const infoTitle = {
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "12px",
};

const infoText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
  margin: "4px 0",
};

const securitySection = {
  backgroundColor: "#fff0f0",
  border: "1px solid #ffc9c9",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "24px",
};

const securityTitle = {
  fontSize: "16px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#e74c3c",
  marginBottom: "8px",
};

const securityText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
  margin: "0",
};

const supportText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
  marginTop: "24px",
  textAlign: "center" as const,
};

const footer = {
  padding: "0 48px",
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
  marginBottom: "8px",
};

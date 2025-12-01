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

interface VerifyEmailProps {
  name: string;
  locale?: "en" | "ar";
  verificationUrl?: string;
  verificationCode?: string;
}

export const VerifyEmail = ({
  name,
  locale = "en",
  verificationUrl = "https://legaldocs.app/verify",
  verificationCode = "123456",
}: VerifyEmailProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: "Verify your email address for LegalDocs",
      greeting: `Hi ${name},`,
      title: "Verify Your Email Address",
      paragraph1:
        "Thank you for signing up for LegalDocs. To complete your registration and secure your account, please verify your email address.",
      paragraph2:
        "Click the button below to verify your email, or use the verification code:",
      cta: "Verify Email Address",
      codeLabel: "Verification Code:",
      alternativeText: "Or copy and paste this URL into your browser:",
      expiryText: "This link will expire in 24 hours.",
      securityTitle: "Security Notice",
      securityText:
        "If you didn't create an account with LegalDocs, please ignore this email or contact our support team if you have concerns.",
      footer: "LegalDocs - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: "تحقق من عنوان بريدك الإلكتروني لـ LegalDocs",
      greeting: `مرحباً ${name}،`,
      title: "تحقق من عنوان بريدك الإلكتروني",
      paragraph1:
        "شكراً لك على التسجيل في LegalDocs. لإكمال تسجيلك وتأمين حسابك، يرجى التحقق من عنوان بريدك الإلكتروني.",
      paragraph2:
        "انقر على الزر أدناه للتحقق من بريدك الإلكتروني، أو استخدم رمز التحقق:",
      cta: "تحقق من البريد الإلكتروني",
      codeLabel: "رمز التحقق:",
      alternativeText: "أو انسخ والصق هذا الرابط في متصفحك:",
      expiryText: "سينتهي صلاحية هذا الرابط خلال 24 ساعة.",
      securityTitle: "إشعار أمني",
      securityText:
        "إذا لم تقم بإنشاء حساب في LegalDocs، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بفريق الدعم لدينا إذا كانت لديك مخاوف.",
      footer: "LegalDocs - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];

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
              <Button style={button} href={verificationUrl}>
                {t.cta}
              </Button>
            </Section>

            <Section style={codeContainer}>
              <Text style={codeLabel}>{t.codeLabel}</Text>
              <Text style={code}>{verificationCode}</Text>
            </Section>

            <Hr style={hr} />

            <Text style={alternativeText}>{t.alternativeText}</Text>
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>

            <Text style={expiryText}>{t.expiryText}</Text>

            <Hr style={hr} />

            <Section style={securitySection}>
              <Text style={securityTitle}>{t.securityTitle}</Text>
              <Text style={securityText}>{t.securityText}</Text>
            </Section>
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

export default VerifyEmail;

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

const codeContainer = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const codeLabel = {
  fontSize: "14px",
  color: "#525f7f",
  marginBottom: "8px",
};

const code = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1a1a1a",
  letterSpacing: "4px",
  fontFamily: "monospace",
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

const expiryText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#e74c3c",
  marginTop: "16px",
  fontWeight: "500",
};

const securitySection = {
  backgroundColor: "#fff9f0",
  border: "1px solid #ffd699",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "24px",
};

const securityTitle = {
  fontSize: "16px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#f39c12",
  marginBottom: "8px",
};

const securityText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
  margin: "0",
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

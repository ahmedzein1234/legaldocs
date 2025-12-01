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

interface SignatureRequestProps {
  recipientName: string;
  senderName: string;
  documentName: string;
  documentType?: string;
  locale?: "en" | "ar";
  signUrl?: string;
  dueDate?: string;
  message?: string;
}

export const SignatureRequest = ({
  recipientName,
  senderName,
  documentName,
  documentType = "Legal Document",
  locale = "en",
  signUrl = "https://legaldocs.app/sign",
  dueDate,
  message,
}: SignatureRequestProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: `${senderName} has requested your signature on ${documentName}`,
      greeting: `Hi ${recipientName},`,
      title: "Signature Required",
      paragraph1: `${senderName} has sent you a document that requires your signature.`,
      documentLabel: "Document:",
      typeLabel: "Type:",
      dueDateLabel: "Due Date:",
      messageLabel: "Message from sender:",
      cta: "Review & Sign Document",
      instructions:
        "Click the button above to review the document and add your signature. You can sign electronically with a secure digital signature.",
      securityNote:
        "This document is protected with end-to-end encryption. Your signature will be legally binding.",
      helpText:
        "Need help signing? Visit our help center or contact support@legaldocs.app",
      footer: "LegalDocs - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: `${senderName} طلب توقيعك على ${documentName}`,
      greeting: `مرحباً ${recipientName}،`,
      title: "التوقيع مطلوب",
      paragraph1: `أرسل لك ${senderName} مستنداً يتطلب توقيعك.`,
      documentLabel: "المستند:",
      typeLabel: "النوع:",
      dueDateLabel: "تاريخ الاستحقاق:",
      messageLabel: "رسالة من المرسل:",
      cta: "مراجعة وتوقيع المستند",
      instructions:
        "انقر على الزر أعلاه لمراجعة المستند وإضافة توقيعك. يمكنك التوقيع إلكترونياً بتوقيع رقمي آمن.",
      securityNote:
        "هذا المستند محمي بالتشفير من طرف إلى طرف. سيكون توقيعك ملزماً قانونياً.",
      helpText:
        "هل تحتاج إلى مساعدة في التوقيع؟ قم بزيارة مركز المساعدة أو اتصل بـ support@legaldocs.app",
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

            <Section style={documentSection}>
              <Section style={documentHeader}>
                <Img
                  src="https://legaldocs.app/icons/document.png"
                  width="48"
                  height="48"
                  alt="Document"
                  style={documentIcon}
                />
              </Section>
              <Text style={documentLabel}>{t.documentLabel}</Text>
              <Text style={documentName}>{documentName}</Text>
              <Text style={documentMeta}>
                {t.typeLabel} {documentType}
              </Text>
              {dueDate && (
                <Text style={dueDate ? dueDateText : documentMeta}>
                  {t.dueDateLabel} {dueDate}
                </Text>
              )}
            </Section>

            {message && (
              <Section style={messageSection}>
                <Text style={messageLabel}>{t.messageLabel}</Text>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={signUrl}>
                {t.cta}
              </Button>
            </Section>

            <Text style={instructions}>{t.instructions}</Text>

            <Hr style={hr} />

            <Section style={securitySection}>
              <Text style={securityNote}>🔒 {t.securityNote}</Text>
            </Section>

            <Text style={helpText}>{t.helpText}</Text>
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

export default SignatureRequest;

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

const documentSection = {
  backgroundColor: "#f6f9fc",
  border: "2px solid #2563eb",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const documentHeader = {
  marginBottom: "16px",
};

const documentIcon = {
  margin: "0 auto",
};

const documentLabel = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "8px",
};

const documentName = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "12px",
};

const documentMeta = {
  fontSize: "14px",
  color: "#525f7f",
  margin: "4px 0",
};

const dueDateText = {
  fontSize: "14px",
  color: "#e74c3c",
  fontWeight: "500",
  margin: "4px 0",
};

const messageSection = {
  backgroundColor: "#fff9f0",
  borderLeft: "4px solid #f39c12",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const messageLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const messageText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
  margin: "0",
  fontStyle: "italic",
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

const instructions = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
  textAlign: "center" as const,
  marginTop: "16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const securitySection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const securityNote = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#27ae60",
  fontWeight: "500",
};

const helpText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
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

import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface DocumentSignedProps {
  recipientName: string;
  signerName: string;
  documentName: string;
  locale?: "en" | "ar";
  documentUrl?: string;
  signedAt?: string;
  remainingSigners?: string[];
}

export const DocumentSigned = ({
  recipientName,
  signerName,
  documentName,
  locale = "en",
  documentUrl = "https://legaldocs.app/documents",
  signedAt,
  remainingSigners = [],
}: DocumentSignedProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: `${signerName} has signed ${documentName}`,
      greeting: `Hi ${recipientName},`,
      title: "Document Signed",
      paragraph1: `Good news! ${signerName} has signed the document "${documentName}".`,
      signedAtLabel: "Signed at:",
      statusTitle: "Signature Status",
      allSignedText: "All parties have signed this document. It is now complete and legally binding.",
      pendingText: "Waiting for signatures from:",
      cta: "View Document",
      nextSteps: "What's Next?",
      nextStepsText:
        "You will receive another notification once all parties have signed the document. The finalized document will be available in your dashboard.",
      footer: "LegalDocs - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: `${signerName} وقع ${documentName}`,
      greeting: `مرحباً ${recipientName}،`,
      title: "تم توقيع المستند",
      paragraph1: `أخبار جيدة! ${signerName} وقع المستند "${documentName}".`,
      signedAtLabel: "تم التوقيع في:",
      statusTitle: "حالة التوقيع",
      allSignedText: "وقعت جميع الأطراف على هذا المستند. إنه الآن كامل وملزم قانونياً.",
      pendingText: "في انتظار التوقيعات من:",
      cta: "عرض المستند",
      nextSteps: "ما التالي؟",
      nextStepsText:
        "ستتلقى إشعاراً آخر بمجرد أن توقع جميع الأطراف على المستند. سيكون المستند النهائي متاحاً في لوحة التحكم الخاصة بك.",
      footer: "LegalDocs - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const timestamp = signedAt || new Date().toLocaleString(locale === "ar" ? "ar-SA" : "en-US");

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

            <Section style={successSection}>
              <Section style={iconContainer}>
                <Text style={checkmark}>✓</Text>
              </Section>
              <Text style={signerName}>{signerName}</Text>
              <Text style={signedLabel}>{t.signedAtLabel}</Text>
              <Text style={timestamp}>{timestamp}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={statusSection}>
              <Text style={statusTitle}>{t.statusTitle}</Text>
              {remainingSigners.length === 0 ? (
                <Section style={completeSection}>
                  <Text style={completeText}>🎉 {t.allSignedText}</Text>
                </Section>
              ) : (
                <>
                  <Text style={pendingText}>{t.pendingText}</Text>
                  <Section style={signersList}>
                    {remainingSigners.map((signer, index) => (
                      <Text key={index} style={signerItem}>
                        • {signer}
                      </Text>
                    ))}
                  </Section>
                </>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={documentUrl}>
                {t.cta}
              </Button>
            </Section>

            {remainingSigners.length > 0 && (
              <>
                <Hr style={hr} />
                <Section style={nextStepsSection}>
                  <Text style={nextStepsTitle}>{t.nextSteps}</Text>
                  <Text style={nextStepsText}>{t.nextStepsText}</Text>
                </Section>
              </>
            )}
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

export default DocumentSigned;

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

const successSection = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #27ae60",
  borderRadius: "12px",
  padding: "32px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const iconContainer = {
  marginBottom: "16px",
};

const checkmark = {
  fontSize: "48px",
  color: "#27ae60",
  margin: "0",
};

const signerName = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const signedLabel = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "4px",
};

const timestamp = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#525f7f",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const statusSection = {
  margin: "24px 0",
};

const statusTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const completeSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
};

const completeText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#27ae60",
  fontWeight: "500",
  margin: "0",
};

const pendingText = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "12px",
};

const signersList = {
  backgroundColor: "#fff9f0",
  borderRadius: "8px",
  padding: "16px",
};

const signerItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#525f7f",
  margin: "4px 0",
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

const nextStepsSection = {
  marginTop: "24px",
};

const nextStepsTitle = {
  fontSize: "16px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const nextStepsText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
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

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

interface SignatureCompleteProps {
  recipientName: string;
  documentName: string;
  locale?: "en" | "ar";
  documentUrl?: string;
  downloadUrl?: string;
  completedAt?: string;
  signers?: Array<{ name: string; signedAt: string }>;
}

export const SignatureComplete = ({
  recipientName,
  documentName,
  locale = "en",
  documentUrl = "https://qannoni.com/documents",
  downloadUrl = "https://qannoni.com/download",
  completedAt,
  signers = [],
}: SignatureCompleteProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: `All signatures collected for ${documentName}`,
      greeting: `Hi ${recipientName},`,
      title: "Document Fully Executed",
      paragraph1: `Great news! All parties have signed "${documentName}". The document is now legally binding and fully executed.`,
      completedLabel: "Completed on:",
      signersTitle: "All Signatories:",
      ctaPrimary: "View Document",
      ctaSecondary: "Download PDF",
      nextSteps: "What You Can Do:",
      step1: "Download the fully executed document",
      step2: "Share the document with relevant parties",
      step3: "Store it securely in your dashboard",
      step4: "Access it anytime from your documents library",
      legalNote:
        "This document has been secured with blockchain-verified digital signatures and is legally binding under GCC electronic signature laws.",
      helpText: "Need a certified copy? Contact support@qannoni.com",
      footer: "Qannoni - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: `تم جمع جميع التوقيعات لـ ${documentName}`,
      greeting: `مرحباً ${recipientName}،`,
      title: "تم تنفيذ المستند بالكامل",
      paragraph1: `أخبار رائعة! وقعت جميع الأطراف على "${documentName}". المستند الآن ملزم قانونياً وتم تنفيذه بالكامل.`,
      completedLabel: "اكتمل في:",
      signersTitle: "جميع الموقعين:",
      ctaPrimary: "عرض المستند",
      ctaSecondary: "تحميل PDF",
      nextSteps: "ما يمكنك القيام به:",
      step1: "تحميل المستند المنفذ بالكامل",
      step2: "مشاركة المستند مع الأطراف ذات الصلة",
      step3: "تخزينه بشكل آمن في لوحة التحكم الخاصة بك",
      step4: "الوصول إليه في أي وقت من مكتبة المستندات الخاصة بك",
      legalNote:
        "تم تأمين هذا المستند بتوقيعات رقمية تم التحقق منها بواسطة blockchain وهو ملزم قانونياً بموجب قوانين التوقيع الإلكتروني في دول مجلس التعاون الخليجي.",
      helpText: "هل تحتاج إلى نسخة معتمدة؟ اتصل بـ support@qannoni.com",
      footer: "Qannoni - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const timestamp = completedAt || new Date().toLocaleString(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <Html dir={isRTL ? "rtl" : "ltr"} lang={locale}>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://qannoni.com/logo.png"
              width="150"
              height="50"
              alt="Qannoni"
              style={logo}
            />
          </Section>
          <Section style={content}>
            <Text style={greeting}>{t.greeting}</Text>

            <Section style={celebrationSection}>
              <Text style={celebrationIcon}>🎉</Text>
              <Text style={title}>{t.title}</Text>
            </Section>

            <Text style={paragraph}>{t.paragraph1}</Text>

            <Section style={completedSection}>
              <Text style={completedLabel}>{t.completedLabel}</Text>
              <Text style={timestamp}>{timestamp}</Text>
            </Section>

            <Section style={signersSection}>
              <Text style={signersTitle}>{t.signersTitle}</Text>
              {signers.map((signer, index) => (
                <Section key={index} style={signerCard}>
                  <Text style={signerName}>✓ {signer.name}</Text>
                  <Text style={signerDate}>{signer.signedAt}</Text>
                </Section>
              ))}
            </Section>

            <Section style={buttonGroup}>
              <Button style={buttonPrimary} href={documentUrl}>
                {t.ctaPrimary}
              </Button>
              <Button style={buttonSecondary} href={downloadUrl}>
                {t.ctaSecondary}
              </Button>
            </Section>

            <Hr style={hr} />

            <Section style={stepsSection}>
              <Text style={stepsTitle}>{t.nextSteps}</Text>
              <Text style={step}>1. {t.step1}</Text>
              <Text style={step}>2. {t.step2}</Text>
              <Text style={step}>3. {t.step3}</Text>
              <Text style={step}>4. {t.step4}</Text>
            </Section>

            <Section style={legalSection}>
              <Text style={legalNote}>⚖️ {t.legalNote}</Text>
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

export default SignatureComplete;

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

const celebrationSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const celebrationIcon = {
  fontSize: "64px",
  margin: "0 0 16px 0",
};

const title = {
  fontSize: "28px",
  lineHeight: "36px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const completedSection = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #27ae60",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const completedLabel = {
  fontSize: "14px",
  color: "#27ae60",
  fontWeight: "600",
  marginBottom: "8px",
};

const timestamp = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const signersSection = {
  margin: "32px 0",
};

const signersTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const signerCard = {
  backgroundColor: "#f6f9fc",
  borderLeft: "4px solid #27ae60",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const signerName = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "4px",
};

const signerDate = {
  fontSize: "14px",
  color: "#8898aa",
  margin: "0",
};

const buttonGroup = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const buttonPrimary = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  margin: "8px",
};

const buttonSecondary = {
  backgroundColor: "#ffffff",
  border: "2px solid #2563eb",
  borderRadius: "8px",
  color: "#2563eb",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  margin: "8px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const stepsSection = {
  marginBottom: "24px",
};

const stepsTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const step = {
  fontSize: "15px",
  lineHeight: "28px",
  color: "#525f7f",
  margin: "8px 0",
};

const legalSection = {
  backgroundColor: "#f0f4ff",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const legalNote = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#2563eb",
  margin: "0",
};

const helpText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
  textAlign: "center" as const,
  marginTop: "16px",
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

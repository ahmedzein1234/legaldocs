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

interface WelcomeEmailProps {
  name: string;
  locale?: "en" | "ar";
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  name,
  locale = "en",
  dashboardUrl = "https://legaldocs.app/dashboard",
}: WelcomeEmailProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: "Welcome to LegalDocs - Your AI-Powered Legal Document Platform",
      greeting: `Hi ${name},`,
      title: "Welcome to LegalDocs!",
      paragraph1:
        "We're thrilled to have you on board. LegalDocs is your trusted AI-powered platform for creating, managing, and signing legal documents across the GCC region.",
      paragraph2: "Here's what you can do with LegalDocs:",
      feature1: "Create legally compliant documents in Arabic, English, and Urdu",
      feature2: "E-sign documents with secure digital signatures",
      feature3: "Consult with verified legal professionals",
      feature4: "Track and manage all your legal documents in one place",
      cta: "Go to Dashboard",
      helpTitle: "Need Help?",
      helpText:
        "Our support team is here to assist you. Visit our help center or contact us anytime.",
      footer: "LegalDocs - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
      unsubscribe: "Unsubscribe from these emails",
    },
    ar: {
      preview: "مرحباً بك في LegalDocs - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي",
      greeting: `مرحباً ${name}،`,
      title: "مرحباً بك في LegalDocs!",
      paragraph1:
        "يسعدنا انضمامك إلينا. LegalDocs هي منصتك الموثوقة المدعومة بالذكاء الاصطناعي لإنشاء وإدارة وتوقيع المستندات القانونية في منطقة دول مجلس التعاون الخليجي.",
      paragraph2: "إليك ما يمكنك القيام به مع LegalDocs:",
      feature1: "إنشاء مستندات متوافقة قانونياً بالعربية والإنجليزية والأردية",
      feature2: "التوقيع الإلكتروني على المستندات بتوقيعات رقمية آمنة",
      feature3: "استشارة متخصصين قانونيين معتمدين",
      feature4: "تتبع وإدارة جميع مستنداتك القانونية في مكان واحد",
      cta: "الذهاب إلى لوحة التحكم",
      helpTitle: "هل تحتاج إلى مساعدة؟",
      helpText:
        "فريق الدعم لدينا هنا لمساعدتك. قم بزيارة مركز المساعدة أو اتصل بنا في أي وقت.",
      footer: "LegalDocs - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
      unsubscribe: "إلغاء الاشتراك في هذه الرسائل",
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
            <Section style={featureList}>
              <Text style={feature}>✓ {t.feature1}</Text>
              <Text style={feature}>✓ {t.feature2}</Text>
              <Text style={feature}>✓ {t.feature3}</Text>
              <Text style={feature}>✓ {t.feature4}</Text>
            </Section>
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                {t.cta}
              </Button>
            </Section>
            <Hr style={hr} />
            <Text style={helpTitle}>{t.helpTitle}</Text>
            <Text style={helpText}>{t.helpText}</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>{t.footer}</Text>
            <Text style={footerText}>{t.footerAddress}</Text>
            <Link href="https://legaldocs.app/unsubscribe" style={link}>
              {t.unsubscribe}
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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

const featureList = {
  margin: "24px 0",
};

const feature = {
  fontSize: "16px",
  lineHeight: "28px",
  color: "#525f7f",
  margin: "8px 0",
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

const helpTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const helpText = {
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

const link = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "underline",
};

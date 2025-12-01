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

interface LawyerVerificationProps {
  lawyerName: string;
  locale?: "en" | "ar";
  dashboardUrl?: string;
  licenseNumber?: string;
  specialties?: string[];
  verificationDate?: string;
}

export const LawyerVerification = ({
  lawyerName,
  locale = "en",
  dashboardUrl = "https://qannoni.com/lawyer-portal",
  licenseNumber,
  specialties = [],
  verificationDate,
}: LawyerVerificationProps) => {
  const isRTL = locale === "ar";

  const content = {
    en: {
      preview: "Your lawyer account has been verified - Welcome to Qannoni",
      greeting: `Dear ${lawyerName},`,
      title: "Account Verified!",
      paragraph1:
        "Congratulations! Your lawyer account has been successfully verified. You can now start offering legal consultations and connecting with clients through the Qannoni platform.",
      verificationLabel: "Verification Details:",
      licenseLabel: "License Number:",
      specialtiesLabel: "Verified Specialties:",
      dateLabel: "Verification Date:",
      cta: "Access Lawyer Portal",
      benefitsTitle: "What You Can Do Now:",
      benefit1: "Create and manage your professional profile",
      benefit2: "Set your consultation availability and pricing",
      benefit3: "Receive consultation requests from verified clients",
      benefit4: "Access the AI-powered document management system",
      benefit5: "Track your earnings and consultation history",
      benefit6: "Build your reputation with client reviews",
      guidelinesTitle: "Professional Guidelines:",
      guideline1: "Maintain client confidentiality at all times",
      guideline2: "Respond to consultation requests within 24 hours",
      guideline3: "Provide accurate and professional legal advice",
      guideline4: "Keep your availability calendar up to date",
      guideline5: "Follow the Qannoni code of professional conduct",
      supportTitle: "Getting Started:",
      supportText:
        "We recommend completing your profile and setting up your availability right away. Check out our lawyer portal guide for tips on maximizing your success on the platform.",
      helpText: "Questions? Contact our lawyer support team at lawyers@qannoni.com",
      footer: "Qannoni - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: "تم التحقق من حساب المحامي الخاص بك - مرحباً بك في Qannoni",
      greeting: `عزيزي ${lawyerName}،`,
      title: "تم التحقق من الحساب!",
      paragraph1:
        "تهانينا! تم التحقق من حساب المحامي الخاص بك بنجاح. يمكنك الآن البدء في تقديم الاستشارات القانونية والتواصل مع العملاء من خلال منصة Qannoni.",
      verificationLabel: "تفاصيل التحقق:",
      licenseLabel: "رقم الترخيص:",
      specialtiesLabel: "التخصصات المعتمدة:",
      dateLabel: "تاريخ التحقق:",
      cta: "الوصول إلى بوابة المحامين",
      benefitsTitle: "ما يمكنك القيام به الآن:",
      benefit1: "إنشاء وإدارة ملفك المهني",
      benefit2: "تحديد توفرك وأسعار الاستشارات",
      benefit3: "تلقي طلبات الاستشارة من العملاء المعتمدين",
      benefit4: "الوصول إلى نظام إدارة المستندات المدعوم بالذكاء الاصطناعي",
      benefit5: "تتبع أرباحك وسجل الاستشارات",
      benefit6: "بناء سمعتك من خلال تقييمات العملاء",
      guidelinesTitle: "الإرشادات المهنية:",
      guideline1: "حافظ على سرية العميل في جميع الأوقات",
      guideline2: "الرد على طلبات الاستشارة خلال 24 ساعة",
      guideline3: "تقديم مشورة قانونية دقيقة ومهنية",
      guideline4: "حافظ على تحديث تقويم التوفر الخاص بك",
      guideline5: "اتبع قواعد السلوك المهني في Qannoni",
      supportTitle: "البدء:",
      supportText:
        "نوصي بإكمال ملفك الشخصي وإعداد توفرك على الفور. تحقق من دليل بوابة المحامين للحصول على نصائح لتحقيق أقصى نجاح على المنصة.",
      helpText: "أسئلة؟ اتصل بفريق دعم المحامين لدينا على lawyers@qannoni.com",
      footer: "Qannoni - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const timestamp = verificationDate || new Date().toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");

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

            <Section style={verificationBanner}>
              <Text style={verificationIcon}>✓</Text>
              <Text style={title}>{t.title}</Text>
            </Section>

            <Text style={paragraph}>{t.paragraph1}</Text>

            <Section style={verificationSection}>
              <Text style={verificationTitle}>{t.verificationLabel}</Text>

              {licenseNumber && (
                <Section style={verificationDetail}>
                  <Text style={detailLabel}>{t.licenseLabel}</Text>
                  <Text style={detailValue}>{licenseNumber}</Text>
                </Section>
              )}

              {specialties.length > 0 && (
                <Section style={verificationDetail}>
                  <Text style={detailLabel}>{t.specialtiesLabel}</Text>
                  {specialties.map((specialty, index) => (
                    <Text key={index} style={specialtyItem}>
                      • {specialty}
                    </Text>
                  ))}
                </Section>
              )}

              <Section style={verificationDetail}>
                <Text style={detailLabel}>{t.dateLabel}</Text>
                <Text style={detailValue}>{timestamp}</Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                {t.cta}
              </Button>
            </Section>

            <Hr style={hr} />

            <Section style={benefitsSection}>
              <Text style={sectionTitle}>{t.benefitsTitle}</Text>
              <Text style={benefitItem}>✓ {t.benefit1}</Text>
              <Text style={benefitItem}>✓ {t.benefit2}</Text>
              <Text style={benefitItem}>✓ {t.benefit3}</Text>
              <Text style={benefitItem}>✓ {t.benefit4}</Text>
              <Text style={benefitItem}>✓ {t.benefit5}</Text>
              <Text style={benefitItem}>✓ {t.benefit6}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={guidelinesSection}>
              <Text style={sectionTitle}>{t.guidelinesTitle}</Text>
              <Text style={guidelineItem}>1. {t.guideline1}</Text>
              <Text style={guidelineItem}>2. {t.guideline2}</Text>
              <Text style={guidelineItem}>3. {t.guideline3}</Text>
              <Text style={guidelineItem}>4. {t.guideline4}</Text>
              <Text style={guidelineItem}>5. {t.guideline5}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={supportSection}>
              <Text style={supportTitle}>{t.supportTitle}</Text>
              <Text style={supportText}>{t.supportText}</Text>
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

export default LawyerVerification;

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

const verificationBanner = {
  background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
  borderRadius: "12px",
  padding: "32px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const verificationIcon = {
  fontSize: "64px",
  color: "#ffffff",
  marginBottom: "16px",
};

const title = {
  fontSize: "32px",
  lineHeight: "40px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
  marginBottom: "24px",
};

const verificationSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const verificationTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const verificationDetail = {
  marginBottom: "16px",
};

const detailLabel = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "4px",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const specialtyItem = {
  fontSize: "15px",
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
  padding: "14px 40px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const benefitsSection = {
  marginBottom: "24px",
};

const sectionTitle = {
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const benefitItem = {
  fontSize: "15px",
  lineHeight: "28px",
  color: "#525f7f",
  margin: "8px 0",
};

const guidelinesSection = {
  backgroundColor: "#fff9f0",
  border: "2px solid #f39c12",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const guidelineItem = {
  fontSize: "15px",
  lineHeight: "28px",
  color: "#525f7f",
  margin: "8px 0",
};

const supportSection = {
  marginBottom: "24px",
};

const supportTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const supportText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#525f7f",
};

const helpText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#8898aa",
  textAlign: "center" as const,
  marginTop: "24px",
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

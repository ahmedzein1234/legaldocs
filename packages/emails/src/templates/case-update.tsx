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

interface CaseUpdateProps {
  clientName: string;
  caseName: string;
  caseNumber?: string;
  updateType: "status_change" | "new_document" | "deadline" | "general";
  locale?: "en" | "ar";
  updateTitle: string;
  updateMessage: string;
  previousStatus?: string;
  newStatus?: string;
  updatedBy?: string;
  caseUrl?: string;
  actionRequired?: boolean;
  actionText?: string;
  actionUrl?: string;
  deadline?: string;
}

export const CaseUpdate = ({
  clientName,
  caseName,
  caseNumber,
  updateType,
  locale = "en",
  updateTitle,
  updateMessage,
  previousStatus,
  newStatus,
  updatedBy,
  caseUrl = "https://qannoni.com/cases",
  actionRequired = false,
  actionText,
  actionUrl,
  deadline,
}: CaseUpdateProps) => {
  const isRTL = locale === "ar";

  const updateTypeLabels = {
    en: {
      status_change: "Status Update",
      new_document: "New Document",
      deadline: "Deadline Notice",
      general: "Case Update",
    },
    ar: {
      status_change: "تحديث الحالة",
      new_document: "مستند جديد",
      deadline: "إشعار الموعد النهائي",
      general: "تحديث الحالة",
    },
  };

  const content = {
    en: {
      preview: `Update on your case: ${caseName}`,
      greeting: `Hi ${clientName},`,
      title: "Case Update",
      caseLabel: "Case:",
      caseNumberLabel: "Case Number:",
      updateTypeLabel: "Update Type:",
      statusChangeLabel: "Status Changed:",
      from: "From:",
      to: "To:",
      updatedByLabel: "Updated by:",
      deadlineLabel: "Important Deadline:",
      actionRequiredBanner: "Action Required",
      actionRequiredText: "This update requires your attention. Please review and take necessary action.",
      cta: "View Case Details",
      actionCta: actionText || "Take Action",
      nextSteps: "What's Next:",
      nextStepsText:
        "Review the update details and any attached documents. If you have questions, contact your legal advisor or our support team.",
      footer: "Qannoni - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: `تحديث على قضيتك: ${caseName}`,
      greeting: `مرحباً ${clientName}،`,
      title: "تحديث القضية",
      caseLabel: "القضية:",
      caseNumberLabel: "رقم القضية:",
      updateTypeLabel: "نوع التحديث:",
      statusChangeLabel: "تغيرت الحالة:",
      from: "من:",
      to: "إلى:",
      updatedByLabel: "تم التحديث بواسطة:",
      deadlineLabel: "الموعد النهائي المهم:",
      actionRequiredBanner: "مطلوب إجراء",
      actionRequiredText: "يتطلب هذا التحديث اهتمامك. يرجى المراجعة واتخاذ الإجراء اللازم.",
      cta: "عرض تفاصيل القضية",
      actionCta: actionText || "اتخذ إجراء",
      nextSteps: "ما التالي:",
      nextStepsText:
        "راجع تفاصيل التحديث وأي مستندات مرفقة. إذا كانت لديك أسئلة، اتصل بمستشارك القانوني أو فريق الدعم لدينا.",
      footer: "Qannoni - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const updateTypeLabel = updateTypeLabels[locale][updateType];

  // Select icon based on update type
  const getUpdateIcon = () => {
    switch (updateType) {
      case "status_change":
        return "🔄";
      case "new_document":
        return "📄";
      case "deadline":
        return "⏰";
      default:
        return "ℹ️";
    }
  };

  const updateIcon = getUpdateIcon();

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

            <Section style={updateHeader}>
              <Text style={updateIconText}>{updateIcon}</Text>
              <Text style={title}>{t.title}</Text>
            </Section>

            {actionRequired && (
              <Section style={actionRequiredSection}>
                <Text style={actionRequiredTitle}>⚠️ {t.actionRequiredBanner}</Text>
                <Text style={actionRequiredText}>{t.actionRequiredText}</Text>
              </Section>
            )}

            <Section style={caseInfoSection}>
              <Text style={caseLabel}>{t.caseLabel}</Text>
              <Text style={caseName}>{caseName}</Text>
              {caseNumber && (
                <Text style={caseNumber}>
                  {t.caseNumberLabel} {caseNumber}
                </Text>
              )}
            </Section>

            <Section style={updateSection}>
              <Text style={updateTypeText}>
                {t.updateTypeLabel} {updateTypeLabel}
              </Text>

              <Hr style={sectionHr} />

              <Text style={updateTitleText}>{updateTitle}</Text>
              <Text style={updateMessageText}>{updateMessage}</Text>

              {updateType === "status_change" && previousStatus && newStatus && (
                <Section style={statusChangeSection}>
                  <Text style={statusChangeLabel}>{t.statusChangeLabel}</Text>
                  <Section style={statusFlow}>
                    <Section style={statusBox}>
                      <Text style={statusLabel}>{t.from}</Text>
                      <Text style={statusValue}>{previousStatus}</Text>
                    </Section>
                    <Text style={arrow}>→</Text>
                    <Section style={statusBox}>
                      <Text style={statusLabel}>{t.to}</Text>
                      <Text style={statusValueNew}>{newStatus}</Text>
                    </Section>
                  </Section>
                </Section>
              )}

              {deadline && (
                <Section style={deadlineSection}>
                  <Text style={deadlineTitle}>{t.deadlineLabel}</Text>
                  <Text style={deadlineText}>{deadline}</Text>
                </Section>
              )}

              {updatedBy && (
                <Text style={updatedByText}>
                  {t.updatedByLabel} {updatedBy}
                </Text>
              )}
            </Section>

            <Section style={buttonGroup}>
              <Button style={buttonPrimary} href={caseUrl}>
                {t.cta}
              </Button>
              {actionRequired && actionUrl && (
                <Button style={buttonAction} href={actionUrl}>
                  {t.actionCta}
                </Button>
              )}
            </Section>

            <Hr style={hr} />

            <Section style={nextStepsSection}>
              <Text style={nextStepsTitle}>{t.nextSteps}</Text>
              <Text style={nextStepsText}>{t.nextStepsText}</Text>
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

export default CaseUpdate;

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

const updateHeader = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const updateIconText = {
  fontSize: "48px",
  marginBottom: "8px",
};

const title = {
  fontSize: "28px",
  lineHeight: "36px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const actionRequiredSection = {
  backgroundColor: "#fff0f0",
  border: "2px solid #e74c3c",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const actionRequiredTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#e74c3c",
  marginBottom: "8px",
};

const actionRequiredText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
  margin: "0",
};

const caseInfoSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const caseLabel = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "8px",
};

const caseName = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "4px",
};

const caseNumber = {
  fontSize: "14px",
  color: "#525f7f",
  margin: "0",
};

const updateSection = {
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const updateTypeText = {
  fontSize: "14px",
  color: "#2563eb",
  fontWeight: "600",
  marginBottom: "8px",
};

const sectionHr = {
  borderColor: "#e6ebf1",
  margin: "16px 0",
};

const updateTitleText = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "12px",
};

const updateMessageText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#525f7f",
  marginBottom: "16px",
};

const statusChangeSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
};

const statusChangeLabel = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "12px",
  textAlign: "center" as const,
};

const statusFlow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
};

const statusBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "6px",
  padding: "12px",
  flex: "1",
};

const statusLabel = {
  fontSize: "12px",
  color: "#8898aa",
  marginBottom: "4px",
};

const statusValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#525f7f",
  margin: "0",
};

const statusValueNew = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#27ae60",
  margin: "0",
};

const arrow = {
  fontSize: "24px",
  color: "#2563eb",
  fontWeight: "bold",
};

const deadlineSection = {
  backgroundColor: "#fff9f0",
  border: "1px solid #f39c12",
  borderRadius: "6px",
  padding: "12px",
  marginTop: "16px",
  textAlign: "center" as const,
};

const deadlineTitle = {
  fontSize: "14px",
  color: "#f39c12",
  fontWeight: "600",
  marginBottom: "4px",
};

const deadlineText = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const updatedByText = {
  fontSize: "14px",
  color: "#8898aa",
  marginTop: "16px",
  fontStyle: "italic",
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

const buttonAction = {
  backgroundColor: "#27ae60",
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

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const nextStepsSection = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "20px",
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

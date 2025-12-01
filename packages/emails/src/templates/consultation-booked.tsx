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

interface ConsultationBookedProps {
  clientName: string;
  lawyerName: string;
  lawyerSpecialty?: string;
  locale?: "en" | "ar";
  consultationDate: string;
  consultationTime: string;
  duration?: string;
  meetingUrl?: string;
  consultationType?: "video" | "phone" | "in-person";
  notes?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
}

export const ConsultationBooked = ({
  clientName,
  lawyerName,
  lawyerSpecialty,
  locale = "en",
  consultationDate,
  consultationTime,
  duration = "30 minutes",
  meetingUrl = "https://qannoni.com/consultation",
  consultationType = "video",
  notes,
  rescheduleUrl = "https://qannoni.com/reschedule",
  cancelUrl = "https://qannoni.com/cancel",
}: ConsultationBookedProps) => {
  const isRTL = locale === "ar";

  const consultationTypeLabels = {
    en: {
      video: "Video Call",
      phone: "Phone Call",
      "in-person": "In-Person Meeting",
    },
    ar: {
      video: "مكالمة فيديو",
      phone: "مكالمة هاتفية",
      "in-person": "اجتماع شخصي",
    },
  };

  const content = {
    en: {
      preview: `Your consultation with ${lawyerName} is confirmed`,
      greeting: `Hi ${clientName},`,
      title: "Consultation Confirmed",
      paragraph1: `Your legal consultation has been successfully booked. We look forward to helping you with your legal needs.`,
      detailsTitle: "Consultation Details:",
      lawyerLabel: "Legal Advisor:",
      specialtyLabel: "Specialty:",
      dateLabel: "Date:",
      timeLabel: "Time:",
      durationLabel: "Duration:",
      typeLabel: "Type:",
      notesLabel: "Additional Notes:",
      cta: "Join Consultation",
      preparationTitle: "How to Prepare:",
      prep1: "Gather any relevant documents or information",
      prep2: "Prepare a list of questions you'd like to discuss",
      prep3: "Join the meeting 5 minutes early to test your connection",
      prep4: "Ensure you're in a quiet, private location",
      calendarText: "Add to your calendar to receive reminders",
      rescheduleText: "Need to reschedule or cancel?",
      reschedule: "Reschedule",
      cancel: "Cancel Consultation",
      footer: "Qannoni - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: `تم تأكيد استشارتك مع ${lawyerName}`,
      greeting: `مرحباً ${clientName}،`,
      title: "تم تأكيد الاستشارة",
      paragraph1: `تم حجز استشارتك القانونية بنجاح. نتطلع إلى مساعدتك في احتياجاتك القانونية.`,
      detailsTitle: "تفاصيل الاستشارة:",
      lawyerLabel: "المستشار القانوني:",
      specialtyLabel: "التخصص:",
      dateLabel: "التاريخ:",
      timeLabel: "الوقت:",
      durationLabel: "المدة:",
      typeLabel: "النوع:",
      notesLabel: "ملاحظات إضافية:",
      cta: "انضم إلى الاستشارة",
      preparationTitle: "كيف تستعد:",
      prep1: "اجمع أي مستندات أو معلومات ذات صلة",
      prep2: "أعد قائمة بالأسئلة التي تريد مناقشتها",
      prep3: "انضم إلى الاجتماع قبل 5 دقائق لاختبار اتصالك",
      prep4: "تأكد من أنك في مكان هادئ وخاص",
      calendarText: "أضف إلى التقويم الخاص بك لتلقي التذكيرات",
      rescheduleText: "هل تحتاج إلى إعادة الجدولة أو الإلغاء؟",
      reschedule: "إعادة الجدولة",
      cancel: "إلغاء الاستشارة",
      footer: "Qannoni - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const typeLabel = consultationTypeLabels[locale][consultationType];

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

            <Section style={confirmationBanner}>
              <Text style={confirmIcon}>✓</Text>
              <Text style={title}>{t.title}</Text>
            </Section>

            <Text style={paragraph}>{t.paragraph1}</Text>

            <Section style={detailsSection}>
              <Text style={detailsTitle}>{t.detailsTitle}</Text>

              <Section style={detailCard}>
                <Section style={detailRow}>
                  <Text style={detailLabel}>{t.lawyerLabel}</Text>
                  <Text style={detailValue}>{lawyerName}</Text>
                  {lawyerSpecialty && (
                    <Text style={detailSubtext}>
                      {t.specialtyLabel} {lawyerSpecialty}
                    </Text>
                  )}
                </Section>

                <Hr style={detailHr} />

                <Section style={detailRow}>
                  <Text style={detailLabel}>{t.dateLabel}</Text>
                  <Text style={detailValue}>{consultationDate}</Text>
                </Section>

                <Section style={detailRow}>
                  <Text style={detailLabel}>{t.timeLabel}</Text>
                  <Text style={detailValue}>{consultationTime}</Text>
                </Section>

                <Section style={detailRow}>
                  <Text style={detailLabel}>{t.durationLabel}</Text>
                  <Text style={detailValue}>{duration}</Text>
                </Section>

                <Section style={detailRow}>
                  <Text style={detailLabel}>{t.typeLabel}</Text>
                  <Text style={detailValue}>{typeLabel}</Text>
                </Section>

                {notes && (
                  <>
                    <Hr style={detailHr} />
                    <Section style={notesSection}>
                      <Text style={detailLabel}>{t.notesLabel}</Text>
                      <Text style={notesText}>{notes}</Text>
                    </Section>
                  </>
                )}
              </Section>
            </Section>

            {consultationType === "video" && (
              <Section style={buttonContainer}>
                <Button style={button} href={meetingUrl}>
                  {t.cta}
                </Button>
              </Section>
            )}

            <Hr style={hr} />

            <Section style={preparationSection}>
              <Text style={preparationTitle}>{t.preparationTitle}</Text>
              <Text style={prepItem}>1. {t.prep1}</Text>
              <Text style={prepItem}>2. {t.prep2}</Text>
              <Text style={prepItem}>3. {t.prep3}</Text>
              <Text style={prepItem}>4. {t.prep4}</Text>
            </Section>

            <Section style={calendarSection}>
              <Text style={calendarText}>📅 {t.calendarText}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={actionsSection}>
              <Text style={actionsText}>{t.rescheduleText}</Text>
              <Link href={rescheduleUrl} style={linkButton}>
                {t.reschedule}
              </Link>
              <Text style={separator}>|</Text>
              <Link href={cancelUrl} style={cancelLink}>
                {t.cancel}
              </Link>
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

export default ConsultationBooked;

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

const confirmationBanner = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const confirmIcon = {
  fontSize: "48px",
  color: "#27ae60",
  marginBottom: "8px",
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

const detailsSection = {
  margin: "32px 0",
};

const detailsTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const detailCard = {
  backgroundColor: "#f6f9fc",
  border: "2px solid #2563eb",
  borderRadius: "12px",
  padding: "24px",
};

const detailRow = {
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

const detailSubtext = {
  fontSize: "14px",
  color: "#525f7f",
  marginTop: "4px",
};

const detailHr = {
  borderColor: "#e6ebf1",
  margin: "16px 0",
};

const notesSection = {
  marginTop: "16px",
};

const notesText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525f7f",
  fontStyle: "italic",
  marginTop: "8px",
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

const preparationSection = {
  marginBottom: "24px",
};

const preparationTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const prepItem = {
  fontSize: "15px",
  lineHeight: "28px",
  color: "#525f7f",
  margin: "8px 0",
};

const calendarSection = {
  backgroundColor: "#fff9f0",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  marginTop: "24px",
};

const calendarText = {
  fontSize: "14px",
  color: "#f39c12",
  fontWeight: "500",
  margin: "0",
};

const actionsSection = {
  textAlign: "center" as const,
  marginTop: "24px",
};

const actionsText = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "12px",
};

const linkButton = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "underline",
  fontWeight: "500",
};

const separator = {
  fontSize: "14px",
  color: "#e6ebf1",
  margin: "0 12px",
};

const cancelLink = {
  color: "#e74c3c",
  fontSize: "14px",
  textDecoration: "underline",
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

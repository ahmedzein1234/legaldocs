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

interface ConsultationReminderProps {
  clientName: string;
  lawyerName: string;
  locale?: "en" | "ar";
  consultationDate: string;
  consultationTime: string;
  timeUntil: string;
  meetingUrl?: string;
  consultationType?: "video" | "phone" | "in-person";
  phoneNumber?: string;
  address?: string;
  rescheduleUrl?: string;
}

export const ConsultationReminder = ({
  clientName,
  lawyerName,
  locale = "en",
  consultationDate,
  consultationTime,
  timeUntil,
  meetingUrl = "https://legaldocs.app/consultation",
  consultationType = "video",
  phoneNumber,
  address,
  rescheduleUrl = "https://legaldocs.app/reschedule",
}: ConsultationReminderProps) => {
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
      preview: `Reminder: Your consultation with ${lawyerName} starts in ${timeUntil}`,
      greeting: `Hi ${clientName},`,
      title: "Consultation Reminder",
      paragraph1: `This is a friendly reminder that your legal consultation is coming up soon.`,
      timeUntilLabel: "Starting in:",
      detailsTitle: "Consultation Details:",
      lawyerLabel: "Legal Advisor:",
      dateLabel: "Date:",
      timeLabel: "Time:",
      typeLabel: "Type:",
      phoneLabel: "Phone Number:",
      addressLabel: "Location:",
      ctaVideo: "Join Now",
      ctaPhone: "Prepare for Call",
      ctaInPerson: "Get Directions",
      checklistTitle: "Before You Join:",
      check1: "Test your internet connection and audio/video",
      check2: "Have your documents and questions ready",
      check3: "Find a quiet, private location",
      check4: "Join 5 minutes early",
      phoneCheck1: "Ensure you're in a quiet location",
      phoneCheck2: "Have your documents and questions ready",
      phoneCheck3: "Keep the lawyer's contact number handy",
      inPersonCheck1: "Note the address and plan your route",
      inPersonCheck2: "Bring all relevant documents",
      inPersonCheck3: "Arrive 10 minutes early",
      rescheduleText: "Need to reschedule?",
      reschedule: "Reschedule Consultation",
      footer: "LegalDocs - AI-Powered Legal Document Platform for GCC",
      footerAddress: "Building legal solutions across the Middle East",
    },
    ar: {
      preview: `تذكير: استشارتك مع ${lawyerName} تبدأ في ${timeUntil}`,
      greeting: `مرحباً ${clientName}،`,
      title: "تذكير بالاستشارة",
      paragraph1: `هذا تذكير ودي بأن استشارتك القانونية ستبدأ قريباً.`,
      timeUntilLabel: "تبدأ في:",
      detailsTitle: "تفاصيل الاستشارة:",
      lawyerLabel: "المستشار القانوني:",
      dateLabel: "التاريخ:",
      timeLabel: "الوقت:",
      typeLabel: "النوع:",
      phoneLabel: "رقم الهاتف:",
      addressLabel: "الموقع:",
      ctaVideo: "انضم الآن",
      ctaPhone: "الاستعداد للمكالمة",
      ctaInPerson: "احصل على الاتجاهات",
      checklistTitle: "قبل أن تنضم:",
      check1: "اختبر اتصالك بالإنترنت والصوت/الفيديو",
      check2: "جهز مستنداتك وأسئلتك",
      check3: "ابحث عن مكان هادئ وخاص",
      check4: "انضم قبل 5 دقائق",
      phoneCheck1: "تأكد من أنك في مكان هادئ",
      phoneCheck2: "جهز مستنداتك وأسئلتك",
      phoneCheck3: "احتفظ برقم اتصال المحامي في متناول اليد",
      inPersonCheck1: "لاحظ العنوان وخطط لطريقك",
      inPersonCheck2: "أحضر جميع المستندات ذات الصلة",
      inPersonCheck3: "احضر قبل 10 دقائق",
      rescheduleText: "هل تحتاج إلى إعادة الجدولة؟",
      reschedule: "إعادة جدولة الاستشارة",
      footer: "LegalDocs - منصة المستندات القانونية المدعومة بالذكاء الاصطناعي لدول مجلس التعاون الخليجي",
      footerAddress: "بناء الحلول القانونية في جميع أنحاء الشرق الأوسط",
    },
  };

  const t = content[locale];
  const typeLabel = consultationTypeLabels[locale][consultationType];

  // Select CTA based on consultation type
  let ctaText = t.ctaVideo;
  let ctaUrl = meetingUrl;
  if (consultationType === "phone") {
    ctaText = t.ctaPhone;
  } else if (consultationType === "in-person") {
    ctaText = t.ctaInPerson;
    ctaUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : meetingUrl;
  }

  // Select checklist based on consultation type
  let checklist = [t.check1, t.check2, t.check3, t.check4];
  if (consultationType === "phone") {
    checklist = [t.phoneCheck1, t.phoneCheck2, t.phoneCheck3];
  } else if (consultationType === "in-person") {
    checklist = [t.inPersonCheck1, t.inPersonCheck2, t.inPersonCheck3];
  }

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

            <Section style={reminderBanner}>
              <Text style={reminderIcon}>⏰</Text>
              <Text style={title}>{t.title}</Text>
            </Section>

            <Text style={paragraph}>{t.paragraph1}</Text>

            <Section style={timeSection}>
              <Text style={timeLabel}>{t.timeUntilLabel}</Text>
              <Text style={timeValue}>{timeUntil}</Text>
            </Section>

            <Section style={detailsSection}>
              <Text style={detailsTitle}>{t.detailsTitle}</Text>

              <Section style={detailCard}>
                <Text style={detailLabel}>{t.lawyerLabel}</Text>
                <Text style={detailValue}>{lawyerName}</Text>

                <Hr style={detailHr} />

                <Text style={detailLabel}>{t.dateLabel}</Text>
                <Text style={detailValue}>{consultationDate}</Text>

                <Text style={detailLabel}>{t.timeLabel}</Text>
                <Text style={detailValue}>{consultationTime}</Text>

                <Text style={detailLabel}>{t.typeLabel}</Text>
                <Text style={detailValue}>{typeLabel}</Text>

                {consultationType === "phone" && phoneNumber && (
                  <>
                    <Hr style={detailHr} />
                    <Text style={detailLabel}>{t.phoneLabel}</Text>
                    <Text style={detailValue}>{phoneNumber}</Text>
                  </>
                )}

                {consultationType === "in-person" && address && (
                  <>
                    <Hr style={detailHr} />
                    <Text style={detailLabel}>{t.addressLabel}</Text>
                    <Text style={detailValue}>{address}</Text>
                  </>
                )}
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={ctaUrl}>
                {ctaText}
              </Button>
            </Section>

            <Hr style={hr} />

            <Section style={checklistSection}>
              <Text style={checklistTitle}>{t.checklistTitle}</Text>
              {checklist.map((item, index) => (
                <Text key={index} style={checkItem}>
                  ☑ {item}
                </Text>
              ))}
            </Section>

            <Section style={rescheduleSection}>
              <Text style={rescheduleText}>{t.rescheduleText}</Text>
              <Link href={rescheduleUrl} style={rescheduleLink}>
                {t.reschedule}
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

export default ConsultationReminder;

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

const reminderBanner = {
  backgroundColor: "#fff9f0",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const reminderIcon = {
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

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525f7f",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const timeSection = {
  backgroundColor: "#fff0f0",
  border: "2px solid #e74c3c",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const timeLabel = {
  fontSize: "14px",
  color: "#e74c3c",
  fontWeight: "600",
  marginBottom: "8px",
};

const timeValue = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
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
  borderRadius: "8px",
  padding: "20px",
};

const detailLabel = {
  fontSize: "14px",
  color: "#8898aa",
  marginTop: "12px",
  marginBottom: "4px",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 4px 0",
};

const detailHr = {
  borderColor: "#e6ebf1",
  margin: "16px 0",
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

const checklistSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
};

const checklistTitle = {
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const checkItem = {
  fontSize: "15px",
  lineHeight: "28px",
  color: "#525f7f",
  margin: "8px 0",
};

const rescheduleSection = {
  textAlign: "center" as const,
  marginTop: "24px",
};

const rescheduleText = {
  fontSize: "14px",
  color: "#8898aa",
  marginBottom: "8px",
};

const rescheduleLink = {
  color: "#2563eb",
  fontSize: "14px",
  textDecoration: "underline",
  fontWeight: "500",
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

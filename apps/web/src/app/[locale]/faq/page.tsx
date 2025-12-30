import { getTranslations } from 'next-intl/server';
import {
  HelpCircle,
  FileText,
  Shield,
  CreditCard,
  Lock,
  Settings,
  Scale,
  MessageCircle,
} from 'lucide-react';
import { FaqAccordion, FaqCategory } from '@/components/faq/faq-accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { locales } from '@/i18n';

// Required for static export
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  const categories: FaqCategory[] = [
    {
      id: 'general',
      title: t('categories.general'),
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        {
          question: t('general.whatIsQannoni.question'),
          answer: t('general.whatIsQannoni.answer'),
          keywords: ['platform', 'service', 'about'],
        },
        {
          question: t('general.isLawFirm.question'),
          answer: t('general.isLawFirm.answer'),
          keywords: ['lawyer', 'legal advice', 'firm'],
        },
        {
          question: t('general.countries.question'),
          answer: t('general.countries.answer'),
          keywords: ['UAE', 'GCC', 'region', 'countries'],
        },
        {
          question: t('general.languages.question'),
          answer: t('general.languages.answer'),
          keywords: ['English', 'Arabic', 'Urdu', 'translation'],
        },
        {
          question: t('general.dataSecurity.question'),
          answer: t('general.dataSecurity.answer'),
          keywords: ['security', 'safe', 'encryption', 'privacy'],
        },
      ],
    },
    {
      id: 'documents',
      title: t('categories.documents'),
      icon: <FileText className="h-4 w-4" />,
      items: [
        {
          question: t('documents.howAiWorks.question'),
          answer: t('documents.howAiWorks.answer'),
          keywords: ['AI', 'generation', 'create', 'how'],
        },
        {
          question: t('documents.legallyValid.question'),
          answer: t('documents.legallyValid.answer'),
          keywords: ['valid', 'legal', 'binding', 'court'],
        },
        {
          question: t('documents.customizeTemplates.question'),
          answer: t('documents.customizeTemplates.answer'),
          keywords: ['customize', 'edit', 'modify', 'template'],
        },
        {
          question: t('documents.documentTypes.question'),
          answer: t('documents.documentTypes.answer'),
          keywords: ['types', 'contract', 'agreement', 'NDA'],
        },
        {
          question: t('documents.arabicTranslations.question'),
          answer: t('documents.arabicTranslations.answer'),
          keywords: ['Arabic', 'translation', 'accuracy', 'quality'],
        },
      ],
    },
    {
      id: 'signatures',
      title: t('categories.signatures'),
      icon: <Shield className="h-4 w-4" />,
      items: [
        {
          question: t('signatures.legalInUae.question'),
          answer: t('signatures.legalInUae.answer'),
          keywords: ['UAE', 'legal', 'e-signature', 'digital'],
        },
        {
          question: t('signatures.signingProcess.question'),
          answer: t('signatures.signingProcess.answer'),
          keywords: ['process', 'how', 'sign', 'workflow'],
        },
        {
          question: t('signatures.mobileSupport.question'),
          answer: t('signatures.mobileSupport.answer'),
          keywords: ['mobile', 'phone', 'app', 'device'],
        },
        {
          question: t('signatures.verification.question'),
          answer: t('signatures.verification.answer'),
          keywords: ['verify', 'authentication', 'secure'],
        },
        {
          question: t('signatures.countries.question'),
          answer: t('signatures.countries.answer'),
          keywords: ['countries', 'international', 'global'],
        },
      ],
    },
    {
      id: 'billing',
      title: t('categories.billing'),
      icon: <CreditCard className="h-4 w-4" />,
      items: [
        {
          question: t('billing.createAccount.question'),
          answer: t('billing.createAccount.answer'),
          keywords: ['account', 'signup', 'register'],
        },
        {
          question: t('billing.freePlan.question'),
          answer: t('billing.freePlan.answer'),
          keywords: ['free', 'trial', 'plan', 'pricing'],
        },
        {
          question: t('billing.paymentMethods.question'),
          answer: t('billing.paymentMethods.answer'),
          keywords: ['payment', 'card', 'billing'],
        },
        {
          question: t('billing.cancelSubscription.question'),
          answer: t('billing.cancelSubscription.answer'),
          keywords: ['cancel', 'subscription', 'refund'],
        },
        {
          question: t('billing.deleteAccount.question'),
          answer: t('billing.deleteAccount.answer'),
          keywords: ['delete', 'remove', 'close account'],
        },
      ],
    },
    {
      id: 'security',
      title: t('categories.security'),
      icon: <Lock className="h-4 w-4" />,
      items: [
        {
          question: t('security.dataProtection.question'),
          answer: t('security.dataProtection.answer'),
          keywords: ['protection', 'security', 'encryption'],
        },
        {
          question: t('security.dataStorage.question'),
          answer: t('security.dataStorage.answer'),
          keywords: ['storage', 'server', 'location'],
        },
        {
          question: t('security.documentAccess.question'),
          answer: t('security.documentAccess.answer'),
          keywords: ['access', 'privacy', 'permissions'],
        },
        {
          question: t('security.dataRetention.question'),
          answer: t('security.dataRetention.answer'),
          keywords: ['retention', 'delete', 'keep'],
        },
        {
          question: t('security.gdprCompliant.question'),
          answer: t('security.gdprCompliant.answer'),
          keywords: ['GDPR', 'compliance', 'regulation'],
        },
      ],
    },
    {
      id: 'technical',
      title: t('categories.technical'),
      icon: <Settings className="h-4 w-4" />,
      items: [
        {
          question: t('technical.browsers.question'),
          answer: t('technical.browsers.answer'),
          keywords: ['browser', 'Chrome', 'Safari', 'Firefox'],
        },
        {
          question: t('technical.offline.question'),
          answer: t('technical.offline.answer'),
          keywords: ['offline', 'internet', 'connection'],
        },
        {
          question: t('technical.exportDocuments.question'),
          answer: t('technical.exportDocuments.answer'),
          keywords: ['export', 'download', 'PDF'],
        },
        {
          question: t('technical.fileFormats.question'),
          answer: t('technical.fileFormats.answer'),
          keywords: ['format', 'PDF', 'DOCX', 'file'],
        },
        {
          question: t('technical.api.question'),
          answer: t('technical.api.answer'),
          keywords: ['API', 'integration', 'developer'],
        },
      ],
    },
    {
      id: 'legal',
      title: t('categories.legal'),
      icon: <Scale className="h-4 w-4" />,
      items: [
        {
          question: t('legal.uaeLaws.question'),
          answer: t('legal.uaeLaws.answer'),
          keywords: ['UAE law', 'compliance', 'regulation'],
        },
        {
          question: t('legal.governmentUse.question'),
          answer: t('legal.governmentUse.answer'),
          keywords: ['government', 'official', 'authority'],
        },
        {
          question: t('legal.notarization.question'),
          answer: t('legal.notarization.answer'),
          keywords: ['notary', 'attestation', 'certification'],
        },
        {
          question: t('legal.courtProceedings.question'),
          answer: t('legal.courtProceedings.answer'),
          keywords: ['court', 'litigation', 'legal proceedings'],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <FaqAccordion categories={categories} />
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">{t('stillNeedHelp.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('stillNeedHelp.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/contact">{t('stillNeedHelp.contactSupport')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">{t('stillNeedHelp.backToDashboard')}</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

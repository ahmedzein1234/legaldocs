'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Shield, Database, Lock, Eye, Cloud, Cookie, Mail, Globe, UserCheck, Trash2, Download, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  const t = useTranslations('legal.privacy');
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  return (
    <div className="container max-w-4xl py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('effectiveDate')}: January 1, 2025</p>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-200">
            {t('commitment')}
          </AlertDescription>
        </Alert>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle>{t('introduction.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('introduction.p1')}</p>
          <p>{t('introduction.p2')}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              {t('badges.encrypted')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {t('badges.gdprCompliant')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" />
              {t('badges.secureStorage')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {t('collection.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {t('collection.personal.title')}
            </h4>
            <ul className="space-y-1 list-disc list-inside text-sm">
              <li>{t('collection.personal.item1')}</li>
              <li>{t('collection.personal.item2')}</li>
              <li>{t('collection.personal.item3')}</li>
              <li>{t('collection.personal.item4')}</li>
              <li>{t('collection.personal.item5')}</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('collection.usage.title')}
            </h4>
            <ul className="space-y-1 list-disc list-inside text-sm">
              <li>{t('collection.usage.item1')}</li>
              <li>{t('collection.usage.item2')}</li>
              <li>{t('collection.usage.item3')}</li>
              <li>{t('collection.usage.item4')}</li>
              <li>{t('collection.usage.item5')}</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t('collection.documents.title')}
            </h4>
            <ul className="space-y-1 list-disc list-inside text-sm">
              <li>{t('collection.documents.item1')}</li>
              <li>{t('collection.documents.item2')}</li>
              <li>{t('collection.documents.item3')}</li>
              <li>{t('collection.documents.item4')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Your Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t('usage.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('usage.purpose1')}</li>
            <li>{t('usage.purpose2')}</li>
            <li>{t('usage.purpose3')}</li>
            <li>{t('usage.purpose4')}</li>
            <li>{t('usage.purpose5')}</li>
            <li>{t('usage.purpose6')}</li>
            <li>{t('usage.purpose7')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Storage and Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            {t('storage.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div>
              <p className="font-semibold text-sm mb-1">{t('storage.location.title')}</p>
              <p className="text-sm">{t('storage.location.description')}</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">{t('storage.encryption.title')}</p>
              <p className="text-sm">{t('storage.encryption.description')}</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">{t('storage.backup.title')}</p>
              <p className="text-sm">{t('storage.backup.description')}</p>
            </div>
          </div>

          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              {t('storage.security')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Third-Party Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('thirdParty.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{t('thirdParty.description')}</p>

          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                <Cloud className="h-4 w-4 text-orange-500" />
                Cloudflare
              </h4>
              <p className="text-sm text-muted-foreground mb-2">{t('thirdParty.cloudflare.purpose')}</p>
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('thirdParty.viewPolicy')}
              </a>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                OpenRouter AI
              </h4>
              <p className="text-sm text-muted-foreground mb-2">{t('thirdParty.openrouter.purpose')}</p>
              <a
                href="https://openrouter.ai/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('thirdParty.viewPolicy')}
              </a>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                Supabase
              </h4>
              <p className="text-sm text-muted-foreground mb-2">{t('thirdParty.supabase.purpose')}</p>
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('thirdParty.viewPolicy')}
              </a>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('thirdParty.aiWarning')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cookies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            {t('cookies.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{t('cookies.description')}</p>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">{t('cookies.essential.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('cookies.essential.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{t('cookies.functional.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('cookies.functional.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{t('cookies.analytics.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('cookies.analytics.description')}</p>
            </div>
          </div>

          <p className="text-sm">{t('cookies.control')}</p>
        </CardContent>
      </Card>

      {/* Your Rights (GDPR-style) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {t('rights.title')}
          </CardTitle>
          <CardDescription>{t('rights.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Eye className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t('rights.access.title')}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t('rights.access.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t('rights.portability.title')}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t('rights.portability.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t('rights.correction.title')}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t('rights.correction.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Trash2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t('rights.deletion.title')}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t('rights.deletion.description')}</p>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {t('rights.exercise')}: <a href="mailto:privacy@legaldocs.ae" className="text-primary hover:underline">privacy@legaldocs.ae</a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {t('retention.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('retention.description')}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('retention.account')}</li>
            <li>{t('retention.documents')}</li>
            <li>{t('retention.logs')}</li>
            <li>{t('retention.analytics')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Children's Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>{t('children.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('children.description')}</p>
        </CardContent>
      </Card>

      {/* International Data Transfers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('international.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('international.description')}</p>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {t('international.protection')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Changes to Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle>{t('changes.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('changes.description')}</p>
          <p className="text-sm text-muted-foreground">{t('changes.notification')}</p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t('contact.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('contact.description')}</p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-semibold">LegalDocs Data Protection Officer</p>
            <p className="text-sm">{t('contact.email')}: <a href="mailto:privacy@legaldocs.ae" className="text-primary hover:underline">privacy@legaldocs.ae</a></p>
            <p className="text-sm">{t('contact.support')}: <a href="mailto:support@legaldocs.ae" className="text-primary hover:underline">support@legaldocs.ae</a></p>
            <p className="text-sm">{t('contact.address')}: Dubai, United Arab Emirates</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="flex flex-wrap gap-4 pt-6 border-t">
        <Link href={`/${locale}/legal/disclaimer`} className="text-sm text-primary hover:underline">
          {t('footer.disclaimer')}
        </Link>
        <Link href={`/${locale}/legal/terms`} className="text-sm text-primary hover:underline">
          {t('footer.terms')}
        </Link>
        <Link href={`/${locale}/dashboard`} className="text-sm text-primary hover:underline">
          {t('footer.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}

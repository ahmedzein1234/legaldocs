'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Shield, Scale, AlertTriangle, FileText, Building2, Globe, Gavel, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DisclaimerPage() {
  const t = useTranslations('legal.disclaimer');
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  return (
    <div className="container max-w-4xl py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('lastUpdated')}: January 2025</p>
          </div>
        </div>

        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            {t('importantNotice')}
          </AlertDescription>
        </Alert>
      </div>

      {/* Critical Warning */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            {t('criticalWarning.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold">{t('criticalWarning.subtitle')}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('criticalWarning.point1')}</li>
            <li>{t('criticalWarning.point2')}</li>
            <li>{t('criticalWarning.point3')}</li>
            <li>{t('criticalWarning.point4')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Nature of Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t('natureOfService.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {t('badges.softwareCompany')}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {t('badges.technologyProvider')}
            </Badge>
          </div>

          <p>{t('natureOfService.description')}</p>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-semibold text-sm">{t('natureOfService.weProvide')}</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('natureOfService.item1')}</li>
              <li>• {t('natureOfService.item2')}</li>
              <li>• {t('natureOfService.item3')}</li>
              <li>• {t('natureOfService.item4')}</li>
            </ul>
          </div>

          <div className="bg-destructive/10 p-4 rounded-lg space-y-2 border border-destructive/20">
            <p className="font-semibold text-sm text-destructive">{t('natureOfService.weDoNotProvide')}</p>
            <ul className="space-y-1 text-sm">
              <li>• {t('natureOfService.notItem1')}</li>
              <li>• {t('natureOfService.notItem2')}</li>
              <li>• {t('natureOfService.notItem3')}</li>
              <li>• {t('natureOfService.notItem4')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* No Attorney-Client Relationship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            {t('noAttorneyClient.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold">{t('noAttorneyClient.statement')}</p>
          <p>{t('noAttorneyClient.explanation')}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('noAttorneyClient.point1')}</li>
            <li>{t('noAttorneyClient.point2')}</li>
            <li>{t('noAttorneyClient.point3')}</li>
            <li>{t('noAttorneyClient.point4')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Templates and AI-Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('templates.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('templates.description')}</p>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('templates.aiWarning')}
            </AlertDescription>
          </Alert>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('templates.point1')}</li>
            <li>{t('templates.point2')}</li>
            <li>{t('templates.point3')}</li>
            <li>{t('templates.point4')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* User Responsibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            {t('userResponsibility.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold">{t('userResponsibility.statement')}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('userResponsibility.point1')}</li>
            <li>{t('userResponsibility.point2')}</li>
            <li>{t('userResponsibility.point3')}</li>
            <li>{t('userResponsibility.point4')}</li>
            <li>{t('userResponsibility.point5')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Limitation of Liability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('liability.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold uppercase text-sm">{t('liability.statement')}</p>
          <p>{t('liability.description')}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t('liability.point1')}</li>
            <li>{t('liability.point2')}</li>
            <li>{t('liability.point3')}</li>
            <li>{t('liability.point4')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* UAE/GCC Specific Disclaimers */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('regional.title')}
          </CardTitle>
          <CardDescription>{t('regional.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">{t('regional.uae.title')}</h4>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>{t('regional.uae.point1')}</li>
              <li>{t('regional.uae.point2')}</li>
              <li>{t('regional.uae.point3')}</li>
              <li>{t('regional.uae.point4')}</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">{t('regional.gcc.title')}</h4>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>{t('regional.gcc.point1')}</li>
              <li>{t('regional.gcc.point2')}</li>
              <li>{t('regional.gcc.point3')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Scale className="h-5 w-5" />
            {t('recommendation.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold">{t('recommendation.statement')}</p>
          <div className="bg-white dark:bg-green-950/40 p-4 rounded-lg">
            <p className="text-sm mb-2 font-medium">{t('recommendation.whenToConsult')}</p>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>{t('recommendation.case1')}</li>
              <li>{t('recommendation.case2')}</li>
              <li>{t('recommendation.case3')}</li>
              <li>{t('recommendation.case4')}</li>
              <li>{t('recommendation.case5')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Changes to Disclaimer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t('changes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('changes.description')}</p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contact.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>{t('contact.description')}</p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-semibold">Ai Creative innovations, LLC</p>
            <p className="text-sm">{t('contact.email')}: support@qannoni.com</p>
            <p className="text-sm">{t('contact.address')}: 131 Continental Dr, Suite 305, Newark, DE 19713 US</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
      <div className="flex flex-wrap gap-4 pt-6 border-t">
        <Link href={`/${locale}/legal/privacy`} className="text-sm text-primary hover:underline">
          {t('footer.privacy')}
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

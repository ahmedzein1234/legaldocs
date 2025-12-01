'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { FileText, Mail, MapPin, Phone, Globe, Shield, Scale, Cookie, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const locale = useLocale();
  const t = useTranslations('footer');
  const isRTL = locale === 'ar' || locale === 'ur';

  const currentYear = new Date().getFullYear();

  const productLinks = [
    { href: `/${locale}/dashboard/generate`, label: t('product.aiGenerator') },
    { href: `/${locale}/dashboard/templates`, label: t('product.templates') },
    { href: `/${locale}/dashboard/signatures`, label: t('product.eSignatures') },
    { href: `/${locale}/dashboard/advisor`, label: t('product.legalAdvisor') },
  ];

  const legalLinks = [
    { href: `/${locale}/legal/disclaimer`, label: t('legal.disclaimer'), icon: Shield },
    { href: `/${locale}/legal/privacy`, label: t('legal.privacy'), icon: Scale },
    { href: `/${locale}/legal/terms`, label: t('legal.terms'), icon: FileText },
    { href: `/${locale}/legal/cookies`, label: t('legal.cookies'), icon: Cookie },
  ];

  const companyLinks = [
    { href: `/${locale}/about`, label: t('company.about') },
    { href: `/${locale}/contact`, label: t('company.contact') },
    { href: `/${locale}/blog`, label: t('company.blog') },
    { href: `/${locale}/careers`, label: t('company.careers') },
  ];

  const supportLinks = [
    { href: `/${locale}/help`, label: t('support.helpCenter') },
    { href: `/${locale}/faq`, label: t('support.faq') },
    { href: `/${locale}/api`, label: t('support.api') },
    { href: `/${locale}/status`, label: t('support.status') },
  ];

  const socialLinks = [
    { href: 'https://twitter.com/legaldocs', icon: Twitter, label: 'Twitter' },
    { href: 'https://linkedin.com/company/legaldocs', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://facebook.com/legaldocs', icon: Facebook, label: 'Facebook' },
    { href: 'https://instagram.com/legaldocs', icon: Instagram, label: 'Instagram' },
  ];

  return (
    <footer className={cn('border-t bg-muted/30', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold text-lg">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <span>LegalDocs</span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-xs">
              {t('tagline')}
            </p>

            {/* Critical Legal Notice */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
              <Shield className="h-4 w-4 text-amber-700 dark:text-amber-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                {t('softwareNotice')}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@legaldocs.ae" className="hover:text-primary transition-colors">
                  support@legaldocs.ae
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">{t('sections.product')}</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">{t('sections.legal')}</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <link.icon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">{t('sections.company')}</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-sm mt-6">{t('sections.support')}</h4>
            <ul className="space-y-2">
              {supportLinks.slice(0, 2).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Copyright */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              © {currentYear} LegalDocs. {t('copyright')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('registeredTrademark')}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Regional Notice */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                {t('regional.title')}
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-300">
                {t('regional.notice')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

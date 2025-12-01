'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Shield,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Lock,
  Users,
  Award,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomepageContent() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      titleAr: 'إنشاء بالذكاء الاصطناعي',
      titleUr: 'AI کے ساتھ بنائیں',
      description: 'Create professional legal documents in minutes using advanced AI technology',
      descriptionAr: 'إنشاء وثائق قانونية احترافية في دقائق باستخدام تقنية الذكاء الاصطناعي المتقدمة',
      descriptionUr: 'جدید AI ٹیکنالوجی کے ساتھ منٹوں میں پیشہ ورانہ قانونی دستاویزات بنائیں',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      titleAr: 'دعم متعدد اللغات',
      titleUr: 'کثیر لسانی معاونت',
      description: 'Documents in English, Arabic, and Urdu with professional translations',
      descriptionAr: 'وثائق بالإنجليزية والعربية والأردية مع ترجمات احترافية',
      descriptionUr: 'انگریزی، عربی اور اردو میں دستاویزات پیشہ ورانہ ترجموں کے ساتھ',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Secure Digital Signatures',
      titleAr: 'توقيعات رقمية آمنة',
      titleUr: 'محفوظ ڈیجیٹل دستخط',
      description: 'Legally binding e-signatures compliant with UAE laws',
      descriptionAr: 'توقيعات إلكترونية ملزمة قانونياً متوافقة مع قوانين الإمارات',
      descriptionUr: 'قانونی طور پر پابند ای-دستخط UAE قوانین کے مطابق',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      titleAr: 'إنشاء فوري',
      titleUr: 'فوری تیاری',
      description: 'Get your documents ready in seconds, not days',
      descriptionAr: 'احصل على مستنداتك جاهزة في ثوانٍ، وليس أيام',
      descriptionUr: 'اپنی دستاویزات سیکنڈوں میں تیار کریں، دنوں میں نہیں',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Lock,
      title: 'Bank-Grade Security',
      titleAr: 'أمان على مستوى البنوك',
      titleUr: 'بینک درجے کی سیکیورٹی',
      description: 'Your data is encrypted and stored securely',
      descriptionAr: 'بياناتك مشفرة ومخزنة بشكل آمن',
      descriptionUr: 'آپ کا ڈیٹا محفوظ طریقے سے محفوظ کیا جاتا ہے',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Users,
      title: 'Multi-Party Signing',
      titleAr: 'توقيع متعدد الأطراف',
      titleUr: 'کثیر فریقی دستخط',
      description: 'Collect signatures from multiple parties seamlessly',
      descriptionAr: 'جمع التوقيعات من أطراف متعددة بسلاسة',
      descriptionUr: 'متعدد فریقوں سے آسانی سے دستخط جمع کریں',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  const templates = [
    {
      name: 'Employment Contract',
      nameAr: 'عقد عمل',
      nameUr: 'ملازمت کا معاہدہ',
      category: 'Employment',
      popular: true,
    },
    {
      name: 'NDA Agreement',
      nameAr: 'اتفاقية السرية',
      nameUr: 'رازداری کا معاہدہ',
      category: 'Business',
      popular: true,
    },
    {
      name: 'Rental Agreement',
      nameAr: 'عقد إيجار',
      nameUr: 'کرایہ کا معاہدہ',
      category: 'Real Estate',
      popular: true,
    },
    {
      name: 'Service Agreement',
      nameAr: 'اتفاقية خدمة',
      nameUr: 'خدمت کا معاہدہ',
      category: 'Business',
      popular: false,
    },
  ];

  const stats = [
    {
      value: '10,000+',
      label: 'Documents Created',
      labelAr: 'مستند تم إنشاؤه',
      labelUr: 'دستاویزات بنائی گئیں',
      icon: FileText,
    },
    {
      value: '99.9%',
      label: 'Customer Satisfaction',
      labelAr: 'رضا العملاء',
      labelUr: 'کسٹمر اطمینان',
      icon: Award,
    },
    {
      value: '50+',
      label: 'Template Categories',
      labelAr: 'فئة قالب',
      labelUr: 'ٹیمپلیٹ زمرے',
      icon: FileText,
    },
    {
      value: '24/7',
      label: 'Support Available',
      labelAr: 'الدعم متاح',
      labelUr: 'معاونت دستیاب',
      icon: Users,
    },
  ];

  const getLocalizedText = (en: string, ar: string, ur: string) => {
    if (locale === 'ar') return ar;
    if (locale === 'ur') return ur;
    return en;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30" variant="secondary">
              <Sparkles className="mr-2 h-3 w-3" />
              {getLocalizedText('AI-Powered Legal Platform', 'منصة قانونية مدعومة بالذكاء الاصطناعي', 'AI طاقتور قانونی پلیٹ فارم')}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              {getLocalizedText(
                'Legal Documents Made Simple',
                'الوثائق القانونية أصبحت بسيطة',
                'قانونی دستاویزات آسان بنائیں'
              )}
            </h1>
            <p className="mb-8 text-xl text-blue-100 md:text-2xl">
              {getLocalizedText(
                'Create, manage, and sign legal documents in minutes with AI assistance. Available in English, Arabic & Urdu.',
                'إنشاء وإدارة وتوقيع الوثائق القانونية في دقائق بمساعدة الذكاء الاصطناعي. متاح بالإنجليزية والعربية والأردية.',
                'AI کی مدد سے منٹوں میں قانونی دستاویزات بنائیں، منظم کریں اور دستخط کریں۔ انگریزی، عربی اور اردو میں دستیاب۔'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={`/${locale}/dashboard/generate`}>
                <Button size="lg" className="gap-2 bg-white text-primary hover:bg-gray-100">
                  <Sparkles className="h-5 w-5" />
                  {getLocalizedText('Start Generating', 'ابدأ الإنشاء', 'بنانا شروع کریں')}
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard/templates`}>
                <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                  <FileText className="h-5 w-5" />
                  {getLocalizedText('Browse Templates', 'تصفح القوالب', 'ٹیمپلیٹس دیکھیں')}
                </Button>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>{getLocalizedText('UAE Compliant', 'متوافق مع الإمارات', 'UAE کے مطابق')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>{getLocalizedText('Secure & Encrypted', 'آمن ومشفر', 'محفوظ اور خفیہ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{getLocalizedText('Ready in Minutes', 'جاهز في دقائق', 'منٹوں میں تیار')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {getLocalizedText(stat.label, stat.labelAr, stat.labelUr)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {getLocalizedText('Powerful Features', 'ميزات قوية', 'طاقتور خصوصیات')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {getLocalizedText(
                'Everything you need to create, manage, and sign legal documents',
                'كل ما تحتاجه لإنشاء وإدارة وتوقيع الوثائق القانونية',
                'قانونی دستاویزات بنانے، منظم کرنے اور دستخط کرنے کے لیے آپ کو جو کچھ چاہیے'
              )}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                <div className={cn('absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5 bg-gradient-to-br', feature.color)} />
                <CardHeader>
                  <div className={cn('mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white', feature.color)}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">
                    {getLocalizedText(feature.title, feature.titleAr, feature.titleUr)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {getLocalizedText(feature.description, feature.descriptionAr, feature.descriptionUr)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {getLocalizedText('Popular Templates', 'القوالب الشائعة', 'مقبول ٹیمپلیٹس')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {getLocalizedText(
                'Choose from our library of professionally crafted legal document templates',
                'اختر من مكتبتنا من قوالب الوثائق القانونية المصممة باحتراف',
                'ہماری پیشہ ورانہ طور پر تیار کردہ قانونی دستاویز ٹیمپلیٹس کی لائبریری سے منتخب کریں'
              )}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {templates.map((template, index) => (
              <Card key={index} className="group cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary" />
                    {template.popular && (
                      <Badge variant="secondary" className="text-xs">
                        {getLocalizedText('Popular', 'شائع', 'مقبول')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg">
                    {getLocalizedText(template.name, template.nameAr, template.nameUr)}
                  </CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href={`/${locale}/dashboard/templates`}>
              <Button size="lg" className="gap-2">
                {getLocalizedText('View All Templates', 'عرض جميع القوالب', 'تمام ٹیمپلیٹس دیکھیں')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-blue-500/5">
            <CardContent className="p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                {getLocalizedText(
                  'Ready to Get Started?',
                  'هل أنت مستعد للبدء؟',
                  'شروع کرنے کے لیے تیار ہیں؟'
                )}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {getLocalizedText(
                  'Join thousands of businesses creating professional legal documents',
                  'انضم إلى آلاف الشركات التي تنشئ وثائق قانونية احترافية',
                  'ہزاروں کاروبار میں شامل ہوں جو پیشہ ورانہ قانونی دستاویزات بنا رہے ہیں'
                )}
              </p>
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  {getLocalizedText('Get Started Free', 'ابدأ مجاناً', 'مفت شروع کریں')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

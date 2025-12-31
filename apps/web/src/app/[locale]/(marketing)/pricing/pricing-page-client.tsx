'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Zap, Building2, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/i18n';

interface PricingPageClientProps {
  locale: Locale;
}

interface PlanFeature {
  name: string;
  nameAr: string;
  free: boolean | string;
  professional: boolean | string;
  business: boolean | string;
  enterprise: boolean | string;
}

const plans = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    priceYearly: 0,
    description: 'Perfect for individuals getting started',
    descriptionAr: 'مثالي للأفراد الذين يبدأون',
    icon: Zap,
    features: [
      '3 documents per month',
      '3 AI generations',
      '1 e-signature',
      'Basic templates',
      'PDF export',
      'Email support',
    ],
    featuresAr: [
      '3 مستندات شهرياً',
      '3 توليدات بالذكاء الاصطناعي',
      'توقيع إلكتروني واحد',
      'القوالب الأساسية',
      'تصدير PDF',
      'دعم البريد الإلكتروني',
    ],
    cta: 'Get Started Free',
    ctaAr: 'ابدأ مجاناً',
    popular: false,
  },
  professional: {
    name: 'Professional',
    nameAr: 'احترافي',
    price: 149,
    priceYearly: 1490,
    description: 'For professionals who need more power',
    descriptionAr: 'للمحترفين الذين يحتاجون إلى قوة أكبر',
    icon: Users,
    features: [
      '25 documents per month',
      '50 AI generations',
      '10 e-signatures',
      'All templates (basic + premium)',
      'AI contract review',
      'Custom branding',
      'Priority support',
      '3 team members',
    ],
    featuresAr: [
      '25 مستنداً شهرياً',
      '50 توليداً بالذكاء الاصطناعي',
      '10 توقيعات إلكترونية',
      'جميع القوالب (أساسية + متميزة)',
      'مراجعة العقود بالذكاء الاصطناعي',
      'علامة تجارية مخصصة',
      'دعم متميز',
      '3 أعضاء فريق',
    ],
    cta: 'Start Professional',
    ctaAr: 'ابدأ الاحترافي',
    popular: true,
  },
  business: {
    name: 'Business',
    nameAr: 'أعمال',
    price: 449,
    priceYearly: 4490,
    description: 'For growing businesses',
    descriptionAr: 'للشركات النامية',
    icon: Building2,
    features: [
      'Unlimited documents',
      '200 AI generations',
      '50 e-signatures',
      'All templates',
      'AI contract review + suggestions',
      'Team collaboration',
      'Audit trail',
      'API access',
      'Dedicated support',
      '10 team members',
    ],
    featuresAr: [
      'مستندات غير محدودة',
      '200 توليد بالذكاء الاصطناعي',
      '50 توقيعاً إلكترونياً',
      'جميع القوالب',
      'مراجعة العقود + اقتراحات',
      'تعاون الفريق',
      'سجل المراجعة',
      'الوصول إلى API',
      'دعم مخصص',
      '10 أعضاء فريق',
    ],
    cta: 'Start Business',
    ctaAr: 'ابدأ الأعمال',
    popular: false,
  },
  enterprise: {
    name: 'Enterprise',
    nameAr: 'مؤسسة',
    price: null,
    priceYearly: null,
    description: 'Custom solutions for large organizations',
    descriptionAr: 'حلول مخصصة للمؤسسات الكبيرة',
    icon: Crown,
    features: [
      'Everything in Business',
      'Unlimited everything',
      'White-label option',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager',
      '24/7 support',
      'On-premise option',
      'Training included',
    ],
    featuresAr: [
      'كل ما في الأعمال',
      'كل شيء غير محدود',
      'خيار العلامة البيضاء',
      'تكاملات مخصصة',
      'ضمان اتفاقية مستوى الخدمة',
      'مدير حساب مخصص',
      'دعم على مدار الساعة',
      'خيار التثبيت المحلي',
      'التدريب متضمن',
    ],
    cta: 'Contact Sales',
    ctaAr: 'اتصل بالمبيعات',
    popular: false,
  },
};

const featureComparison: PlanFeature[] = [
  { name: 'Documents per month', nameAr: 'المستندات شهرياً', free: '3', professional: '25', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI generations', nameAr: 'توليدات الذكاء الاصطناعي', free: '3', professional: '50', business: '200', enterprise: 'Unlimited' },
  { name: 'E-signatures', nameAr: 'التوقيعات الإلكترونية', free: '1', professional: '10', business: '50', enterprise: 'Unlimited' },
  { name: 'Storage', nameAr: 'التخزين', free: '100 MB', professional: '1 GB', business: '10 GB', enterprise: 'Unlimited' },
  { name: 'Team members', nameAr: 'أعضاء الفريق', free: '1', professional: '3', business: '10', enterprise: 'Unlimited' },
  { name: 'Basic templates', nameAr: 'القوالب الأساسية', free: true, professional: true, business: true, enterprise: true },
  { name: 'Premium templates', nameAr: 'القوالب المتميزة', free: false, professional: true, business: true, enterprise: true },
  { name: 'AI contract review', nameAr: 'مراجعة العقود بالذكاء الاصطناعي', free: false, professional: true, business: true, enterprise: true },
  { name: 'Custom branding', nameAr: 'العلامة التجارية المخصصة', free: false, professional: true, business: true, enterprise: true },
  { name: 'Team collaboration', nameAr: 'تعاون الفريق', free: false, professional: false, business: true, enterprise: true },
  { name: 'Audit trail', nameAr: 'سجل المراجعة', free: false, professional: false, business: true, enterprise: true },
  { name: 'API access', nameAr: 'الوصول إلى API', free: false, professional: false, business: true, enterprise: true },
  { name: 'White-label', nameAr: 'العلامة البيضاء', free: false, professional: false, business: false, enterprise: true },
  { name: 'Dedicated support', nameAr: 'دعم مخصص', free: false, professional: false, business: true, enterprise: true },
  { name: 'SLA guarantee', nameAr: 'ضمان SLA', free: false, professional: false, business: false, enterprise: true },
];

const faqs = [
  {
    question: 'Can I change my plan at any time?',
    questionAr: 'هل يمكنني تغيير خطتي في أي وقت؟',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll have immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.',
    answerAr: 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. عند الترقية، ستحصل على وصول فوري للميزات الجديدة. عند التخفيض، تسري التغييرات في نهاية دورة الفوترة.',
  },
  {
    question: 'What happens when I reach my document limit?',
    questionAr: 'ماذا يحدث عندما أصل إلى حد المستندات الخاص بي؟',
    answer: 'You\'ll receive a notification when you\'re close to your limit. You can either wait for the next billing cycle, upgrade your plan, or purchase additional documents.',
    answerAr: 'ستتلقى إشعاراً عندما تقترب من حدك. يمكنك إما الانتظار لدورة الفوترة التالية، أو ترقية خطتك، أو شراء مستندات إضافية.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    questionAr: 'هل تقدمون خصومات للفوترة السنوية؟',
    answer: 'Yes! Annual plans save you approximately 17% compared to monthly billing. You\'ll pay for 10 months and get 12 months of access.',
    answerAr: 'نعم! الخطط السنوية توفر لك حوالي 17% مقارنة بالفوترة الشهرية. ستدفع لمدة 10 أشهر وتحصل على 12 شهراً من الوصول.',
  },
  {
    question: 'Is there a free trial?',
    questionAr: 'هل هناك تجربة مجانية؟',
    answer: 'Yes, you can start with our Free plan which includes 3 documents per month. This allows you to test the platform before committing to a paid plan.',
    answerAr: 'نعم، يمكنك البدء بخطتنا المجانية التي تتضمن 3 مستندات شهرياً. يتيح لك هذا اختبار المنصة قبل الالتزام بخطة مدفوعة.',
  },
  {
    question: 'What payment methods do you accept?',
    questionAr: 'ما طرق الدفع التي تقبلونها؟',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), and bank transfers for Enterprise plans. All payments are processed securely.',
    answerAr: 'نقبل جميع بطاقات الائتمان الرئيسية (فيزا، ماستركارد، أمريكان إكسبريس)، والتحويلات البنكية لخطط المؤسسات. جميع المدفوعات تتم بشكل آمن.',
  },
];

export function PricingPageClient({ locale }: PricingPageClientProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const isRTL = locale === 'ar' || locale === 'ur';

  const t = {
    title: locale === 'ar' ? 'خطط الأسعار' : 'Pricing Plans',
    subtitle: locale === 'ar'
      ? 'اختر الخطة المثالية لاحتياجاتك من الوثائق القانونية'
      : 'Choose the perfect plan for your legal document needs',
    monthly: locale === 'ar' ? 'شهري' : 'Monthly',
    yearly: locale === 'ar' ? 'سنوي' : 'Yearly',
    save: locale === 'ar' ? 'وفر 17%' : 'Save 17%',
    perMonth: locale === 'ar' ? '/شهر' : '/month',
    perYear: locale === 'ar' ? '/سنة' : '/year',
    mostPopular: locale === 'ar' ? 'الأكثر شعبية' : 'Most Popular',
    custom: locale === 'ar' ? 'مخصص' : 'Custom',
    compareFeatures: locale === 'ar' ? 'مقارنة الميزات' : 'Compare Features',
    faq: locale === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions',
    startTrial: locale === 'ar' ? 'ابدأ تجربتك المجانية' : 'Start Your Free Trial',
    trialCta: locale === 'ar'
      ? 'انضم إلى أول 1000 مستخدم واحصل على 3 أشهر مجاناً مع الخطة الاحترافية!'
      : 'Join the first 1,000 users and get 3 months free with Professional plan!',
    promoCode: 'LAUNCH2025',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          {t.title}
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 px-4">
          {t.subtitle}
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.monthly}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.yearly}
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {t.save}
            </Badge>
          </button>
        </div>
      </div>

      {/* Launch Promo Banner */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-center">
          <p className="text-lg font-semibold mb-2">{t.trialCta}</p>
          <code className="bg-white/20 px-4 py-1 rounded-lg font-mono text-lg">
            {t.promoCode}
          </code>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(plans).map(([key, plan]) => {
            const Icon = plan.icon;
            const price = billingCycle === 'yearly' && plan.priceYearly
              ? Math.round(plan.priceYearly / 12)
              : plan.price;

            return (
              <Card
                key={key}
                className={`relative flex flex-col ${
                  plan.popular
                    ? 'border-2 border-emerald-500 shadow-xl'
                    : 'border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white px-4 py-1">
                      {t.mostPopular}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-emerald-600' : 'text-slate-600'}`} />
                  </div>
                  <CardTitle className="text-xl">
                    {locale === 'ar' ? plan.nameAr : plan.name}
                  </CardTitle>
                  <CardDescription>
                    {locale === 'ar' ? plan.descriptionAr : plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    {price !== null ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          AED {price}
                        </span>
                        <span className="text-slate-500">
                          {t.perMonth}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-slate-900">
                        {t.custom}
                      </span>
                    )}
                    {billingCycle === 'yearly' && plan.priceYearly && (
                      <p className="text-sm text-slate-500 mt-1">
                        AED {plan.priceYearly}{t.perYear}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {(locale === 'ar' ? plan.featuresAr : plan.features).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    asChild
                    className={`w-full ${
                      plan.popular
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <Link href={key === 'enterprise' ? '/contact' : '/auth/register'}>
                      {locale === 'ar' ? plan.ctaAr : plan.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            {t.compareFeatures}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-4 font-semibold text-slate-900">
                    {locale === 'ar' ? 'الميزة' : 'Feature'}
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-900">Free</th>
                  <th className="text-center p-4 font-semibold text-emerald-600 bg-emerald-50">
                    Professional
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-900">Business</th>
                  <th className="text-center p-4 font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-4 text-slate-600">
                      {locale === 'ar' ? feature.nameAr : feature.name}
                    </td>
                    {['free', 'professional', 'business', 'enterprise'].map((plan) => {
                      const value = feature[plan as keyof PlanFeature];
                      return (
                        <td
                          key={plan}
                          className={`text-center p-4 ${
                            plan === 'professional' ? 'bg-emerald-50' : ''
                          }`}
                        >
                          {typeof value === 'boolean' ? (
                            value ? (
                              <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-slate-700 font-medium">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            {t.faq}
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {locale === 'ar' ? faq.questionAr : faq.question}
                </h3>
                <p className="text-slate-600">
                  {locale === 'ar' ? faq.answerAr : faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.startTrial}
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            {t.trialCta}
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/auth/register">
              {locale === 'ar' ? 'ابدأ الآن' : 'Get Started Now'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

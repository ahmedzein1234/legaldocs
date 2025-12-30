'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, FileText, Scale, Shield, CreditCard, AlertTriangle, Gavel, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  const lastUpdated = 'November 30, 2024';

  const sections = [
    {
      id: 'acceptance',
      icon: FileText,
      title: locale === 'ar' ? 'القبول والأهلية' : locale === 'ur' ? 'قبولیت اور اہلیت' : 'Acceptance & Eligibility',
      content: locale === 'ar' ? `
        <p>باستخدامك لمنصة Qannoni، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.</p>
        <h4>متطلبات الأهلية:</h4>
        <ul>
          <li>يجب أن يكون عمرك 18 عاماً على الأقل</li>
          <li>يجب أن تكون لديك الصلاحية القانونية للدخول في عقود ملزمة</li>
          <li>يجب ألا تكون محظوراً من استخدام خدماتنا بموجب أي قانون معمول به</li>
          <li>إذا كنت تستخدم المنصة نيابة عن شركة، فيجب أن تكون لديك السلطة لإلزام تلك الشركة</li>
        </ul>
      ` : locale === 'ur' ? `
        <p>Qannoni پلیٹ فارم استعمال کرکے، آپ ان شرائط و ضوابط سے متفق ہوتے ہیں۔ اگر آپ کسی شرط سے متفق نہیں ہیں، تو براہ کرم ہماری خدمات استعمال نہ کریں۔</p>
        <h4>اہلیت کے تقاضے:</h4>
        <ul>
          <li>آپ کی عمر کم از کم 18 سال ہونی چاہیے</li>
          <li>آپ کے پاس قانونی معاہدوں میں داخل ہونے کی قانونی صلاحیت ہونی چاہیے</li>
          <li>کسی بھی قابل اطلاق قانون کے تحت آپ پر ہماری خدمات کے استعمال پر پابندی نہیں ہونی چاہیے</li>
          <li>اگر کمپنی کی جانب سے استعمال کر رہے ہیں، تو آپ کے پاس اس کمپنی کو پابند کرنے کا اختیار ہونا چاہیے</li>
        </ul>
      ` : `
        <p>By using the Qannoni platform, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, please do not use our services.</p>
        <h4>Eligibility Requirements:</h4>
        <ul>
          <li>You must be at least 18 years old</li>
          <li>You must have the legal capacity to enter into binding contracts</li>
          <li>You must not be prohibited from using our services under any applicable law</li>
          <li>If using on behalf of a company, you must have authority to bind that company</li>
        </ul>
      `
    },
    {
      id: 'service',
      icon: Scale,
      title: locale === 'ar' ? 'وصف الخدمة' : locale === 'ur' ? 'خدمات کی تفصیل' : 'Service Description',
      content: locale === 'ar' ? `
        <p>Qannoni هي منصة برمجية كخدمة (SaaS) توفر:</p>
        <ul>
          <li><strong>إنشاء المستندات بالذكاء الاصطناعي:</strong> قوالب مستندات قانونية آلية مدعومة بتقنية الذكاء الاصطناعي</li>
          <li><strong>التوقيع الرقمي:</strong> إمكانيات التوقيع الإلكتروني للمستندات</li>
          <li><strong>إدارة المستندات:</strong> تخزين وتنظيم واسترجاع المستندات بشكل آمن</li>
          <li><strong>دعم متعدد اللغات:</strong> الإنجليزية والعربية والأردية</li>
          <li><strong>الامتثال لدول الخليج:</strong> قوالب مصممة لدول الإمارات والسعودية وقطر والكويت والبحرين وعُمان</li>
        </ul>
        <p><strong>هام:</strong> Qannoni هي شركة تقنية، وليست مكتب محاماة. نحن لا نقدم استشارات قانونية.</p>
      ` : locale === 'ur' ? `
        <p>Qannoni ایک سافٹ ویئر بطور سروس (SaaS) پلیٹ فارم ہے جو فراہم کرتا ہے:</p>
        <ul>
          <li><strong>AI دستاویز تخلیق:</strong> AI سے چلنے والے خودکار قانونی دستاویز ٹیمپلیٹس</li>
          <li><strong>ڈیجیٹل دستخط:</strong> الیکٹرانک دستاویز دستخط کی صلاحیتیں</li>
          <li><strong>دستاویز انتظام:</strong> محفوظ ذخیرہ، تنظیم، اور بازیافت</li>
          <li><strong>کثیر لسانی معاونت:</strong> انگریزی، عربی، اور اردو</li>
          <li><strong>خلیجی تعمیل:</strong> متحدہ عرب امارات، سعودی عرب، قطر، کویت، بحرین، عمان کے لیے ٹیمپلیٹس</li>
        </ul>
        <p><strong>اہم:</strong> Qannoni ایک ٹیکنالوجی کمپنی ہے، قانونی فرم نہیں۔ ہم قانونی مشورہ فراہم نہیں کرتے۔</p>
      ` : `
        <p>Qannoni is a Software-as-a-Service (SaaS) platform that provides:</p>
        <ul>
          <li><strong>AI Document Generation:</strong> AI-powered automated legal document templates</li>
          <li><strong>Digital Signatures:</strong> Electronic document signing capabilities</li>
          <li><strong>Document Management:</strong> Secure storage, organization, and retrieval</li>
          <li><strong>Multi-language Support:</strong> English, Arabic, and Urdu</li>
          <li><strong>GCC Compliance:</strong> Templates designed for UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman</li>
        </ul>
        <p><strong>Important:</strong> Qannoni is a technology company, NOT a law firm. We do not provide legal advice.</p>
      `
    },
    {
      id: 'disclaimer',
      icon: AlertTriangle,
      title: locale === 'ar' ? 'إخلاء المسؤولية القانونية' : locale === 'ur' ? 'قانونی خدمات کا اعلان' : 'Legal Services Disclaimer',
      content: locale === 'ar' ? `
        <div class="warning-box">
          <p><strong>تحذير هام:</strong></p>
          <ul>
            <li>Qannoni ليست مكتب محاماة ولا تقدم خدمات قانونية</li>
            <li>المستندات المُنشأة هي قوالب للأغراض المعلوماتية فقط</li>
            <li>لا تتشكل علاقة محامي-موكل من خلال استخدام منصتنا</li>
            <li>يجب عليك استشارة محامٍ مؤهل لأي مسائل قانونية</li>
            <li>نحن لا نضمن الصحة القانونية أو قابلية التنفيذ لأي مستند</li>
            <li>قد تتطلب المستندات مراجعة مهنية وتوثيقاً وتصديقاً</li>
          </ul>
        </div>
      ` : locale === 'ur' ? `
        <div class="warning-box">
          <p><strong>اہم انتباہ:</strong></p>
          <ul>
            <li>Qannoni قانونی فرم نہیں ہے اور قانونی خدمات فراہم نہیں کرتی</li>
            <li>تیار کردہ دستاویزات صرف معلوماتی مقاصد کے لیے ٹیمپلیٹس ہیں</li>
            <li>ہمارے پلیٹ فارم کے استعمال سے کوئی وکیل-موکل تعلق قائم نہیں ہوتا</li>
            <li>کسی بھی قانونی معاملے کے لیے آپ کو اہل وکیل سے مشورہ کرنا چاہیے</li>
            <li>ہم کسی دستاویز کی قانونی درستگی یا نفاذ کی ضمانت نہیں دیتے</li>
            <li>دستاویزات کو پیشہ ورانہ جائزہ، نوٹرائزیشن، اور تصدیق کی ضرورت ہو سکتی ہے</li>
          </ul>
        </div>
      ` : `
        <div class="warning-box">
          <p><strong>Critical Warning:</strong></p>
          <ul>
            <li>Qannoni is NOT a law firm and does NOT provide legal services</li>
            <li>Generated documents are templates for informational purposes only</li>
            <li>No attorney-client relationship is formed through use of our platform</li>
            <li>You MUST consult a qualified attorney for any legal matters</li>
            <li>We do NOT guarantee legal validity or enforceability of any document</li>
            <li>Documents may require professional review, notarization, and attestation</li>
          </ul>
        </div>
      `
    },
    {
      id: 'user-obligations',
      icon: Shield,
      title: locale === 'ar' ? 'التزامات المستخدم' : locale === 'ur' ? 'صارف کی ذمہ داریاں' : 'User Obligations',
      content: locale === 'ar' ? `
        <p>بصفتك مستخدماً لـ Qannoni، فإنك توافق على:</p>
        <h4>تقديم معلومات دقيقة</h4>
        <ul>
          <li>تقديم معلومات صحيحة ودقيقة وحديثة</li>
          <li>الحفاظ على أمان بيانات اعتماد حسابك</li>
          <li>إخطارنا فوراً بأي استخدام غير مصرح به</li>
        </ul>
        <h4>الاستخدامات المحظورة</h4>
        <ul>
          <li>استخدام المنصة لأي غرض غير قانوني</li>
          <li>إنشاء مستندات احتيالية أو خادعة</li>
          <li>انتهاك أي قوانين أو لوائح معمول بها</li>
          <li>التدخل في أمن أو سلامة المنصة</li>
          <li>محاولة الهندسة العكسية لأي جزء من الخدمة</li>
        </ul>
      ` : locale === 'ur' ? `
        <p>Qannoni کے صارف کے طور پر، آپ متفق ہیں:</p>
        <h4>درست معلومات فراہم کرنا</h4>
        <ul>
          <li>سچی، درست، اور موجودہ معلومات فراہم کریں</li>
          <li>اپنے اکاؤنٹ کی اسناد کو محفوظ رکھیں</li>
          <li>کسی بھی غیر مجاز استعمال کی فوری اطلاع دیں</li>
        </ul>
        <h4>ممنوعہ استعمال</h4>
        <ul>
          <li>کسی بھی غیر قانونی مقصد کے لیے پلیٹ فارم کا استعمال</li>
          <li>دھوکہ دہی یا گمراہ کن دستاویزات بنانا</li>
          <li>کسی بھی قابل اطلاق قوانین یا ضوابط کی خلاف ورزی</li>
          <li>پلیٹ فارم کی سیکیورٹی یا سالمیت میں مداخلت</li>
          <li>سروس کے کسی حصے کی ریورس انجینئرنگ کی کوشش</li>
        </ul>
      ` : `
        <p>As a user of Qannoni, you agree to:</p>
        <h4>Provide Accurate Information</h4>
        <ul>
          <li>Provide truthful, accurate, and current information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>
        <h4>Prohibited Uses</h4>
        <ul>
          <li>Using the platform for any unlawful purpose</li>
          <li>Creating fraudulent or deceptive documents</li>
          <li>Violating any applicable laws or regulations</li>
          <li>Interfering with platform security or integrity</li>
          <li>Attempting to reverse engineer any part of the service</li>
        </ul>
      `
    },
    {
      id: 'intellectual-property',
      icon: FileText,
      title: locale === 'ar' ? 'الملكية الفكرية' : locale === 'ur' ? 'دانشورانہ ملکیت' : 'Intellectual Property',
      content: locale === 'ar' ? `
        <h4>ملكية المنصة</h4>
        <p>Qannoni تملك جميع الحقوق في المنصة، بما في ذلك:</p>
        <ul>
          <li>البرنامج والشفرة الأساسية</li>
          <li>هياكل وصيغ القوالب</li>
          <li>العلامات التجارية والشعارات</li>
          <li>واجهة المستخدم وتصميمها</li>
        </ul>
        <h4>ملكية المحتوى الخاص بك</h4>
        <p>أنت تحتفظ بملكية:</p>
        <ul>
          <li>المعلومات التي تدخلها في المستندات</li>
          <li>المستندات النهائية المُنشأة</li>
          <li>التخصيصات والتعديلات الخاصة بك</li>
        </ul>
      ` : locale === 'ur' ? `
        <h4>پلیٹ فارم کی ملکیت</h4>
        <p>Qannoni پلیٹ فارم کے تمام حقوق کی مالک ہے، بشمول:</p>
        <ul>
          <li>سافٹ ویئر اور بنیادی کوڈ</li>
          <li>ٹیمپلیٹ ڈھانچے اور فارمیٹس</li>
          <li>ٹریڈ مارکس اور برانڈنگ</li>
          <li>یوزر انٹرفیس اور ڈیزائن</li>
        </ul>
        <h4>آپ کے مواد کی ملکیت</h4>
        <p>آپ ملکیت برقرار رکھتے ہیں:</p>
        <ul>
          <li>آپ کی دستاویزات میں داخل کردہ معلومات</li>
          <li>حتمی تیار کردہ دستاویزات</li>
          <li>آپ کی تخصیصات اور ترامیم</li>
        </ul>
      ` : `
        <h4>Platform Ownership</h4>
        <p>Qannoni owns all rights to the platform, including:</p>
        <ul>
          <li>Software and underlying code</li>
          <li>Template structures and formats</li>
          <li>Trademarks and branding</li>
          <li>User interface and design</li>
        </ul>
        <h4>Your Content Ownership</h4>
        <p>You retain ownership of:</p>
        <ul>
          <li>Information you input into documents</li>
          <li>Final generated documents</li>
          <li>Your customizations and modifications</li>
        </ul>
      `
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: locale === 'ar' ? 'شروط الدفع' : locale === 'ur' ? 'ادائیگی کی شرائط' : 'Payment Terms',
      content: locale === 'ar' ? `
        <h4>خطط التسعير</h4>
        <ul>
          <li><strong>الخطة المجانية:</strong> ميزات أساسية مع قيود على الاستخدام</li>
          <li><strong>الخطة الاحترافية:</strong> ميزات موسعة للمحترفين</li>
          <li><strong>خطة المؤسسات:</strong> حلول مخصصة للشركات</li>
        </ul>
        <h4>الفوترة</h4>
        <ul>
          <li>تتم الفوترة للاشتراكات شهرياً أو سنوياً</li>
          <li>الدفع مستحق في بداية كل فترة فوترة</li>
          <li>جميع الأسعار بالدرهم الإماراتي ما لم يُذكر خلاف ذلك</li>
        </ul>
        <h4>سياسة الاسترداد</h4>
        <ul>
          <li>استرداد خلال 14 يوماً للاشتراكات السنوية الجديدة</li>
          <li>لا استرداد للاشتراكات الشهرية</li>
          <li>لا استرداد للفترات المستخدمة جزئياً</li>
        </ul>
      ` : locale === 'ur' ? `
        <h4>قیمتوں کے منصوبے</h4>
        <ul>
          <li><strong>مفت پلان:</strong> استعمال کی حدود کے ساتھ بنیادی خصوصیات</li>
          <li><strong>پرو پلان:</strong> پیشہ ور افراد کے لیے توسیعی خصوصیات</li>
          <li><strong>انٹرپرائز:</strong> کاروباروں کے لیے حسب ضرورت حل</li>
        </ul>
        <h4>بلنگ</h4>
        <ul>
          <li>سبسکرپشنز ماہانہ یا سالانہ بل کی جاتی ہیں</li>
          <li>ہر بلنگ مدت کے آغاز پر ادائیگی واجب ہے</li>
          <li>تمام قیمتیں AED میں ہیں جب تک کہ دوسری صورت میں نہ بتایا جائے</li>
        </ul>
        <h4>واپسی کی پالیسی</h4>
        <ul>
          <li>نئی سالانہ سبسکرپشنز کے لیے 14 دن کی واپسی</li>
          <li>ماہانہ سبسکرپشنز کے لیے کوئی واپسی نہیں</li>
          <li>جزوی طور پر استعمال شدہ ادوار کے لیے کوئی واپسی نہیں</li>
        </ul>
      ` : `
        <h4>Pricing Plans</h4>
        <ul>
          <li><strong>Free Plan:</strong> Basic features with usage limits</li>
          <li><strong>Pro Plan:</strong> Extended features for professionals</li>
          <li><strong>Enterprise:</strong> Custom solutions for businesses</li>
        </ul>
        <h4>Billing</h4>
        <ul>
          <li>Subscriptions are billed monthly or annually</li>
          <li>Payment is due at the beginning of each billing period</li>
          <li>All prices are in AED unless otherwise stated</li>
        </ul>
        <h4>Refund Policy</h4>
        <ul>
          <li>14-day refund for new annual subscriptions</li>
          <li>No refunds for monthly subscriptions</li>
          <li>No refunds for partially used periods</li>
        </ul>
      `
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: locale === 'ar' ? 'تحديد المسؤولية' : locale === 'ur' ? 'ذمہ داری کی حد' : 'Limitation of Liability',
      content: locale === 'ar' ? `
        <h4>إخلاء المسؤولية عن الضمان</h4>
        <p>يتم تقديم المنصة "كما هي" دون أي ضمانات من أي نوع، صريحة أو ضمنية.</p>
        <h4>حدود المسؤولية</h4>
        <ul>
          <li>لن تكون Qannoni مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية</li>
          <li>لا نتحمل مسؤولية العواقب القانونية الناتجة عن استخدام مستنداتنا</li>
          <li>يقتصر الحد الأقصى لمسؤوليتنا على المبلغ المدفوع لنا في الأشهر الـ 12 الماضية</li>
        </ul>
        <h4>التعويض</h4>
        <p>توافق على تعويض Qannoni من أي مطالبات ناشئة عن استخدامك للمنصة.</p>
      ` : locale === 'ur' ? `
        <h4>وارنٹی کا اعلان</h4>
        <p>پلیٹ فارم "جیسا ہے" فراہم کیا جاتا ہے کسی بھی قسم کی وارنٹی کے بغیر، واضح یا مضمر۔</p>
        <h4>ذمہ داری کی حدود</h4>
        <ul>
          <li>Qannoni کسی بھی بالواسطہ، حادثاتی، خاص، یا نتیجہ خیز نقصانات کے لیے ذمہ دار نہیں ہوگی</li>
          <li>ہم اپنے دستاویزات کے استعمال سے پیدا ہونے والے قانونی نتائج کے ذمہ دار نہیں ہیں</li>
          <li>ہماری زیادہ سے زیادہ ذمہ داری پچھلے 12 مہینوں میں ہمیں ادا کی گئی رقم تک محدود ہے</li>
        </ul>
        <h4>معاوضہ</h4>
        <p>آپ پلیٹ فارم کے اپنے استعمال سے پیدا ہونے والے کسی بھی دعووں سے Qannoni کو معاوضہ دینے پر متفق ہیں۔</p>
      ` : `
        <h4>Warranty Disclaimer</h4>
        <p>The platform is provided "as is" without warranties of any kind, express or implied.</p>
        <h4>Liability Limits</h4>
        <ul>
          <li>Qannoni shall not be liable for any indirect, incidental, special, or consequential damages</li>
          <li>We are not responsible for legal consequences arising from use of our documents</li>
          <li>Our maximum liability is limited to the amount paid to us in the past 12 months</li>
        </ul>
        <h4>Indemnification</h4>
        <p>You agree to indemnify Qannoni from any claims arising from your use of the platform.</p>
      `
    },
    {
      id: 'termination',
      icon: Shield,
      title: locale === 'ar' ? 'الإنهاء' : locale === 'ur' ? 'ختم کرنا' : 'Termination',
      content: locale === 'ar' ? `
        <h4>الإنهاء من قبل المستخدم</h4>
        <ul>
          <li>يمكنك إلغاء حسابك في أي وقت من خلال الإعدادات</li>
          <li>ستظل الأرصدة المتبقية غير مستردة</li>
          <li>ستتمكن من الوصول إلى مستنداتك حتى نهاية فترة الفوترة</li>
        </ul>
        <h4>الإنهاء من قبلنا</h4>
        <ul>
          <li>يمكننا تعليق أو إنهاء حسابك بسبب انتهاك هذه الشروط</li>
          <li>قد يحدث الإنهاء الفوري بسبب النشاط الاحتيالي</li>
          <li>سنقدم إشعاراً عندما يكون ذلك ممكناً</li>
        </ul>
        <h4>بعد الإنهاء</h4>
        <ul>
          <li>ستكون بياناتك متاحة للتصدير لمدة 30 يوماً</li>
          <li>بعد 30 يوماً، قد يتم حذف البيانات نهائياً</li>
          <li>تظل بعض الأحكام سارية بعد الإنهاء</li>
        </ul>
      ` : locale === 'ur' ? `
        <h4>صارف کی طرف سے ختم کرنا</h4>
        <ul>
          <li>آپ کسی بھی وقت سیٹنگز کے ذریعے اپنا اکاؤنٹ منسوخ کر سکتے ہیں</li>
          <li>بقایا بیلنس واپس نہیں کیا جائے گا</li>
          <li>بلنگ مدت کے اختتام تک آپ کو اپنے دستاویزات تک رسائی حاصل ہوگی</li>
        </ul>
        <h4>ہماری طرف سے ختم کرنا</h4>
        <ul>
          <li>ان شرائط کی خلاف ورزی پر ہم آپ کا اکاؤنٹ معطل یا ختم کر سکتے ہیں</li>
          <li>دھوکہ دہی کی سرگرمی کے لیے فوری ختم ہو سکتا ہے</li>
          <li>ممکن ہونے پر ہم نوٹس فراہم کریں گے</li>
        </ul>
        <h4>ختم کرنے کے بعد</h4>
        <ul>
          <li>آپ کا ڈیٹا 30 دن تک برآمد کے لیے دستیاب رہے گا</li>
          <li>30 دن کے بعد، ڈیٹا مستقل طور پر حذف ہو سکتا ہے</li>
          <li>کچھ دفعات ختم کرنے کے بعد بھی برقرار رہتی ہیں</li>
        </ul>
      ` : `
        <h4>Termination by User</h4>
        <ul>
          <li>You may cancel your account at any time through settings</li>
          <li>Remaining balances will not be refunded</li>
          <li>You will have access to your documents until end of billing period</li>
        </ul>
        <h4>Termination by Us</h4>
        <ul>
          <li>We may suspend or terminate your account for violation of these terms</li>
          <li>Immediate termination may occur for fraudulent activity</li>
          <li>We will provide notice when reasonably possible</li>
        </ul>
        <h4>After Termination</h4>
        <ul>
          <li>Your data will be available for export for 30 days</li>
          <li>After 30 days, data may be permanently deleted</li>
          <li>Some provisions survive termination</li>
        </ul>
      `
    },
    {
      id: 'governing-law',
      icon: Gavel,
      title: locale === 'ar' ? 'القانون الحاكم' : locale === 'ur' ? 'حاکم قانون' : 'Governing Law',
      content: locale === 'ar' ? `
        <h4>الاختصاص القضائي</h4>
        <p>تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة وتُفسر وفقاً لها.</p>
        <h4>حل النزاعات</h4>
        <ul>
          <li>يجب أولاً محاولة حل النزاعات ودياً</li>
          <li>تخضع النزاعات التي لم تُحل للتحكيم في دبي</li>
          <li>لغة التحكيم ستكون الإنجليزية</li>
          <li>يكون قرار التحكيم نهائياً وملزماً</li>
        </ul>
        <h4>التنازل عن الدعاوى الجماعية</h4>
        <p>توافق على حل النزاعات بشكل فردي، وليس كجزء من دعوى جماعية.</p>
      ` : locale === 'ur' ? `
        <h4>دائرہ اختیار</h4>
        <p>یہ شرائط متحدہ عرب امارات کے قوانین کے تحت چلائی اور تشریح کی جائیں گی۔</p>
        <h4>تنازعات کا حل</h4>
        <ul>
          <li>تنازعات کو پہلے دوستانہ طریقے سے حل کرنے کی کوشش کی جانی چاہیے</li>
          <li>حل نہ ہونے والے تنازعات دبئی میں ثالثی کے تابع ہوں گے</li>
          <li>ثالثی کی زبان انگریزی ہوگی</li>
          <li>ثالثی کا فیصلہ حتمی اور پابند ہوگا</li>
        </ul>
        <h4>اجتماعی کارروائی کا دستبرداری</h4>
        <p>آپ انفرادی طور پر تنازعات حل کرنے پر متفق ہیں، اجتماعی کارروائی کے حصے کے طور پر نہیں۔</p>
      ` : `
        <h4>Jurisdiction</h4>
        <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates.</p>
        <h4>Dispute Resolution</h4>
        <ul>
          <li>Disputes must first be attempted to be resolved amicably</li>
          <li>Unresolved disputes shall be subject to arbitration in Dubai</li>
          <li>The language of arbitration shall be English</li>
          <li>The arbitration decision shall be final and binding</li>
        </ul>
        <h4>Class Action Waiver</h4>
        <p>You agree to resolve disputes individually, not as part of a class action.</p>
      `
    },
    {
      id: 'contact',
      icon: Mail,
      title: locale === 'ar' ? 'اتصل بنا' : locale === 'ur' ? 'ہم سے رابطہ کریں' : 'Contact Us',
      content: locale === 'ar' ? `
        <p>إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا:</p>
        <ul>
          <li><strong>البريد الإلكتروني:</strong> legal@qannoni.com</li>
          <li><strong>العنوان:</strong> دبي، الإمارات العربية المتحدة</li>
          <li><strong>ساعات العمل:</strong> الأحد - الخميس، 9 صباحاً - 6 مساءً (توقيت الخليج)</li>
        </ul>
      ` : locale === 'ur' ? `
        <p>اگر آپ کے ان شرائط و ضوابط کے بارے میں کوئی سوالات ہیں، تو براہ کرم ہم سے رابطہ کریں:</p>
        <ul>
          <li><strong>ای میل:</strong> legal@qannoni.com</li>
          <li><strong>پتہ:</strong> دبئی، متحدہ عرب امارات</li>
          <li><strong>کاروباری اوقات:</strong> اتوار - جمعرات، صبح 9 بجے - شام 6 بجے (GST)</li>
        </ul>
      ` : `
        <p>If you have any questions about these Terms and Conditions, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> legal@qannoni.com</li>
          <li><strong>Address:</strong> 131 Continental Dr, Suite 305, Newark, DE 19713 US</li>
          <li><strong>Business Hours:</strong> Sunday - Thursday, 9 AM - 6 PM (GST)</li>
        </ul>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${locale}/dashboard`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {locale === 'ar' ? 'العودة' : locale === 'ur' ? 'واپس' : 'Back'}
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-2">
            {locale === 'ar' ? 'الشروط والأحكام' : locale === 'ur' ? 'شرائط و ضوابط' : 'Terms and Conditions'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? `آخر تحديث: ${lastUpdated}` : locale === 'ur' ? `آخری تازہ کاری: ${lastUpdated}` : `Last Updated: ${lastUpdated}`}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              {locale === 'ar'
                ? 'مرحباً بك في Qannoni. تحكم هذه الشروط والأحكام استخدامك لمنصتنا. يرجى قراءتها بعناية قبل استخدام خدماتنا. باستخدام Qannoni، فإنك توافق على هذه الشروط.'
                : locale === 'ur'
                ? 'Qannoni میں خوش آمدید۔ یہ شرائط و ضوابط ہمارے پلیٹ فارم کے آپ کے استعمال کو کنٹرول کرتے ہیں۔ براہ کرم ہماری خدمات استعمال کرنے سے پہلے انہیں احتیاط سے پڑھیں۔ Qannoni استعمال کرکے، آپ ان شرائط سے متفق ہوتے ہیں۔'
                : 'Welcome to Qannoni. These Terms and Conditions govern your use of our platform. Please read them carefully before using our services. By using Qannoni, you agree to these terms.'
              }
            </p>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                  {locale === 'ar' ? 'إشعار مهم' : locale === 'ur' ? 'اہم نوٹس' : 'Important Notice'}
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  {locale === 'ar'
                    ? 'Qannoni هي شركة برمجيات تقنية. نحن لسنا مكتب محاماة ولا نقدم خدمات أو استشارات قانونية. القوالب والمستندات المُنشأة من خلال منصتنا للأغراض المعلوماتية فقط ويجب مراجعتها من قبل متخصص قانوني مؤهل.'
                    : locale === 'ur'
                    ? 'Qannoni ایک سافٹ ویئر ٹیکنالوجی کمپنی ہے۔ ہم قانونی فرم نہیں ہیں اور قانونی خدمات یا مشورہ فراہم نہیں کرتے۔ ہمارے پلیٹ فارم کے ذریعے تیار کردہ ٹیمپلیٹس اور دستاویزات صرف معلوماتی مقاصد کے لیے ہیں اور اہل قانونی پیشہ ور کے ذریعے جائزہ لیا جانا چاہیے۔'
                    : 'Qannoni is a software technology company. We are NOT a law firm and do NOT provide legal services or advice. Templates and documents generated through our platform are for informational purposes only and should be reviewed by a qualified legal professional.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {locale === 'ar' ? 'جدول المحتويات' : locale === 'ur' ? 'فہرست' : 'Table of Contents'}
            </h2>
            <nav className="grid gap-2 sm:grid-cols-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-primary font-medium">{index + 1}.</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none
                      prose-h4:text-base prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
                      prose-ul:my-2 prose-li:my-0.5
                      prose-p:my-2 prose-p:leading-relaxed
                      [&_.warning-box]:bg-amber-50 [&_.warning-box]:dark:bg-amber-950/30
                      [&_.warning-box]:border [&_.warning-box]:border-amber-200 [&_.warning-box]:dark:border-amber-800
                      [&_.warning-box]:rounded-lg [&_.warning-box]:p-4 [&_.warning-box]:my-4"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Acceptance */}
        <Card className="mt-8 border-primary">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'ar' ? 'قبول الشروط' : locale === 'ur' ? 'شرائط کی قبولیت' : 'Acceptance of Terms'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {locale === 'ar'
                ? 'باستخدامك لـ Qannoni، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بهذه الشروط والأحكام.'
                : locale === 'ur'
                ? 'Qannoni استعمال کرکے، آپ تسلیم کرتے ہیں کہ آپ نے یہ شرائط و ضوابط پڑھ لیے ہیں، سمجھ لیے ہیں، اور ان سے پابند رہنے پر متفق ہیں۔'
                : 'By using Qannoni, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.'
              }
            </p>
            <div className="flex justify-center gap-4">
              <Link href={`/${locale}/legal/privacy`}>
                <Button variant="outline">
                  {locale === 'ar' ? 'سياسة الخصوصية' : locale === 'ur' ? 'رازداری کی پالیسی' : 'Privacy Policy'}
                </Button>
              </Link>
              <Link href={`/${locale}/legal/disclaimer`}>
                <Button variant="outline">
                  {locale === 'ar' ? 'إخلاء المسؤولية' : locale === 'ur' ? 'دستبرداری' : 'Disclaimer'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {locale === 'ar'
              ? `© ${new Date().getFullYear()} Qannoni. جميع الحقوق محفوظة. شركة برمجيات - ليست خدمة قانونية.`
              : locale === 'ur'
              ? `© ${new Date().getFullYear()} Qannoni. جملہ حقوق محفوظ ہیں۔ سافٹ ویئر کمپنی - قانونی سروس نہیں۔`
              : `© ${new Date().getFullYear()} Qannoni. All rights reserved. Software Company - Not a Legal Service.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

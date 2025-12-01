'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  FileText,
  Shield,
  Zap,
  Users,
  Globe,
  Bot,
  PenTool,
  Scale,
  ArrowRight,
  Check,
  Play,
  Star,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Clock,
  Award,
  MessageCircle,
  Video,
  Phone,
  Building2,
  Briefcase,
  Heart,
  LayoutDashboard,
  LogOut,
  AlertTriangle,
  Banknote,
  Languages,
  Lock,
  Key,
  FileCheck,
  Rocket,
  Home,
  Lightbulb,
  ChevronDown,
  Minus,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HomePageClientProps {
  locale: string;
}

const translations = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      lawyers: 'Find Lawyers',
      login: 'Sign In',
      getStarted: 'Get Started Free',
      dashboard: 'Dashboard',
      logout: 'Log Out',
    },
    hero: {
      badge: 'Trusted by 500+ UAE businesses',
      title: 'Legal documents',
      titleHighlight: 'made human',
      subtitle: 'Stop wrestling with complex legal jargon. Create professionally-crafted contracts, NDAs, and legal documents in minutes — not hours.',
      cta: 'Start Creating for Free',
      ctaSecondary: 'Watch Demo',
      stats: {
        documents: '10,000+',
        documentsLabel: 'Documents Created',
        lawyers: '150+',
        lawyersLabel: 'Expert Lawyers',
        countries: '6',
        countriesLabel: 'GCC Countries',
      },
    },
    problemSolution: {
      label: 'The Problem We Solve',
      title: 'Legal work shouldn\'t be',
      titleHighlight: 'this painful',
      problems: [
        {
          icon: 'Clock',
          title: 'Hours of Research',
          description: 'Spending days figuring out what clauses your contract needs',
        },
        {
          icon: 'Banknote',
          title: 'Expensive Lawyers',
          description: 'Paying AED 2,000+ for a simple employment contract',
        },
        {
          icon: 'AlertTriangle',
          title: 'Fear of Mistakes',
          description: 'Worrying if your DIY contract will hold up in court',
        },
        {
          icon: 'Languages',
          title: 'Translation Nightmares',
          description: 'Struggling to get accurate Arabic legal translations',
        },
      ],
      solutionTitle: 'There\'s a better way',
      solutionDescription: 'LegalDocs combines AI intelligence with UAE legal expertise to give you professional documents in minutes.',
    },
    features: {
      label: 'Why Choose LegalDocs',
      title: 'Everything you need.',
      titleHighlight: 'Nothing you don\'t.',
      subtitle: 'We\'ve stripped away the complexity. What\'s left is a powerful, intuitive platform that just works.',
      items: [
        {
          icon: 'Bot',
          title: 'AI That Understands Law',
          description: 'Our AI doesn\'t just fill templates. It understands UAE legal requirements and adapts documents to your specific situation.',
          highlight: 'Smart & Contextual',
        },
        {
          icon: 'PenTool',
          title: 'Sign Anywhere',
          description: 'Legally-binding digital signatures that work on any device. No apps to download, no accounts required for signers.',
          highlight: 'UAE TDRA Compliant',
        },
        {
          icon: 'Globe',
          title: 'Built for the Region',
          description: 'Every document is crafted for UAE and GCC compliance. Arabic and English, formatted exactly as courts expect.',
          highlight: 'Bilingual Support',
        },
        {
          icon: 'Users',
          title: 'Expert When You Need',
          description: 'Connect with verified lawyers for consultation. Video calls, phone calls, or messages — your choice.',
          highlight: '24/7 Available',
        },
      ],
    },
    showcase: {
      label: 'See It In Action',
      title: 'Powerful features,',
      titleHighlight: 'simple interface',
      tabs: [
        {
          id: 'generate',
          title: 'AI Document Generation',
          description: 'Describe what you need in plain language. Our AI understands context, suggests relevant clauses, and generates a complete, legally-sound document tailored to UAE law.',
          features: ['Natural language input', 'Smart clause suggestions', 'UAE law compliance', 'Instant generation'],
        },
        {
          id: 'review',
          title: 'Smart Document Review',
          description: 'Upload any contract and get instant AI analysis. Identify risks, missing clauses, and unfavorable terms before you sign.',
          features: ['Risk scoring', 'Clause analysis', 'Improvement suggestions', 'Plain language explanations'],
        },
        {
          id: 'sign',
          title: 'Digital Signatures',
          description: 'Send documents for signature with a single click. Track who has signed, send reminders, and get legally-binding signatures from anywhere.',
          features: ['One-click sending', 'Real-time tracking', 'Automatic reminders', 'Audit trail'],
        },
        {
          id: 'consult',
          title: 'Lawyer Consultations',
          description: 'When you need human expertise, connect with verified UAE lawyers instantly. Video calls, phone calls, or chat — your choice.',
          features: ['Video consultations', 'Instant messaging', 'Document review', 'Fixed-price quotes'],
        },
      ],
    },
    useCases: {
      label: 'Built For You',
      title: 'Whether you\'re a startup founder',
      titleHighlight: 'or an enterprise team',
      cases: [
        {
          icon: 'Rocket',
          title: 'Startups & Entrepreneurs',
          description: 'Launch faster with ready-to-use founder agreements, NDAs, and employment contracts. No need to spend your runway on legal fees.',
          benefits: ['Founder agreements', 'SAFE notes', 'Employee contracts', 'NDA templates'],
        },
        {
          icon: 'Building2',
          title: 'Small & Medium Businesses',
          description: 'Streamline your operations with professional contracts for clients, vendors, and employees. Scale without the legal overhead.',
          benefits: ['Service agreements', 'Vendor contracts', 'HR documents', 'Partnership deals'],
        },
        {
          icon: 'Briefcase',
          title: 'HR & People Teams',
          description: 'Onboard employees faster with compliant contracts in Arabic and English. Manage the entire signing process digitally.',
          benefits: ['Employment contracts', 'Offer letters', 'Policy documents', 'Termination letters'],
        },
        {
          icon: 'Home',
          title: 'Real Estate Professionals',
          description: 'Close deals faster with UAE-compliant tenancy contracts, sale agreements, and property management documents.',
          benefits: ['Tenancy contracts', 'Sale agreements', 'Management contracts', 'MoU templates'],
        },
      ],
    },
    howItWorks: {
      label: 'Simple Process',
      title: 'Three steps to',
      titleHighlight: 'legal peace of mind',
      steps: [
        {
          number: '01',
          title: 'Tell us what you need',
          description: 'Answer a few simple questions in plain language. No legal expertise required. Our AI guides you through the process.',
          detail: 'Example: "I need an employment contract for a marketing manager with a 3-month probation period and a non-compete clause."',
        },
        {
          number: '02',
          title: 'Review your document',
          description: 'Our AI generates a professionally-crafted document in seconds. Review it in our editor, make any adjustments, and see changes in real-time.',
          detail: 'Get both Arabic and English versions instantly. Edit any section with our intuitive editor.',
        },
        {
          number: '03',
          title: 'Sign and share',
          description: 'Send for signatures and track everything in real-time. Signers don\'t need an account — they just click the link and sign.',
          detail: 'Receive notifications when documents are viewed and signed. Download certified copies anytime.',
        },
      ],
    },
    documents: {
      label: 'Document Library',
      title: '50+ Legal Templates',
      titleHighlight: 'Ready in Minutes',
      subtitle: 'From simple NDAs to complex partnership agreements. Every template is crafted by UAE lawyers and continuously updated.',
      categories: [
        { name: 'Employment', count: 12, icon: 'Briefcase', examples: ['Employment Contract', 'Offer Letter', 'Termination Letter', 'Non-Compete Agreement'] },
        { name: 'Business', count: 18, icon: 'Building2', examples: ['Service Agreement', 'Partnership Agreement', 'Shareholder Agreement', 'MoU'] },
        { name: 'Real Estate', count: 8, icon: 'Home', examples: ['Tenancy Contract', 'Sale Agreement', 'Property Management', 'Lease Agreement'] },
        { name: 'Personal', count: 6, icon: 'Heart', examples: ['Power of Attorney', 'Will', 'Prenuptial Agreement', 'Loan Agreement'] },
        { name: 'Intellectual Property', count: 6, icon: 'Lightbulb', examples: ['NDA', 'Copyright Assignment', 'Licensing Agreement', 'Trademark License'] },
      ],
      popular: [
        'Employment Contract',
        'Non-Disclosure Agreement',
        'Service Agreement',
        'Power of Attorney',
        'Tenancy Contract',
        'Partnership Agreement',
      ],
    },
    comparison: {
      label: 'Why LegalDocs',
      title: 'The smarter way to handle',
      titleHighlight: 'legal documents',
      traditional: {
        title: 'Traditional Way',
        items: [
          { text: 'Wait days for lawyer availability', negative: true },
          { text: 'Pay AED 1,500-5,000 per document', negative: true },
          { text: 'Back-and-forth revisions for weeks', negative: true },
          { text: 'Separate translation fees', negative: true },
          { text: 'Print, sign, scan workflow', negative: true },
          { text: 'No document tracking', negative: true },
        ],
      },
      legaldocs: {
        title: 'With LegalDocs',
        items: [
          { text: 'Generate documents in minutes', negative: false },
          { text: 'Starting from free, Pro at AED 199/mo', negative: false },
          { text: 'Instant AI-powered edits', negative: false },
          { text: 'Arabic & English included', negative: false },
          { text: 'Digital signatures built-in', negative: false },
          { text: 'Real-time status tracking', negative: false },
        ],
      },
    },
    lawyers: {
      label: 'Expert Network',
      title: 'When AI isn\'t enough.',
      titleHighlight: 'Real lawyers, real help.',
      subtitle: 'Connect with verified legal experts across the UAE. Book consultations in minutes, not days.',
      stats: [
        { value: '150+', label: 'Verified Lawyers' },
        { value: '4.9', label: 'Average Rating' },
        { value: '15 min', label: 'Response Time' },
        { value: '24/7', label: 'Availability' },
      ],
      features: [
        { icon: 'Video', title: 'Video Consultations', description: 'Face-to-face advice from anywhere' },
        { icon: 'Phone', title: 'Phone Calls', description: 'Quick answers when you need them' },
        { icon: 'MessageCircle', title: 'Instant Messaging', description: 'Async communication on your schedule' },
        { icon: 'FileCheck', title: 'Document Review', description: 'Expert eyes on your contracts' },
      ],
      cta: 'Browse Lawyers',
    },
    security: {
      label: 'Enterprise Security',
      title: 'Your documents are',
      titleHighlight: 'safe with us',
      features: [
        { icon: 'Lock', title: 'Bank-Level Encryption', description: 'AES-256 encryption for all documents at rest and in transit' },
        { icon: 'Shield', title: 'UAE Data Residency', description: 'Your data stays in UAE data centers, compliant with local regulations' },
        { icon: 'FileCheck', title: 'Audit Trail', description: 'Complete history of every action taken on your documents' },
        { icon: 'Key', title: 'Access Controls', description: 'Granular permissions for team members and external parties' },
      ],
      certifications: ['ISO 27001', 'SOC 2', 'GDPR Compliant', 'UAE TDRA'],
    },
    testimonials: {
      label: 'Trusted by Thousands',
      title: 'Don\'t take our word for it.',
      items: [
        {
          quote: 'LegalDocs saved us weeks of back-and-forth with lawyers. We created all our employment contracts in one afternoon. The Arabic translations are perfect.',
          author: 'Sarah Al-Rashid',
          role: 'HR Director, TechStart Dubai',
          company: 'TechStart',
          avatar: 'S',
          metric: 'Saved 40+ hours',
        },
        {
          quote: 'The bilingual support is incredible. Our Arabic contracts are just as professional as the English ones. Our UAE clients are impressed every time.',
          author: 'Ahmed Hassan',
          role: 'CEO, Gulf Trading Co.',
          company: 'Gulf Trading',
          avatar: 'A',
          metric: '200+ contracts created',
        },
        {
          quote: 'Finally, a legal platform that doesn\'t require a law degree to use. We onboard new employees in minutes now, not days.',
          author: 'Maria Santos',
          role: 'Founder, Creative Agency',
          company: 'Creative Agency',
          avatar: 'M',
          metric: '90% faster onboarding',
        },
        {
          quote: 'The lawyer consultation feature is a game-changer. I got expert advice on a complex partnership agreement within an hour.',
          author: 'Omar Al-Farsi',
          role: 'Managing Partner, Investment Fund',
          company: 'Al-Farsi Investments',
          avatar: 'O',
          metric: 'AED 10,000+ saved',
        },
      ],
    },
    pricing: {
      label: 'Simple Pricing',
      title: 'Start free.',
      titleHighlight: 'Scale as you grow.',
      guarantee: '14-day money-back guarantee. No questions asked.',
      plans: [
        {
          name: 'Starter',
          price: 'Free',
          period: 'forever',
          description: 'Perfect for individuals and freelancers',
          features: [
            '3 documents per month',
            'Basic templates library',
            'Digital signatures',
            'Email support',
            'Arabic & English',
          ],
          limitations: ['No AI document review', 'No lawyer access'],
          cta: 'Get Started',
          highlighted: false,
        },
        {
          name: 'Professional',
          price: 'AED 199',
          period: '/month',
          description: 'For growing businesses and teams',
          features: [
            'Unlimited documents',
            'All 50+ premium templates',
            'AI document review & analysis',
            '2 lawyer consultations/month',
            'Priority support',
            'Custom branding',
            'Team collaboration (up to 5)',
            'API access',
          ],
          limitations: [],
          cta: 'Start 14-Day Free Trial',
          highlighted: true,
          badge: 'Most Popular',
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          period: '',
          description: 'For large organizations with custom needs',
          features: [
            'Everything in Professional',
            'Unlimited team members',
            'Dedicated account manager',
            'Custom integrations',
            'SSO & advanced security',
            'On-premise deployment option',
            'SLA guarantee',
            'Custom template development',
          ],
          limitations: [],
          cta: 'Contact Sales',
          highlighted: false,
        },
      ],
    },
    faq: {
      label: 'Common Questions',
      title: 'Got questions?',
      titleHighlight: 'We\'ve got answers.',
      items: [
        {
          question: 'Are the documents legally valid in the UAE?',
          answer: 'Yes. All our templates are drafted by UAE-licensed lawyers and comply with UAE Federal Law. Our digital signatures are TDRA-compliant and legally binding.',
        },
        {
          question: 'How does the AI document generation work?',
          answer: 'Simply describe what you need in plain language. Our AI understands your requirements, suggests relevant clauses based on UAE law, and generates a complete document. You can review and edit everything before finalizing.',
        },
        {
          question: 'Can I get documents in both Arabic and English?',
          answer: 'Absolutely! Every document can be generated in both languages simultaneously. Our translations are done by legal translation experts, not machine translation.',
        },
        {
          question: 'What if I need legal advice beyond documents?',
          answer: 'Our platform connects you with 150+ verified UAE lawyers. Book video consultations, phone calls, or chat sessions directly through the platform. Lawyers can also review your documents and provide feedback.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes. We use bank-level AES-256 encryption, and all data is stored in UAE data centers. We\'re ISO 27001 certified and GDPR compliant. You own your data, and you can export or delete it anytime.',
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel anytime. We offer a 14-day money-back guarantee for paid plans. If you\'re not satisfied, we\'ll refund you in full, no questions asked.',
        },
      ],
    },
    cta: {
      title: 'Ready to simplify your legal work?',
      subtitle: 'Join 10,000+ businesses creating better documents. Start free, upgrade when you\'re ready.',
      button: 'Get Started Free',
      note: 'No credit card required • Setup in 2 minutes',
      features: ['3 free documents/month', 'All basic templates', 'Digital signatures included'],
    },
    footer: {
      tagline: 'Making legal simple for everyone in the UAE and GCC.',
      product: {
        title: 'Product',
        links: ['Features', 'Templates', 'Pricing', 'Lawyers', 'API'],
      },
      company: {
        title: 'Company',
        links: ['About', 'Blog', 'Careers', 'Contact', 'Press'],
      },
      legal: {
        title: 'Legal',
        links: ['Privacy', 'Terms', 'Cookies', 'Security'],
      },
      support: {
        title: 'Support',
        links: ['Help Center', 'Contact Us', 'Status', 'Feedback'],
      },
      copyright: '© 2024 LegalDocs. All rights reserved.',
    },
  },
  ar: {
    nav: {
      features: 'المميزات',
      howItWorks: 'كيف يعمل',
      pricing: 'الأسعار',
      lawyers: 'المحامون',
      login: 'تسجيل الدخول',
      getStarted: 'ابدأ مجاناً',
      dashboard: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
    },
    hero: {
      badge: 'موثوق من 500+ شركة إماراتية',
      title: 'وثائق قانونية',
      titleHighlight: 'بلمسة إنسانية',
      subtitle: 'توقف عن معاناة اللغة القانونية المعقدة. أنشئ عقوداً واتفاقيات سرية ووثائق قانونية في دقائق — وليس ساعات.',
      cta: 'ابدأ مجاناً الآن',
      ctaSecondary: 'شاهد العرض',
      stats: {
        documents: '+10,000',
        documentsLabel: 'وثيقة تم إنشاؤها',
        lawyers: '+150',
        lawyersLabel: 'محامٍ خبير',
        countries: '6',
        countriesLabel: 'دول خليجية',
      },
    },
    problemSolution: {
      label: 'المشكلة التي نحلها',
      title: 'العمل القانوني لا يجب أن يكون',
      titleHighlight: 'بهذه الصعوبة',
      problems: [
        { icon: 'Clock', title: 'ساعات من البحث', description: 'قضاء أيام لمعرفة البنود المطلوبة في عقدك' },
        { icon: 'Banknote', title: 'محامون باهظون', description: 'دفع 2,000+ درهم لعقد توظيف بسيط' },
        { icon: 'AlertTriangle', title: 'الخوف من الأخطاء', description: 'القلق إذا كان عقدك سيصمد في المحكمة' },
        { icon: 'Languages', title: 'كوابيس الترجمة', description: 'صعوبة الحصول على ترجمة قانونية عربية دقيقة' },
      ],
      solutionTitle: 'هناك طريقة أفضل',
      solutionDescription: 'LegalDocs يجمع بين الذكاء الاصطناعي والخبرة القانونية الإماراتية لتقديم وثائق احترافية في دقائق.',
    },
    showcase: {
      label: 'شاهدها تعمل',
      title: 'مميزات قوية،',
      titleHighlight: 'واجهة بسيطة',
      tabs: [
        { id: 'generate', title: 'إنشاء بالذكاء الاصطناعي', description: 'صف ما تحتاجه بلغة بسيطة. ذكاؤنا يفهم السياق ويقترح البنود المناسبة ويُنشئ وثيقة كاملة.', features: ['إدخال بلغة طبيعية', 'اقتراحات ذكية', 'امتثال للقانون الإماراتي', 'إنشاء فوري'] },
        { id: 'review', title: 'مراجعة ذكية', description: 'حمّل أي عقد واحصل على تحليل فوري بالذكاء الاصطناعي. حدد المخاطر والبنود الناقصة.', features: ['تقييم المخاطر', 'تحليل البنود', 'اقتراحات التحسين', 'شرح مبسط'] },
        { id: 'sign', title: 'التوقيعات الرقمية', description: 'أرسل الوثائق للتوقيع بنقرة واحدة. تتبع من وقّع وأرسل تذكيرات.', features: ['إرسال بنقرة', 'تتبع مباشر', 'تذكيرات تلقائية', 'سجل كامل'] },
        { id: 'consult', title: 'استشارات المحامين', description: 'عندما تحتاج خبرة بشرية، تواصل مع محامين إماراتيين موثقين فوراً.', features: ['استشارات فيديو', 'رسائل فورية', 'مراجعة الوثائق', 'أسعار ثابتة'] },
      ],
    },
    useCases: {
      label: 'مُصمم لك',
      title: 'سواء كنت مؤسس شركة ناشئة',
      titleHighlight: 'أو فريق مؤسسة كبيرة',
      cases: [
        { icon: 'Rocket', title: 'الشركات الناشئة', description: 'انطلق أسرع مع اتفاقيات جاهزة للاستخدام', benefits: ['اتفاقيات المؤسسين', 'اتفاقيات السرية', 'عقود الموظفين'] },
        { icon: 'Building2', title: 'الشركات الصغيرة والمتوسطة', description: 'نمو بدون أعباء قانونية', benefits: ['اتفاقيات الخدمات', 'عقود الموردين', 'وثائق الموارد البشرية'] },
        { icon: 'Briefcase', title: 'فرق الموارد البشرية', description: 'توظيف الموظفين أسرع', benefits: ['عقود العمل', 'خطابات العرض', 'السياسات'] },
        { icon: 'Home', title: 'العقارات', description: 'إغلاق الصفقات أسرع', benefits: ['عقود الإيجار', 'اتفاقيات البيع', 'مذكرات التفاهم'] },
      ],
    },
    comparison: {
      label: 'لماذا LegalDocs',
      title: 'الطريقة الذكية للتعامل مع',
      titleHighlight: 'الوثائق القانونية',
      traditional: {
        title: 'الطريقة التقليدية',
        items: [
          { text: 'انتظار أيام لتوفر المحامي', negative: true },
          { text: 'دفع 1,500-5,000 درهم للوثيقة', negative: true },
          { text: 'تعديلات لأسابيع', negative: true },
          { text: 'رسوم ترجمة منفصلة', negative: true },
          { text: 'طباعة، توقيع، مسح', negative: true },
          { text: 'لا تتبع للوثائق', negative: true },
        ],
      },
      legaldocs: {
        title: 'مع LegalDocs',
        items: [
          { text: 'إنشاء وثائق في دقائق', negative: false },
          { text: 'مجاني للبدء، المحترف 199 درهم/شهر', negative: false },
          { text: 'تعديلات فورية بالذكاء الاصطناعي', negative: false },
          { text: 'العربية والإنجليزية مشمولة', negative: false },
          { text: 'توقيعات رقمية مدمجة', negative: false },
          { text: 'تتبع الحالة مباشرة', negative: false },
        ],
      },
    },
    security: {
      label: 'أمان المؤسسات',
      title: 'وثائقك',
      titleHighlight: 'آمنة معنا',
      features: [
        { icon: 'Lock', title: 'تشفير بنكي', description: 'تشفير AES-256 لجميع الوثائق' },
        { icon: 'Shield', title: 'بيانات في الإمارات', description: 'البيانات تبقى في مراكز بيانات الإمارات' },
        { icon: 'FileCheck', title: 'سجل كامل', description: 'تاريخ كامل لجميع الإجراءات' },
        { icon: 'Key', title: 'صلاحيات دقيقة', description: 'أذونات محددة للفرق' },
      ],
      certifications: ['ISO 27001', 'SOC 2', 'متوافق مع GDPR', 'هيئة تنظيم الاتصالات'],
    },
    faq: {
      label: 'أسئلة شائعة',
      title: 'لديك أسئلة؟',
      titleHighlight: 'لدينا إجابات.',
      items: [
        { question: 'هل الوثائق صالحة قانونياً في الإمارات؟', answer: 'نعم. جميع قوالبنا مُعدة من محامين مرخصين في الإمارات وتتوافق مع القانون الاتحادي.' },
        { question: 'كيف يعمل إنشاء الوثائق بالذكاء الاصطناعي؟', answer: 'صف ما تحتاجه بلغة بسيطة. ذكاؤنا يُنشئ وثيقة كاملة مُصممة للقانون الإماراتي.' },
        { question: 'هل يمكنني الحصول على وثائق بالعربية والإنجليزية؟', answer: 'بالتأكيد! يمكن إنشاء كل وثيقة باللغتين في نفس الوقت.' },
        { question: 'ماذا لو احتجت استشارة قانونية؟', answer: 'منصتنا تربطك بأكثر من 150 محامٍ إماراتي موثق لاستشارات فيديو أو مكالمات أو رسائل.' },
        { question: 'هل بياناتي آمنة؟', answer: 'نعم. نستخدم تشفير AES-256 البنكي، وجميع البيانات مُخزنة في مراكز بيانات الإمارات.' },
        { question: 'هل يمكنني الإلغاء في أي وقت؟', answer: 'نعم، يمكنك الإلغاء في أي وقت. نقدم ضمان استرداد الأموال لمدة 14 يوماً.' },
      ],
    },
    features: {
      label: 'لماذا LegalDocs',
      title: 'كل ما تحتاجه.',
      titleHighlight: 'لا شيء زائد.',
      subtitle: 'أزلنا التعقيد. ما تبقى هو منصة قوية وبديهية تعمل بكفاءة.',
      items: [
        {
          icon: 'Bot',
          title: 'ذكاء اصطناعي يفهم القانون',
          description: 'ذكاؤنا الاصطناعي لا يملأ قوالب فقط. يفهم المتطلبات القانونية الإماراتية ويكيّف الوثائق لوضعك.',
          highlight: 'ذكي وسياقي',
        },
        {
          icon: 'PenTool',
          title: 'وقّع من أي مكان',
          description: 'توقيعات رقمية ملزمة قانونياً تعمل على أي جهاز. بدون تطبيقات أو حسابات للموقعين.',
          highlight: 'متوافق مع TDRA',
        },
        {
          icon: 'Globe',
          title: 'مصمم للمنطقة',
          description: 'كل وثيقة مصممة للامتثال الإماراتي والخليجي. عربي وإنجليزي، بالتنسيق المطلوب.',
          highlight: 'دعم ثنائي اللغة',
        },
        {
          icon: 'Users',
          title: 'خبراء عند الحاجة',
          description: 'تواصل مع محامين موثقين للاستشارة. مكالمات فيديو أو هاتف أو رسائل — اختيارك.',
          highlight: 'متاح 24/7',
        },
      ],
    },
    howItWorks: {
      label: 'عملية بسيطة',
      title: 'ثلاث خطوات نحو',
      titleHighlight: 'راحة البال القانونية',
      steps: [
        {
          number: '01',
          title: 'أخبرنا ما تحتاج',
          description: 'أجب على بضعة أسئلة بلغة بسيطة. لا تحتاج خبرة قانونية.',
        },
        {
          number: '02',
          title: 'راجع وثيقتك',
          description: 'ذكاؤنا الاصطناعي يولّد وثيقة احترافية. عدّل كما تشاء.',
        },
        {
          number: '03',
          title: 'وقّع وشارك',
          description: 'أرسل للتوقيعات وتابع كل شيء مباشرة. بهذه البساطة.',
        },
      ],
    },
    documents: {
      label: 'أنواع الوثائق',
      title: 'من الشركات الناشئة للمؤسسات.',
      titleHighlight: 'نغطي كل احتياجاتك.',
      categories: [
        { name: 'التوظيف', count: 12, icon: 'Briefcase' },
        { name: 'الأعمال', count: 18, icon: 'Building2' },
        { name: 'العقارات', count: 8, icon: 'Home' },
        { name: 'الشخصية', count: 6, icon: 'Heart' },
      ],
      popular: [
        'عقد العمل',
        'اتفاقية السرية',
        'اتفاقية الخدمات',
        'التوكيل',
        'عقد الإيجار',
        'اتفاقية الشراكة',
      ],
    },
    lawyers: {
      label: 'شبكة الخبراء',
      title: 'عندما لا يكفي الذكاء الاصطناعي.',
      titleHighlight: 'محامون حقيقيون، مساعدة حقيقية.',
      subtitle: 'تواصل مع خبراء قانونيين موثقين في الإمارات. احجز استشارات في دقائق.',
      features: [
        'استشارات فيديو',
        'مكالمات هاتفية',
        'رسائل فورية',
        'مراجعة الوثائق',
      ],
      cta: 'تصفح المحامين',
    },
    testimonials: {
      label: 'ثقة الآلاف',
      title: 'لا تأخذ كلامنا فقط.',
      items: [
        {
          quote: 'LegalDocs وفّر لنا أسابيع من التواصل مع المحامين. أنشأنا كل عقود التوظيف في عصر واحد.',
          author: 'سارة الراشد',
          role: 'مديرة الموارد البشرية، تك ستارت دبي',
          avatar: 'س',
        },
        {
          quote: 'الدعم ثنائي اللغة مذهل. عقودنا العربية احترافية بنفس مستوى الإنجليزية.',
          author: 'أحمد حسن',
          role: 'الرئيس التنفيذي، شركة الخليج للتجارة',
          avatar: 'أ',
        },
        {
          quote: 'أخيراً، منصة قانونية لا تحتاج شهادة في القانون لاستخدامها. بسيطة وسريعة وموثوقة.',
          author: 'ماريا سانتوس',
          role: 'مؤسسة، وكالة إبداعية',
          avatar: 'م',
        },
      ],
    },
    pricing: {
      label: 'أسعار بسيطة',
      title: 'ابدأ مجاناً.',
      titleHighlight: 'توسّع مع نموك.',
      plans: [
        {
          name: 'البداية',
          price: 'مجاني',
          period: 'للأبد',
          description: 'مثالي للأفراد',
          features: [
            '3 وثائق/شهر',
            'قوالب أساسية',
            'دعم بريدي',
            'توقيعات رقمية',
          ],
          cta: 'ابدأ الآن',
          highlighted: false,
        },
        {
          name: 'المحترف',
          price: '199 د.إ',
          period: '/شهر',
          description: 'للشركات النامية',
          features: [
            'وثائق غير محدودة',
            'كل القوالب المميزة',
            'دعم أولوية',
            'مراجعة AI للوثائق',
            'استشارات المحامين',
            'علامة تجارية مخصصة',
          ],
          cta: 'ابدأ تجربة مجانية',
          highlighted: true,
        },
        {
          name: 'المؤسسات',
          price: 'مخصص',
          period: '',
          description: 'للمؤسسات الكبيرة',
          features: [
            'كل مميزات المحترف',
            'مدير حساب مخصص',
            'وصول API',
            'تكاملات مخصصة',
            'خيار استضافة محلية',
            'ضمان SLA',
          ],
          cta: 'تواصل مع المبيعات',
          highlighted: false,
        },
      ],
    },
    cta: {
      title: 'جاهز لتبسيط عملك القانوني؟',
      subtitle: 'انضم لآلاف الشركات التي تنشئ وثائق أفضل.',
      button: 'ابدأ مجاناً',
      note: 'بدون بطاقة ائتمان',
    },
    footer: {
      tagline: 'نجعل القانون بسيطاً للجميع.',
      product: {
        title: 'المنتج',
        links: ['المميزات', 'القوالب', 'الأسعار', 'المحامون'],
      },
      company: {
        title: 'الشركة',
        links: ['عنا', 'المدونة', 'الوظائف', 'تواصل'],
      },
      legal: {
        title: 'قانوني',
        links: ['الخصوصية', 'الشروط', 'الكوكيز'],
      },
      copyright: '© 2024 LegalDocs. جميع الحقوق محفوظة.',
    },
  },
};

// Custom organic blob shape SVG
const BlobShape = ({ className, color = 'currentColor' }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill={color}
      d="M47.7,-57.2C59.9,-47.3,66.8,-30.9,69.3,-13.8C71.8,3.3,69.9,21.1,61.5,35.1C53.1,49.1,38.2,59.3,21.8,65.1C5.4,70.9,-12.5,72.3,-28.4,66.7C-44.3,61.1,-58.2,48.5,-66.1,32.6C-74,16.7,-75.9,-2.5,-70.8,-19.1C-65.7,-35.7,-53.6,-49.7,-39.5,-59.1C-25.4,-68.5,-9.3,-73.3,4.9,-79.1C19.1,-84.9,35.5,-67.1,47.7,-57.2Z"
      transform="translate(100 100)"
    />
  </svg>
);

// Animated counter component
const AnimatedNumber = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      const numValue = parseInt(value.replace(/[^0-9]/g, ''));
      const duration = 2000;
      const steps = 60;
      const increment = numValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current).toLocaleString() + (value.includes('+') ? '+' : ''));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

export function HomePageClient({ locale }: HomePageClientProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('generate');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { user, isAuthenticated, logout, isMounted } = useAuth();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const iconMap: Record<string, any> = {
    Bot,
    PenTool,
    Globe,
    Users,
    Briefcase,
    Building2,
    Heart,
    Home,
    Clock,
    Banknote,
    AlertTriangle,
    Languages,
    Lock,
    Shield,
    Key,
    FileCheck,
    Rocket,
    Lightbulb,
    Video,
    Phone,
    MessageCircle,
  };

  return (
    <div className={`min-h-screen bg-[#FAFBFC] overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-xl flex items-center justify-center transform -rotate-6">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full" />
              </div>
              <span className="text-xl font-bold text-[#1e3a5f]">LegalDocs</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-[#1e3a5f] transition-colors font-medium">
                {t.nav.features}
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#1e3a5f] transition-colors font-medium">
                {t.nav.howItWorks}
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-[#1e3a5f] transition-colors font-medium">
                {t.nav.pricing}
              </a>
              <Link href={`/${locale}/dashboard/lawyers`} className="text-gray-600 hover:text-[#1e3a5f] transition-colors font-medium">
                {t.nav.lawyers}
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {isMounted && isAuthenticated ? (
                <>
                  <Link
                    href={`/${locale}/dashboard`}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1e3a5f] text-white rounded-full font-medium hover:bg-[#2d5a87] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t.nav.dashboard}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/auth/login`}
                    className="text-gray-700 hover:text-[#1e3a5f] font-medium transition-colors"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    className="relative group px-6 py-2.5 bg-[#1e3a5f] text-white rounded-full font-medium overflow-hidden"
                  >
                    <span className="relative z-10">{t.nav.getStarted}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2d5a87] to-[#1e3a5f] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>{t.nav.features}</a>
              <a href="#how-it-works" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>{t.nav.howItWorks}</a>
              <a href="#pricing" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>{t.nav.pricing}</a>
              <Link href={`/${locale}/dashboard/lawyers`} className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>{t.nav.lawyers}</Link>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {isMounted && isAuthenticated ? (
                  <>
                    <Link
                      href={`/${locale}/dashboard`}
                      className="flex items-center justify-center gap-2 py-3 bg-[#1e3a5f] text-white rounded-full font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t.nav.dashboard}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-2 text-center text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={`/${locale}/auth/login`} className="block py-2 text-center text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                      {t.nav.login}
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      className="block py-3 text-center bg-[#1e3a5f] text-white rounded-full font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.nav.getStarted}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen pt-20 overflow-hidden">
        {/* Asymmetric background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large organic blob - top right */}
          <motion.div
            style={{ opacity: heroOpacity }}
            className="absolute -top-20 -right-40 w-[800px] h-[800px] opacity-[0.08]"
          >
            <BlobShape className="w-full h-full" color="#1e3a5f" />
          </motion.div>

          {/* Small accent blob */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-40 left-20 w-32 h-32 opacity-20"
          >
            <BlobShape className="w-full h-full" color="#D4AF37" />
          </motion.div>

          {/* Geometric shapes */}
          <div className="absolute top-1/3 right-1/4 w-64 h-64 border-2 border-[#1e3a5f]/10 rounded-full" />
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 border-2 border-[#D4AF37]/20 rotate-45" />

          {/* Dotted pattern */}
          <div
            className="absolute top-1/2 left-0 w-full h-full opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(#1e3a5f 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Content */}
            <motion.div
              style={{ opacity: heroOpacity, y: heroY }}
              className="relative z-10"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f]/5 rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm font-medium text-[#1e3a5f]">{t.hero.badge}</span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6"
              >
                <span className="text-gray-900">{t.hero.title}</span>
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#1e3a5f]">{t.hero.titleHighlight}</span>
                  {/* Hand-drawn underline effect */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-4 text-[#D4AF37]"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 Q 50 2, 100 8 T 198 6"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed"
              >
                {t.hero.subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Link
                  href={`/${locale}/auth/register`}
                  className="group relative px-8 py-4 bg-[#1e3a5f] text-white rounded-2xl font-semibold text-lg overflow-hidden shadow-xl shadow-[#1e3a5f]/20 hover:shadow-2xl hover:shadow-[#1e3a5f]/30 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.hero.cta}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2d5a87] to-[#1e3a5f] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <button className="group flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-[#1e3a5f]/30 transition-colors">
                  <span className="w-10 h-10 flex items-center justify-center bg-[#1e3a5f]/10 rounded-full group-hover:bg-[#1e3a5f] transition-colors">
                    <Play className="w-4 h-4 text-[#1e3a5f] group-hover:text-white transition-colors" />
                  </span>
                  {t.hero.ctaSecondary}
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-8 lg:gap-12"
              >
                {[
                  { value: t.hero.stats.documents, label: t.hero.stats.documentsLabel },
                  { value: t.hero.stats.lawyers, label: t.hero.stats.lawyersLabel },
                  { value: t.hero.stats.countries, label: t.hero.stats.countriesLabel },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">
                      <AnimatedNumber value={stat.value} />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Asymmetric card composition */}
              <div className="relative w-full h-[600px]">
                {/* Main card - tilted */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-10 right-0 w-[400px] bg-white rounded-3xl shadow-2xl p-8 transform rotate-3"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Employment Contract</h3>
                      <p className="text-sm text-gray-500">UAE Compliant</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[80, 100, 60, 90].map((w, i) => (
                      <div key={i} className="h-3 bg-gray-100 rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {['#1e3a5f', '#D4AF37', '#10b981'].map((c, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> Ready to sign
                    </span>
                  </div>
                </motion.div>

                {/* Secondary card - opposite tilt */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-20 left-0 w-[320px] bg-white rounded-3xl shadow-xl p-6 transform -rotate-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span className="font-semibold text-gray-800">AI Assistant</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    "I've reviewed your contract and found 3 clauses that need attention..."
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Review needed</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Auto-fixed</span>
                  </div>
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 left-20 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2"
                >
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-sm">Legally Binding</span>
                </motion.div>

                {/* Accent shape */}
                <div className="absolute bottom-10 right-20 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.problemSolution?.label || 'The Problem We Solve'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mt-4"
            >
              {t.problemSolution?.title || 'Legal work shouldn\'t be'}{' '}
              <span className="text-red-500">{t.problemSolution?.titleHighlight || 'this painful'}</span>
            </motion.h2>
          </div>

          {/* Problems Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {(t.problemSolution?.problems || [
              { icon: 'Clock', title: 'Hours of Research', description: 'Spending days figuring out what clauses your contract needs' },
              { icon: 'Banknote', title: 'Expensive Lawyers', description: 'Paying AED 2,000+ for a simple employment contract' },
              { icon: 'AlertTriangle', title: 'Fear of Mistakes', description: 'Worrying if your DIY contract will hold up in court' },
              { icon: 'Languages', title: 'Translation Nightmares', description: 'Struggling to get accurate Arabic legal translations' },
            ]).map((problem: any, i: number) => {
              const Icon = iconMap[problem.icon] || Clock;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border-2 border-red-100 hover:border-red-200 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-gray-600 text-sm">{problem.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-3xl p-8 lg:p-12 text-center text-white"
          >
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#D4AF37]/20 rounded-full" />
            </div>
            <div className="relative">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                {t.problemSolution?.solutionTitle || 'There\'s a better way'}
              </h3>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                {t.problemSolution?.solutionDescription || 'LegalDocs combines AI intelligence with UAE legal expertise to give you professional documents in minutes.'}
              </p>
              <Link
                href={`/${locale}/auth/register`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1e3a5f] rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Try It Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.showcase?.label || 'See It In Action'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mt-4"
            >
              {t.showcase?.title || 'Powerful features,'}{' '}
              <span className="text-[#1e3a5f]">{t.showcase?.titleHighlight || 'simple interface'}</span>
            </motion.h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {(t.showcase?.tabs || [
              { id: 'generate', title: 'AI Generation' },
              { id: 'review', title: 'Smart Review' },
              { id: 'sign', title: 'Digital Signatures' },
              { id: 'consult', title: 'Lawyer Consultations' },
            ]).map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveShowcaseTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeShowcaseTab === tab.id
                    ? 'bg-[#1e3a5f] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {(t.showcase?.tabs || []).map((tab: any) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: activeShowcaseTab === tab.id ? 1 : 0, y: activeShowcaseTab === tab.id ? 0 : 20 }}
              className={`${activeShowcaseTab === tab.id ? 'block' : 'hidden'}`}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{tab.title}</h3>
                  <p className="text-lg text-gray-600 mb-8">{tab.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {(tab.features || []).map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/${locale}/auth/register`}
                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#1e3a5f] text-white rounded-xl font-semibold hover:bg-[#2d5a87] transition-colors"
                  >
                    Try It Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Visual */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                      {activeShowcaseTab === 'generate' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Bot className="w-8 h-8 text-[#1e3a5f]" />
                            <span className="font-semibold">AI Document Generator</span>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-600 italic">"I need an employment contract for a software developer with a 3-month probation..."</p>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Document generated in 8 seconds</span>
                          </div>
                        </div>
                      )}
                      {activeShowcaseTab === 'review' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <FileCheck className="w-8 h-8 text-[#D4AF37]" />
                            <span className="font-semibold">Contract Analysis</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Risk Score</span>
                              <span className="text-green-600 font-semibold">Low (2/10)</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full w-[20%] bg-green-500 rounded-full" />
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">3 suggestions for improvement found</div>
                        </div>
                      )}
                      {activeShowcaseTab === 'sign' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <PenTool className="w-8 h-8 text-[#1e3a5f]" />
                            <span className="font-semibold">Signature Status</span>
                          </div>
                          <div className="space-y-3">
                            {['Ahmed Hassan', 'Sarah Al-Rashid'].map((name, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm">{name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${i === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {i === 0 ? 'Signed' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeShowcaseTab === 'consult' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Video className="w-8 h-8 text-[#D4AF37]" />
                            <span className="font-semibold">Book Consultation</span>
                          </div>
                          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold">MA</div>
                            <div>
                              <p className="font-semibold">Dr. Mohammed Ali</p>
                              <p className="text-sm text-gray-600">Corporate Law • 4.9 ★</p>
                            </div>
                          </div>
                          <button className="w-full py-3 bg-[#1e3a5f] text-white rounded-xl font-medium">
                            Book Video Call - AED 150
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.useCases?.label || 'Built For You'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mt-4"
            >
              {t.useCases?.title || 'Whether you\'re a startup founder'}{' '}
              <span className="text-[#1e3a5f]">{t.useCases?.titleHighlight || 'or an enterprise team'}</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(t.useCases?.cases || [
              { icon: 'Rocket', title: 'Startups', description: 'Launch faster with ready-to-use agreements', benefits: ['Founder agreements', 'NDAs', 'Employee contracts'] },
              { icon: 'Building2', title: 'SMBs', description: 'Scale without legal overhead', benefits: ['Service agreements', 'Vendor contracts', 'HR documents'] },
              { icon: 'Briefcase', title: 'HR Teams', description: 'Onboard employees faster', benefits: ['Employment contracts', 'Offer letters', 'Policies'] },
              { icon: 'Home', title: 'Real Estate', description: 'Close deals faster', benefits: ['Tenancy contracts', 'Sale agreements', 'MoUs'] },
            ]).map((useCase: any, i: number) => {
              const Icon = iconMap[useCase.icon] || Briefcase;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                      <p className="text-gray-600 mb-4">{useCase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(useCase.benefits || []).map((benefit: string, j: number) => (
                          <span key={j} className="px-3 py-1 bg-[#1e3a5f]/5 text-[#1e3a5f] text-sm rounded-full">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.comparison?.label || 'Why LegalDocs'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mt-4"
            >
              {t.comparison?.title || 'The smarter way to handle'}{' '}
              <span className="text-[#1e3a5f]">{t.comparison?.titleHighlight || 'legal documents'}</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Way */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-400 mb-6">{t.comparison?.traditional?.title || 'Traditional Way'}</h3>
              <div className="space-y-4">
                {(t.comparison?.traditional?.items || [
                  { text: 'Wait days for lawyer availability', negative: true },
                  { text: 'Pay AED 1,500-5,000 per document', negative: true },
                  { text: 'Back-and-forth revisions for weeks', negative: true },
                  { text: 'Separate translation fees', negative: true },
                  { text: 'Print, sign, scan workflow', negative: true },
                  { text: 'No document tracking', negative: true },
                ]).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-gray-500">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* With LegalDocs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-3xl p-8 text-white relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#D4AF37] text-[#1e3a5f] text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
              <h3 className="text-xl font-bold mb-6">{t.comparison?.legaldocs?.title || 'With LegalDocs'}</h3>
              <div className="space-y-4">
                {(t.comparison?.legaldocs?.items || [
                  { text: 'Generate documents in minutes', negative: false },
                  { text: 'Starting from free, Pro at AED 199/mo', negative: false },
                  { text: 'Instant AI-powered edits', negative: false },
                  { text: 'Arabic & English included', negative: false },
                  { text: 'Digital signatures built-in', negative: false },
                  { text: 'Real-time status tracking', negative: false },
                ]).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1e3a5f]/[0.02] to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left - Content */}
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
              >
                {t.features.label}
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-5xl font-bold mt-4 mb-6"
              >
                {t.features.title}
                <br />
                <span className="text-[#1e3a5f]">{t.features.titleHighlight}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 mb-12"
              >
                {t.features.subtitle}
              </motion.p>

              {/* Feature cards with asymmetric layout */}
              <div className="space-y-6">
                {t.features.items.slice(0, 2).map((feature, i) => {
                  const Icon = iconMap[feature.icon];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        i % 2 === 0 ? 'ml-0' : 'ml-8'
                      }`}
                    >
                      {/* Accent line */}
                      <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-[#1e3a5f] to-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-[#1e3a5f]/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1e3a5f] transition-colors">
                          <Icon className="w-7 h-7 text-[#1e3a5f] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                            {feature.highlight}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right - More features with different style */}
            <div className="relative">
              {/* Decorative shape */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />

              <div className="relative space-y-6">
                {t.features.items.slice(2).map((feature, i) => {
                  const Icon = iconMap[feature.icon];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        i % 2 === 0 ? 'mr-0' : 'mr-8'
                      }`}
                    >
                      <div className="absolute right-0 top-8 bottom-8 w-1 bg-gradient-to-b from-[#D4AF37] to-[#1e3a5f] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex gap-5">
                        <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                          <Icon className="w-7 h-7 text-[#D4AF37] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">
                            {feature.highlight}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-[#1e3a5f] relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] opacity-10">
            <BlobShape className="w-full h-full" color="#ffffff" />
          </div>
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] opacity-10">
            <BlobShape className="w-full h-full" color="#D4AF37" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.howItWorks.label}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-white mt-4"
            >
              {t.howItWorks.title}
              <br />
              <span className="text-[#D4AF37]">{t.howItWorks.titleHighlight}</span>
            </motion.h2>
          </div>

          {/* Steps - Asymmetric timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/10" />

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {t.howItWorks.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`relative ${
                    i === 1 ? 'lg:-translate-y-8' : i === 2 ? 'lg:translate-y-8' : ''
                  }`}
                >
                  {/* Number badge */}
                  <div className="absolute -top-4 left-8 lg:left-1/2 lg:-translate-x-1/2 w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center transform rotate-12">
                    <span className="font-bold text-lg text-[#1e3a5f] transform -rotate-12">{step.number}</span>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 pt-12 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.testimonials.label}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4"
            >
              {t.testimonials.title}
            </motion.h2>
          </div>

          {/* Testimonial cards with organic layout */}
          <div className="grid md:grid-cols-3 gap-8">
            {t.testimonials.items.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative group ${
                  i === 1 ? 'md:-translate-y-8' : ''
                }`}
              >
                {/* Quote shape */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-[#D4AF37] font-serif">"</span>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg group-hover:shadow-xl transition-shadow border border-gray-100">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-[#D4AF37]/20 rounded-full" />
        <div className="absolute bottom-20 right-10 w-48 h-48 border-2 border-[#1e3a5f]/10 rotate-45" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.pricing.label}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4"
            >
              {t.pricing.title}
              <span className="text-[#1e3a5f]"> {t.pricing.titleHighlight}</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {t.pricing.plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative ${
                  plan.highlighted ? 'md:-translate-y-4' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#D4AF37] rounded-full text-sm font-semibold text-[#1e3a5f]">
                    Most Popular
                  </div>
                )}

                <div className={`h-full rounded-3xl p-8 ${
                  plan.highlighted
                    ? 'bg-[#1e3a5f] text-white shadow-2xl shadow-[#1e3a5f]/20'
                    : 'bg-white border border-gray-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 ${
                          plan.highlighted ? 'text-[#D4AF37]' : 'text-green-500'
                        }`} />
                        <span className={plan.highlighted ? 'text-gray-200' : 'text-gray-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/${locale}/auth/register`}
                    className={`block w-full py-4 rounded-2xl font-semibold text-center transition-all ${
                      plan.highlighted
                        ? 'bg-white text-[#1e3a5f] hover:bg-gray-100'
                        : 'bg-[#1e3a5f] text-white hover:bg-[#2d5a87]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.security?.label || 'Enterprise Security'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mt-4"
            >
              {t.security?.title || 'Your documents are'}{' '}
              <span className="text-[#1e3a5f]">{t.security?.titleHighlight || 'safe with us'}</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {(t.security?.features || [
              { icon: 'Lock', title: 'Bank-Level Encryption', description: 'AES-256 encryption for all documents' },
              { icon: 'Shield', title: 'UAE Data Residency', description: 'Data stays in UAE data centers' },
              { icon: 'FileCheck', title: 'Audit Trail', description: 'Complete history of all actions' },
              { icon: 'Key', title: 'Access Controls', description: 'Granular permissions for teams' },
            ]).map((feature: any, i: number) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg"
                >
                  <div className="w-14 h-14 bg-[#1e3a5f]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-[#1e3a5f]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            {(t.security?.certifications || ['ISO 27001', 'SOC 2', 'GDPR Compliant', 'UAE TDRA']).map((cert: string, i: number) => (
              <div
                key={i}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700"
              >
                <Shield className="w-4 h-4 inline-block mr-2 text-green-500" />
                {cert}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#D4AF37] font-semibold uppercase tracking-wider text-sm"
            >
              {t.faq?.label || 'Common Questions'}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mt-4"
            >
              {t.faq?.title || 'Got questions?'}{' '}
              <span className="text-[#1e3a5f]">{t.faq?.titleHighlight || 'We\'ve got answers.'}</span>
            </motion.h2>
          </div>

          <div className="space-y-4">
            {(t.faq?.items || [
              { question: 'Are the documents legally valid in the UAE?', answer: 'Yes. All our templates are drafted by UAE-licensed lawyers and comply with UAE Federal Law.' },
              { question: 'How does AI document generation work?', answer: 'Simply describe what you need in plain language. Our AI generates a complete document tailored to UAE law.' },
              { question: 'Can I get documents in Arabic and English?', answer: 'Absolutely! Every document can be generated in both languages simultaneously.' },
              { question: 'What if I need legal advice?', answer: 'Our platform connects you with 150+ verified UAE lawyers for video consultations, calls, or chat.' },
              { question: 'Is my data secure?', answer: 'Yes. We use bank-level AES-256 encryption, and all data is stored in UAE data centers.' },
              { question: 'Can I cancel anytime?', answer: 'Yes, you can cancel anytime. We offer a 14-day money-back guarantee for paid plans.' },
            ]).map((faq: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-2 border-gray-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <div className={`w-8 h-8 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-[#1e3a5f]" />
                  </div>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-[#1e3a5f]" />

        {/* Animated background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-10"
          >
            <BlobShape className="w-full h-full" color="#ffffff" />
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -45, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-[400px] h-[400px] opacity-10"
          >
            <BlobShape className="w-full h-full" color="#D4AF37" />
          </motion.div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6"
          >
            {t.cta.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-10"
          >
            {t.cta.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href={`/${locale}/auth/register`}
              className="group px-10 py-5 bg-white text-[#1e3a5f] rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
            >
              {t.cta.button}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mt-6 text-sm"
          >
            {t.cta.note}
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 relative overflow-hidden">
        {/* Organic shape accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1e3a5f] via-[#D4AF37] to-[#1e3a5f]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href={`/${locale}`} className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-xl flex items-center justify-center transform -rotate-6">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full" />
                </div>
                <span className="text-xl font-bold text-white">LegalDocs</span>
              </Link>
              <p className="text-gray-500 mb-6">{t.footer.tagline}</p>

              {/* Social links */}
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1e3a5f] transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[t.footer.product, t.footer.company, t.footer.legal].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}

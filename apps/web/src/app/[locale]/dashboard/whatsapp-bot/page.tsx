'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Translations
const translations = {
  en: {
    title: 'WhatsApp Legal Bot',
    subtitle: 'AI-powered document analysis via WhatsApp',
    stats: {
      totalAnalyses: 'Total Analyses',
      todayAnalyses: 'Today',
      activeSessions: 'Active Sessions',
      lawyerReferrals: 'Lawyer Referrals',
      avgRiskScore: 'Avg Risk Score',
      responseTime: 'Avg Response',
    },
    tabs: {
      overview: 'Overview',
      analyses: 'Document Analyses',
      sessions: 'Sessions',
      referrals: 'Lawyer Referrals',
      settings: 'Bot Settings',
    },
    botStatus: {
      title: 'Bot Status',
      active: 'Active',
      inactive: 'Inactive',
      whatsappNumber: 'WhatsApp Number',
      lastMessage: 'Last Message',
      uptime: 'Uptime',
    },
    recentAnalyses: {
      title: 'Recent Document Analyses',
      documentType: 'Document Type',
      riskScore: 'Risk Score',
      phone: 'Phone',
      date: 'Date',
      status: 'Status',
      viewDetails: 'View Details',
    },
    riskLevels: {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
    },
    documentTypes: {
      contract: 'Contract',
      trade_license: 'Trade License',
      emirates_id: 'Emirates ID',
      passport: 'Passport',
      visa: 'Visa',
      other: 'Other Document',
    },
    settings: {
      title: 'Bot Configuration',
      autoRespond: 'Auto-respond to messages',
      docAnalysis: 'Enable document analysis',
      lawyerMatching: 'Enable lawyer matching',
      maxDailyAnalyses: 'Max daily analyses',
      responseLanguage: 'Default response language',
      welcomeMessage: 'Welcome message',
      save: 'Save Settings',
      saved: 'Settings saved!',
    },
    howItWorks: {
      title: 'How It Works',
      step1: 'User sends document photo via WhatsApp',
      step2: 'AI extracts and analyzes content in seconds',
      step3: 'Risk assessment with key findings returned',
      step4: 'Option to connect with a real lawyer',
    },
    languages: {
      auto: 'Auto-detect',
      en: 'English',
      ar: 'Arabic',
      ur: 'Urdu',
    },
    noData: 'No data available',
    loading: 'Loading...',
  },
  ar: {
    title: 'بوت واتساب القانوني',
    subtitle: 'تحليل المستندات بالذكاء الاصطناعي عبر واتساب',
    stats: {
      totalAnalyses: 'إجمالي التحليلات',
      todayAnalyses: 'اليوم',
      activeSessions: 'الجلسات النشطة',
      lawyerReferrals: 'إحالات المحامين',
      avgRiskScore: 'متوسط درجة المخاطر',
      responseTime: 'متوسط الاستجابة',
    },
    tabs: {
      overview: 'نظرة عامة',
      analyses: 'تحليلات المستندات',
      sessions: 'الجلسات',
      referrals: 'إحالات المحامين',
      settings: 'إعدادات البوت',
    },
    botStatus: {
      title: 'حالة البوت',
      active: 'نشط',
      inactive: 'غير نشط',
      whatsappNumber: 'رقم واتساب',
      lastMessage: 'آخر رسالة',
      uptime: 'وقت التشغيل',
    },
    recentAnalyses: {
      title: 'تحليلات المستندات الأخيرة',
      documentType: 'نوع المستند',
      riskScore: 'درجة المخاطر',
      phone: 'الهاتف',
      date: 'التاريخ',
      status: 'الحالة',
      viewDetails: 'عرض التفاصيل',
    },
    riskLevels: {
      low: 'مخاطر منخفضة',
      medium: 'مخاطر متوسطة',
      high: 'مخاطر عالية',
    },
    documentTypes: {
      contract: 'عقد',
      trade_license: 'رخصة تجارية',
      emirates_id: 'هوية إماراتية',
      passport: 'جواز سفر',
      visa: 'تأشيرة',
      other: 'مستند آخر',
    },
    settings: {
      title: 'إعدادات البوت',
      autoRespond: 'الرد التلقائي على الرسائل',
      docAnalysis: 'تمكين تحليل المستندات',
      lawyerMatching: 'تمكين مطابقة المحامين',
      maxDailyAnalyses: 'الحد الأقصى للتحليلات اليومية',
      responseLanguage: 'لغة الرد الافتراضية',
      welcomeMessage: 'رسالة الترحيب',
      save: 'حفظ الإعدادات',
      saved: 'تم حفظ الإعدادات!',
    },
    howItWorks: {
      title: 'كيف يعمل',
      step1: 'المستخدم يرسل صورة المستند عبر واتساب',
      step2: 'الذكاء الاصطناعي يستخرج ويحلل المحتوى في ثوان',
      step3: 'تقييم المخاطر مع النتائج الرئيسية',
      step4: 'خيار التواصل مع محامٍ حقيقي',
    },
    languages: {
      auto: 'اكتشاف تلقائي',
      en: 'الإنجليزية',
      ar: 'العربية',
      ur: 'الأردية',
    },
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
  },
};

// Mock data for demonstration
const mockStats = {
  totalAnalyses: 1247,
  todayAnalyses: 23,
  activeSessions: 156,
  lawyerReferrals: 89,
  avgRiskScore: 54,
  responseTime: '45s',
};

const mockAnalyses = [
  {
    id: '1',
    documentType: 'contract',
    riskScore: 72,
    phone: '+971501234567',
    createdAt: '2026-01-04T10:30:00Z',
    status: 'completed',
    summary: 'Employment contract with non-compete clause concerns',
  },
  {
    id: '2',
    documentType: 'trade_license',
    riskScore: 25,
    phone: '+971509876543',
    createdAt: '2026-01-04T09:15:00Z',
    status: 'completed',
    summary: 'Valid trade license, no issues detected',
  },
  {
    id: '3',
    documentType: 'contract',
    riskScore: 85,
    phone: '+971507654321',
    createdAt: '2026-01-04T08:45:00Z',
    status: 'referral_requested',
    summary: 'Rental agreement with unfair termination clauses',
  },
  {
    id: '4',
    documentType: 'visa',
    riskScore: 15,
    phone: '+971503456789',
    createdAt: '2026-01-03T16:20:00Z',
    status: 'completed',
    summary: 'Employment visa, valid for 2 years',
  },
  {
    id: '5',
    documentType: 'contract',
    riskScore: 58,
    phone: '+971502345678',
    createdAt: '2026-01-03T14:10:00Z',
    status: 'completed',
    summary: 'Service agreement with payment term concerns',
  },
];

const mockSessions = [
  { id: '1', phone: '+971501234567', language: 'en', messageCount: 12, lastMessage: '2026-01-04T10:35:00Z' },
  { id: '2', phone: '+971509876543', language: 'ar', messageCount: 5, lastMessage: '2026-01-04T09:20:00Z' },
  { id: '3', phone: '+971507654321', language: 'en', messageCount: 8, lastMessage: '2026-01-04T08:50:00Z' },
];

const mockReferrals = [
  { id: '1', phone: '+971507654321', documentType: 'contract', status: 'pending', createdAt: '2026-01-04T08:50:00Z' },
  { id: '2', phone: '+971505555555', documentType: 'contract', status: 'assigned', lawyerName: 'Ahmed Al-Rashid', createdAt: '2026-01-03T11:30:00Z' },
];

export default function WhatsAppBotPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  const [activeTab, setActiveTab] = useState('overview');
  const [botConfig, setBotConfig] = useState({
    autoRespond: true,
    docAnalysis: true,
    lawyerMatching: true,
    maxDailyAnalyses: 100,
    responseLanguage: 'auto',
    welcomeMessage: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return t.riskLevels.low;
    if (score <= 60) return t.riskLevels.medium;
    return t.riskLevels.high;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveSettings = () => {
    // TODO: API call to save settings
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-green-100">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: t.stats.totalAnalyses, value: mockStats.totalAnalyses.toLocaleString(), icon: '📄' },
            { label: t.stats.todayAnalyses, value: mockStats.todayAnalyses, icon: '📊' },
            { label: t.stats.activeSessions, value: mockStats.activeSessions, icon: '💬' },
            { label: t.stats.lawyerReferrals, value: mockStats.lawyerReferrals, icon: '⚖️' },
            { label: t.stats.avgRiskScore, value: `${mockStats.avgRiskScore}/100`, icon: '🎯' },
            { label: t.stats.responseTime, value: mockStats.responseTime, icon: '⚡' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 -mb-px overflow-x-auto">
            {Object.entries(t.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bot Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.botStatus.title}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-600 font-medium">{t.botStatus.active}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.botStatus.whatsappNumber}</span>
                  <span className="font-mono text-gray-900">+971 50 123 4567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.botStatus.lastMessage}</span>
                  <span className="text-gray-900">2 min ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.botStatus.uptime}</span>
                  <span className="text-gray-900">99.9%</span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.howItWorks.title}</h3>
              <div className="space-y-4">
                {[t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3, t.howItWorks.step4].map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-600 text-sm pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Test Bot
                </button>
                <button className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Analytics
                </button>
                <button className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configure Webhooks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyses Tab */}
        {activeTab === 'analyses' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t.recentAnalyses.title}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.recentAnalyses.documentType}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.recentAnalyses.riskScore}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.recentAnalyses.phone}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.recentAnalyses.date}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.recentAnalyses.status}
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {analysis.documentType === 'contract' ? '📄' :
                             analysis.documentType === 'trade_license' ? '🏢' :
                             analysis.documentType === 'emirates_id' ? '🪪' :
                             analysis.documentType === 'passport' ? '🛂' :
                             analysis.documentType === 'visa' ? '📋' : '📑'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {t.documentTypes[analysis.documentType as keyof typeof t.documentTypes] || analysis.documentType}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{analysis.summary}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(analysis.riskScore)}`}>
                          {analysis.riskScore}/100 - {getRiskLabel(analysis.riskScore)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{analysis.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(analysis.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                          analysis.status === 'referral_requested' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {analysis.status === 'completed' ? 'Completed' :
                           analysis.status === 'referral_requested' ? 'Lawyer Requested' : analysis.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          {t.recentAnalyses.viewDetails}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockSessions.map((session) => (
                <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">{session.language.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-mono text-gray-900">{session.phone}</div>
                      <div className="text-sm text-gray-500">{session.messageCount} messages</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(session.lastMessage)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lawyer Referral Requests</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {mockReferrals.map((referral) => (
                <div key={referral.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-mono text-gray-900">{referral.phone}</div>
                      <div className="text-sm text-gray-500">
                        {t.documentTypes[referral.documentType as keyof typeof t.documentTypes]} analysis
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      referral.status === 'assigned' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {referral.status === 'pending' ? 'Pending' :
                       referral.status === 'assigned' ? `Assigned: ${referral.lawyerName}` : referral.status}
                    </span>
                    {referral.status === 'pending' && (
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        Assign Lawyer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.settings.title}</h3>
            <div className="space-y-6 max-w-2xl">
              {/* Toggle Settings */}
              <div className="space-y-4">
                {[
                  { key: 'autoRespond', label: t.settings.autoRespond },
                  { key: 'docAnalysis', label: t.settings.docAnalysis },
                  { key: 'lawyerMatching', label: t.settings.lawyerMatching },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <span className="text-gray-700">{setting.label}</span>
                    <button
                      onClick={() => setBotConfig({
                        ...botConfig,
                        [setting.key]: !botConfig[setting.key as keyof typeof botConfig],
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        botConfig[setting.key as keyof typeof botConfig] ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          botConfig[setting.key as keyof typeof botConfig] ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200" />

              {/* Max Daily Analyses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.maxDailyAnalyses}
                </label>
                <input
                  type="number"
                  value={botConfig.maxDailyAnalyses}
                  onChange={(e) => setBotConfig({ ...botConfig, maxDailyAnalyses: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Response Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.responseLanguage}
                </label>
                <select
                  value={botConfig.responseLanguage}
                  onChange={(e) => setBotConfig({ ...botConfig, responseLanguage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.entries(t.languages).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.welcomeMessage}
                </label>
                <textarea
                  value={botConfig.welcomeMessage}
                  onChange={(e) => setBotConfig({ ...botConfig, welcomeMessage: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Custom welcome message..."
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t.settings.save}
                </button>
                {settingsSaved && (
                  <span className="text-green-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.settings.saved}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

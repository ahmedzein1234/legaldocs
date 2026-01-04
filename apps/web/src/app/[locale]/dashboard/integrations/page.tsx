'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Translations
const translations = {
  en: {
    title: 'Government Integrations',
    subtitle: 'Connect with UAE government services for seamless compliance',
    status: {
      connected: 'Connected',
      pending: 'Pending Setup',
      notConnected: 'Not Connected',
    },
    actions: {
      connect: 'Connect',
      disconnect: 'Disconnect',
      configure: 'Configure',
      verify: 'Verify',
      refresh: 'Refresh',
    },
    integrations: {
      uaepass: {
        name: 'UAE Pass',
        description: 'National digital identity for secure authentication and document signing',
        features: ['Single Sign-On', 'Digital Signatures', 'Identity Verification', 'Document Attestation'],
        status: 'connected',
      },
      ded: {
        name: 'DED (Dept. of Economic Development)',
        description: 'Trade license verification and business registration services',
        features: ['License Verification', 'Activity Lookup', 'Renewal Reminders', 'Compliance Checks'],
        status: 'pending',
      },
      mohre: {
        name: 'MOHRE (Ministry of Human Resources)',
        description: 'Labor law compliance and employment contract verification',
        features: ['Contract Templates', 'WPS Compliance', 'Labor Card Verification', 'End of Service Calculator'],
        status: 'connected',
      },
      rera: {
        name: 'RERA (Real Estate Regulatory Agency)',
        description: 'Real estate transaction and tenancy contract registration',
        features: ['Ejari Registration', 'Contract Validation', 'Rent Calculator', 'Dispute Resolution'],
        status: 'notConnected',
      },
      notary: {
        name: 'Notary Public',
        description: 'Digital notarization and document attestation services',
        features: ['POA Attestation', 'Document Authentication', 'Digital Stamps', 'Legal Certification'],
        status: 'pending',
      },
      courts: {
        name: 'Dubai Courts',
        description: 'Case filing and court document submission',
        features: ['E-Filing', 'Case Tracking', 'Document Submission', 'Hearing Notifications'],
        status: 'notConnected',
      },
      immigration: {
        name: 'ICP (Immigration)',
        description: 'Visa and residency document verification',
        features: ['Visa Status', 'Residency Verification', 'Entry Permit Status', 'Travel Ban Check'],
        status: 'connected',
      },
      mof: {
        name: 'Ministry of Finance',
        description: 'VAT compliance and tax documentation',
        features: ['VAT Registration', 'Tax Invoice Validation', 'Filing Reminders', 'Compliance Reports'],
        status: 'notConnected',
      },
    },
    categories: {
      identity: 'Identity & Authentication',
      business: 'Business & Licensing',
      legal: 'Legal & Courts',
      compliance: 'Compliance & Tax',
    },
    stats: {
      connected: 'Connected Services',
      pending: 'Pending Setup',
      available: 'Available',
      apiCalls: 'API Calls Today',
    },
    apiStatus: {
      title: 'API Status',
      healthy: 'All Systems Operational',
      degraded: 'Partial Outage',
      down: 'Service Unavailable',
    },
    logs: {
      title: 'Recent Activity',
      viewAll: 'View All',
    },
    setup: {
      title: 'Quick Setup Guide',
      step1: 'Select an integration to connect',
      step2: 'Authenticate with your credentials',
      step3: 'Configure data sync preferences',
      step4: 'Start using integrated features',
    },
    benefits: {
      title: 'Integration Benefits',
      items: [
        { icon: '⚡', title: 'Real-time Verification', description: 'Instant verification of licenses, visas, and documents' },
        { icon: '🔒', title: 'Secure & Compliant', description: 'Government-grade security and data protection' },
        { icon: '📊', title: 'Automated Compliance', description: 'Stay compliant with automatic updates and alerts' },
        { icon: '🔄', title: 'Seamless Sync', description: 'Two-way sync keeps your data up-to-date' },
      ],
    },
  },
  ar: {
    title: 'التكامل الحكومي',
    subtitle: 'اتصل بخدمات الحكومة الإماراتية للامتثال السلس',
    status: {
      connected: 'متصل',
      pending: 'بانتظار الإعداد',
      notConnected: 'غير متصل',
    },
    actions: {
      connect: 'اتصال',
      disconnect: 'قطع الاتصال',
      configure: 'تكوين',
      verify: 'تحقق',
      refresh: 'تحديث',
    },
    integrations: {
      uaepass: {
        name: 'الهوية الرقمية UAE Pass',
        description: 'الهوية الرقمية الوطنية للمصادقة الآمنة وتوقيع المستندات',
        features: ['تسجيل دخول موحد', 'التوقيعات الرقمية', 'التحقق من الهوية', 'توثيق المستندات'],
        status: 'connected',
      },
      ded: {
        name: 'دائرة التنمية الاقتصادية',
        description: 'التحقق من الرخص التجارية وخدمات تسجيل الأعمال',
        features: ['التحقق من الرخصة', 'البحث عن الأنشطة', 'تذكيرات التجديد', 'فحوصات الامتثال'],
        status: 'pending',
      },
      mohre: {
        name: 'وزارة الموارد البشرية',
        description: 'الامتثال لقانون العمل والتحقق من عقود العمل',
        features: ['نماذج العقود', 'امتثال نظام حماية الأجور', 'التحقق من بطاقة العمل', 'حاسبة نهاية الخدمة'],
        status: 'connected',
      },
      rera: {
        name: 'مؤسسة التنظيم العقاري',
        description: 'تسجيل المعاملات العقارية وعقود الإيجار',
        features: ['تسجيل إيجاري', 'التحقق من العقود', 'حاسبة الإيجار', 'حل النزاعات'],
        status: 'notConnected',
      },
      notary: {
        name: 'كاتب العدل',
        description: 'خدمات التوثيق الرقمي وتصديق المستندات',
        features: ['توثيق التوكيلات', 'مصادقة المستندات', 'الأختام الرقمية', 'الشهادات القانونية'],
        status: 'pending',
      },
      courts: {
        name: 'محاكم دبي',
        description: 'تقديم القضايا وتقديم مستندات المحكمة',
        features: ['التقديم الإلكتروني', 'تتبع القضايا', 'تقديم المستندات', 'إشعارات الجلسات'],
        status: 'notConnected',
      },
      immigration: {
        name: 'الهوية والجنسية',
        description: 'التحقق من وثائق التأشيرة والإقامة',
        features: ['حالة التأشيرة', 'التحقق من الإقامة', 'حالة تصريح الدخول', 'فحص منع السفر'],
        status: 'connected',
      },
      mof: {
        name: 'وزارة المالية',
        description: 'الامتثال لضريبة القيمة المضافة وتوثيق الضرائب',
        features: ['تسجيل ضريبة القيمة المضافة', 'التحقق من الفواتير الضريبية', 'تذكيرات التقديم', 'تقارير الامتثال'],
        status: 'notConnected',
      },
    },
    categories: {
      identity: 'الهوية والمصادقة',
      business: 'الأعمال والترخيص',
      legal: 'القانون والمحاكم',
      compliance: 'الامتثال والضرائب',
    },
    stats: {
      connected: 'الخدمات المتصلة',
      pending: 'بانتظار الإعداد',
      available: 'متاح',
      apiCalls: 'طلبات API اليوم',
    },
    apiStatus: {
      title: 'حالة API',
      healthy: 'جميع الأنظمة تعمل',
      degraded: 'انقطاع جزئي',
      down: 'الخدمة غير متاحة',
    },
    logs: {
      title: 'النشاط الأخير',
      viewAll: 'عرض الكل',
    },
    setup: {
      title: 'دليل الإعداد السريع',
      step1: 'اختر تكاملاً للاتصال',
      step2: 'قم بالمصادقة ببيانات اعتمادك',
      step3: 'قم بتكوين تفضيلات مزامنة البيانات',
      step4: 'ابدأ باستخدام الميزات المتكاملة',
    },
    benefits: {
      title: 'فوائد التكامل',
      items: [
        { icon: '⚡', title: 'التحقق الفوري', description: 'التحقق الفوري من التراخيص والتأشيرات والمستندات' },
        { icon: '🔒', title: 'آمن ومتوافق', description: 'أمان على مستوى حكومي وحماية البيانات' },
        { icon: '📊', title: 'امتثال تلقائي', description: 'ابق متوافقاً مع التحديثات والتنبيهات التلقائية' },
        { icon: '🔄', title: 'مزامنة سلسة', description: 'المزامنة ثنائية الاتجاه تحافظ على تحديث بياناتك' },
      ],
    },
  },
};

// Mock activity logs
const mockLogs = [
  { id: '1', action: 'License verified', service: 'DED', status: 'success', time: '2 min ago' },
  { id: '2', action: 'Employee contract synced', service: 'MOHRE', status: 'success', time: '15 min ago' },
  { id: '3', action: 'UAE Pass authentication', service: 'UAE Pass', status: 'success', time: '1 hour ago' },
  { id: '4', action: 'Visa status checked', service: 'ICP', status: 'success', time: '2 hours ago' },
  { id: '5', action: 'API rate limit warning', service: 'DED', status: 'warning', time: '3 hours ago' },
];

export default function IntegrationsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const integrations = Object.entries(t.integrations);
  const connectedCount = integrations.filter(([_, i]) => i.status === 'connected').length;
  const pendingCount = integrations.filter(([_, i]) => i.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'notConnected': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    return t.status[status as keyof typeof t.status] || status;
  };

  const getCategoryIntegrations = (category: string) => {
    const categoryMap: Record<string, string[]> = {
      identity: ['uaepass'],
      business: ['ded', 'rera'],
      legal: ['mohre', 'notary', 'courts'],
      compliance: ['immigration', 'mof'],
    };
    return integrations.filter(([key]) => categoryMap[category]?.includes(key));
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-cyan-100">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-3xl font-bold text-green-600">{connectedCount}</div>
            <div className="text-sm text-gray-500">{t.stats.connected}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">{t.stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-3xl font-bold text-gray-600">{integrations.length}</div>
            <div className="text-sm text-gray-500">{t.stats.available}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-3xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-500">{t.stats.apiCalls}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Integration Categories */}
            {Object.entries(t.categories).map(([categoryKey, categoryName]) => {
              const categoryIntegrations = getCategoryIntegrations(categoryKey);
              if (categoryIntegrations.length === 0) return null;

              return (
                <div key={categoryKey}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{categoryName}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {categoryIntegrations.map(([key, integration]) => (
                      <div
                        key={key}
                        className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-all cursor-pointer ${
                          selectedIntegration === key ? 'border-cyan-500' : 'border-transparent hover:border-gray-200'
                        }`}
                        onClick={() => setSelectedIntegration(selectedIntegration === key ? null : key)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              integration.status === 'connected' ? 'bg-green-100' :
                              integration.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              <span className="text-2xl">
                                {key === 'uaepass' ? '🆔' :
                                 key === 'ded' ? '🏢' :
                                 key === 'mohre' ? '👔' :
                                 key === 'rera' ? '🏠' :
                                 key === 'notary' ? '📜' :
                                 key === 'courts' ? '⚖️' :
                                 key === 'immigration' ? '🛂' :
                                 key === 'mof' ? '💰' : '🔗'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                                {getStatusLabel(integration.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                        {selectedIntegration === key && (
                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                              <div className="flex flex-wrap gap-2">
                                {integration.features.map((feature, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {integration.status === 'connected' ? (
                                <>
                                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                    {t.actions.configure}
                                  </button>
                                  <button className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                                    {t.actions.disconnect}
                                  </button>
                                </>
                              ) : (
                                <button className="flex-1 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
                                  {t.actions.connect}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t.apiStatus.title}</h3>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">{t.apiStatus.healthy}</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">{t.logs.title}</h3>
                <button className="text-sm text-cyan-600 hover:text-cyan-700">{t.logs.viewAll}</button>
              </div>
              <div className="space-y-3">
                {mockLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' :
                      log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.service} • {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">{t.benefits.title}</h3>
              <div className="space-y-4">
                {t.benefits.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-cyan-100">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Setup */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t.setup.title}</h3>
              <ol className="space-y-3">
                {[t.setup.step1, t.setup.step2, t.setup.step3, t.setup.step4].map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

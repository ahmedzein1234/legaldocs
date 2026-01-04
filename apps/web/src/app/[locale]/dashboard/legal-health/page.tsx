'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Translations
const translations = {
  en: {
    title: 'Legal Health Score',
    subtitle: 'Your comprehensive legal compliance status',
    overallScore: 'Overall Score',
    lastUpdated: 'Last updated',
    categories: {
      contracts: 'Contract Management',
      compliance: 'Regulatory Compliance',
      documents: 'Document Organization',
      deadlines: 'Deadline Management',
      signatures: 'Signature Status',
    },
    status: {
      excellent: 'Excellent',
      good: 'Good',
      needsAttention: 'Needs Attention',
      critical: 'Critical',
    },
    insights: {
      title: 'Key Insights',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
    },
    actions: {
      title: 'Recommended Actions',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      due: 'Due',
      complete: 'Complete',
    },
    metrics: {
      documentsReviewed: 'Documents Reviewed',
      contractsActive: 'Active Contracts',
      upcomingDeadlines: 'Upcoming Deadlines',
      pendingSignatures: 'Pending Signatures',
      complianceItems: 'Compliance Items',
      riskAlerts: 'Risk Alerts',
    },
    trends: {
      title: 'Score Trends',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      improvement: 'Improvement',
    },
    breakdown: {
      title: 'Score Breakdown',
      weight: 'Weight',
      score: 'Score',
      impact: 'Impact on Total',
    },
    recommendations: {
      title: 'Personalized Recommendations',
      based: 'Based on your legal profile',
    },
    refresh: 'Refresh Score',
    export: 'Export Report',
    schedule: 'Schedule Consultation',
  },
  ar: {
    title: 'نقاط الصحة القانونية',
    subtitle: 'حالة الامتثال القانوني الشاملة',
    overallScore: 'النتيجة الإجمالية',
    lastUpdated: 'آخر تحديث',
    categories: {
      contracts: 'إدارة العقود',
      compliance: 'الامتثال التنظيمي',
      documents: 'تنظيم المستندات',
      deadlines: 'إدارة المواعيد',
      signatures: 'حالة التوقيعات',
    },
    status: {
      excellent: 'ممتاز',
      good: 'جيد',
      needsAttention: 'يحتاج اهتمام',
      critical: 'حرج',
    },
    insights: {
      title: 'الرؤى الرئيسية',
      strengths: 'نقاط القوة',
      improvements: 'مجالات التحسين',
    },
    actions: {
      title: 'الإجراءات الموصى بها',
      priority: 'الأولوية',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
      due: 'الموعد',
      complete: 'إكمال',
    },
    metrics: {
      documentsReviewed: 'المستندات المراجعة',
      contractsActive: 'العقود النشطة',
      upcomingDeadlines: 'المواعيد القادمة',
      pendingSignatures: 'التوقيعات المعلقة',
      complianceItems: 'بنود الامتثال',
      riskAlerts: 'تنبيهات المخاطر',
    },
    trends: {
      title: 'اتجاهات النتيجة',
      thisMonth: 'هذا الشهر',
      lastMonth: 'الشهر الماضي',
      improvement: 'التحسن',
    },
    breakdown: {
      title: 'تفصيل النتيجة',
      weight: 'الوزن',
      score: 'النتيجة',
      impact: 'التأثير على الإجمالي',
    },
    recommendations: {
      title: 'التوصيات المخصصة',
      based: 'بناءً على ملفك القانوني',
    },
    refresh: 'تحديث النتيجة',
    export: 'تصدير التقرير',
    schedule: 'جدولة استشارة',
  },
};

// Mock data
const mockHealthData = {
  overallScore: 76,
  lastUpdated: '2026-01-04T09:30:00Z',
  previousScore: 68,
  categories: {
    contracts: { score: 82, weight: 25, items: 12, issues: 2 },
    compliance: { score: 65, weight: 25, items: 8, issues: 3 },
    documents: { score: 88, weight: 20, items: 45, issues: 1 },
    deadlines: { score: 72, weight: 15, items: 6, issues: 2 },
    signatures: { score: 70, weight: 15, items: 5, issues: 2 },
  },
  metrics: {
    documentsReviewed: 45,
    contractsActive: 12,
    upcomingDeadlines: 6,
    pendingSignatures: 5,
    complianceItems: 8,
    riskAlerts: 3,
  },
  trends: [
    { month: 'Aug', score: 62 },
    { month: 'Sep', score: 65 },
    { month: 'Oct', score: 68 },
    { month: 'Nov', score: 72 },
    { month: 'Dec', score: 74 },
    { month: 'Jan', score: 76 },
  ],
  strengths: [
    'Well-organized document management system',
    'Consistent contract templates usage',
    'Regular document backups',
  ],
  improvements: [
    'Several compliance items need attention',
    'Some contract renewals approaching',
    'Pending signature requests',
  ],
  actions: [
    { id: '1', title: 'Review Trade License Renewal', priority: 'high', category: 'compliance', dueDate: '2026-01-15' },
    { id: '2', title: 'Complete pending Employment Contract', priority: 'high', category: 'signatures', dueDate: '2026-01-10' },
    { id: '3', title: 'Update Privacy Policy', priority: 'medium', category: 'compliance', dueDate: '2026-01-20' },
    { id: '4', title: 'Renew Service Agreement with Supplier', priority: 'medium', category: 'contracts', dueDate: '2026-01-25' },
    { id: '5', title: 'Archive expired contracts', priority: 'low', category: 'documents', dueDate: '2026-01-30' },
  ],
  recommendations: [
    { title: 'Set up automatic renewal reminders', description: 'Prevent missed deadlines with 30/60/90 day alerts' },
    { title: 'Schedule quarterly compliance review', description: 'Regular audits ensure continuous compliance' },
    { title: 'Digitize remaining paper documents', description: 'Improve searchability and reduce risk of loss' },
  ],
};

export default function LegalHealthPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  const [isRefreshing, setIsRefreshing] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t.status.excellent;
    if (score >= 60) return t.status.good;
    if (score >= 40) return t.status.needsAttention;
    return t.status.critical;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      month: 'short',
      day: 'numeric',
    });
  };

  const scoreChange = mockHealthData.overallScore - mockHealthData.previousScore;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-emerald-100">{t.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.refresh}
              </button>
              <button className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors">
                {t.export}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Overall Score */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">{t.overallScore}</p>
              <div className="relative w-48 h-48 mx-auto">
                {/* SVG Circle Progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke={mockHealthData.overallScore >= 80 ? '#10b981' : mockHealthData.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(mockHealthData.overallScore / 100) * 553} 553`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${getScoreColor(mockHealthData.overallScore)}`}>
                    {mockHealthData.overallScore}
                  </span>
                  <span className={`text-sm font-medium ${getScoreColor(mockHealthData.overallScore)}`}>
                    {getScoreLabel(mockHealthData.overallScore)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className={`flex items-center gap-1 text-sm ${scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scoreChange >= 0 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {Math.abs(scoreChange)} points
                </span>
                <span className="text-gray-400">vs last month</span>
              </div>
            </div>

            {/* Category Scores */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.breakdown.title}</h3>
              <div className="space-y-4">
                {Object.entries(mockHealthData.categories).map(([key, category]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {t.categories[key as keyof typeof t.categories]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                          {category.score}
                        </span>
                        {category.issues > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {category.issues} issues
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          category.score >= 80 ? 'bg-green-500' :
                          category.score >= 60 ? 'bg-yellow-500' :
                          category.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(t.metrics).map(([key, label]) => (
            <div key={key} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockHealthData.metrics[key as keyof typeof mockHealthData.metrics]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.trends.title}</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {mockHealthData.trends.map((trend, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all ${
                        trend.score >= 80 ? 'bg-green-500' :
                        trend.score >= 60 ? 'bg-yellow-500' :
                        trend.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${(trend.score / 100) * 160}px` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">{trend.month}</span>
                    <span className="text-xs font-medium text-gray-700">{trend.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.actions.title}</h3>
              <div className="space-y-3">
                {mockHealthData.actions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(action.priority)}`}>
                        {t.actions[action.priority as keyof typeof t.actions]}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500">{t.actions.due}: {formatDate(action.dueDate)}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      {t.actions.complete}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">{t.insights.strengths}</h3>
                <ul className="space-y-2">
                  {mockHealthData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">{t.insights.improvements}</h3>
                <ul className="space-y-2">
                  {mockHealthData.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.recommendations.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{t.recommendations.based}</p>
              <div className="space-y-4">
                {mockHealthData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need Expert Help?</h3>
              <p className="text-emerald-100 text-sm mb-4">
                Schedule a consultation with our legal experts to improve your compliance score.
              </p>
              <button className="w-full py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
                {t.schedule}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

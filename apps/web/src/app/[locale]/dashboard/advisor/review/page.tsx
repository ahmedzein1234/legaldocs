'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft,
  FileSearch,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  Scale,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Info,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DocumentUploader } from '@/components/upload/document-uploader';
import { type DocumentExtraction } from '@/lib/document-upload';
import {
  type ContractReview,
  type ContractIssue,
  type MissingClause,
  type ComplianceFlag,
  type ContractRecommendation,
  getRiskLevelColor,
} from '@/lib/legal-advisor';

type ReviewStep = 'upload' | 'analyzing' | 'results';

const countries = [
  { code: 'ae', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'qa', name: 'Qatar', nameAr: 'قطر' },
  { code: 'kw', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'bh', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'عمان' },
];

export default function ContractReviewPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [step, setStep] = React.useState<ReviewStep>('upload');
  const [selectedCountry, setSelectedCountry] = React.useState('ae');
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [extraction, setExtraction] = React.useState<DocumentExtraction | null>(null);
  const [review, setReview] = React.useState<ContractReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analyzeProgress, setAnalyzeProgress] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'issues' | 'missing' | 'compliance' | 'recommendations'>('overview');
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['critical']));

  const countryRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExtracted = async (extractedData: DocumentExtraction) => {
    setExtraction(extractedData);
    setStep('analyzing');
    setIsAnalyzing(true);
    setAnalyzeProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalyzeProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const token = localStorage.getItem('legaldocs_token') || '';
      const response = await fetch('https://legaldocs-api.a-m-zein.workers.dev/api/advisor/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: extractedData.id,
          documentName: extractedData.fileName,
          extractedText: extractedData.rawText,
          documentType: extractedData.documentType,
          parties: extractedData.parties,
          clauses: extractedData.clauses,
          country: selectedCountry,
          language: locale,
        }),
      });

      clearInterval(progressInterval);
      setAnalyzeProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Review failed');
      }

      setReview(result.review);
      setStep('results');
    } catch (error) {
      console.error('Review error:', error);
      clearInterval(progressInterval);
      // Reset to upload on error
      setStep('upload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const selectedCountryInfo = countries.find(c => c.code === selectedCountry);

  // Group issues by severity
  const groupedIssues = React.useMemo(() => {
    if (!review?.issues) return { critical: [], warning: [], info: [] };
    return {
      critical: review.issues.filter(i => i.severity === 'critical'),
      warning: review.issues.filter(i => i.severity === 'warning'),
      info: review.issues.filter(i => i.severity === 'info'),
    };
  }, [review?.issues]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/dashboard/advisor`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              {isRTL ? 'مراجعة العقد' : 'Contract Review'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'تحليل شامل للمخاطر والامتثال' : 'Comprehensive risk and compliance analysis'}
            </p>
          </div>
        </div>

        {step === 'upload' && (
          <div className="relative" ref={countryRef}>
            <Button
              variant="outline"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="gap-2"
            >
              <Scale className="h-4 w-4" />
              {isRTL ? selectedCountryInfo?.nameAr : selectedCountryInfo?.name}
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showCountryDropdown && (
              <div className="absolute top-full mt-1 end-0 z-50 w-48 bg-popover border rounded-lg shadow-lg p-1">
                {countries.map(country => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country.code);
                      setShowCountryDropdown(false);
                    }}
                    className={cn(
                      "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                      selectedCountry === country.code && "bg-accent"
                    )}
                  >
                    {isRTL ? country.nameAr : country.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'results' && (
          <Button variant="outline" onClick={() => setStep('upload')} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'مراجعة جديدة' : 'New Review'}
          </Button>
        )}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <DocumentUploader
            onExtracted={handleExtracted}
            purpose="analysis"
            language={locale as 'en' | 'ar'}
          />
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isRTL ? 'ما ستحصل عليه:' : 'What you will get:'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {isRTL ? 'تقييم المخاطر الشامل' : 'Comprehensive risk assessment'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {isRTL ? 'فحص الامتثال القانوني' : 'Legal compliance check'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {isRTL ? 'البنود المفقودة والموصى بها' : 'Missing and recommended clauses'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {isRTL ? 'مقارنة بمعايير السوق' : 'Market standard comparison'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {isRTL ? 'توصيات التحسين' : 'Improvement recommendations'}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Analyzing Step */}
      {step === 'analyzing' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {isRTL ? 'جاري تحليل العقد...' : 'Analyzing Contract...'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isRTL
              ? 'نقوم بفحص العقد للمخاطر والامتثال والبنود المفقودة'
              : 'Checking for risks, compliance issues, and missing clauses'}
          </p>
          <Progress value={analyzeProgress} className="w-full max-w-xs mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">{analyzeProgress}%</p>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && review && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={cn("text-4xl font-bold", getScoreColor(review.overallScore))}>
                    {review.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'الدرجة الإجمالية' : 'Overall Score'}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge className={cn("text-lg px-4 py-1", getRiskLevelColor(review.riskLevel))}>
                    {review.riskLevel.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    {isRTL ? 'مستوى المخاطر' : 'Risk Level'}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">
                    {review.issues?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'المشكلات المكتشفة' : 'Issues Found'}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500">
                    {review.missingClauses?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'البنود المفقودة' : 'Missing Clauses'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? 'الملخص التنفيذي' : 'Executive Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {isRTL ? review.executiveSummaryAr || review.executiveSummary : review.executiveSummary}
              </p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', labelAr: 'نظرة عامة' },
              { id: 'issues', label: isRTL ? 'المشكلات' : 'Issues', count: review.issues?.length },
              { id: 'missing', label: isRTL ? 'البنود المفقودة' : 'Missing', count: review.missingClauses?.length },
              { id: 'compliance', label: isRTL ? 'الامتثال' : 'Compliance', count: review.complianceFlags?.length },
              { id: 'recommendations', label: isRTL ? 'التوصيات' : 'Recommendations', count: review.recommendations?.length },
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="gap-2"
              >
                {tab.label}
                {tab.count !== undefined && (
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <Card>
            <CardContent className="pt-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Strengths */}
                  {review.strengths && review.strengths.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {isRTL ? 'نقاط القوة' : 'Strengths'}
                      </h3>
                      <div className="space-y-2">
                        {review.strengths.map((strength, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                            <p className="font-medium text-sm">{strength.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{strength.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Market Comparison */}
                  {review.marketComparison && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Scale className="h-5 w-5 text-blue-500" />
                        {isRTL ? 'مقارنة السوق' : 'Market Comparison'}
                      </h3>
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">
                            {review.marketComparison.comparedTo}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              review.marketComparison.overallPosition === 'favorable' && 'border-green-500 text-green-500',
                              review.marketComparison.overallPosition === 'standard' && 'border-blue-500 text-blue-500',
                              review.marketComparison.overallPosition === 'unfavorable' && 'border-red-500 text-red-500'
                            )}
                          >
                            {review.marketComparison.overallPosition}
                          </Badge>
                        </div>
                        {review.marketComparison.metrics && (
                          <div className="space-y-2">
                            {review.marketComparison.metrics.map((metric, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span>{metric.category}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-muted-foreground">{metric.yourValue}</span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      metric.position === 'better' && 'border-green-500 text-green-500',
                                      metric.position === 'same' && 'border-gray-500 text-gray-500',
                                      metric.position === 'worse' && 'border-red-500 text-red-500'
                                    )}
                                  >
                                    {metric.position}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-4">
                  {Object.entries(groupedIssues).map(([severity, issues]) => {
                    if (issues.length === 0) return null;
                    return (
                      <div key={severity}>
                        <button
                          onClick={() => toggleSection(severity)}
                          className="flex items-center gap-2 w-full text-start mb-2"
                        >
                          {expandedSections.has(severity) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {getSeverityIcon(severity)}
                          <span className="font-medium capitalize">{severity}</span>
                          <Badge variant="secondary">{issues.length}</Badge>
                        </button>
                        {expandedSections.has(severity) && (
                          <div className="space-y-2 ml-6">
                            {issues.map((issue, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "p-4 rounded-lg border",
                                  severity === 'critical' && 'border-red-200 bg-red-50 dark:bg-red-900/10',
                                  severity === 'warning' && 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10',
                                  severity === 'info' && 'border-blue-200 bg-blue-50 dark:bg-blue-900/10'
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{isRTL ? issue.titleAr || issue.title : issue.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {isRTL ? issue.descriptionAr || issue.description : issue.description}
                                    </p>
                                    {issue.clauseNumber && (
                                      <Badge variant="outline" className="mt-2">
                                        Clause {issue.clauseNumber}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-sm font-medium">{isRTL ? 'التوصية:' : 'Recommendation:'}</p>
                                  <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'missing' && (
                <div className="space-y-3">
                  {review.missingClauses?.map((clause, idx) => (
                    <div key={idx} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{isRTL ? clause.titleAr || clause.title : clause.title}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                clause.importance === 'essential' && 'border-red-500 text-red-500',
                                clause.importance === 'recommended' && 'border-yellow-500 text-yellow-500',
                                clause.importance === 'optional' && 'border-gray-500 text-gray-500'
                              )}
                            >
                              {clause.importance}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{clause.description}</p>
                        </div>
                      </div>
                      {clause.suggestedText && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-1">{isRTL ? 'النص المقترح:' : 'Suggested text:'}</p>
                          <p className="text-sm bg-muted p-2 rounded">{clause.suggestedText}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-3">
                  {review.complianceFlags?.map((flag, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/10">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{isRTL ? flag.titleAr || flag.title : flag.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                          {flag.law && (
                            <Badge variant="outline" className="mt-2">
                              {flag.law}
                            </Badge>
                          )}
                          {flag.consequence && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-red-600">
                                {isRTL ? 'العواقب: ' : 'Consequence: '}
                              </span>
                              <span className="text-sm">{flag.consequence}</span>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="text-sm font-medium text-green-600">
                              {isRTL ? 'الحل: ' : 'Remedy: '}
                            </span>
                            <span className="text-sm">{flag.remedy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-3">
                  {review.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                rec.priority === 'high' && 'border-red-500 text-red-500',
                                rec.priority === 'medium' && 'border-yellow-500 text-yellow-500',
                                rec.priority === 'low' && 'border-gray-500 text-gray-500'
                              )}
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="p-2 rounded bg-muted">
                          <span className="text-xs font-medium">{isRTL ? 'الإجراء:' : 'Action:'}</span>
                          <p className="text-sm">{rec.action}</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <span className="text-xs font-medium">{isRTL ? 'الفائدة:' : 'Benefit:'}</span>
                          <p className="text-sm">{rec.benefit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

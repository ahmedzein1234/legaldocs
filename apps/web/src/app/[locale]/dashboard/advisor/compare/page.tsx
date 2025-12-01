'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft,
  GitCompare,
  Upload,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  Minus,
  AlertTriangle,
  ChevronDown,
  Scale,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DocumentUploader } from '@/components/upload/document-uploader';
import { type DocumentExtraction } from '@/lib/document-upload';

interface ComparisonItem {
  category: string;
  categoryAr: string;
  clause: string;
  yourValue: string;
  standardValue: string;
  difference: 'better' | 'same' | 'worse' | 'missing';
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}

interface ComparisonResult {
  overallScore: number;
  yourPosition: 'favorable' | 'standard' | 'unfavorable';
  totalClauses: number;
  matchedClauses: number;
  betterClauses: number;
  worseClauses: number;
  missingClauses: number;
  comparisons: ComparisonItem[];
  summary: string;
  summaryAr?: string;
}

type CompareStep = 'upload' | 'comparing' | 'results';

const contractTypes = [
  { value: 'rental', label: 'Rental Agreement', labelAr: 'عقد إيجار' },
  { value: 'employment', label: 'Employment Contract', labelAr: 'عقد عمل' },
  { value: 'commercial_lease', label: 'Commercial Lease', labelAr: 'إيجار تجاري' },
  { value: 'service', label: 'Service Agreement', labelAr: 'عقد خدمات' },
  { value: 'nda', label: 'Non-Disclosure Agreement', labelAr: 'اتفاقية سرية' },
  { value: 'sales', label: 'Sales Contract', labelAr: 'عقد بيع' },
];

const countries = [
  { code: 'ae', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'qa', name: 'Qatar', nameAr: 'قطر' },
  { code: 'kw', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'bh', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'عمان' },
];

// Mock comparison result
const mockComparisonResult: ComparisonResult = {
  overallScore: 72,
  yourPosition: 'standard',
  totalClauses: 15,
  matchedClauses: 10,
  betterClauses: 3,
  worseClauses: 4,
  missingClauses: 2,
  summary: 'Your contract is generally aligned with market standards but has some areas that could be improved. The termination notice period is shorter than typical, and some standard protection clauses are missing.',
  summaryAr: 'عقدك متوافق بشكل عام مع معايير السوق ولكن هناك بعض المجالات التي يمكن تحسينها. فترة الإشعار للإنهاء أقصر من المعتاد، وبعض بنود الحماية القياسية مفقودة.',
  comparisons: [
    {
      category: 'Term',
      categoryAr: 'المدة',
      clause: 'Contract Duration',
      yourValue: '1 year',
      standardValue: '1 year',
      difference: 'same',
      impact: 'medium',
    },
    {
      category: 'Termination',
      categoryAr: 'الإنهاء',
      clause: 'Notice Period',
      yourValue: '30 days',
      standardValue: '60 days',
      difference: 'worse',
      impact: 'high',
      recommendation: 'Consider negotiating a longer notice period for better protection',
    },
    {
      category: 'Rent',
      categoryAr: 'الإيجار',
      clause: 'Annual Increase Cap',
      yourValue: '5%',
      standardValue: '10%',
      difference: 'better',
      impact: 'high',
    },
    {
      category: 'Maintenance',
      categoryAr: 'الصيانة',
      clause: 'Responsibility Split',
      yourValue: 'Landlord covers major',
      standardValue: 'Tenant covers all',
      difference: 'better',
      impact: 'medium',
    },
    {
      category: 'Deposit',
      categoryAr: 'التأمين',
      clause: 'Security Deposit',
      yourValue: '2 months',
      standardValue: '1 month',
      difference: 'worse',
      impact: 'medium',
      recommendation: 'Standard practice is 1 month deposit. Consider negotiating down.',
    },
    {
      category: 'Late Payment',
      categoryAr: 'التأخير',
      clause: 'Grace Period',
      yourValue: '5 days',
      standardValue: '7 days',
      difference: 'worse',
      impact: 'low',
    },
    {
      category: 'Utilities',
      categoryAr: 'المرافق',
      clause: 'Utility Responsibility',
      yourValue: 'Tenant pays',
      standardValue: 'Tenant pays',
      difference: 'same',
      impact: 'low',
    },
    {
      category: 'Renewal',
      categoryAr: 'التجديد',
      clause: 'Automatic Renewal',
      yourValue: 'Yes',
      standardValue: 'Yes',
      difference: 'same',
      impact: 'medium',
    },
    {
      category: 'Dispute',
      categoryAr: 'النزاعات',
      clause: 'Resolution Method',
      yourValue: 'Mediation then Court',
      standardValue: 'Direct Court',
      difference: 'better',
      impact: 'high',
    },
    {
      category: 'Insurance',
      categoryAr: 'التأمين',
      clause: 'Content Insurance',
      yourValue: 'Not specified',
      standardValue: 'Tenant responsible',
      difference: 'missing',
      impact: 'medium',
      recommendation: 'Add clause specifying insurance responsibilities',
    },
    {
      category: 'Subletting',
      categoryAr: 'التأجير الفرعي',
      clause: 'Subletting Rights',
      yourValue: 'Not allowed',
      standardValue: 'With consent',
      difference: 'worse',
      impact: 'low',
    },
    {
      category: 'Force Majeure',
      categoryAr: 'القوة القاهرة',
      clause: 'Force Majeure Clause',
      yourValue: 'Not specified',
      standardValue: 'Standard clause',
      difference: 'missing',
      impact: 'high',
      recommendation: 'Critical: Add force majeure clause for protection',
    },
  ],
};

export default function ContractComparisonPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [step, setStep] = React.useState<CompareStep>('upload');
  const [selectedType, setSelectedType] = React.useState('rental');
  const [selectedCountry, setSelectedCountry] = React.useState('ae');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [extraction, setExtraction] = React.useState<DocumentExtraction | null>(null);
  const [result, setResult] = React.useState<ComparisonResult | null>(null);
  const [compareProgress, setCompareProgress] = React.useState(0);

  const typeRef = React.useRef<HTMLDivElement>(null);
  const countryRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExtracted = async (extractedData: DocumentExtraction) => {
    setExtraction(extractedData);
    setStep('comparing');
    setCompareProgress(0);

    // Simulate comparison progress
    const interval = setInterval(() => {
      setCompareProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate API call - in production this would call the real API
    setTimeout(() => {
      clearInterval(interval);
      setCompareProgress(100);
      setResult(mockComparisonResult);
      setStep('results');
    }, 3000);
  };

  const getDifferenceIcon = (diff: ComparisonItem['difference']) => {
    switch (diff) {
      case 'better':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'same':
        return <Minus className="h-4 w-4 text-gray-400" />;
      case 'worse':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getDifferenceLabel = (diff: ComparisonItem['difference']) => {
    const labels = {
      better: { en: 'Better than market', ar: 'أفضل من السوق' },
      same: { en: 'Market standard', ar: 'معيار السوق' },
      worse: { en: 'Below market', ar: 'أقل من السوق' },
      missing: { en: 'Missing clause', ar: 'بند مفقود' },
    };
    return isRTL ? labels[diff].ar : labels[diff].en;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const selectedTypeInfo = contractTypes.find(t => t.value === selectedType);
  const selectedCountryInfo = countries.find(c => c.code === selectedCountry);

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
              <GitCompare className="h-5 w-5 text-primary" />
              {isRTL ? 'مقارنة العقود' : 'Contract Comparison'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'قارن عقدك بمعايير السوق' : 'Compare your contract against market standards'}
            </p>
          </div>
        </div>

        {step === 'results' && (
          <Button variant="outline" onClick={() => setStep('upload')} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'مقارنة جديدة' : 'New Comparison'}
          </Button>
        )}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isRTL ? 'خيارات المقارنة' : 'Comparison Options'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Contract Type */}
                <div className="relative" ref={typeRef}>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'نوع العقد' : 'Contract Type'}
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="w-full justify-between"
                  >
                    {isRTL ? selectedTypeInfo?.labelAr : selectedTypeInfo?.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showTypeDropdown && (
                    <div className="absolute top-full mt-1 z-50 w-full bg-popover border rounded-lg shadow-lg p-1">
                      {contractTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setSelectedType(type.value);
                            setShowTypeDropdown(false);
                          }}
                          className={cn(
                            "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                            selectedType === type.value && "bg-accent"
                          )}
                        >
                          {isRTL ? type.labelAr : type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div className="relative" ref={countryRef}>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'الدولة' : 'Country'}
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      {isRTL ? selectedCountryInfo?.nameAr : selectedCountryInfo?.name}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showCountryDropdown && (
                    <div className="absolute top-full mt-1 z-50 w-full bg-popover border rounded-lg shadow-lg p-1">
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
              </div>
            </CardContent>
          </Card>

          {/* Upload */}
          <DocumentUploader
            onExtracted={handleExtracted}
            purpose="analysis"
            language={locale as 'en' | 'ar'}
          />

          {/* Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Sparkles className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-2">
                    {isRTL ? 'كيف تعمل المقارنة؟' : 'How does comparison work?'}
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      {isRTL
                        ? '• نستخرج البنود الرئيسية من عقدك'
                        : '• We extract key clauses from your contract'}
                    </li>
                    <li>
                      {isRTL
                        ? '• نقارنها بقاعدة بيانات معايير السوق'
                        : '• Compare them against our market standards database'}
                    </li>
                    <li>
                      {isRTL
                        ? '• نحدد المجالات التي تحتاج إلى تحسين'
                        : '• Identify areas that need improvement'}
                    </li>
                    <li>
                      {isRTL
                        ? '• نقدم توصيات محددة للتفاوض'
                        : '• Provide specific negotiation recommendations'}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparing Step */}
      {step === 'comparing' && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <GitCompare className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {isRTL ? 'جاري المقارنة...' : 'Comparing Contract...'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isRTL
              ? 'نقارن عقدك بمعايير السوق في دول الخليج'
              : 'Comparing your contract against GCC market standards'}
          </p>
          <Progress value={compareProgress} className="w-full max-w-xs mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">{compareProgress}%</p>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && result && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6 text-center">
                <div className={cn("text-4xl font-bold", getScoreColor(result.overallScore))}>
                  {result.overallScore}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'الدرجة الإجمالية' : 'Overall Score'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-500">{result.betterClauses}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'أفضل من السوق' : 'Better than market'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-gray-500">{result.matchedClauses}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'مطابق للمعيار' : 'Matches standard'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-red-500">{result.worseClauses}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'أقل من السوق' : 'Below market'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-orange-500">{result.missingClauses}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'بنود مفقودة' : 'Missing clauses'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isRTL ? 'ملخص المقارنة' : 'Comparison Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {isRTL ? result.summaryAr || result.summary : result.summary}
              </p>
            </CardContent>
          </Card>

          {/* Detailed Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'المقارنة التفصيلية' : 'Detailed Comparison'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'مقارنة بند ببند مع معايير السوق'
                  : 'Clause-by-clause comparison with market standards'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.comparisons.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-4 rounded-lg border",
                      item.difference === 'better' && 'border-green-200 bg-green-50 dark:bg-green-900/10',
                      item.difference === 'same' && 'border-gray-200 bg-gray-50 dark:bg-gray-900/10',
                      item.difference === 'worse' && 'border-red-200 bg-red-50 dark:bg-red-900/10',
                      item.difference === 'missing' && 'border-orange-200 bg-orange-50 dark:bg-orange-900/10'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getDifferenceIcon(item.difference)}
                          <span className="font-medium">{item.clause}</span>
                          <Badge variant="outline" className="text-xs">
                            {isRTL ? item.categoryAr : item.category}
                          </Badge>
                          {item.impact === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              {isRTL ? 'تأثير عالي' : 'High Impact'}
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 text-sm">
                          <div className="p-2 rounded bg-background">
                            <span className="text-xs text-muted-foreground block mb-1">
                              {isRTL ? 'عقدك' : 'Your Contract'}
                            </span>
                            <span className={cn(
                              item.difference === 'missing' && 'text-muted-foreground italic'
                            )}>
                              {item.yourValue}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-background">
                            <span className="text-xs text-muted-foreground block mb-1">
                              {isRTL ? 'معيار السوق' : 'Market Standard'}
                            </span>
                            <span>{item.standardValue}</span>
                          </div>
                        </div>
                        {item.recommendation && (
                          <div className="mt-3 p-2 rounded bg-primary/5 text-sm">
                            <span className="font-medium">{isRTL ? 'التوصية: ' : 'Recommendation: '}</span>
                            {item.recommendation}
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <span className={cn(
                          "text-xs font-medium",
                          item.difference === 'better' && 'text-green-600',
                          item.difference === 'same' && 'text-gray-500',
                          item.difference === 'worse' && 'text-red-600',
                          item.difference === 'missing' && 'text-orange-600'
                        )}>
                          {getDifferenceLabel(item.difference)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

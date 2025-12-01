'use client';

import * as React from 'react';
import {
  type DocumentExtraction,
  type ExtractedParty,
  type ExtractedClause,
  formatFileSize,
} from '@/lib/document-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Home,
  AlertTriangle,
  CheckCircle,
  Copy,
  ChevronRight,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ExtractionViewerProps {
  extraction: DocumentExtraction;
  onUseParty?: (party: ExtractedParty, role: 'partyA' | 'partyB') => void;
  onUseClause?: (clause: ExtractedClause) => void;
  onUseAmount?: (amount: number, description: string) => void;
  onUseDates?: (dates: { start?: string; end?: string }) => void;
  language?: 'en' | 'ar';
  className?: string;
}

const clauseTypeLabels: Record<string, { en: string; ar: string; color: string }> = {
  preamble: { en: 'Preamble', ar: 'التمهيد', color: 'bg-blue-100 text-blue-800' },
  recital: { en: 'Recital', ar: 'المقدمة', color: 'bg-indigo-100 text-indigo-800' },
  definition: { en: 'Definition', ar: 'تعريف', color: 'bg-purple-100 text-purple-800' },
  obligation: { en: 'Obligation', ar: 'التزام', color: 'bg-orange-100 text-orange-800' },
  right: { en: 'Right', ar: 'حق', color: 'bg-green-100 text-green-800' },
  termination: { en: 'Termination', ar: 'إنهاء', color: 'bg-red-100 text-red-800' },
  confidentiality: { en: 'Confidentiality', ar: 'سرية', color: 'bg-yellow-100 text-yellow-800' },
  indemnity: { en: 'Indemnity', ar: 'تعويض', color: 'bg-pink-100 text-pink-800' },
  liability: { en: 'Liability', ar: 'مسؤولية', color: 'bg-rose-100 text-rose-800' },
  dispute: { en: 'Dispute', ar: 'نزاع', color: 'bg-amber-100 text-amber-800' },
  governing_law: { en: 'Governing Law', ar: 'القانون', color: 'bg-cyan-100 text-cyan-800' },
  signature: { en: 'Signature', ar: 'توقيع', color: 'bg-teal-100 text-teal-800' },
  witness: { en: 'Witness', ar: 'شهود', color: 'bg-emerald-100 text-emerald-800' },
  schedule: { en: 'Schedule', ar: 'جدول', color: 'bg-slate-100 text-slate-800' },
  other: { en: 'Other', ar: 'أخرى', color: 'bg-gray-100 text-gray-800' },
};

export function ExtractionViewer({
  extraction,
  onUseParty,
  onUseClause,
  onUseAmount,
  onUseDates,
  language = 'en',
  className,
}: ExtractionViewerProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const isRTL = language === 'ar';

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const labels = {
    summary: isRTL ? 'ملخص' : 'Summary',
    parties: isRTL ? 'الأطراف' : 'Parties',
    financials: isRTL ? 'المالية' : 'Financials',
    dates: isRTL ? 'التواريخ' : 'Dates',
    clauses: isRTL ? 'البنود' : 'Clauses',
    property: isRTL ? 'العقار' : 'Property',
    warnings: isRTL ? 'تحذيرات' : 'Warnings',
    useAsPartyA: isRTL ? 'استخدم كطرف أول' : 'Use as Party A',
    useAsPartyB: isRTL ? 'استخدم كطرف ثاني' : 'Use as Party B',
    useClause: isRTL ? 'استخدم البند' : 'Use Clause',
    useAmount: isRTL ? 'استخدم المبلغ' : 'Use Amount',
    useDates: isRTL ? 'استخدم التواريخ' : 'Use Dates',
    copy: isRTL ? 'نسخ' : 'Copy',
    copied: isRTL ? 'تم النسخ' : 'Copied',
    confidence: isRTL ? 'الثقة' : 'Confidence',
    noData: isRTL ? 'لا توجد بيانات' : 'No data found',
  };

  return (
    <Card className={cn('w-full', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {isRTL ? 'نتائج الاستخراج' : 'Extraction Results'}
            </CardTitle>
            <CardDescription className="mt-1">
              {extraction.fileName} ({formatFileSize(extraction.fileSize)})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {extraction.documentType?.replace(/_/g, ' ') || 'Unknown'}
            </Badge>
            <Badge variant="secondary">
              {Math.round((extraction.documentTypeConfidence || 0) * 100)}% {labels.confidence}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="summary" className="text-xs">
              {labels.summary}
            </TabsTrigger>
            <TabsTrigger value="parties" className="text-xs">
              {labels.parties}
              {extraction.parties.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {extraction.parties.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="financials" className="text-xs">
              {labels.financials}
            </TabsTrigger>
            <TabsTrigger value="dates" className="text-xs">
              {labels.dates}
            </TabsTrigger>
            <TabsTrigger value="clauses" className="text-xs">
              {labels.clauses}
              {extraction.clauses.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {extraction.clauses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="warnings" className="text-xs">
              {labels.warnings}
              {extraction.warnings.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {extraction.warnings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">
                {isRTL ? extraction.summaryAr || extraction.summary : extraction.summary}
              </p>
            </div>

            {/* Key Terms */}
            {extraction.keyTerms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {isRTL ? 'المصطلحات الرئيسية' : 'Key Terms'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {extraction.keyTerms.map((term, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-xs text-muted-foreground">{term.term}</span>
                      <span className="text-sm font-medium">{term.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jurisdiction */}
            {extraction.jurisdiction && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{extraction.jurisdiction}</Badge>
                <span className="text-muted-foreground">
                  {isRTL ? 'الاختصاص القضائي' : 'Jurisdiction'}
                </span>
              </div>
            )}
          </TabsContent>

          {/* Parties Tab */}
          <TabsContent value="parties">
            <ScrollArea className="h-[300px]">
              {extraction.parties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{labels.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extraction.parties.map((party, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {party.type === 'company' ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{party.name}</p>
                            {party.nameAr && party.nameAr !== party.name && (
                              <p className="text-xs text-muted-foreground">{party.nameAr}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {party.role?.replace(/_/g, ' ') || party.type}
                        </Badge>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        {party.idNumber && <span>ID: {party.idNumber}</span>}
                        {party.nationality && <span>Nationality: {party.nationality}</span>}
                        {party.phone && <span>Phone: {party.phone}</span>}
                        {party.email && <span>Email: {party.email}</span>}
                      </div>

                      {onUseParty && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => onUseParty(party, 'partyA')}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {labels.useAsPartyA}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => onUseParty(party, 'partyB')}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {labels.useAsPartyB}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials">
            <ScrollArea className="h-[300px]">
              {extraction.financials.amounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{labels.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extraction.financials.currency && (
                    <Badge variant="secondary">
                      {isRTL ? 'العملة: ' : 'Currency: '}{extraction.financials.currency}
                    </Badge>
                  )}

                  {extraction.financials.amounts.map((amount, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {extraction.financials.currency} {amount.value.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{amount.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {amount.type}
                          </Badge>
                          {amount.frequency && (
                            <Badge variant="secondary" className="text-xs">
                              {amount.frequency}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {onUseAmount && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs h-7"
                          onClick={() => onUseAmount(amount.value, amount.description)}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {labels.useAmount}
                        </Button>
                      )}
                    </div>
                  ))}

                  {extraction.financials.paymentTerms && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {isRTL ? 'شروط الدفع' : 'Payment Terms'}
                      </p>
                      <p className="text-sm">{extraction.financials.paymentTerms}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Dates Tab */}
          <TabsContent value="dates">
            <div className="space-y-3">
              {extraction.dates.effectiveDate && (
                <DateItem
                  label={isRTL ? 'تاريخ السريان' : 'Effective Date'}
                  value={extraction.dates.effectiveDate}
                />
              )}
              {extraction.dates.startDate && (
                <DateItem
                  label={isRTL ? 'تاريخ البدء' : 'Start Date'}
                  value={extraction.dates.startDate}
                />
              )}
              {extraction.dates.endDate && (
                <DateItem
                  label={isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                  value={extraction.dates.endDate}
                />
              )}
              {extraction.dates.signatureDate && (
                <DateItem
                  label={isRTL ? 'تاريخ التوقيع' : 'Signature Date'}
                  value={extraction.dates.signatureDate}
                />
              )}
              {extraction.dates.noticePeriod && (
                <DateItem
                  label={isRTL ? 'فترة الإشعار' : 'Notice Period'}
                  value={extraction.dates.noticePeriod}
                />
              )}

              {extraction.dates.customDates?.map((d, i) => (
                <DateItem key={i} label={d.label} value={d.date} />
              ))}

              {onUseDates && extraction.dates.startDate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => onUseDates({
                    start: extraction.dates.startDate,
                    end: extraction.dates.endDate,
                  })}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  {labels.useDates}
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Clauses Tab */}
          <TabsContent value="clauses">
            <ScrollArea className="h-[300px]">
              {extraction.clauses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{labels.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extraction.clauses.map((clause, i) => {
                    const typeInfo = clauseTypeLabels[clause.type] || clauseTypeLabels.other;
                    return (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{clause.title}</p>
                            {clause.titleAr && clause.titleAr !== clause.title && (
                              <p className="text-xs text-muted-foreground">{clause.titleAr}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={cn('text-xs', typeInfo.color)}>
                              {isRTL ? typeInfo.ar : typeInfo.en}
                            </Badge>
                            {clause.importance === 'critical' && (
                              <Badge variant="destructive" className="text-xs">
                                {isRTL ? 'هام' : 'Critical'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {clause.content}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {labels.confidence}: {Math.round(clause.confidence * 100)}%
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => copyToClipboard(clause.content, clause.id)}
                            >
                              {copiedId === clause.id ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            {onUseClause && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={() => onUseClause(clause)}
                              >
                                {labels.useClause}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Warnings Tab */}
          <TabsContent value="warnings">
            <div className="space-y-3">
              {extraction.warnings.length === 0 && extraction.notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">
                    {isRTL ? 'لا توجد تحذيرات' : 'No warnings found'}
                  </p>
                </div>
              ) : (
                <>
                  {extraction.warnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <p className="text-sm">{warning}</p>
                    </div>
                  ))}

                  {extraction.notes.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <h4 className="text-sm font-medium mb-2">
                        {isRTL ? 'ملاحظات' : 'Notes'}
                      </h4>
                      {extraction.notes.map((note, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-muted-foreground">{note}</p>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default ExtractionViewer;

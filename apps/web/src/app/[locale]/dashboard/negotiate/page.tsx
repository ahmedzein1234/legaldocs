'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  RiskLevel,
  ClauseCategory,
  NegotiationPosition,
  ClauseAnalysis,
  ContractRiskSummary,
  WhatIfScenario,
  CounterProposal,
  RealTimeSuggestion,
  getRiskColor,
  getRiskBadgeColor,
  getRiskLabel,
  getCategoryLabel,
  getPositionLabel,
  riskyPhrases,
} from '@/lib/contract-negotiation';
import {
  SUPPORTED_FILE_TYPES,
  ALL_MIME_TYPES,
  MAX_FILE_SIZE,
  validateFile,
  getFileCategory,
  formatFileSize,
  fileToBase64,
  type DocumentExtraction,
  type ExtractedParty,
  type ExtractedDates,
  type ExtractedFinancials,
} from '@/lib/document-upload';

// Document metadata from upload
interface UploadedDocumentInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  parties?: ExtractedParty[];
  dates?: ExtractedDates;
  financials?: ExtractedFinancials;
  documentType?: string;
}

export default function NegotiationAssistantPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isArabic = locale === 'ar';

  const [activeTab, setActiveTab] = useState<'analyze' | 'scenarios' | 'counter' | 'chat'>('analyze');
  const [contractText, setContractText] = useState('');
  const [position, setPosition] = useState<NegotiationPosition>('neutral');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clauses, setClauses] = useState<ClauseAnalysis[]>([]);
  const [riskSummary, setRiskSummary] = useState<ContractRiskSummary | null>(null);
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([]);
  const [counterProposals, setCounterProposals] = useState<CounterProposal[]>([]);
  const [suggestions, setSuggestions] = useState<RealTimeSuggestion[]>([]);
  const [selectedClause, setSelectedClause] = useState<ClauseAnalysis | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Document upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocumentInfo | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    title: isArabic ? 'مساعد التفاوض الذكي' : 'AI Negotiation Assistant',
    subtitle: isArabic ? 'تحليل العقود والمقترحات المضادة وسيناريوهات ماذا لو' : 'Contract analysis, counter-proposals, and what-if scenarios',

    // Tabs
    analyze: isArabic ? 'تحليل المخاطر' : 'Risk Analysis',
    scenarios: isArabic ? 'سيناريوهات ماذا لو' : 'What-If Scenarios',
    counter: isArabic ? 'مقترحات مضادة' : 'Counter-Proposals',
    chat: isArabic ? 'محادثة ذكية' : 'AI Chat',

    // Input section
    pasteContract: isArabic ? 'الصق نص العقد هنا...' : 'Paste contract text here...',
    yourPosition: isArabic ? 'موقفك' : 'Your Position',
    analyzeBtn: isArabic ? 'تحليل العقد' : 'Analyze Contract',
    analyzing: isArabic ? 'جاري التحليل...' : 'Analyzing...',

    // Risk summary
    overallRisk: isArabic ? 'المخاطر الإجمالية' : 'Overall Risk',
    riskScore: isArabic ? 'درجة المخاطر' : 'Risk Score',
    topRisks: isArabic ? 'أهم المخاطر' : 'Top Risks',
    missingClauses: isArabic ? 'بنود مفقودة' : 'Missing Clauses',
    clauseBreakdown: isArabic ? 'تحليل البنود' : 'Clause Breakdown',

    // Clause analysis
    issues: isArabic ? 'المشاكل' : 'Issues',
    suggestions: isArabic ? 'الاقتراحات' : 'Suggestions',
    marketStandard: isArabic ? 'المعيار السوقي' : 'Market Standard',
    legalBasis: isArabic ? 'الأساس القانوني' : 'Legal Basis',

    // What-if
    currentClause: isArabic ? 'البند الحالي' : 'Current Clause',
    proposedChange: isArabic ? 'التغيير المقترح' : 'Proposed Change',
    impact: isArabic ? 'التأثير' : 'Impact',
    riskChange: isArabic ? 'تغير المخاطر' : 'Risk Change',
    pros: isArabic ? 'الإيجابيات' : 'Pros',
    cons: isArabic ? 'السلبيات' : 'Cons',
    recommendation: isArabic ? 'التوصية' : 'Recommendation',

    // Counter-proposals
    original: isArabic ? 'البند الأصلي' : 'Original Clause',
    proposed: isArabic ? 'البند المقترح' : 'Proposed Clause',
    rationale: isArabic ? 'المبررات' : 'Rationale',
    tips: isArabic ? 'نصائح التفاوض' : 'Negotiation Tips',
    fallback: isArabic ? 'الموقف الاحتياطي' : 'Fallback Position',
    redLines: isArabic ? 'الخطوط الحمراء' : 'Red Lines',

    // Chat
    chatPlaceholder: isArabic ? 'اسأل عن أي بند في العقد...' : 'Ask about any clause in the contract...',
    send: isArabic ? 'إرسال' : 'Send',

    // Actions
    generateScenarios: isArabic ? 'توليد السيناريوهات' : 'Generate Scenarios',
    generateCounters: isArabic ? 'توليد المقترحات المضادة' : 'Generate Counter-Proposals',
    copyToClipboard: isArabic ? 'نسخ' : 'Copy',
    exportReport: isArabic ? 'تصدير التقرير' : 'Export Report',

    // Upload section
    uploadContract: isArabic ? 'رفع العقد' : 'Upload Contract',
    orPasteText: isArabic ? 'أو الصق النص أدناه' : 'or paste text below',
    dragDrop: isArabic ? 'اسحب وأفلت الملف هنا' : 'Drag & drop file here',
    browse: isArabic ? 'تصفح الملفات' : 'Browse Files',
    supportedFormats: isArabic ? 'PDF, Word, صور (مع OCR)' : 'PDF, Word, Images (with OCR)',
    maxSize: isArabic ? 'الحد الأقصى 10 ميجابايت' : 'Max 10MB',
    uploading: isArabic ? 'جاري الرفع...' : 'Uploading...',
    processing: isArabic ? 'جاري المعالجة...' : 'Processing...',
    extracting: isArabic ? 'جاري استخراج النص...' : 'Extracting text...',
    uploadSuccess: isArabic ? 'تم استخراج النص بنجاح' : 'Text extracted successfully',
    uploadError: isArabic ? 'فشل في رفع الملف' : 'Failed to upload file',
    removeFile: isArabic ? 'إزالة الملف' : 'Remove file',
    documentInfo: isArabic ? 'معلومات المستند' : 'Document Info',
    parties: isArabic ? 'الأطراف' : 'Parties',
    dates: isArabic ? 'التواريخ' : 'Dates',
    value: isArabic ? 'القيمة' : 'Value',
    textExtracted: isArabic ? 'تم استخراج النص من المستند' : 'Text extracted from document',
  };

  // File upload handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      // Convert to base64
      setUploadProgress(30);
      const base64Data = await fileToBase64(file);

      // Send to API for extraction
      setUploadProgress(50);
      const response = await fetch('/api/uploads/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: base64Data,
          purpose: 'analysis',
          language: locale,
        }),
      });

      setUploadProgress(80);

      if (!response.ok) {
        throw new Error('Failed to extract document');
      }

      const data = await response.json();
      const extraction: DocumentExtraction = data.data || data;

      setUploadProgress(100);

      // Set the extracted text to contract text
      if (extraction.rawText) {
        setContractText(extraction.rawText);
      }

      // Store document info for display
      setUploadedDocument({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        parties: extraction.parties,
        dates: extraction.dates,
        financials: extraction.financials,
        documentType: extraction.documentType,
      });

      // Auto-detect position based on document content
      if (extraction.parties && extraction.parties.length > 0) {
        const roles = extraction.parties.map(p => p.role?.toLowerCase() || '');
        if (roles.includes('tenant') || roles.includes('lessee')) {
          setPosition('tenant');
        } else if (roles.includes('landlord') || roles.includes('lessor')) {
          setPosition('landlord');
        } else if (roles.includes('employer')) {
          setPosition('employer');
        } else if (roles.includes('employee')) {
          setPosition('employee');
        } else if (roles.includes('buyer') || roles.includes('purchaser')) {
          setPosition('buyer');
        } else if (roles.includes('seller') || roles.includes('vendor')) {
          setPosition('seller');
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to process document');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearUploadedDocument = () => {
    setUploadedDocument(null);
    setContractText('');
    setClauses([]);
    setRiskSummary(null);
    setScenarios([]);
    setCounterProposals([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Real-time suggestion detection
  useEffect(() => {
    if (!contractText) {
      setSuggestions([]);
      return;
    }

    const detected: RealTimeSuggestion[] = [];
    const phrases = isArabic ? riskyPhrases.ar : riskyPhrases.en;

    phrases.forEach((item) => {
      if (contractText.toLowerCase().includes(item.phrase.toLowerCase())) {
        detected.push({
          type: item.risk === 'critical' ? 'risk' : item.risk === 'high' ? 'warning' : 'improvement',
          message: `Found "${item.phrase}" - ${item.suggestion}`,
          priority: item.risk as 'low' | 'medium' | 'high',
        });
      }
    });

    setSuggestions(detected);
  }, [contractText, isArabic]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const analyzeContract = async () => {
    if (!contractText.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/negotiate/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          position,
          language: locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClauses(data.clauses || []);
        setRiskSummary(data.riskSummary || null);
      } else {
        // Demo mode - generate mock analysis
        generateMockAnalysis();
      }
    } catch (error) {
      // Demo mode
      generateMockAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockAnalysis = () => {
    const mockClauses: ClauseAnalysis[] = [
      {
        id: '1',
        text: 'The Tenant shall pay rent on the first of each month without any deduction or set-off.',
        category: 'payment',
        riskLevel: 'medium',
        riskScore: 45,
        issues: ['No grace period specified', 'No provision for disputes'],
        suggestions: ['Add 5-day grace period', 'Include dispute resolution for payment issues'],
        marketComparison: 'Standard is 3-5 day grace period in UAE',
        legalBasis: 'UAE Civil Code Article 762',
      },
      {
        id: '2',
        text: 'Either party may terminate this agreement with 30 days written notice.',
        category: 'termination',
        riskLevel: 'low',
        riskScore: 20,
        issues: [],
        suggestions: ['Consider adding early termination fee'],
        marketComparison: 'Standard 30-90 days in UAE commercial leases',
      },
      {
        id: '3',
        text: 'The Tenant shall indemnify and hold harmless the Landlord against all claims, damages, and expenses.',
        category: 'indemnity',
        riskLevel: 'high',
        riskScore: 75,
        issues: ['Unlimited indemnification', 'No cap on liability', 'Includes third-party claims'],
        suggestions: ['Cap indemnity to contract value', 'Exclude gross negligence of landlord', 'Limit to direct damages only'],
        marketComparison: 'Balanced contracts cap indemnity at 1-2x annual rent',
        legalBasis: 'DIFC Law No. 6 of 2004',
      },
    ];

    const mockSummary: ContractRiskSummary = {
      overallScore: 47,
      overallLevel: 'medium',
      clauseBreakdown: [
        { category: 'payment', count: 3, avgRisk: 35 },
        { category: 'termination', count: 2, avgRisk: 25 },
        { category: 'indemnity', count: 1, avgRisk: 75 },
        { category: 'liability', count: 2, avgRisk: 60 },
      ],
      topRisks: [
        { clause: 'Indemnification', risk: 'Unlimited liability exposure', severity: 'high' },
        { clause: 'Termination', risk: 'No cure period for defaults', severity: 'medium' },
        { clause: 'Jurisdiction', risk: 'Foreign court specified', severity: 'medium' },
      ],
      missingClauses: [
        { clause: 'Force Majeure', importance: 'essential', reason: 'Protects against unforeseeable events' },
        { clause: 'Data Protection', importance: 'recommended', reason: 'UAE PDPL compliance' },
        { clause: 'Anti-Corruption', importance: 'recommended', reason: 'Standard in commercial contracts' },
      ],
    };

    setClauses(mockClauses);
    setRiskSummary(mockSummary);
  };

  const generateWhatIfScenarios = async () => {
    if (!clauses.length) return;

    // Mock scenarios
    const mockScenarios: WhatIfScenario[] = [
      {
        id: '1',
        title: 'Cap Indemnification',
        description: 'What if we limit indemnification to contract value?',
        currentClause: 'Unlimited indemnification for all claims',
        proposedChange: 'Indemnification capped at total contract value (AED 500,000)',
        impactAnalysis: {
          riskChange: -30,
          pros: ['Limits maximum exposure', 'Standard market practice', 'More insurable'],
          cons: ['May face pushback', 'Landlord may request higher rent'],
          likelihood: 'high',
          financialImpact: 'Reduces potential liability by AED 500,000+',
        },
        recommendation: 'accept',
      },
      {
        id: '2',
        title: 'Add Grace Period',
        description: 'What if we add a 5-day grace period for rent payment?',
        currentClause: 'Rent due on the 1st with no grace period',
        proposedChange: 'Rent due on the 1st with 5-day grace period before penalties apply',
        impactAnalysis: {
          riskChange: -15,
          pros: ['Flexibility for payment processing', 'Reduces default risk', 'Industry standard'],
          cons: ['Minor concession from landlord perspective'],
          likelihood: 'high',
          financialImpact: 'Avoids potential late fees of 5% per incident',
        },
        recommendation: 'accept',
      },
      {
        id: '3',
        title: 'Extend Notice Period',
        description: 'What if we extend termination notice to 90 days?',
        currentClause: '30 days notice for termination',
        proposedChange: '90 days written notice required for termination',
        impactAnalysis: {
          riskChange: +10,
          pros: ['More time to find replacement', 'Shows commitment'],
          cons: ['Less flexibility to exit', 'Longer commitment period'],
          likelihood: 'medium',
          financialImpact: 'Potential 2 months additional rent if need to exit early',
        },
        recommendation: 'negotiate',
      },
    ];

    setScenarios(mockScenarios);
    setActiveTab('scenarios');
  };

  const generateCounterProposals = async () => {
    if (!clauses.length) return;

    const mockCounters: CounterProposal[] = [
      {
        id: '1',
        originalClause: 'The Tenant shall indemnify and hold harmless the Landlord against all claims, damages, and expenses arising from the tenancy.',
        proposedClause: 'The Tenant shall indemnify the Landlord against direct claims and damages arising from the Tenant\'s negligence or breach, up to a maximum of the annual rent amount, excluding any claims arising from the Landlord\'s own negligence or willful misconduct.',
        rationale: 'The original clause creates unlimited exposure. This counter limits liability to a reasonable cap while maintaining the landlord\'s protection for legitimate claims.',
        negotiationTips: [
          'Present market data showing capped indemnities are standard',
          'Emphasize your clean track record',
          'Offer to increase security deposit as compromise',
          'Mention insurance coverage you carry',
        ],
        fallbackPosition: 'Accept 2x annual rent cap if 1x is rejected',
        redLines: ['Never accept unlimited liability', 'Must exclude landlord negligence'],
        expectedResponse: 'Landlord may counter with 2-3x annual rent cap',
      },
      {
        id: '2',
        originalClause: 'Rent shall be paid on the first day of each month. Late payment shall incur a penalty of 10% of the monthly rent.',
        proposedClause: 'Rent shall be paid by the fifth day of each month. A grace period of 5 additional days shall apply before any late fee. Late payment after the grace period shall incur a penalty of 5% of the monthly rent for the first occurrence, increasing to 10% for subsequent late payments within the same year.',
        rationale: 'The original penalty is harsh and immediate. This provides reasonable flexibility while still incentivizing timely payment.',
        negotiationTips: [
          'Reference banking transfer processing times',
          'Mention your payment history if positive',
          'Offer auto-debit arrangement as alternative',
        ],
        fallbackPosition: '3-day grace period with 7% penalty',
        redLines: ['Must have at least 3 days grace', 'Penalty should not exceed 10%'],
        expectedResponse: 'Likely to accept 5-day grace with original 10% penalty',
      },
    ];

    setCounterProposals(mockCounters);
    setActiveTab('counter');
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/negotiate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          contractText,
          position,
          history: chatMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        // Demo response
        const demoResponse = generateDemoResponse(userMessage);
        setChatMessages((prev) => [...prev, { role: 'assistant', content: demoResponse }]);
      }
    } catch {
      const demoResponse = generateDemoResponse(userMessage);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: demoResponse }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateDemoResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('indemnity') || q.includes('liability')) {
      return `Based on UAE law and market practice, I recommend:\n\n1. **Cap the indemnity** at 1-2x annual contract value\n2. **Exclude** claims arising from the other party's negligence\n3. **Limit to direct damages** only (no consequential damages)\n4. **Require notice** before any indemnity claim\n\nIn DIFC/ADGM, courts have upheld reasonable liability caps. Would you like me to draft a counter-proposal?`;
    }

    if (q.includes('termination') || q.includes('notice')) {
      return `For termination clauses in UAE contracts:\n\n1. **Standard notice periods**: 30-90 days for commercial, 90+ days for employment\n2. **Cure periods**: Always negotiate a right to cure breaches (typically 14-30 days)\n3. **Early termination fees**: Usually 2-3 months rent/fees\n\nYour current 30-day notice is on the shorter end. Consider negotiating for mutual termination rights.`;
    }

    if (q.includes('rent') || q.includes('payment')) {
      return `Payment term recommendations:\n\n1. **Grace period**: 3-5 days is standard in UAE\n2. **Late fees**: Should not exceed 5-10% (courts may reduce excessive penalties)\n3. **Payment method**: Bank transfer with proof is recommended\n4. **Post-dated cheques**: Common in UAE but carry criminal liability risk\n\nWould you like me to suggest alternative payment terms?`;
    }

    return `I can help you analyze and negotiate this contract. Here are some things I can assist with:\n\n• **Risk Assessment**: Identify problematic clauses\n• **Counter-Proposals**: Draft alternative language\n• **What-If Analysis**: Evaluate impact of changes\n• **UAE Law**: Explain local legal requirements\n\nWhat specific aspect would you like to explore?`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {translations.title}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {translations.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Contract Input */}
          <div className="lg:col-span-1 space-y-4">
            {/* Position Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translations.yourPosition}
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as NegotiationPosition)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {(['buyer', 'seller', 'landlord', 'tenant', 'employer', 'employee', 'service_provider', 'client', 'neutral'] as NegotiationPosition[]).map((pos) => (
                  <option key={pos} value={pos}>
                    {getPositionLabel(pos, isArabic)}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {translations.uploadContract}
              </h3>

              {/* Upload Area */}
              {!uploadedDocument && (
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALL_MIME_TYPES.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {isUploading ? (
                    <div className="space-y-3">
                      <svg className="animate-spin w-8 h-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadProgress < 50 ? translations.uploading : uploadProgress < 80 ? translations.processing : translations.extracting}
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translations.dragDrop}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {translations.supportedFormats}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {translations.maxSize}
                      </p>
                      <button
                        type="button"
                        className="mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        {translations.browse}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                  </div>
                </div>
              )}

              {/* Uploaded Document Info */}
              {uploadedDocument && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          {translations.uploadSuccess}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 truncate max-w-[200px]">
                          {uploadedDocument.fileName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearUploadedDocument}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title={translations.removeFile}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Extracted Info Summary */}
                  {(uploadedDocument.parties?.length || uploadedDocument.dates?.effectiveDate || uploadedDocument.dates?.startDate || uploadedDocument.financials?.amounts?.length) && (
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800 space-y-2">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">
                        {translations.documentInfo}:
                      </p>
                      {uploadedDocument.documentType && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Type: {uploadedDocument.documentType}
                        </p>
                      )}
                      {uploadedDocument.parties && uploadedDocument.parties.length > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {translations.parties}: {uploadedDocument.parties.map(p => p.name || p.role).join(', ')}
                        </p>
                      )}
                      {(uploadedDocument.dates?.effectiveDate || uploadedDocument.dates?.startDate) && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {translations.dates}: {uploadedDocument.dates.effectiveDate || uploadedDocument.dates.startDate}
                        </p>
                      )}
                      {uploadedDocument.financials?.amounts && uploadedDocument.financials.amounts.length > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {translations.value}: {uploadedDocument.financials.currency || 'AED'} {uploadedDocument.financials.amounts.reduce((sum, a) => sum + a.value, 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{translations.orPasteText}</span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              </div>

              {/* Text Input */}
              <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder={translations.pasteContract}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none text-sm"
              />

              {/* Text extracted indicator */}
              {uploadedDocument && contractText && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {translations.textExtracted}
                </p>
              )}

              {/* Analyze Button */}
              <button
                onClick={analyzeContract}
                disabled={isAnalyzing || !contractText.trim()}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {translations.analyzing}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {translations.analyzeBtn}
                  </>
                )}
              </button>
            </div>

            {/* Real-time Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {isArabic ? 'تنبيهات فورية' : 'Real-time Alerts'}
                </h3>
                <div className="space-y-2">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-sm ${
                        s.priority === 'high'
                          ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : s.priority === 'medium'
                          ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}
                    >
                      {s.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  {(['analyze', 'scenarios', 'counter', 'chat'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {translations[tab]}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Risk Analysis Tab */}
                {activeTab === 'analyze' && (
                  <div className="space-y-6">
                    {riskSummary ? (
                      <>
                        {/* Overall Risk Score */}
                        <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 transform -rotate-90">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                              />
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="none"
                                stroke={
                                  riskSummary.overallLevel === 'critical' ? '#ef4444' :
                                  riskSummary.overallLevel === 'high' ? '#f97316' :
                                  riskSummary.overallLevel === 'medium' ? '#eab308' : '#22c55e'
                                }
                                strokeWidth="8"
                                strokeDasharray={`${riskSummary.overallScore * 2.51} 251`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {riskSummary.overallScore}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {translations.overallRisk}
                            </h3>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskSummary.overallLevel)}`}>
                              {getRiskLabel(riskSummary.overallLevel, isArabic)}
                            </span>
                          </div>
                          <div className="flex-1 flex gap-2 justify-end">
                            <button
                              onClick={generateWhatIfScenarios}
                              className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                              {translations.generateScenarios}
                            </button>
                            <button
                              onClick={generateCounterProposals}
                              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                              {translations.generateCounters}
                            </button>
                          </div>
                        </div>

                        {/* Top Risks */}
                        {riskSummary.topRisks.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              {translations.topRisks}
                            </h4>
                            <div className="space-y-2">
                              {riskSummary.topRisks.map((risk, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${getRiskColor(risk.severity)}`}>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="font-medium">{risk.clause}</span>
                                      <p className="text-sm mt-1">{risk.risk}</p>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${getRiskBadgeColor(risk.severity)}`} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Clauses */}
                        {riskSummary.missingClauses.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              {translations.missingClauses}
                            </h4>
                            <div className="space-y-2">
                              {riskSummary.missingClauses.map((missing, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                      missing.importance === 'essential' ? 'bg-red-100 text-red-700' :
                                      missing.importance === 'recommended' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {missing.importance}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">{missing.clause}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{missing.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Clause Analysis */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            {translations.clauseBreakdown}
                          </h4>
                          <div className="space-y-3">
                            {clauses.map((clause) => (
                              <div
                                key={clause.id}
                                onClick={() => setSelectedClause(selectedClause?.id === clause.id ? null : clause)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  selectedClause?.id === clause.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                        {getCategoryLabel(clause.category, isArabic)}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${getRiskColor(clause.riskLevel)}`}>
                                        {clause.riskScore}%
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                      {clause.text}
                                    </p>
                                  </div>
                                  <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform ${selectedClause?.id === clause.id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>

                                {selectedClause?.id === clause.id && (
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                    {clause.issues.length > 0 && (
                                      <div>
                                        <h5 className="text-xs font-medium text-red-600 mb-1">{translations.issues}</h5>
                                        <ul className="text-sm space-y-1">
                                          {clause.issues.map((issue, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <span className="text-red-500">•</span>
                                              {issue}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {clause.suggestions.length > 0 && (
                                      <div>
                                        <h5 className="text-xs font-medium text-green-600 mb-1">{translations.suggestions}</h5>
                                        <ul className="text-sm space-y-1">
                                          {clause.suggestions.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <span className="text-green-500">•</span>
                                              {s}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {clause.marketComparison && (
                                      <div>
                                        <h5 className="text-xs font-medium text-blue-600 mb-1">{translations.marketStandard}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{clause.marketComparison}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">
                          {isArabic ? 'الصق نص العقد وانقر على تحليل للبدء' : 'Paste contract text and click Analyze to begin'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* What-If Scenarios Tab */}
                {activeTab === 'scenarios' && (
                  <div className="space-y-4">
                    {scenarios.length > 0 ? (
                      scenarios.map((scenario) => (
                        <div key={scenario.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{scenario.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-medium text-gray-500 mb-1">{translations.currentClause}</h5>
                                <p className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">{scenario.currentClause}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-gray-500 mb-1">{translations.proposedChange}</h5>
                                <p className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">{scenario.proposedChange}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                scenario.impactAnalysis.riskChange < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {translations.riskChange}: {scenario.impactAnalysis.riskChange > 0 ? '+' : ''}{scenario.impactAnalysis.riskChange}%
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                scenario.recommendation === 'accept' ? 'bg-green-100 text-green-700' :
                                scenario.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {translations.recommendation}: {scenario.recommendation}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-medium text-green-600 mb-1">{translations.pros}</h5>
                                <ul className="text-sm space-y-1">
                                  {scenario.impactAnalysis.pros.map((p, i) => (
                                    <li key={i}>+ {p}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-red-600 mb-1">{translations.cons}</h5>
                                <ul className="text-sm space-y-1">
                                  {scenario.impactAnalysis.cons.map((c, i) => (
                                    <li key={i}>- {c}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            {scenario.impactAnalysis.financialImpact && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                💰 {scenario.impactAnalysis.financialImpact}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          {isArabic ? 'حلل العقد أولاً ثم اضغط على توليد السيناريوهات' : 'Analyze contract first, then click Generate Scenarios'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Counter-Proposals Tab */}
                {activeTab === 'counter' && (
                  <div className="space-y-6">
                    {counterProposals.length > 0 ? (
                      counterProposals.map((cp) => (
                        <div key={cp.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="p-4 space-y-4">
                            <div>
                              <h5 className="text-xs font-medium text-red-600 mb-1">{translations.original}</h5>
                              <p className="text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{cp.originalClause}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-green-600 mb-1">{translations.proposed}</h5>
                              <p className="text-sm p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">{cp.proposedClause}</p>
                              <button
                                onClick={() => navigator.clipboard.writeText(cp.proposedClause)}
                                className="mt-2 text-xs text-blue-600 hover:underline"
                              >
                                {translations.copyToClipboard}
                              </button>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-blue-600 mb-1">{translations.rationale}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{cp.rationale}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-medium text-purple-600 mb-1">{translations.tips}</h5>
                                <ul className="text-sm space-y-1">
                                  {cp.negotiationTips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span>💡</span> {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-orange-600 mb-1">{translations.redLines}</h5>
                                <ul className="text-sm space-y-1">
                                  {cp.redLines.map((line, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span>🚫</span> {line}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <h5 className="text-xs font-medium text-yellow-700 mb-1">{translations.fallback}</h5>
                              <p className="text-sm">{cp.fallbackPosition}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">
                          {isArabic ? 'حلل العقد أولاً ثم اضغط على توليد المقترحات المضادة' : 'Analyze contract first, then click Generate Counter-Proposals'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-[500px]">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          {isArabic ? 'ابدأ محادثة حول العقد...' : 'Start a conversation about the contract...'}
                        </div>
                      )}
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-xl ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder={translations.chatPlaceholder}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={isChatLoading || !chatInput.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {translations.send}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

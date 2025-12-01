'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Send,
  MessageSquare,
  ArrowLeft,
  Paperclip,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Scale,
  FileText,
  AlertCircle,
  BookOpen,
  Clock,
  User,
  Bot,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  type ConsultationMessage,
  type ConsultationTopic,
  type LegalCitation,
  generateSessionId,
  GCC_LEGAL_FRAMEWORKS,
} from '@/lib/legal-advisor';

interface Message extends ConsultationMessage {
  isLoading?: boolean;
}

const consultationTopics: { value: ConsultationTopic; label: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'general_inquiry', label: 'General Legal Question', labelAr: 'سؤال قانوني عام', icon: MessageSquare },
  { value: 'contract_review', label: 'Contract Review', labelAr: 'مراجعة العقد', icon: FileText },
  { value: 'dispute_advice', label: 'Dispute Resolution', labelAr: 'حل النزاعات', icon: Scale },
  { value: 'compliance_check', label: 'Compliance Check', labelAr: 'فحص الامتثال', icon: AlertCircle },
  { value: 'risk_assessment', label: 'Risk Assessment', labelAr: 'تقييم المخاطر', icon: AlertCircle },
  { value: 'strategy_planning', label: 'Strategy Planning', labelAr: 'التخطيط الاستراتيجي', icon: BookOpen },
  { value: 'negotiation_tactics', label: 'Negotiation Tactics', labelAr: 'تكتيكات التفاوض', icon: MessageSquare },
  { value: 'court_procedure', label: 'Court Procedures', labelAr: 'إجراءات المحكمة', icon: Scale },
];

const countries = [
  { code: 'ae', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'qa', name: 'Qatar', nameAr: 'قطر' },
  { code: 'kw', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'bh', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'عمان' },
];

const suggestedQuestions = {
  en: [
    "What are my rights as a tenant in Dubai?",
    "How do I terminate an employment contract legally?",
    "What clauses should I look for in a commercial lease?",
    "What is the process for filing a labor complaint in UAE?",
    "How can I protect my intellectual property in GCC?",
    "What are the penalties for bounced checks in UAE?",
  ],
  ar: [
    "ما هي حقوقي كمستأجر في دبي؟",
    "كيف يمكنني إنهاء عقد العمل بشكل قانوني؟",
    "ما البنود التي يجب البحث عنها في عقد الإيجار التجاري؟",
    "ما هي إجراءات تقديم شكوى عمالية في الإمارات؟",
    "كيف أحمي ملكيتي الفكرية في دول الخليج؟",
    "ما هي عقوبات الشيكات المرتجعة في الإمارات؟",
  ],
};

export default function ConsultationPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [sessionId] = React.useState(() => generateSessionId());
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState<ConsultationTopic>('general_inquiry');
  const [selectedCountry, setSelectedCountry] = React.useState('ae');
  const [showTopicDropdown, setShowTopicDropdown] = React.useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const topicRef = React.useRef<HTMLDivElement>(null);
  const countryRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (topicRef.current && !topicRef.current.contains(event.target as Node)) {
        setShowTopicDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: `msg_loading`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const token = localStorage.getItem('legaldocs_token') || '';
      const response = await fetch('https://legaldocs-api.a-m-zein.workers.dev/api/advisor/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          topic: selectedTopic,
          country: selectedCountry,
          language: locale,
          conversationHistory: messages.filter(m => !m.isLoading).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get response');
      }

      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
          citations: result.citations,
        }];
      });
    } catch (error) {
      console.error('Consultation error:', error);
      // Remove loading and add error message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: isRTL
            ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
            : 'Sorry, an error occurred. Please try again.',
          timestamp: new Date(),
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedback } : m
    ));
  };

  const selectedTopicInfo = consultationTopics.find(t => t.value === selectedTopic);
  const selectedCountryInfo = countries.find(c => c.code === selectedCountry);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/dashboard/advisor`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isRTL ? 'الاستشارة القانونية' : 'Legal Consultation'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'اسأل خبيرنا القانوني أي سؤال' : 'Ask our legal expert any question'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Country Selector */}
          <div className="relative" ref={countryRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="gap-2"
            >
              <span>{isRTL ? selectedCountryInfo?.nameAr : selectedCountryInfo?.name}</span>
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

          {/* Topic Selector */}
          <div className="relative" ref={topicRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTopicDropdown(!showTopicDropdown)}
              className="gap-2"
            >
              {selectedTopicInfo && <selectedTopicInfo.icon className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {isRTL ? selectedTopicInfo?.labelAr : selectedTopicInfo?.label}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showTopicDropdown && (
              <div className="absolute top-full mt-1 end-0 z-50 w-64 bg-popover border rounded-lg shadow-lg p-1">
                {consultationTopics.map(topic => (
                  <button
                    key={topic.value}
                    onClick={() => {
                      setSelectedTopic(topic.value);
                      setShowTopicDropdown(false);
                    }}
                    className={cn(
                      "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent flex items-center gap-2",
                      selectedTopic === topic.value && "bg-accent"
                    )}
                  >
                    <topic.icon className="h-4 w-4" />
                    {isRTL ? topic.labelAr : topic.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Scale className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isRTL ? 'مرحباً بك في المستشار القانوني' : 'Welcome to Legal Advisor'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {isRTL
                ? 'اسأل أي سؤال قانوني متعلق بقوانين دول الخليج. سأساعدك في فهم حقوقك والتزاماتك.'
                : "Ask any legal question related to GCC law. I'll help you understand your rights and obligations."}
            </p>
            <div className="w-full max-w-2xl">
              <p className="text-sm font-medium mb-3">
                {isRTL ? 'أسئلة مقترحة:' : 'Suggested questions:'}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(isRTL ? suggestedQuestions.ar : suggestedQuestions.en).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-start p-3 rounded-lg border hover:bg-accent/50 transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {isRTL ? 'جاري التحليل...' : 'Analyzing...'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                      {/* Citations */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-medium mb-2 opacity-70">
                            {isRTL ? 'المراجع القانونية:' : 'Legal References:'}
                          </p>
                          <div className="space-y-1">
                            {message.citations.map((citation, idx) => (
                              <div key={idx} className="text-xs opacity-70 flex items-start gap-1">
                                <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{citation.title} - {citation.reference}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions for assistant messages */}
                      {message.role === 'assistant' && !message.isLoading && (
                        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7",
                              message.feedback === 'helpful' && "text-green-500"
                            )}
                            onClick={() => handleFeedback(message.id, 'helpful')}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7",
                              message.feedback === 'not_helpful' && "text-red-500"
                            )}
                            onClick={() => handleFeedback(message.id, 'not_helpful')}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t pt-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRTL ? 'اكتب سؤالك القانوني...' : 'Type your legal question...'}
              className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] max-h-[150px]"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-12 w-12"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className={cn("h-5 w-5", isRTL && "rotate-180")} />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {isRTL
            ? 'هذه المشورة للإرشاد فقط وليست بديلاً عن الاستشارة القانونية المتخصصة'
            : 'This advice is for guidance only and is not a substitute for professional legal advice'}
        </p>
      </div>
    </div>
  );
}

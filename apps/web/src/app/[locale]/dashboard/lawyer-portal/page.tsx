'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Eye,
  Send,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Building2,
  Briefcase,
  Shield,
  AlertCircle,
  ChevronRight,
  Bell,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface QuoteRequest {
  id: string;
  documentType: string;
  documentTitle: string;
  documentSummary: string;
  anonymizedPreview: string;
  serviceType: 'review' | 'certify' | 'consult';
  urgency: 'standard' | 'urgent' | 'express';
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  specialInstructions?: string;
  pageCount: number;
  complexityScore: number;
  language: string;
  createdAt: string;
  expiresAt: string;
  status: 'new' | 'viewed' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  userInfo?: {
    avatar?: string;
    memberSince: string;
    documentsCompleted: number;
  };
  myQuote?: {
    amount: number;
    estimatedDays: number;
    status: 'pending' | 'accepted' | 'rejected';
  };
}

interface Engagement {
  id: string;
  documentTitle: string;
  documentType: string;
  clientName: string;
  amount: number;
  status: 'active' | 'review' | 'revision' | 'completed' | 'disputed';
  dueDate: string;
  startedAt: string;
  lastMessageAt?: string;
  unreadMessages: number;
}

// Mock data for demonstration
const mockRequests: QuoteRequest[] = [
  {
    id: 'qr_1',
    documentType: 'Employment Contract',
    documentTitle: 'Senior Developer Employment Agreement',
    documentSummary: 'Standard employment contract for a technology company. Includes provisions for intellectual property, non-compete clauses, and bonus structure.',
    anonymizedPreview: 'This Employment Agreement is entered into between [COMPANY NAME] ("Employer") and [PARTY A] ("Employee"). The Employee shall serve as [POSITION] starting from [DATE]...',
    serviceType: 'review',
    urgency: 'standard',
    budgetMin: 500,
    budgetMax: 1500,
    deadline: '2025-12-15',
    pageCount: 8,
    complexityScore: 3,
    language: 'en',
    createdAt: '2025-11-28T10:00:00Z',
    expiresAt: '2025-12-05T10:00:00Z',
    status: 'new',
    userInfo: {
      memberSince: '2024-03-15',
      documentsCompleted: 12,
    },
  },
  {
    id: 'qr_2',
    documentType: 'Tenancy Contract',
    documentTitle: 'Villa Lease Agreement - Dubai Marina',
    documentSummary: 'Residential lease agreement for a villa property. Standard RERA-compliant format with additional clauses for maintenance responsibilities.',
    anonymizedPreview: 'TENANCY CONTRACT\n\nLandlord: [PARTY A]\nTenant: [PARTY B]\nProperty: [PROPERTY ADDRESS]\nEjari Registration: [HIDDEN]...',
    serviceType: 'certify',
    urgency: 'urgent',
    budgetMin: 800,
    budgetMax: 2000,
    specialInstructions: 'Need notarization for visa purposes. Must be completed before tenant visa renewal deadline.',
    pageCount: 12,
    complexityScore: 2,
    language: 'ar',
    createdAt: '2025-11-27T14:30:00Z',
    expiresAt: '2025-12-04T14:30:00Z',
    status: 'viewed',
    userInfo: {
      memberSince: '2023-08-20',
      documentsCompleted: 28,
    },
  },
  {
    id: 'qr_3',
    documentType: 'Share Purchase Agreement',
    documentTitle: 'SPA - Tech Startup Acquisition',
    documentSummary: 'Complex share purchase agreement for acquiring 40% stake in a technology startup. Includes warranties, indemnities, and earn-out provisions.',
    anonymizedPreview: 'SHARE PURCHASE AGREEMENT\n\nSeller: [PARTY A]\nBuyer: [PARTY B]\nTarget Company: [COMPANY NAME]\nShares: [NUMBER] ordinary shares representing [PERCENTAGE]% of issued share capital...',
    serviceType: 'review',
    urgency: 'express',
    budgetMin: 3000,
    budgetMax: 8000,
    deadline: '2025-12-01',
    specialInstructions: 'Critical transaction with tight timeline. Need thorough review of warranties and indemnity caps.',
    pageCount: 45,
    complexityScore: 5,
    language: 'en',
    createdAt: '2025-11-29T08:00:00Z',
    expiresAt: '2025-11-30T08:00:00Z',
    status: 'new',
    userInfo: {
      memberSince: '2024-01-10',
      documentsCompleted: 8,
    },
  },
  {
    id: 'qr_4',
    documentType: 'Power of Attorney',
    documentTitle: 'General POA for Property Management',
    documentSummary: 'General power of attorney document authorizing property management activities including rental, maintenance, and legal representation.',
    anonymizedPreview: 'POWER OF ATTORNEY\n\nI, [PARTY A], hereby appoint [PARTY B] as my lawful attorney to act on my behalf in all matters relating to...',
    serviceType: 'certify',
    urgency: 'standard',
    budgetMin: 300,
    budgetMax: 600,
    pageCount: 4,
    complexityScore: 1,
    language: 'en',
    createdAt: '2025-11-26T16:00:00Z',
    expiresAt: '2025-12-03T16:00:00Z',
    status: 'quoted',
    myQuote: {
      amount: 450,
      estimatedDays: 2,
      status: 'pending',
    },
    userInfo: {
      memberSince: '2024-06-01',
      documentsCompleted: 5,
    },
  },
];

const mockEngagements: Engagement[] = [
  {
    id: 'eng_1',
    documentTitle: 'Commercial Lease Agreement',
    documentType: 'Tenancy Contract',
    clientName: 'Ahmed M.',
    amount: 1200,
    status: 'active',
    dueDate: '2025-12-02',
    startedAt: '2025-11-25',
    lastMessageAt: '2025-11-28T15:30:00Z',
    unreadMessages: 2,
  },
  {
    id: 'eng_2',
    documentTitle: 'Freelance Service Agreement',
    documentType: 'Service Contract',
    clientName: 'Sara K.',
    amount: 650,
    status: 'review',
    dueDate: '2025-11-30',
    startedAt: '2025-11-20',
    lastMessageAt: '2025-11-28T09:00:00Z',
    unreadMessages: 0,
  },
];

const serviceTypeLabels = {
  review: { en: 'Document Review', ar: 'مراجعة مستند' },
  certify: { en: 'Certification', ar: 'توثيق' },
  consult: { en: 'Consultation', ar: 'استشارة' },
};

const urgencyColors = {
  standard: 'bg-blue-100 text-blue-700',
  urgent: 'bg-orange-100 text-orange-700',
  express: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  viewed: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-700',
};

const engagementStatusColors = {
  active: 'bg-blue-100 text-blue-700',
  review: 'bg-purple-100 text-purple-700',
  revision: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  disputed: 'bg-red-100 text-red-700',
};

export default function LawyerPortalPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Stats
  const stats = {
    newRequests: mockRequests.filter(r => r.status === 'new').length,
    pendingQuotes: mockRequests.filter(r => r.myQuote?.status === 'pending').length,
    activeEngagements: mockEngagements.filter(e => e.status === 'active').length,
    monthlyEarnings: 4850,
    rating: 4.9,
    responseRate: 95,
  };

  const filteredRequests = mockRequests.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request.documentTitle.toLowerCase().includes(query) ||
        request.documentType.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSubmitQuote = () => {
    console.log('Submitting quote:', {
      requestId: selectedRequest?.id,
      amount: quoteAmount,
      estimatedDays,
      coverLetter,
    });
    setQuoteDialogOpen(false);
    setQuoteAmount('');
    setEstimatedDays('');
    setCoverLetter('');
    setSelectedRequest(null);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  const getExpiresIn = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return isArabic ? 'منتهي' : 'Expired';
    if (diffHours < 24) return isArabic ? `${diffHours} ساعة` : `${diffHours}h`;
    return isArabic ? `${diffDays} يوم` : `${diffDays}d`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isArabic ? 'بوابة المحامي' : 'Lawyer Portal'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إدارة الطلبات والعملاء' : 'Manage requests & clients'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {stats.newRequests > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.newRequests}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.newRequests}</p>
                  <p className="text-xs text-green-600">
                    {isArabic ? 'طلبات جديدة' : 'New Requests'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.pendingQuotes}</p>
                  <p className="text-xs text-purple-600">
                    {isArabic ? 'عروض معلقة' : 'Pending Quotes'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.activeEngagements}</p>
                  <p className="text-xs text-blue-600">
                    {isArabic ? 'عمل نشط' : 'Active Work'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">
                    {stats.monthlyEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-600">
                    {isArabic ? 'أرباح الشهر (AED)' : 'Monthly (AED)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{stats.rating}</p>
                  <p className="text-xs text-orange-600">
                    {isArabic ? 'التقييم' : 'Rating'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">{stats.responseRate}%</p>
                  <p className="text-xs text-teal-600">
                    {isArabic ? 'معدل الرد' : 'Response Rate'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="requests" className="gap-2">
              <FileText className="h-4 w-4" />
              {isArabic ? 'طلبات العروض' : 'Quote Requests'}
              {stats.newRequests > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {stats.newRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="engagements" className="gap-2">
              <Briefcase className="h-4 w-4" />
              {isArabic ? 'العمل الحالي' : 'Active Work'}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {isArabic ? 'المكتمل' : 'Completed'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'البحث في الطلبات...' : 'Search requests...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="new">{isArabic ? 'جديد' : 'New'}</SelectItem>
                  <SelectItem value="viewed">{isArabic ? 'تم المشاهدة' : 'Viewed'}</SelectItem>
                  <SelectItem value="quoted">{isArabic ? 'تم التسعير' : 'Quoted'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Request Cards */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className={cn(
                    'transition-all hover:shadow-lg cursor-pointer',
                    request.status === 'new' && 'border-green-200 bg-green-50/30'
                  )}
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{request.documentTitle}</h3>
                              {request.status === 'new' && (
                                <Badge className="bg-green-500">
                                  {isArabic ? 'جديد' : 'New'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>{request.documentType}</span>
                              <span>•</span>
                              <span>{request.pageCount} {isArabic ? 'صفحة' : 'pages'}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                {isArabic ? 'عرض التفاصيل' : 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request);
                                setQuoteDialogOpen(true);
                              }}>
                                <Send className="h-4 w-4 mr-2" />
                                {isArabic ? 'تقديم عرض' : 'Submit Quote'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {request.documentSummary}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className={urgencyColors[request.urgency]}>
                            {request.urgency === 'standard' && (isArabic ? 'عادي' : 'Standard')}
                            {request.urgency === 'urgent' && (isArabic ? 'عاجل' : 'Urgent')}
                            {request.urgency === 'express' && (isArabic ? 'سريع جداً' : 'Express')}
                          </Badge>
                          <Badge variant="outline">
                            {serviceTypeLabels[request.serviceType][isArabic ? 'ar' : 'en']}
                          </Badge>
                          <Badge variant="outline">
                            {request.language === 'ar' ? '🇦🇪 Arabic' : '🇬🇧 English'}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {isArabic ? 'التعقيد' : 'Complexity'}: {request.complexityScore}/5
                          </Badge>
                        </div>

                        {/* Anonymized Preview */}
                        <div className="bg-muted/50 rounded-lg p-3 border border-dashed">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">
                            {isArabic ? 'معاينة مخفية الهوية:' : 'Anonymized Preview:'}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono line-clamp-2">
                            {request.anonymizedPreview}
                          </p>
                        </div>
                      </div>

                      {/* Side Info */}
                      <div className="lg:w-64 space-y-4 lg:border-l lg:pl-4">
                        {/* Budget */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-start">
                          <span className="text-sm text-muted-foreground">
                            {isArabic ? 'الميزانية' : 'Budget'}
                          </span>
                          <span className="font-semibold text-lg">
                            {request.budgetMin.toLocaleString()} - {request.budgetMax.toLocaleString()} AED
                          </span>
                        </div>

                        {/* Deadline */}
                        {request.deadline && (
                          <div className="flex items-center justify-between lg:flex-col lg:items-start">
                            <span className="text-sm text-muted-foreground">
                              {isArabic ? 'الموعد النهائي' : 'Deadline'}
                            </span>
                            <span className="font-medium flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Time Info */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-start">
                          <span className="text-sm text-muted-foreground">
                            {isArabic ? 'تنتهي في' : 'Expires in'}
                          </span>
                          <span className="font-medium text-orange-600">
                            {getExpiresIn(request.expiresAt)}
                          </span>
                        </div>

                        {/* Quote Status or Submit Button */}
                        {request.myQuote ? (
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 mb-1">
                              {isArabic ? 'عرضك' : 'Your Quote'}
                            </p>
                            <p className="font-semibold text-purple-700">
                              {request.myQuote.amount.toLocaleString()} AED
                            </p>
                            <p className="text-xs text-purple-600">
                              {request.myQuote.estimatedDays} {isArabic ? 'أيام' : 'days'}
                            </p>
                            <Badge className={cn('mt-2', statusColors[request.myQuote.status])}>
                              {request.myQuote.status === 'pending' && (isArabic ? 'قيد المراجعة' : 'Pending')}
                              {request.myQuote.status === 'accepted' && (isArabic ? 'مقبول' : 'Accepted')}
                              {request.myQuote.status === 'rejected' && (isArabic ? 'مرفوض' : 'Rejected')}
                            </Badge>
                          </div>
                        ) : (
                          <Button
                            className="w-full gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                              setQuoteDialogOpen(true);
                            }}
                          >
                            <Send className="h-4 w-4" />
                            {isArabic ? 'تقديم عرض' : 'Submit Quote'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold mb-2">
                      {isArabic ? 'لا توجد طلبات' : 'No requests found'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic
                        ? 'ستظهر الطلبات الجديدة هنا عند توفرها'
                        : 'New quote requests will appear here when available'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="engagements" className="space-y-4">
            {mockEngagements.map((engagement) => (
              <Card key={engagement.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {engagement.clientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{engagement.documentTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {engagement.clientName} • {engagement.documentType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={engagementStatusColors[engagement.status]}>
                        {engagement.status === 'active' && (isArabic ? 'نشط' : 'Active')}
                        {engagement.status === 'review' && (isArabic ? 'قيد المراجعة' : 'In Review')}
                        {engagement.status === 'revision' && (isArabic ? 'تعديلات' : 'Revision')}
                      </Badge>
                      {engagement.unreadMessages > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {engagement.unreadMessages}
                        </Badge>
                      )}
                      <div className="text-right">
                        <p className="font-semibold">{engagement.amount.toLocaleString()} AED</p>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? 'موعد التسليم' : 'Due'}: {new Date(engagement.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed">
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">
                  {isArabic ? 'لا توجد أعمال مكتملة' : 'No completed work yet'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isArabic
                    ? 'ستظهر الأعمال المكتملة هنا'
                    : 'Completed engagements will appear here'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Quote Dialog */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              {isArabic ? 'تقديم عرض سعر' : 'Submit Quote'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.documentTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Request Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">
                {isArabic ? 'ملخص الطلب' : 'Request Summary'}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'النوع' : 'Type'}:</span>
                  <span className="ml-2 font-medium">{selectedRequest?.documentType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'الخدمة' : 'Service'}:</span>
                  <span className="ml-2 font-medium">
                    {selectedRequest && serviceTypeLabels[selectedRequest.serviceType][isArabic ? 'ar' : 'en']}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'الميزانية' : 'Budget'}:</span>
                  <span className="ml-2 font-medium">
                    {selectedRequest?.budgetMin.toLocaleString()} - {selectedRequest?.budgetMax.toLocaleString()} AED
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isArabic ? 'الصفحات' : 'Pages'}:</span>
                  <span className="ml-2 font-medium">{selectedRequest?.pageCount}</span>
                </div>
              </div>
            </div>

            {/* Quote Form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isArabic ? 'مبلغ العرض (AED)' : 'Quote Amount (AED)'}</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? 'مدة التسليم (أيام)' : 'Delivery Time (days)'}</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'رسالة للعميل' : 'Cover Letter'}</Label>
              <Textarea
                placeholder={isArabic
                  ? 'اشرح خبرتك في هذا النوع من المستندات وكيف ستتعامل مع المراجعة...'
                  : 'Explain your experience with this type of document and how you would approach the review...'}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">
                  {isArabic ? 'ملاحظة مهمة' : 'Important Note'}
                </p>
                <p>
                  {isArabic
                    ? 'ستحصل على الوصول الكامل للمستند فقط بعد قبول العميل لعرضك'
                    : 'You will only get full document access after the client accepts your quote'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitQuote} className="gap-2">
              <Send className="h-4 w-4" />
              {isArabic ? 'إرسال العرض' : 'Submit Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Plus,
  Briefcase,
  Filter,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Scale,
  FileText,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
interface Case {
  id: string;
  case_number: string;
  title: string;
  title_ar?: string;
  description?: string;
  case_type: string;
  practice_area?: string;
  jurisdiction: string;
  court?: string;
  status: string;
  priority: string;
  client_name?: string;
  client_email?: string;
  opposing_party?: string;
  case_value?: number;
  currency: string;
  billing_type: string;
  hourly_rate?: number;
  total_billed: number;
  total_paid: number;
  next_deadline?: string;
  next_hearing_date?: string;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  document_count: number;
  created_at: string;
  updated_at: string;
}

interface CaseStats {
  total_cases: number;
  open_cases: number;
  active_cases: number;
  pending_cases: number;
  closed_cases: number;
  won_cases: number;
  lost_cases: number;
  urgent_cases: number;
  total_billed: number;
  total_paid: number;
}

// Mock data for demo - replace with API calls
const mockCases: Case[] = [
  {
    id: '1',
    case_number: 'CASE-2025-ABC123',
    title: 'Al Maktoum Holdings vs. Emirates Trading Co.',
    case_type: 'litigation',
    practice_area: 'commercial',
    jurisdiction: 'AE',
    court: 'Dubai Courts',
    status: 'active',
    priority: 'high',
    client_name: 'Al Maktoum Holdings LLC',
    client_email: 'legal@almaktoum.ae',
    opposing_party: 'Emirates Trading Co.',
    case_value: 5000000,
    currency: 'AED',
    billing_type: 'hourly',
    hourly_rate: 1500,
    total_billed: 45000,
    total_paid: 30000,
    next_deadline: '2025-12-15',
    next_hearing_date: '2025-12-20',
    total_tasks: 12,
    completed_tasks: 8,
    overdue_tasks: 1,
    document_count: 24,
    created_at: '2025-10-01',
    updated_at: '2025-11-28',
  },
  {
    id: '2',
    case_number: 'CASE-2025-DEF456',
    title: 'Employment Dispute - Mohamed Ahmed',
    case_type: 'employment',
    practice_area: 'civil',
    jurisdiction: 'AE',
    court: 'Abu Dhabi Labour Court',
    status: 'pending',
    priority: 'medium',
    client_name: 'Mohamed Ahmed',
    client_email: 'mohamed@email.com',
    opposing_party: 'Gulf Construction LLC',
    case_value: 250000,
    currency: 'AED',
    billing_type: 'fixed',
    total_billed: 15000,
    total_paid: 15000,
    next_deadline: '2025-12-10',
    total_tasks: 6,
    completed_tasks: 4,
    overdue_tasks: 0,
    document_count: 12,
    created_at: '2025-11-01',
    updated_at: '2025-11-25',
  },
  {
    id: '3',
    case_number: 'CASE-2025-GHI789',
    title: 'Property Transfer - Palm Jumeirah Villa',
    case_type: 'real_estate',
    practice_area: 'civil',
    jurisdiction: 'AE',
    status: 'open',
    priority: 'low',
    client_name: 'Sarah Johnson',
    client_email: 'sarah@email.com',
    case_value: 12000000,
    currency: 'AED',
    billing_type: 'fixed',
    total_billed: 25000,
    total_paid: 12500,
    total_tasks: 8,
    completed_tasks: 2,
    overdue_tasks: 0,
    document_count: 8,
    created_at: '2025-11-15',
    updated_at: '2025-11-28',
  },
];

const mockStats: CaseStats = {
  total_cases: 15,
  open_cases: 5,
  active_cases: 6,
  pending_cases: 2,
  closed_cases: 2,
  won_cases: 1,
  lost_cases: 1,
  urgent_cases: 2,
  total_billed: 185000,
  total_paid: 127500,
};

export default function CasesPage() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState('all');
  const [isLoading] = React.useState(false);

  // Labels
  const caseTypeLabels: Record<string, Record<string, string>> = {
    litigation: { en: 'Litigation', ar: 'التقاضي' },
    corporate: { en: 'Corporate', ar: 'الشركات' },
    real_estate: { en: 'Real Estate', ar: 'العقارات' },
    employment: { en: 'Employment', ar: 'العمل' },
    family: { en: 'Family', ar: 'الأسرة' },
    intellectual_property: { en: 'IP', ar: 'الملكية الفكرية' },
    contract: { en: 'Contract', ar: 'العقود' },
    immigration: { en: 'Immigration', ar: 'الهجرة' },
    other: { en: 'Other', ar: 'أخرى' },
  };

  const statusLabels: Record<string, Record<string, string>> = {
    open: { en: 'Open', ar: 'مفتوحة' },
    active: { en: 'Active', ar: 'نشطة' },
    pending: { en: 'Pending', ar: 'معلقة' },
    on_hold: { en: 'On Hold', ar: 'موقوفة' },
    closed: { en: 'Closed', ar: 'مغلقة' },
    won: { en: 'Won', ar: 'فائزة' },
    lost: { en: 'Lost', ar: 'خاسرة' },
    settled: { en: 'Settled', ar: 'تمت التسوية' },
  };

  const priorityLabels: Record<string, Record<string, string>> = {
    low: { en: 'Low', ar: 'منخفضة' },
    medium: { en: 'Medium', ar: 'متوسطة' },
    high: { en: 'High', ar: 'عالية' },
    urgent: { en: 'Urgent', ar: 'عاجلة' },
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'open':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'won':
        return 'default';
      case 'lost':
        return 'destructive';
      case 'closed':
      case 'settled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredCases = React.useMemo(() => {
    return mockCases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesType = typeFilter === 'all' || c.case_type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' && (c.status === 'active' || c.status === 'open')) ||
        (activeTab === 'pending' && c.status === 'pending') ||
        (activeTab === 'closed' && (c.status === 'closed' || c.status === 'won' || c.status === 'lost' || c.status === 'settled'));

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesTab;
    });
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, activeTab]);

  const columns = [
    {
      key: 'case',
      header: locale === 'ar' ? 'القضية' : 'Case',
      sortable: true,
      render: (c: Case) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            c.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
            c.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
            'bg-primary/10 text-primary'
          }`}>
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-medium truncate max-w-[300px] hover:text-primary block">
              {c.title}
            </Link>
            <p className="text-xs text-muted-foreground">{c.case_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      header: locale === 'ar' ? 'العميل' : 'Client',
      render: (c: Case) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{c.client_name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: locale === 'ar' ? 'النوع' : 'Type',
      sortable: true,
      render: (c: Case) => (
        <span className="text-sm">
          {caseTypeLabels[c.case_type]?.[locale] || c.case_type}
        </span>
      ),
    },
    {
      key: 'status',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      sortable: true,
      render: (c: Case) => (
        <div className="flex flex-col gap-1">
          <Badge variant={getStatusBadgeVariant(c.status)}>
            {statusLabels[c.status]?.[locale] || c.status}
          </Badge>
          <Badge variant={getPriorityBadgeVariant(c.priority)} className="text-xs">
            {priorityLabels[c.priority]?.[locale] || c.priority}
          </Badge>
        </div>
      ),
    },
    {
      key: 'progress',
      header: locale === 'ar' ? 'التقدم' : 'Progress',
      render: (c: Case) => {
        const progress = c.total_tasks > 0 ? (c.completed_tasks / c.total_tasks) * 100 : 0;
        return (
          <div className="space-y-1 min-w-[100px]">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{c.completed_tasks}/{c.total_tasks} {locale === 'ar' ? 'مهام' : 'tasks'}</span>
              {c.overdue_tasks > 0 && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {c.overdue_tasks}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'deadline',
      header: locale === 'ar' ? 'الموعد النهائي' : 'Deadline',
      sortable: true,
      render: (c: Case) => {
        if (!c.next_deadline) return <span className="text-muted-foreground">-</span>;
        const deadline = new Date(c.next_deadline);
        const isOverdue = deadline < new Date();
        const isUrgent = deadline < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return (
          <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-destructive' : isUrgent ? 'text-orange-500' : 'text-muted-foreground'}`}>
            <Calendar className="h-4 w-4" />
            {deadline.toLocaleDateString(locale)}
          </div>
        );
      },
    },
    {
      key: 'value',
      header: locale === 'ar' ? 'القيمة' : 'Value',
      sortable: true,
      render: (c: Case) => (
        <div className="text-sm">
          {c.case_value ? (
            <span className="font-medium">
              {c.currency} {c.case_value.toLocaleString()}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      render: (c: Case) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/cases/${c.id}`}>
                <Briefcase className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'عرض القضية' : 'View Case'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/cases/${c.id}/tasks`}>
                <CheckCircle2 className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'المهام' : 'Tasks'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/cases/${c.id}/time`}>
                <Clock className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'سجل الوقت' : 'Time Log'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/cases/${c.id}/edit`}>
                <FileText className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'تعديل' : 'Edit'}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const statusCounts = React.useMemo(() => {
    return {
      all: mockCases.length,
      active: mockCases.filter((c) => c.status === 'active' || c.status === 'open').length,
      pending: mockCases.filter((c) => c.status === 'pending').length,
      closed: mockCases.filter((c) => ['closed', 'won', 'lost', 'settled'].includes(c.status)).length,
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {locale === 'ar' ? 'إدارة القضايا' : 'Case Management'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'تتبع وإدارة جميع القضايا والملفات القانونية' : 'Track and manage all your legal cases and matters'}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/cases/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {locale === 'ar' ? 'قضية جديدة' : 'New Case'}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.total_cases}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'إجمالي القضايا' : 'Total Cases'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.active_cases}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'قضايا نشطة' : 'Active Cases'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.urgent_cases}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'عاجلة' : 'Urgent'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(mockStats.total_billed / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'إجمالي الفواتير' : 'Total Billed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">
              {locale === 'ar' ? 'الكل' : 'All'} ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              {locale === 'ar' ? 'نشطة' : 'Active'} ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="pending">
              {locale === 'ar' ? 'معلقة' : 'Pending'} ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="closed">
              {locale === 'ar' ? 'مغلقة' : 'Closed'} ({statusCounts.closed})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              placeholder={locale === 'ar' ? 'بحث في القضايا...' : 'Search cases...'}
              onSearch={setSearchQuery}
              className="w-full sm:w-[250px]"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={locale === 'ar' ? 'النوع' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                {Object.entries(caseTypeLabels).map(([key, labels]) => (
                  <SelectItem key={key} value={key}>
                    {labels[locale] || labels.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={locale === 'ar' ? 'الأولوية' : 'Priority'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'ar' ? 'جميع الأولويات' : 'All Priorities'}</SelectItem>
                {Object.entries(priorityLabels).map(([key, labels]) => (
                  <SelectItem key={key} value={key}>
                    {labels[locale] || labels.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {filteredCases.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={locale === 'ar' ? 'لا توجد قضايا' : 'No Cases Found'}
              description={
                searchQuery || typeFilter !== 'all' || priorityFilter !== 'all'
                  ? (locale === 'ar' ? 'جرب تغيير معايير البحث' : 'Try adjusting your search criteria')
                  : (locale === 'ar' ? 'ابدأ بإنشاء قضيتك الأولى' : 'Get started by creating your first case')
              }
              action={
                !searchQuery && typeFilter === 'all' && priorityFilter === 'all' ? (
                  <Link href={`/${locale}/dashboard/cases/new`}>
                    <Button>
                      <Plus className="h-4 w-4 me-2" />
                      {locale === 'ar' ? 'قضية جديدة' : 'New Case'}
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <DataTable
              data={filteredCases}
              columns={columns}
              pageSize={10}
              onRowClick={(c) => window.location.href = `/${locale}/dashboard/cases/${c.id}`}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

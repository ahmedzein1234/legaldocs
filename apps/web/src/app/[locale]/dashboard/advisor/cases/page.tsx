'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  FolderKanban,
  Calendar,
  DollarSign,
  Users,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
  ChevronDown,
  ArrowUpDown,
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  type Case,
  type CaseStatus,
  type CaseType,
  type CasePriority,
  getCaseStatusColor,
  getCasePriorityColor,
  formatCaseType,
  formatCaseStatus,
} from '@/lib/legal-advisor';

// Mock data
const mockCases: Partial<Case>[] = [
  {
    id: 'CASE-2025-ABC123',
    title: 'Rental Dispute - Marina Towers',
    caseType: 'real_estate_dispute',
    status: 'in_progress',
    priority: 'high',
    clientName: 'Ahmed Al Mansouri',
    opposingParty: 'Marina Properties LLC',
    country: 'ae',
    claimAmount: 150000,
    currency: 'AED',
    strengthScore: 72,
    createdAt: new Date('2025-01-15'),
    deadlines: [
      { id: '1', title: 'Response Filing', dueDate: '2025-02-15', type: 'filing', status: 'pending', reminderDays: [7, 3, 1] },
    ],
    documents: [{ id: '1', name: 'Rental Agreement.pdf', type: 'contract', uploadedAt: new Date(), tags: [] }],
    tasks: [
      { id: '1', title: 'Review evidence', status: 'completed', priority: 'high', createdAt: new Date() },
      { id: '2', title: 'Draft response', status: 'in_progress', priority: 'high', createdAt: new Date() },
    ],
  },
  {
    id: 'CASE-2025-DEF456',
    title: 'Employment Contract Review',
    caseType: 'contract_review',
    status: 'pending_action',
    priority: 'medium',
    clientName: 'Tech Solutions FZE',
    country: 'ae',
    strengthScore: 85,
    createdAt: new Date('2025-01-20'),
    documents: [],
    tasks: [],
    deadlines: [],
  },
  {
    id: 'CASE-2025-GHI789',
    title: 'Commercial Lease Negotiation',
    caseType: 'contract_negotiation',
    status: 'open',
    priority: 'low',
    clientName: 'Global Trading LLC',
    opposingParty: 'City Center Mall',
    country: 'ae',
    claimAmount: 500000,
    currency: 'AED',
    createdAt: new Date('2025-01-25'),
    documents: [],
    tasks: [],
    deadlines: [],
  },
  {
    id: 'CASE-2025-JKL012',
    title: 'Debt Collection - Supplier Payment',
    caseType: 'debt_collection',
    status: 'closed_won',
    priority: 'high',
    clientName: 'Manufacturing LLC',
    opposingParty: 'XYZ Supplies',
    country: 'ae',
    claimAmount: 75000,
    currency: 'AED',
    strengthScore: 92,
    createdAt: new Date('2024-12-01'),
    closedAt: new Date('2025-01-20'),
    documents: [],
    tasks: [],
    deadlines: [],
  },
  {
    id: 'CASE-2025-MNO345',
    title: 'IP Trademark Registration',
    caseType: 'intellectual_property',
    status: 'on_hold',
    priority: 'medium',
    clientName: 'Brand Co.',
    country: 'ae',
    createdAt: new Date('2025-01-10'),
    documents: [],
    tasks: [],
    deadlines: [],
  },
];

const statusIcons: Record<CaseStatus, React.ComponentType<{ className?: string }>> = {
  open: Briefcase,
  in_progress: Clock,
  pending_action: AlertTriangle,
  on_hold: Pause,
  closed_won: CheckCircle,
  closed_lost: XCircle,
  closed_settled: CheckCircle,
};

export default function CasesPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = React.useState<CaseType | 'all'>('all');
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'date' | 'priority' | 'amount'>('date');

  const statusRef = React.useRef<HTMLDivElement>(null);
  const typeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCases = React.useMemo(() => {
    let cases = [...mockCases];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cases = cases.filter(c =>
        c.title?.toLowerCase().includes(query) ||
        c.clientName?.toLowerCase().includes(query) ||
        c.opposingParty?.toLowerCase().includes(query) ||
        c.id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      cases = cases.filter(c => c.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      cases = cases.filter(c => c.caseType === typeFilter);
    }

    // Sort
    cases.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder: Record<CasePriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority!] || 3) - (priorityOrder[b.priority!] || 3);
        case 'amount':
          return (b.claimAmount || 0) - (a.claimAmount || 0);
        case 'date':
        default:
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      }
    });

    return cases;
  }, [searchQuery, statusFilter, typeFilter, sortBy]);

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: mockCases.length };
    mockCases.forEach(c => {
      counts[c.status!] = (counts[c.status!] || 0) + 1;
    });
    return counts;
  }, []);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/dashboard/advisor`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              {isRTL ? 'إدارة القضايا' : 'Case Management'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'تتبع وإدارة جميع قضاياك القانونية' : 'Track and manage all your legal cases'}
            </p>
          </div>
        </div>
        <Link href={`/${locale}/dashboard/advisor/cases/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {isRTL ? 'قضية جديدة' : 'New Case'}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'القضايا النشطة' : 'Active Cases'}
                </p>
                <p className="text-2xl font-bold">
                  {mockCases.filter(c => !c.status?.startsWith('closed')).length}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'تتطلب إجراء' : 'Need Action'}
                </p>
                <p className="text-2xl font-bold text-orange-500">
                  {statusCounts['pending_action'] || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'المبلغ الإجمالي' : 'Total Value'}
                </p>
                <p className="text-2xl font-bold">
                  {formatAmount(
                    mockCases.reduce((sum, c) => sum + (c.claimAmount || 0), 0),
                    'AED'
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'معدل النجاح' : 'Win Rate'}
                </p>
                <p className="text-2xl font-bold text-green-500">85%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={isRTL ? 'البحث في القضايا...' : 'Search cases...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Filter */}
        <div className="relative" ref={statusRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {statusFilter === 'all'
              ? (isRTL ? 'كل الحالات' : 'All Status')
              : formatCaseStatus(statusFilter, isRTL)}
            <ChevronDown className="h-4 w-4" />
          </Button>
          {showStatusDropdown && (
            <div className="absolute top-full mt-1 end-0 z-50 w-48 bg-popover border rounded-lg shadow-lg p-1">
              <button
                onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); }}
                className={cn(
                  "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                  statusFilter === 'all' && "bg-accent"
                )}
              >
                {isRTL ? 'كل الحالات' : 'All Status'} ({statusCounts.all})
              </button>
              {(['open', 'in_progress', 'pending_action', 'on_hold', 'closed_won', 'closed_lost', 'closed_settled'] as CaseStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                  className={cn(
                    "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent flex items-center justify-between",
                    statusFilter === status && "bg-accent"
                  )}
                >
                  <span>{formatCaseStatus(status, isRTL)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {statusCounts[status] || 0}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortBy(sortBy === 'date' ? 'priority' : sortBy === 'priority' ? 'amount' : 'date')}
          className="gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortBy === 'date' && (isRTL ? 'التاريخ' : 'Date')}
          {sortBy === 'priority' && (isRTL ? 'الأولوية' : 'Priority')}
          {sortBy === 'amount' && (isRTL ? 'المبلغ' : 'Amount')}
        </Button>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 font-medium">
                {isRTL ? 'لا توجد قضايا' : 'No cases found'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL
                  ? 'جرب تغيير معايير البحث أو أنشئ قضية جديدة'
                  : 'Try changing your search criteria or create a new case'}
              </p>
              <Link href={`/${locale}/dashboard/advisor/cases/new`}>
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  {isRTL ? 'قضية جديدة' : 'New Case'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((caseItem) => {
            const StatusIcon = statusIcons[caseItem.status!];
            return (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/${locale}/dashboard/advisor/cases/${caseItem.id}`}
                          className="font-medium hover:text-primary transition-colors truncate"
                        >
                          {caseItem.title}
                        </Link>
                        <Badge className={getCasePriorityColor(caseItem.priority!)}>
                          {caseItem.priority}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {caseItem.clientName}
                        </span>
                        {caseItem.opposingParty && (
                          <>
                            <span>vs</span>
                            <span>{caseItem.opposingParty}</span>
                          </>
                        )}
                        <span>#{caseItem.id}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getCaseStatusColor(caseItem.status!)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {formatCaseStatus(caseItem.status!, isRTL)}
                        </Badge>
                        <Badge variant="outline">
                          {formatCaseType(caseItem.caseType!, isRTL)}
                        </Badge>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6">
                      {caseItem.claimAmount && (
                        <div className="text-center">
                          <p className="text-lg font-semibold">
                            {formatAmount(caseItem.claimAmount, caseItem.currency || 'AED')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? 'قيمة المطالبة' : 'Claim Value'}
                          </p>
                        </div>
                      )}
                      {caseItem.strengthScore !== undefined && (
                        <div className="text-center">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-muted"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${(caseItem.strengthScore / 100) * 176} 176`}
                                className={cn(
                                  caseItem.strengthScore >= 70 && 'text-green-500',
                                  caseItem.strengthScore >= 40 && caseItem.strengthScore < 70 && 'text-yellow-500',
                                  caseItem.strengthScore < 40 && 'text-red-500'
                                )}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{caseItem.strengthScore}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isRTL ? 'القوة' : 'Strength'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/${locale}/dashboard/advisor/cases/${caseItem.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          {isRTL ? 'عرض' : 'View'}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Tasks and Deadlines Preview */}
                  {((caseItem.tasks && caseItem.tasks.length > 0) || (caseItem.deadlines && caseItem.deadlines.length > 0)) && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                      {caseItem.tasks && caseItem.tasks.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>
                            {caseItem.tasks.filter(t => t.status === 'completed').length}/{caseItem.tasks.length}
                            {' '}{isRTL ? 'مهام مكتملة' : 'tasks completed'}
                          </span>
                        </div>
                      )}
                      {caseItem.deadlines && caseItem.deadlines.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span>
                            {isRTL ? 'موعد قادم: ' : 'Next deadline: '}
                            {new Date(caseItem.deadlines[0].dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

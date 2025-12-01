'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  User,
  DollarSign,
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Scale,
  Phone,
  Mail,
  Timer,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Mock data
const mockCase = {
  id: '1',
  case_number: 'CASE-2025-ABC123',
  title: 'Al Maktoum Holdings vs. Emirates Trading Co.',
  description: 'Commercial dispute regarding breach of contract for supply of construction materials.',
  case_type: 'litigation',
  practice_area: 'commercial',
  jurisdiction: 'AE',
  court: 'Dubai Courts - Commercial Division',
  status: 'active',
  priority: 'high',
  client_name: 'Al Maktoum Holdings LLC',
  client_email: 'legal@almaktoum.ae',
  client_phone: '+971 4 123 4567',
  opposing_party: 'Emirates Trading Co.',
  opposing_counsel: 'Smith & Partners LLP',
  case_value: 5000000,
  currency: 'AED',
  billing_type: 'hourly',
  hourly_rate: 1500,
  total_billed: 45000,
  total_paid: 30000,
  court_case_number: 'DC-COM-2025-1234',
  date_opened: '2025-10-01',
  statute_of_limitations: '2028-10-01',
  next_deadline: '2025-12-15',
  next_hearing_date: '2025-12-20',
  tags: ['commercial', 'breach-of-contract'],
  created_at: '2025-10-01',
  updated_at: '2025-11-28',
};

const mockTasks = [
  { id: '1', title: 'File response to defendant motion', task_type: 'filing', priority: 'urgent', status: 'pending', due_date: '2025-12-05', is_court_deadline: true },
  { id: '2', title: 'Review discovery documents', task_type: 'review', priority: 'high', status: 'in_progress', due_date: '2025-12-10', is_court_deadline: false },
  { id: '3', title: 'Prepare witness statements', task_type: 'drafting', priority: 'medium', status: 'pending', due_date: '2025-12-15', is_court_deadline: false },
  { id: '4', title: 'Initial case assessment', task_type: 'review', priority: 'high', status: 'completed', due_date: '2025-10-15', is_court_deadline: false },
];

const mockNotes = [
  { id: '1', content: 'Client meeting held. Discussed settlement options.', note_type: 'communication', created_at: '2025-11-25', author_name: 'Ahmed Hassan', is_pinned: true },
  { id: '2', content: 'Received discovery documents from opposing counsel.', note_type: 'update', created_at: '2025-11-20', author_name: 'Ahmed Hassan', is_pinned: false },
];

const mockDocuments = [
  { id: '1', title: 'Statement of Claim', document_number: 'DR-2025-SOC001', document_type: 'pleading', status: 'signed', created_at: '2025-10-05' },
  { id: '2', title: 'Contract Agreement - Original', document_number: 'DR-2025-CON001', document_type: 'evidence', status: 'certified', created_at: '2025-10-03' },
];

const mockTimeEntries = [
  { id: '1', description: 'Draft statement of claim', activity_type: 'drafting', date: '2025-10-05', duration_minutes: 180, amount: 4500, is_billable: true },
  { id: '2', description: 'Client meeting - case strategy', activity_type: 'meeting', date: '2025-11-25', duration_minutes: 60, amount: 1500, is_billable: true },
];

export default function CaseDetailClient() {
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const params = useParams();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = React.useState(false);

  const caseData = mockCase;
  const tasks = mockTasks;
  const notes = mockNotes;
  const documents = mockDocuments;
  const timeEntries = mockTimeEntries;

  const statusLabels: Record<string, Record<string, string>> = {
    open: { en: 'Open', ar: 'مفتوحة' },
    active: { en: 'Active', ar: 'نشطة' },
    pending: { en: 'Pending', ar: 'معلقة' },
    closed: { en: 'Closed', ar: 'مغلقة' },
    won: { en: 'Won', ar: 'فائزة' },
    lost: { en: 'Lost', ar: 'خاسرة' },
  };

  const priorityLabels: Record<string, Record<string, string>> = {
    low: { en: 'Low', ar: 'منخفضة' },
    medium: { en: 'Medium', ar: 'متوسطة' },
    high: { en: 'High', ar: 'عالية' },
    urgent: { en: 'Urgent', ar: 'عاجلة' },
  };

  const taskTypeLabels: Record<string, Record<string, string>> = {
    task: { en: 'Task', ar: 'مهمة' },
    deadline: { en: 'Deadline', ar: 'موعد نهائي' },
    hearing: { en: 'Hearing', ar: 'جلسة' },
    filing: { en: 'Filing', ar: 'تقديم' },
    meeting: { en: 'Meeting', ar: 'اجتماع' },
    review: { en: 'Review', ar: 'مراجعة' },
    drafting: { en: 'Drafting', ar: 'صياغة' },
    other: { en: 'Other', ar: 'أخرى' },
  };

  const taskStats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'pending' && new Date(t.due_date) < new Date()).length;
    return { total, completed, overdue, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [tasks]);

  const timeStats = React.useMemo(() => {
    const totalMinutes = timeEntries.reduce((acc, e) => acc + e.duration_minutes, 0);
    const totalAmount = timeEntries.reduce((acc, e) => acc + (e.amount || 0), 0);
    return { totalMinutes, totalAmount, hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
  }, [timeEntries]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href={`/${locale}/dashboard/cases`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          {locale === 'ar' ? 'العودة للقضايا' : 'Back to Cases'}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${caseData.priority === 'urgent' ? 'bg-red-500/10' : caseData.priority === 'high' ? 'bg-orange-500/10' : 'bg-primary/10'}`}>
                <Briefcase className={`h-6 w-6 ${caseData.priority === 'urgent' ? 'text-red-500' : caseData.priority === 'high' ? 'text-orange-500' : 'text-primary'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{caseData.title}</h1>
                <p className="text-muted-foreground">{caseData.case_number}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={caseData.status === 'active' ? 'default' : 'secondary'}>
                {statusLabels[caseData.status]?.[locale] || caseData.status}
              </Badge>
              <Badge className={getPriorityColor(caseData.priority)}>
                {priorityLabels[caseData.priority]?.[locale] || caseData.priority}
              </Badge>
              {caseData.tags?.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 me-2" />
              {locale === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 me-2" />
                  {locale === 'ar' ? 'تصدير التقرير' : 'Export Report'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 me-2" />
                  {locale === 'ar' ? 'حذف القضية' : 'Delete Case'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'تقدم المهام' : 'Task Progress'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{taskStats.completed}/{taskStats.total}</p>
                  {taskStats.overdue > 0 && (
                    <span className="text-xs text-destructive">({taskStats.overdue} {locale === 'ar' ? 'متأخرة' : 'overdue'})</span>
                  )}
                </div>
                <Progress value={taskStats.progress} className="h-1.5 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الوقت المسجل' : 'Time Logged'}</p>
                <p className="text-xl font-bold">{timeStats.hours}h {timeStats.minutes}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'المبلغ المفوتر' : 'Amount Billed'}</p>
                <p className="text-xl font-bold">{caseData.currency} {caseData.total_billed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'الموعد التالي' : 'Next Deadline'}</p>
                <p className="text-xl font-bold">
                  {caseData.next_deadline ? new Date(caseData.next_deadline).toLocaleDateString(locale) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{locale === 'ar' ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="tasks">{locale === 'ar' ? 'المهام' : 'Tasks'} ({tasks.length})</TabsTrigger>
          <TabsTrigger value="documents">{locale === 'ar' ? 'المستندات' : 'Documents'} ({documents.length})</TabsTrigger>
          <TabsTrigger value="time">{locale === 'ar' ? 'الوقت' : 'Time'} ({timeEntries.length})</TabsTrigger>
          <TabsTrigger value="notes">{locale === 'ar' ? 'الملاحظات' : 'Notes'} ({notes.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'تفاصيل القضية' : 'Case Details'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{locale === 'ar' ? 'الوصف' : 'Description'}</p>
                    <p className="text-sm">{caseData.description}</p>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'المحكمة' : 'Court'}</p>
                    <p className="font-medium">{caseData.court || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'رقم القضية' : 'Court Case #'}</p>
                    <p className="font-medium">{caseData.court_case_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'تاريخ الافتتاح' : 'Date Opened'}</p>
                    <p className="font-medium">{new Date(caseData.date_opened).toLocaleDateString(locale)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'الجلسة القادمة' : 'Next Hearing'}</p>
                    <p className="font-medium">{caseData.next_hearing_date ? new Date(caseData.next_hearing_date).toLocaleDateString(locale) : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'الأطراف' : 'Parties'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">{locale === 'ar' ? 'العميل' : 'Client'}</p>
                  <p className="font-medium">{caseData.client_name}</p>
                  {caseData.client_email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      {caseData.client_email}
                    </div>
                  )}
                  {caseData.client_phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {caseData.client_phone}
                    </div>
                  )}
                </div>

                {caseData.opposing_party && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">{locale === 'ar' ? 'الطرف المقابل' : 'Opposing Party'}</p>
                    <p className="font-medium">{caseData.opposing_party}</p>
                    {caseData.opposing_counsel && (
                      <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'المحامي:' : 'Counsel:'} {caseData.opposing_counsel}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'الفوترة' : 'Billing'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'نوع الفوترة' : 'Billing Type'}</p>
                    <p className="font-medium capitalize">{caseData.billing_type}</p>
                  </div>
                  {caseData.hourly_rate && (
                    <div>
                      <p className="text-muted-foreground">{locale === 'ar' ? 'السعر بالساعة' : 'Hourly Rate'}</p>
                      <p className="font-medium">{caseData.currency} {caseData.hourly_rate}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'إجمالي الفواتير' : 'Total Billed'}</p>
                    <p className="font-medium text-lg">{caseData.currency} {caseData.total_billed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'المدفوع' : 'Paid'}</p>
                    <p className="font-medium text-lg text-green-600">{caseData.currency} {caseData.total_paid.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'المتبقي' : 'Outstanding'}</span>
                    <span className="font-medium text-orange-500">{caseData.currency} {(caseData.total_billed - caseData.total_paid).toLocaleString()}</span>
                  </div>
                  <Progress value={(caseData.total_paid / caseData.total_billed) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {caseData.case_value && (
              <Card>
                <CardHeader>
                  <CardTitle>{locale === 'ar' ? 'قيمة القضية' : 'Case Value'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{caseData.currency} {caseData.case_value.toLocaleString()}</p>
                  {caseData.statute_of_limitations && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {locale === 'ar' ? 'تقادم الدعوى:' : 'Statute of Limitations:'} {new Date(caseData.statute_of_limitations).toLocaleDateString(locale)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{locale === 'ar' ? 'المهام والمواعيد' : 'Tasks & Deadlines'}</h3>
            <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {locale === 'ar' ? 'إضافة مهمة' : 'Add Task'}
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className={task.status === 'completed' ? 'opacity-60' : ''}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={task.status === 'completed'} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                        {task.is_court_deadline && (
                          <Badge variant="destructive" className="text-xs">{locale === 'ar' ? 'موعد قضائي' : 'Court Deadline'}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{taskTypeLabels[task.task_type]?.[locale] || task.task_type}</span>
                        <span>•</span>
                        <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-destructive' : ''}`}>
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString(locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>{priorityLabels[task.priority]?.[locale] || task.priority}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{locale === 'ar' ? 'المستندات المرتبطة' : 'Linked Documents'}</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 me-2" />
              {locale === 'ar' ? 'ربط مستند' : 'Link Document'}
            </Button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.document_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.document_type}</Badge>
                    <Badge variant={doc.status === 'signed' ? 'default' : 'secondary'}>{doc.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{locale === 'ar' ? 'سجل الوقت' : 'Time Entries'}</h3>
            <Button size="sm" onClick={() => setIsLogTimeOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {locale === 'ar' ? 'تسجيل وقت' : 'Log Time'}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-sm text-muted-foreground">
                    <th className="text-start p-4">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="text-start p-4">{locale === 'ar' ? 'الوصف' : 'Description'}</th>
                    <th className="text-start p-4">{locale === 'ar' ? 'النشاط' : 'Activity'}</th>
                    <th className="text-end p-4">{locale === 'ar' ? 'المدة' : 'Duration'}</th>
                    <th className="text-end p-4">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="p-4 text-sm">{new Date(entry.date).toLocaleDateString(locale)}</td>
                      <td className="p-4 text-sm">{entry.description}</td>
                      <td className="p-4"><Badge variant="outline" className="capitalize">{entry.activity_type}</Badge></td>
                      <td className="p-4 text-sm text-end">{Math.floor(entry.duration_minutes / 60)}h {entry.duration_minutes % 60}m</td>
                      <td className="p-4 text-sm text-end font-medium">{caseData.currency} {entry.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr>
                    <td colSpan={3} className="p-4 font-medium">{locale === 'ar' ? 'الإجمالي' : 'Total'}</td>
                    <td className="p-4 text-end font-medium">{timeStats.hours}h {timeStats.minutes}m</td>
                    <td className="p-4 text-end font-bold">{caseData.currency} {timeStats.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{locale === 'ar' ? 'الملاحظات' : 'Notes'}</h3>
            <Button size="sm" onClick={() => setIsAddNoteOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {locale === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
            </Button>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className={note.is_pinned ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{note.note_type}</Badge>
                      {note.is_pinned && <Badge variant="secondary">{locale === 'ar' ? 'مثبتة' : 'Pinned'}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString(locale)}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">— {note.author_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'إضافة مهمة جديدة' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{locale === 'ar' ? 'العنوان' : 'Title'}</Label>
              <Input placeholder={locale === 'ar' ? 'عنوان المهمة' : 'Task title'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'النوع' : 'Type'}</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder={locale === 'ar' ? 'اختر النوع' : 'Select type'} /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskTypeLabels).map(([key, labels]) => (
                      <SelectItem key={key} value={key}>{labels[locale] || labels.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{locale === 'ar' ? 'الأولوية' : 'Priority'}</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder={locale === 'ar' ? 'اختر الأولوية' : 'Select priority'} /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([key, labels]) => (
                      <SelectItem key={key} value={key}>{labels[locale] || labels.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
              <Input type="date" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="court-deadline" />
              <Label htmlFor="court-deadline" className="text-sm">{locale === 'ar' ? 'موعد قضائي' : 'Court Deadline'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={() => setIsAddTaskOpen(false)}>{locale === 'ar' ? 'إضافة' : 'Add Task'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{locale === 'ar' ? 'النوع' : 'Type'}</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder={locale === 'ar' ? 'اختر النوع' : 'Select type'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">{locale === 'ar' ? 'ملاحظة' : 'Note'}</SelectItem>
                  <SelectItem value="update">{locale === 'ar' ? 'تحديث' : 'Update'}</SelectItem>
                  <SelectItem value="communication">{locale === 'ar' ? 'تواصل' : 'Communication'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'المحتوى' : 'Content'}</Label>
              <Textarea rows={4} placeholder={locale === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="pin-note" />
              <Label htmlFor="pin-note" className="text-sm">{locale === 'ar' ? 'تثبيت الملاحظة' : 'Pin this note'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={() => setIsAddNoteOpen(false)}>{locale === 'ar' ? 'حفظ' : 'Save Note'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Time Dialog */}
      <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تسجيل الوقت' : 'Log Time'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{locale === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Input placeholder={locale === 'ar' ? 'ماذا عملت؟' : 'What did you work on?'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'التاريخ' : 'Date'}</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <Label>{locale === 'ar' ? 'المدة (دقائق)' : 'Duration (minutes)'}</Label>
                <Input type="number" min="1" placeholder="60" />
              </div>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'نوع النشاط' : 'Activity Type'}</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder={locale === 'ar' ? 'اختر النوع' : 'Select type'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="research">{locale === 'ar' ? 'بحث' : 'Research'}</SelectItem>
                  <SelectItem value="drafting">{locale === 'ar' ? 'صياغة' : 'Drafting'}</SelectItem>
                  <SelectItem value="meeting">{locale === 'ar' ? 'اجتماع' : 'Meeting'}</SelectItem>
                  <SelectItem value="court">{locale === 'ar' ? 'محكمة' : 'Court'}</SelectItem>
                  <SelectItem value="communication">{locale === 'ar' ? 'تواصل' : 'Communication'}</SelectItem>
                  <SelectItem value="review">{locale === 'ar' ? 'مراجعة' : 'Review'}</SelectItem>
                  <SelectItem value="other">{locale === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="billable" defaultChecked />
              <Label htmlFor="billable" className="text-sm">{locale === 'ar' ? 'قابل للفوترة' : 'Billable'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogTimeOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={() => setIsLogTimeOpen(false)}>{locale === 'ar' ? 'حفظ' : 'Log Time'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

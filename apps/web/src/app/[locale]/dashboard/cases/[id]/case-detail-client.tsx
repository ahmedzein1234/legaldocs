'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Loader2,
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
import { useCaseDetail, CaseNote, CaseDocument, TimeEntry } from '@/hooks/useCases';
import { CaseTask } from '@/lib/api';
import { captureError } from '@/lib/error-tracking';

export default function CaseDetailClient() {
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const {
    caseData,
    isLoading,
    error,
    refetch,
    deleteCase,
    createTask,
    updateTask,
    addNote,
    logTime,
  } = useCaseDetail(caseId);

  const [activeTab, setActiveTab] = React.useState('overview');
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Form states for dialogs
  const [newTask, setNewTask] = React.useState({ title: '', taskType: 'task', priority: 'medium', dueDate: '', isCourtDeadline: false });
  const [newNote, setNewNote] = React.useState({ content: '', noteType: 'note', isPinned: false });
  const [newTime, setNewTime] = React.useState({ description: '', date: new Date().toISOString().split('T')[0], durationMinutes: 60, activityType: 'other', isBillable: true });

  // Reset form states when dialogs close
  const resetTaskForm = () => setNewTask({ title: '', taskType: 'task', priority: 'medium', dueDate: '', isCourtDeadline: false });
  const resetNoteForm = () => setNewNote({ content: '', noteType: 'note', isPinned: false });
  const resetTimeForm = () => setNewTime({ description: '', date: new Date().toISOString().split('T')[0], durationMinutes: 60, activityType: 'other', isBillable: true });

  // Extract related data from case
  const tasks = caseData?.tasks || [];
  const notes = (caseData?.notes || []) as CaseNote[];
  const documents = (caseData?.documents || []) as CaseDocument[];
  const timeEntries = (caseData?.timeEntries || []) as TimeEntry[];

  // Handle task creation
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.dueDate) return;
    try {
      await createTask.mutateAsync({
        title: newTask.title,
        taskType: newTask.taskType,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
      });
      setIsAddTaskOpen(false);
      resetTaskForm();
    } catch (err) {
      captureError(err, { component: 'CaseDetailClient', action: 'createTask' });
    }
  };

  // Handle task status toggle
  const handleTaskToggle = async (task: CaseTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: { status: newStatus },
      });
    } catch (err) {
      captureError(err, { component: 'CaseDetailClient', action: 'updateTask' });
    }
  };

  // Handle note creation
  const handleAddNote = async () => {
    if (!newNote.content) return;
    try {
      await addNote.mutateAsync({
        content: newNote.content,
        noteType: newNote.noteType,
        isPrivate: false,
      });
      setIsAddNoteOpen(false);
      resetNoteForm();
    } catch (err) {
      captureError(err, { component: 'CaseDetailClient', action: 'addNote' });
    }
  };

  // Handle time logging
  const handleLogTime = async () => {
    if (!newTime.description || !newTime.durationMinutes) return;
    try {
      await logTime.mutateAsync({
        description: newTime.description,
        date: newTime.date,
        durationMinutes: newTime.durationMinutes,
        activityType: newTime.activityType,
        isBillable: newTime.isBillable,
      });
      setIsLogTimeOpen(false);
      resetTimeForm();
    } catch (err) {
      captureError(err, { component: 'CaseDetailClient', action: 'logTime' });
    }
  };

  // Handle case deletion
  const handleDeleteCase = async () => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه القضية؟' : 'Are you sure you want to delete this case?')) return;
    setIsDeleting(true);
    try {
      await deleteCase.mutateAsync(caseId);
      router.push(`/${locale}/dashboard/cases`);
    } catch (err) {
      captureError(err, { component: 'CaseDetailClient', action: 'deleteCase' });
      setIsDeleting(false);
    }
  };

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
    const overdue = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date()).length;
    return { total, completed, overdue, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [tasks]);

  const timeStats = React.useMemo(() => {
    const totalMinutes = timeEntries.reduce((acc, e) => acc + e.durationMinutes, 0);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/dashboard/cases`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          {locale === 'ar' ? 'العودة للقضايا' : 'Back to Cases'}
        </Link>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ms-2 text-muted-foreground">{locale === 'ar' ? 'جاري التحميل...' : 'Loading case details...'}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/dashboard/cases`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="h-4 w-4" />
          {locale === 'ar' ? 'العودة للقضايا' : 'Back to Cases'}
        </Link>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">{locale === 'ar' ? 'خطأ في تحميل القضية' : 'Error Loading Case'}</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || (locale === 'ar' ? 'القضية غير موجودة' : 'Case not found')}
            </p>
            <Button onClick={() => refetch()}>
              {locale === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <p className="text-muted-foreground">{caseData.caseNumber}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={caseData.status === 'active' ? 'default' : 'secondary'}>
                {statusLabels[caseData.status]?.[locale] || caseData.status}
              </Badge>
              <Badge className={getPriorityColor(caseData.priority)}>
                {priorityLabels[caseData.priority]?.[locale] || caseData.priority}
              </Badge>
              {caseData.tags?.map((tag: string) => (
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
                <Button variant="outline" size="sm" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 me-2" />
                  {locale === 'ar' ? 'تصدير التقرير' : 'Export Report'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDeleteCase}>
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
                <p className="text-xl font-bold">{caseData.currency} {(caseData.totalBilled || 0).toLocaleString()}</p>
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
                  {caseData.nextDeadline ? new Date(caseData.nextDeadline).toLocaleDateString(locale) : '-'}
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
                    <p className="font-medium">{caseData.courtCaseNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'تاريخ الافتتاح' : 'Date Opened'}</p>
                    <p className="font-medium">{caseData.dateOpened ? new Date(caseData.dateOpened).toLocaleDateString(locale) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'الجلسة القادمة' : 'Next Hearing'}</p>
                    <p className="font-medium">{caseData.nextHearingDate ? new Date(caseData.nextHearingDate).toLocaleDateString(locale) : '-'}</p>
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
                  <p className="font-medium">{caseData.clientName}</p>
                  {caseData.clientEmail && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      {caseData.clientEmail}
                    </div>
                  )}
                  {caseData.clientPhone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {caseData.clientPhone}
                    </div>
                  )}
                </div>

                {caseData.opposingParty && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">{locale === 'ar' ? 'الطرف المقابل' : 'Opposing Party'}</p>
                    <p className="font-medium">{caseData.opposingParty}</p>
                    {caseData.opposingCounsel && (
                      <p className="text-sm text-muted-foreground">{locale === 'ar' ? 'المحامي:' : 'Counsel:'} {caseData.opposingCounsel}</p>
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
                    <p className="font-medium capitalize">{caseData.billingType || 'hourly'}</p>
                  </div>
                  {caseData.hourlyRate && (
                    <div>
                      <p className="text-muted-foreground">{locale === 'ar' ? 'السعر بالساعة' : 'Hourly Rate'}</p>
                      <p className="font-medium">{caseData.currency} {caseData.hourlyRate}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'إجمالي الفواتير' : 'Total Billed'}</p>
                    <p className="font-medium text-lg">{caseData.currency} {(caseData.totalBilled || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'المدفوع' : 'Paid'}</p>
                    <p className="font-medium text-lg text-green-600">{caseData.currency} {(caseData.totalPaid || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'المتبقي' : 'Outstanding'}</span>
                    <span className="font-medium text-orange-500">{caseData.currency} {((caseData.totalBilled || 0) - (caseData.totalPaid || 0)).toLocaleString()}</span>
                  </div>
                  <Progress value={caseData.totalBilled ? ((caseData.totalPaid || 0) / caseData.totalBilled) * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {caseData.caseValue && (
              <Card>
                <CardHeader>
                  <CardTitle>{locale === 'ar' ? 'قيمة القضية' : 'Case Value'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{caseData.currency} {caseData.caseValue.toLocaleString()}</p>
                  {caseData.statuteOfLimitations && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {locale === 'ar' ? 'تقادم الدعوى:' : 'Statute of Limitations:'} {new Date(caseData.statuteOfLimitations).toLocaleDateString(locale)}
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
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{locale === 'ar' ? 'لا توجد مهام بعد' : 'No tasks yet'}</p>
                  <Button variant="link" size="sm" onClick={() => setIsAddTaskOpen(true)}>
                    {locale === 'ar' ? 'إضافة أول مهمة' : 'Add your first task'}
                  </Button>
                </CardContent>
              </Card>
            ) : tasks.map((task) => (
              <Card key={task.id} className={task.status === 'completed' ? 'opacity-60' : ''}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleTaskToggle(task)}
                      disabled={updateTask.isPending}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                        {task.isCourtDeadline && (
                          <Badge variant="destructive" className="text-xs">{locale === 'ar' ? 'موعد قضائي' : 'Court Deadline'}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{taskTypeLabels[task.taskType]?.[locale] || task.taskType}</span>
                        <span>•</span>
                        <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-destructive' : ''}`}>
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString(locale)}
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
            {documents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{locale === 'ar' ? 'لا توجد مستندات مرتبطة' : 'No linked documents'}</p>
                </CardContent>
              </Card>
            ) : documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.documentNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.documentType}</Badge>
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
                  {timeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        {locale === 'ar' ? 'لا يوجد وقت مسجل' : 'No time entries yet'}
                      </td>
                    </tr>
                  ) : timeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="p-4 text-sm">{new Date(entry.date).toLocaleDateString(locale)}</td>
                      <td className="p-4 text-sm">{entry.description}</td>
                      <td className="p-4"><Badge variant="outline" className="capitalize">{entry.activityType}</Badge></td>
                      <td className="p-4 text-sm text-end">{Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m</td>
                      <td className="p-4 text-sm text-end font-medium">{caseData.currency} {(entry.amount || 0).toLocaleString()}</td>
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
            {notes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{locale === 'ar' ? 'لا توجد ملاحظات بعد' : 'No notes yet'}</p>
                  <Button variant="link" size="sm" onClick={() => setIsAddNoteOpen(true)}>
                    {locale === 'ar' ? 'إضافة أول ملاحظة' : 'Add your first note'}
                  </Button>
                </CardContent>
              </Card>
            ) : notes.map((note) => (
              <Card key={note.id} className={note.isPinned ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{note.noteType}</Badge>
                      {note.isPinned && <Badge variant="secondary">{locale === 'ar' ? 'مثبتة' : 'Pinned'}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString(locale)}</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">— {note.authorName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={(open) => { setIsAddTaskOpen(open); if (!open) resetTaskForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'إضافة مهمة جديدة' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{locale === 'ar' ? 'العنوان' : 'Title'}</Label>
              <Input
                placeholder={locale === 'ar' ? 'عنوان المهمة' : 'Task title'}
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'النوع' : 'Type'}</Label>
                <Select value={newTask.taskType} onValueChange={(v) => setNewTask({ ...newTask, taskType: v })}>
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
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
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
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="court-deadline"
                checked={newTask.isCourtDeadline}
                onCheckedChange={(checked) => setNewTask({ ...newTask, isCourtDeadline: !!checked })}
              />
              <Label htmlFor="court-deadline" className="text-sm">{locale === 'ar' ? 'موعد قضائي' : 'Court Deadline'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleCreateTask} disabled={createTask.isPending || !newTask.title || !newTask.dueDate}>
              {createTask.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {locale === 'ar' ? 'إضافة' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteOpen} onOpenChange={(open) => { setIsAddNoteOpen(open); if (!open) resetNoteForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{locale === 'ar' ? 'النوع' : 'Type'}</Label>
              <Select value={newNote.noteType} onValueChange={(v) => setNewNote({ ...newNote, noteType: v })}>
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
              <Textarea
                rows={4}
                placeholder={locale === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pin-note"
                checked={newNote.isPinned}
                onCheckedChange={(checked) => setNewNote({ ...newNote, isPinned: !!checked })}
              />
              <Label htmlFor="pin-note" className="text-sm">{locale === 'ar' ? 'تثبيت الملاحظة' : 'Pin this note'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleAddNote} disabled={addNote.isPending || !newNote.content}>
              {addNote.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {locale === 'ar' ? 'حفظ' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Time Dialog */}
      <Dialog open={isLogTimeOpen} onOpenChange={(open) => { setIsLogTimeOpen(open); if (!open) resetTimeForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تسجيل الوقت' : 'Log Time'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{locale === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Input
                placeholder={locale === 'ar' ? 'ماذا عملت؟' : 'What did you work on?'}
                value={newTime.description}
                onChange={(e) => setNewTime({ ...newTime, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ar' ? 'التاريخ' : 'Date'}</Label>
                <Input
                  type="date"
                  value={newTime.date}
                  onChange={(e) => setNewTime({ ...newTime, date: e.target.value })}
                />
              </div>
              <div>
                <Label>{locale === 'ar' ? 'المدة (دقائق)' : 'Duration (minutes)'}</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="60"
                  value={newTime.durationMinutes}
                  onChange={(e) => setNewTime({ ...newTime, durationMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>{locale === 'ar' ? 'نوع النشاط' : 'Activity Type'}</Label>
              <Select value={newTime.activityType} onValueChange={(v) => setNewTime({ ...newTime, activityType: v })}>
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
              <Checkbox
                id="billable"
                checked={newTime.isBillable}
                onCheckedChange={(checked) => setNewTime({ ...newTime, isBillable: !!checked })}
              />
              <Label htmlFor="billable" className="text-sm">{locale === 'ar' ? 'قابل للفوترة' : 'Billable'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogTimeOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleLogTime} disabled={logTime.isPending || !newTime.description || !newTime.durationMinutes}>
              {logTime.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {locale === 'ar' ? 'حفظ' : 'Log Time'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

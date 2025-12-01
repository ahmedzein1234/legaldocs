'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  FolderKanban,
  FileText,
  Upload,
  Plus,
  Trash2,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  CheckSquare,
  Clock,
  Users,
  DollarSign,
  Scale,
  AlertTriangle,
  ChevronDown,
  Edit,
  MoreVertical,
  Sparkles,
  FileSearch,
  X,
  Loader2,
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
  type Case,
  type CaseDocument,
  type CaseTask,
  type CaseNote,
  getCaseStatusColor,
  getCasePriorityColor,
  formatCaseType,
  formatCaseStatus,
} from '@/lib/legal-advisor';

// Mock case data
const mockCase: Case = {
  id: 'CASE-2025-ABC123',
  userId: 'user_1',
  title: 'Rental Dispute - Marina Towers',
  description: 'Dispute regarding early termination of rental contract and security deposit return. Landlord is refusing to return the deposit claiming property damage.',
  caseType: 'real_estate_dispute',
  status: 'in_progress',
  priority: 'high',
  clientName: 'Ahmed Al Mansouri',
  opposingParty: 'Marina Properties LLC',
  country: 'ae',
  jurisdiction: 'Dubai Rental Dispute Center',
  claimAmount: 150000,
  currency: 'AED',
  strengthScore: 72,
  tags: ['rental', 'deposit', 'dubai'],
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-28'),
  deadlines: [
    { id: '1', title: 'Response Filing Deadline', dueDate: '2025-02-15', type: 'filing', status: 'pending', reminderDays: [7, 3, 1] },
    { id: '2', title: 'Hearing Date', dueDate: '2025-03-01', type: 'court', status: 'pending', reminderDays: [14, 7, 3, 1] },
  ],
  documents: [
    { id: 'doc_1', name: 'Rental Agreement 2024.pdf', type: 'contract', uploadedAt: new Date('2025-01-15'), tags: ['original'] },
    { id: 'doc_2', name: 'Security Deposit Receipt.pdf', type: 'evidence', uploadedAt: new Date('2025-01-15'), tags: ['payment'] },
    { id: 'doc_3', name: 'Property Photos.zip', type: 'evidence', uploadedAt: new Date('2025-01-16'), tags: ['photos'] },
    { id: 'doc_4', name: 'Termination Notice.pdf', type: 'correspondence', uploadedAt: new Date('2025-01-18'), tags: ['notice'] },
  ],
  notes: [
    { id: 'note_1', content: 'Initial consultation completed. Client has strong case based on contract terms.', type: 'general', isPrivate: false, createdAt: new Date('2025-01-15'), updatedAt: new Date('2025-01-15') },
    { id: 'note_2', content: 'Reviewed evidence photos - no significant damage visible. Landlord claims exaggerated.', type: 'research', isPrivate: false, createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-01-20') },
  ],
  tasks: [
    { id: 'task_1', title: 'Review rental agreement', status: 'completed', priority: 'high', createdAt: new Date('2025-01-15'), completedAt: new Date('2025-01-16') },
    { id: 'task_2', title: 'Gather evidence photos', status: 'completed', priority: 'high', createdAt: new Date('2025-01-15'), completedAt: new Date('2025-01-17') },
    { id: 'task_3', title: 'Draft response letter', status: 'in_progress', priority: 'high', createdAt: new Date('2025-01-18') },
    { id: 'task_4', title: 'File complaint with RDC', status: 'todo', priority: 'medium', dueDate: '2025-02-10', createdAt: new Date('2025-01-20') },
    { id: 'task_5', title: 'Prepare for hearing', status: 'todo', priority: 'medium', dueDate: '2025-02-25', createdAt: new Date('2025-01-20') },
  ],
  consultations: [],
};

const documentTypes = [
  { value: 'contract', label: 'Contract', labelAr: 'عقد' },
  { value: 'evidence', label: 'Evidence', labelAr: 'دليل' },
  { value: 'correspondence', label: 'Correspondence', labelAr: 'مراسلات' },
  { value: 'court_filing', label: 'Court Filing', labelAr: 'ملف محكمة' },
  { value: 'legal_brief', label: 'Legal Brief', labelAr: 'مذكرة قانونية' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
];

export default function CaseDetailClient() {
  const locale = useLocale();
  const params = useParams();
  const isRTL = locale === 'ar';
  const caseId = params.id as string;

  const [caseData, setCaseData] = React.useState<Case>(mockCase);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'documents' | 'tasks' | 'notes' | 'timeline'>('overview');
  const [showUploader, setShowUploader] = React.useState(false);
  const [currentDocType, setCurrentDocType] = React.useState<CaseDocument['type']>('evidence');
  const [showDocTypeDropdown, setShowDocTypeDropdown] = React.useState(false);
  const [newNote, setNewNote] = React.useState('');
  const [newTask, setNewTask] = React.useState('');

  const docTypeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (docTypeRef.current && !docTypeRef.current.contains(event.target as Node)) {
        setShowDocTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDocumentExtracted = (extraction: DocumentExtraction) => {
    const newDoc: CaseDocument = {
      id: extraction.id,
      name: extraction.fileName,
      type: currentDocType,
      extractionId: extraction.id,
      uploadedAt: new Date(),
      tags: [],
    };
    setCaseData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc],
    }));
    setShowUploader(false);
  };

  const removeDocument = (docId: string) => {
    setCaseData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId),
    }));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: CaseNote = {
      id: `note_${Date.now()}`,
      content: newNote,
      type: 'general',
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCaseData(prev => ({
      ...prev,
      notes: [note, ...prev.notes],
    }));
    setNewNote('');
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: CaseTask = {
      id: `task_${Date.now()}`,
      title: newTask,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date(),
    };
    setCaseData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
    setNewTask('');
  };

  const toggleTaskStatus = (taskId: string) => {
    setCaseData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed', completedAt: t.status === 'completed' ? undefined : new Date() }
          : t
      ),
    }));
  };

  const completedTasks = caseData.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = caseData.tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedDocTypeInfo = documentTypes.find(d => d.value === currentDocType);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={`/${locale}/dashboard/advisor/cases`}>
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">{caseData.title}</h1>
              <Badge className={getCasePriorityColor(caseData.priority)}>
                {caseData.priority}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>#{caseData.id}</span>
              <span>•</span>
              <Badge variant="outline" className={getCaseStatusColor(caseData.status)}>
                {formatCaseStatus(caseData.status, isRTL)}
              </Badge>
              <span>•</span>
              <span>{formatCaseType(caseData.caseType, isRTL)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/dashboard/advisor/consult?caseId=${caseId}`}>
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {isRTL ? 'استشارة' : 'Consult'}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/advisor/review?caseId=${caseId}`}>
            <Button variant="outline" className="gap-2">
              <FileSearch className="h-4 w-4" />
              {isRTL ? 'مراجعة' : 'Review'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'قوة القضية' : 'Case Strength'}</p>
                <p className={cn(
                  "text-2xl font-bold",
                  caseData.strengthScore && caseData.strengthScore >= 70 ? 'text-green-500' :
                  caseData.strengthScore && caseData.strengthScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                )}>
                  {caseData.strengthScore || 0}%
                </p>
              </div>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                  <circle
                    cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none"
                    strokeDasharray={`${((caseData.strengthScore || 0) / 100) * 126} 126`}
                    className={cn(
                      caseData.strengthScore && caseData.strengthScore >= 70 ? 'text-green-500' :
                      caseData.strengthScore && caseData.strengthScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                    )}
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'قيمة المطالبة' : 'Claim Value'}</p>
                <p className="text-2xl font-bold">
                  {caseData.claimAmount ? formatAmount(caseData.claimAmount, caseData.currency || 'AED') : '-'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? 'المستندات' : 'Documents'}</p>
                <p className="text-2xl font-bold">{caseData.documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{isRTL ? 'المهام' : 'Tasks'}</p>
                <span className="text-sm font-medium">{completedTasks}/{totalTasks}</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: FolderKanban },
          { id: 'documents', label: isRTL ? 'المستندات' : 'Documents', icon: FileText, count: caseData.documents.length },
          { id: 'tasks', label: isRTL ? 'المهام' : 'Tasks', icon: CheckSquare, count: caseData.tasks.length },
          { id: 'notes', label: isRTL ? 'الملاحظات' : 'Notes', icon: Edit, count: caseData.notes.length },
          { id: 'timeline', label: isRTL ? 'الجدول الزمني' : 'Timeline', icon: Calendar },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && (
              <Badge variant="secondary" className="h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{isRTL ? 'تفاصيل القضية' : 'Case Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {isRTL ? 'الوصف' : 'Description'}
                </h4>
                <p className="text-sm">{caseData.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    {isRTL ? 'العميل' : 'Client'}
                  </h4>
                  <p className="text-sm font-medium">{caseData.clientName}</p>
                </div>
                {caseData.opposingParty && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {isRTL ? 'الطرف المقابل' : 'Opposing Party'}
                    </h4>
                    <p className="text-sm font-medium">{caseData.opposingParty}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    {isRTL ? 'الاختصاص' : 'Jurisdiction'}
                  </h4>
                  <p className="text-sm">{caseData.jurisdiction || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                  </h4>
                  <p className="text-sm">{caseData.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {isRTL ? 'المواعيد القادمة' : 'Upcoming Deadlines'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.deadlines.length > 0 ? (
                caseData.deadlines.map(deadline => (
                  <div key={deadline.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <AlertTriangle className={cn(
                      "h-5 w-5 mt-0.5",
                      new Date(deadline.dueDate) < new Date() ? 'text-red-500' : 'text-orange-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isRTL ? 'لا توجد مواعيد' : 'No deadlines'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{isRTL ? 'المستندات' : 'Documents'}</CardTitle>
              <CardDescription>
                {isRTL ? 'جميع المستندات المتعلقة بالقضية' : 'All documents related to this case'}
              </CardDescription>
            </div>
            {!showUploader && (
              <Button onClick={() => setShowUploader(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة مستند' : 'Add Document'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {showUploader && (
              <div className="mb-6 p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{isRTL ? 'رفع مستند جديد' : 'Upload New Document'}</h4>
                  <Button variant="ghost" size="icon" onClick={() => setShowUploader(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mb-4 relative" ref={docTypeRef}>
                  <label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'نوع المستند' : 'Document Type'}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
                    className="w-full sm:w-auto justify-between min-w-[200px]"
                  >
                    {isRTL ? selectedDocTypeInfo?.labelAr : selectedDocTypeInfo?.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showDocTypeDropdown && (
                    <div className="absolute top-full mt-1 z-50 w-full sm:w-auto min-w-[200px] bg-popover border rounded-lg shadow-lg p-1">
                      {documentTypes.map(dt => (
                        <button
                          key={dt.value}
                          type="button"
                          onClick={() => {
                            setCurrentDocType(dt.value as CaseDocument['type']);
                            setShowDocTypeDropdown(false);
                          }}
                          className={cn(
                            "w-full text-start px-3 py-2 rounded-md text-sm hover:bg-accent",
                            currentDocType === dt.value && "bg-accent"
                          )}
                        >
                          {isRTL ? dt.labelAr : dt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <DocumentUploader
                  onExtracted={handleDocumentExtracted}
                  purpose="reference"
                  language={locale as 'en' | 'ar'}
                />
              </div>
            )}

            {caseData.documents.length > 0 ? (
              <div className="space-y-2">
                {caseData.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {documentTypes.find(t => t.value === doc.type)?.[isRTL ? 'labelAr' : 'label']}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {doc.uploadedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {isRTL ? 'لا توجد مستندات بعد' : 'No documents yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'المهام' : 'Tasks'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Task */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder={isRTL ? 'أضف مهمة جديدة...' : 'Add a new task...'}
                className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask} disabled={!newTask.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {caseData.tasks.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors",
                    task.status === 'completed' && "opacity-60"
                  )}
                  onClick={() => toggleTaskStatus(task.id)}
                >
                  <div className={cn(
                    "h-5 w-5 rounded border-2 flex items-center justify-center",
                    task.status === 'completed' ? 'bg-primary border-primary' : 'border-muted-foreground'
                  )}>
                    {task.status === 'completed' && (
                      <CheckSquare className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium",
                      task.status === 'completed' && "line-through"
                    )}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'موعد التسليم: ' : 'Due: '}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge className={getCasePriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الملاحظات' : 'Notes'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Note */}
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={isRTL ? 'أضف ملاحظة...' : 'Add a note...'}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <Button onClick={addNote} disabled={!newNote.trim()} className="gap-2">
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {caseData.notes.map(note => (
                <div key={note.id} className="p-4 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{note.type}</Badge>
                    <span>{note.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الجدول الزمني' : 'Timeline'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute start-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {[
                  { date: caseData.createdAt, event: isRTL ? 'تم إنشاء القضية' : 'Case created', type: 'create' },
                  ...caseData.documents.map(doc => ({
                    date: doc.uploadedAt,
                    event: isRTL ? `تم رفع مستند: ${doc.name}` : `Document uploaded: ${doc.name}`,
                    type: 'document',
                  })),
                  ...caseData.tasks.filter(t => t.completedAt).map(task => ({
                    date: task.completedAt!,
                    event: isRTL ? `تم إكمال: ${task.title}` : `Completed: ${task.title}`,
                    type: 'task',
                  })),
                ].sort((a, b) => b.date.getTime() - a.date.getTime()).map((item, idx) => (
                  <div key={idx} className="flex gap-4 ps-8 relative">
                    <div className="absolute start-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <div>
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

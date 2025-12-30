'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Plus,
  FileText,
  Filter,
  Download,
  Trash2,
  Send,
  Eye,
  MoreHorizontal,
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  documentTypeLabels,
  statusLabels as statusLabelsData,
} from '@/lib/templates-data';
import { useDocumentsWithMutations } from '@/hooks/useDocuments';
import { documentsApi, type Document } from '@/lib/api';
import { generateDocumentPdf } from '@/lib/document-pdf-generator';

export default function DocumentsPage() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState('all');
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  // Fetch documents with React Query
  const { documents, isLoading, error, deleteDocument } = useDocumentsWithMutations();

  // Download document as PDF
  const handleDownloadPdf = async (docId: string) => {
    setDownloadingId(docId);
    try {
      const response = await documentsApi.download(docId);
      if (response.success) {
        await generateDocumentPdf(response.data, locale === 'ar' ? 'ar' : 'en');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert(t('documents.downloadError') || 'Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  // Get localized labels
  const getStatusLabel = (status: string) => {
    return statusLabelsData[status]?.[locale] || statusLabelsData[status]?.en || status;
  };

  const getTypeLabel = (type: string) => {
    return documentTypeLabels[type]?.[locale] || documentTypeLabels[type]?.en || type;
  };

  // Create localized document types for filter
  const documentTypes = React.useMemo(() => {
    const types: Record<string, string> = {};
    Object.keys(documentTypeLabels).forEach((key) => {
      types[key] = documentTypeLabels[key][locale] || documentTypeLabels[key].en;
    });
    return types;
  }, [locale]);

  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'draft' && doc.status === 'draft') ||
        (activeTab === 'pending' && doc.status === 'pending') ||
        (activeTab === 'signed' && doc.status === 'signed');

      return matchesSearch && matchesStatus && matchesType && matchesTab;
    });
  }, [documents, searchQuery, statusFilter, typeFilter, activeTab]);

  const columns = [
    {
      key: 'title',
      header: t('documents.columns.document'),
      sortable: true,
      render: (doc: Document) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[300px]" title={doc.title}>
              {doc.title}
            </p>
            <p className="text-xs text-muted-foreground">{doc.documentNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('documents.columns.type'),
      sortable: true,
      render: (doc: Document) => (
        <span className="text-sm capitalize">{getTypeLabel(doc.documentType)}</span>
      ),
    },
    {
      key: 'status',
      header: t('documents.columns.status'),
      sortable: true,
      render: (doc: Document) => (
        <Badge variant={doc.status}>{getStatusLabel(doc.status)}</Badge>
      ),
    },
    {
      key: 'signers',
      header: t('documents.columns.signers'),
      render: (doc: Document) => {
        const signersCount = doc.signers?.length || 0;
        const signedCount = doc.signers?.filter((s) => s.status === 'signed').length || 0;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {signedCount}/{signersCount}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('documents.columns.created'),
      sortable: true,
      render: (doc: Document) => {
        const date = new Date(doc.createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString(locale)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      render: (doc: Document) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 me-2" />
              {t('documents.actions.view')}
            </DropdownMenuItem>
            {doc.status === 'draft' && (
              <DropdownMenuItem>
                <Send className="h-4 w-4 me-2" />
                {t('documents.actions.sendForSigning')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleDownloadPdf(doc.id)}
              disabled={downloadingId === doc.id}
            >
              {downloadingId === doc.id ? (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 me-2" />
              )}
              {t('documents.actions.downloadPdf')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                if (confirm(t('documents.confirmDelete'))) {
                  await deleteDocument.mutateAsync(doc.id);
                }
              }}
              disabled={deleteDocument.isPending}
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t('documents.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const statusCounts = React.useMemo(() => {
    return {
      all: documents.length,
      draft: documents.filter((d) => d.status === 'draft').length,
      pending: documents.filter((d) => d.status === 'pending').length,
      signed: documents.filter((d) => d.status === 'signed').length,
    };
  }, [documents]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error loading documents: {error.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('documents.title')}</h1>
          <p className="text-muted-foreground">{t('documents.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/dashboard/generate`}>
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('nav.aiGenerate')}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/generate`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('documents.create')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">{t('documents.allDocuments')} ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="draft">{t('documents.drafts')} ({statusCounts.draft})</TabsTrigger>
            <TabsTrigger value="pending">{t('documents.pending')} ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="signed">{t('documents.signed')} ({statusCounts.signed})</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              placeholder={t('documents.search')}
              onSearch={setSearchQuery}
              className="w-full sm:w-[250px]"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={t('documents.type.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('documents.type.all')}</SelectItem>
                {Object.entries(documentTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {filteredDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t('documents.noDocuments')}
              description={
                searchQuery || typeFilter !== 'all'
                  ? t('documents.noDocumentsFiltered')
                  : t('documents.createFirst')
              }
              action={
                !searchQuery && typeFilter === 'all' ? (
                  <Link href={`/${locale}/dashboard/generate`}>
                    <Button>
                      <Plus className="h-4 w-4 me-2" />
                      {t('documents.create')}
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <DataTable
              data={filteredDocuments}
              columns={columns}
              pageSize={10}
              onRowClick={(doc) => console.log('Navigate to', doc.id)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

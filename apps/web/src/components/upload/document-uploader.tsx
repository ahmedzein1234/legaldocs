'use client';

import * as React from 'react';
import {
  SUPPORTED_FILE_TYPES,
  ALL_MIME_TYPES,
  MAX_FILE_SIZE,
  validateFile,
  getFileCategory,
  formatFileSize,
  fileToBase64,
  type UploadStatus,
  type DocumentExtraction,
} from '@/lib/document-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  FileSearch,
  FileUp,
  Trash2,
} from 'lucide-react';

interface DocumentUploaderProps {
  onExtracted: (extraction: DocumentExtraction) => void;
  onError?: (error: string) => void;
  purpose?: 'reference' | 'template' | 'analysis';
  language?: 'en' | 'ar';
  className?: string;
  compact?: boolean;
}

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  word: FileText,
  image: Image,
  text: File,
};

const statusMessages: Record<UploadStatus, { en: string; ar: string }> = {
  idle: { en: 'Ready to upload', ar: 'جاهز للرفع' },
  uploading: { en: 'Uploading file...', ar: 'جاري رفع الملف...' },
  processing: { en: 'Processing document...', ar: 'جاري معالجة المستند...' },
  extracting: { en: 'Extracting information...', ar: 'جاري استخراج المعلومات...' },
  analyzing: { en: 'Analyzing content with AI...', ar: 'جاري تحليل المحتوى بالذكاء الاصطناعي...' },
  completed: { en: 'Extraction complete!', ar: 'اكتمل الاستخراج!' },
  error: { en: 'Error occurred', ar: 'حدث خطأ' },
};

export function DocumentUploader({
  onExtracted,
  onError,
  purpose = 'reference',
  language = 'en',
  className,
  compact = false,
}: DocumentUploaderProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<UploadStatus>('idle');
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isRTL = language === 'ar';

  const handleDragEnter = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onError?.(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    await uploadAndExtract(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadAndExtract = async (file: File) => {
    setStatus('uploading');
    setProgress(10);

    try {
      // Convert to base64
      const base64Data = await fileToBase64(file);
      setProgress(30);
      setStatus('processing');

      // Call API
      const response = await fetch('https://legaldocs-api.a-m-zein.workers.dev/api/upload/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('legaldocs_token') || ''}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileData: base64Data,
          purpose,
          language: language === 'ar' ? 'ar' : 'en',
          extractClauses: true,
          extractParties: true,
          extractFinancials: true,
        }),
      });

      setProgress(70);
      setStatus('analyzing');

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setProgress(100);
      setStatus('completed');

      // Create extraction object
      const extraction: DocumentExtraction = {
        id: result.uploadId,
        fileName: file.name,
        fileType: getFileCategory(file.type) || 'text',
        fileSize: file.size,
        uploadedAt: new Date(),
        documentType: result.extraction?.documentType || 'unknown',
        documentTypeConfidence: result.extraction?.documentTypeConfidence || 0,
        language: result.extraction?.language || 'unknown',
        jurisdiction: result.extraction?.jurisdiction,
        rawText: result.extraction?.rawText || '',
        pageCount: result.extraction?.pageCount,
        parties: result.extraction?.parties || [],
        financials: result.extraction?.financials || { amounts: [] },
        dates: result.extraction?.dates || { customDates: [] },
        clauses: result.extraction?.clauses || [],
        property: result.extraction?.property,
        summary: result.extraction?.summary || '',
        summaryAr: result.extraction?.summaryAr,
        keyTerms: result.extraction?.keyTerms || [],
        warnings: result.extraction?.warnings || [],
        notes: result.extraction?.notes || [],
        processingTime: 0,
        extractionModel: 'claude-sonnet-4',
        status: 'completed',
      };

      onExtracted(extraction);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to process document';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileCategory = selectedFile ? getFileCategory(selectedFile.type) : null;
  const FileIcon = fileCategory ? fileTypeIcons[fileCategory] : File;

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALL_MIME_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === 'uploading' || status === 'processing' || status === 'analyzing'}
          className="gap-2"
        >
          {status === 'idle' || status === 'completed' || status === 'error' ? (
            <>
              <FileUp className="h-4 w-4" />
              {isRTL ? 'رفع مستند' : 'Upload Document'}
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {statusMessages[status][language]}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSearch className="h-5 w-5" />
          {isRTL ? 'رفع مستند للتحليل' : 'Upload Document for Analysis'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'ارفع مستندًا قانونيًا موجودًا لاستخراج المعلومات والبنود الرئيسية'
            : 'Upload an existing legal document to extract key information and clauses'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALL_MIME_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => status === 'idle' && fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragActive && 'border-primary bg-primary/5',
            status === 'idle' && 'hover:border-primary/50 hover:bg-muted/50',
            status === 'error' && 'border-destructive/50 bg-destructive/5',
            status === 'completed' && 'border-green-500/50 bg-green-50',
            (status === 'uploading' || status === 'processing' || status === 'analyzing') &&
              'border-blue-500/50 bg-blue-50 cursor-wait'
          )}
        >
          {/* Idle State */}
          {status === 'idle' && !selectedFile && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive
                    ? isRTL ? 'أفلت الملف هنا' : 'Drop file here'
                    : isRTL ? 'اسحب وأفلت أو انقر للرفع' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL
                    ? 'PDF، Word، صور، ملفات نصية (حتى 10 ميجابايت)'
                    : 'PDF, Word, Images, Text files (up to 10MB)'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(SUPPORTED_FILE_TYPES).map(([key, config]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {config.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Processing State */}
          {(status === 'uploading' || status === 'processing' || status === 'extracting' || status === 'analyzing') && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {statusMessages[status][language]}
                </p>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <Progress value={progress} className="w-2/3 mx-auto" />
            </div>
          )}

          {/* Completed State */}
          {status === 'completed' && selectedFile && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">
                  {statusMessages.completed[language]}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleClear} className="gap-1">
                <Trash2 className="h-3 w-3" />
                {isRTL ? 'رفع ملف آخر' : 'Upload Another'}
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">
                  {error || statusMessages.error[language]}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClear} className="gap-1">
                <X className="h-3 w-3" />
                {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
              </Button>
            </div>
          )}
        </div>

        {/* Purpose Indicator */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isRTL ? 'الغرض: ' : 'Purpose: '}
            <Badge variant="secondary" className="text-xs">
              {purpose === 'reference' && (isRTL ? 'مرجع' : 'Reference')}
              {purpose === 'template' && (isRTL ? 'قالب' : 'Template')}
              {purpose === 'analysis' && (isRTL ? 'تحليل' : 'Analysis')}
            </Badge>
          </span>
          <span>
            {isRTL ? 'الحد الأقصى: ' : 'Max: '}
            {formatFileSize(MAX_FILE_SIZE)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentUploader;

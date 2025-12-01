'use client';

import * as React from 'react';
import {
  type DocumentVersion,
  type TrackChangesState,
  formatVersion,
  getVersionHistory,
  getChangeStats,
} from '@/lib/track-changes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  History,
  Clock,
  User,
  GitCompare,
  RotateCcw,
  Eye,
  Check,
  X,
  Plus,
  Minus,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface VersionHistoryProps {
  state: TrackChangesState;
  onRestore: (versionId: string) => void;
  onPreview?: (versionId: string) => void;
  onCompare?: (versionId1: string, versionId2: string) => void;
  language?: 'en' | 'ar';
  className?: string;
}

export function VersionHistory({
  state,
  onRestore,
  onPreview,
  onCompare,
  language = 'en',
  className,
}: VersionHistoryProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([]);
  const [compareMode, setCompareMode] = React.useState(false);
  const isRTL = language === 'ar';

  const versions = getVersionHistory(state);
  const stats = getChangeStats(state);

  const handleVersionSelect = (versionId: string) => {
    if (compareMode) {
      setSelectedVersions((prev) => {
        if (prev.includes(versionId)) {
          return prev.filter((id) => id !== versionId);
        }
        if (prev.length < 2) {
          return [...prev, versionId];
        }
        return [prev[1], versionId];
      });
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2 && onCompare) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  const labels = {
    title: isRTL ? 'سجل الإصدارات' : 'Version History',
    description: isRTL
      ? 'عرض ومقارنة واستعادة الإصدارات السابقة'
      : 'View, compare, and restore previous versions',
    changes: isRTL ? 'التغييرات' : 'Changes',
    pending: isRTL ? 'قيد الانتظار' : 'Pending',
    accepted: isRTL ? 'مقبول' : 'Accepted',
    rejected: isRTL ? 'مرفوض' : 'Rejected',
    insertions: isRTL ? 'إضافات' : 'Insertions',
    deletions: isRTL ? 'حذف' : 'Deletions',
    modifications: isRTL ? 'تعديلات' : 'Modifications',
    restore: isRTL ? 'استعادة' : 'Restore',
    preview: isRTL ? 'معاينة' : 'Preview',
    compare: isRTL ? 'مقارنة' : 'Compare',
    compareMode: isRTL ? 'وضع المقارنة' : 'Compare Mode',
    selectTwo: isRTL
      ? 'اختر إصدارين للمقارنة'
      : 'Select two versions to compare',
    noVersions: isRTL ? 'لا توجد إصدارات محفوظة' : 'No versions saved yet',
    current: isRTL ? 'الحالي' : 'Current',
    autoSave: isRTL ? 'حفظ تلقائي' : 'Auto-save',
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 px-2 gap-1', className)}
          title={labels.title}
        >
          <History className="h-4 w-4" />
          <span className="text-xs">{labels.title}</span>
          {stats.pending > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {stats.pending}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isRTL ? 'left' : 'right'}
        className="w-[400px] sm:w-[540px]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {labels.title}
          </SheetTitle>
          <SheetDescription>{labels.description}</SheetDescription>
        </SheetHeader>

        {/* Change Statistics */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">{labels.changes}</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-background rounded">
              <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                <AlertCircle className="h-3 w-3" />
                <span className="text-lg font-bold">{stats.pending}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {labels.pending}
              </span>
            </div>
            <div className="p-2 bg-background rounded">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Check className="h-3 w-3" />
                <span className="text-lg font-bold">{stats.accepted}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {labels.accepted}
              </span>
            </div>
            <div className="p-2 bg-background rounded">
              <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                <X className="h-3 w-3" />
                <span className="text-lg font-bold">{stats.rejected}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {labels.rejected}
              </span>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-around text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-green-500" />
              {stats.insertions} {labels.insertions}
            </span>
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-red-500" />
              {stats.deletions} {labels.deletions}
            </span>
            <span className="flex items-center gap-1">
              <Edit3 className="h-3 w-3 text-blue-500" />
              {stats.modifications} {labels.modifications}
            </span>
          </div>
        </div>

        {/* Compare Mode Toggle */}
        {onCompare && versions.length >= 2 && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant={compareMode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedVersions([]);
              }}
              className="gap-1"
            >
              <GitCompare className="h-4 w-4" />
              {labels.compareMode}
            </Button>
            {compareMode && selectedVersions.length === 2 && (
              <Button size="sm" onClick={handleCompare} className="gap-1">
                <GitCompare className="h-4 w-4" />
                {labels.compare}
              </Button>
            )}
          </div>
        )}

        {compareMode && (
          <p className="mt-2 text-xs text-muted-foreground">{labels.selectTwo}</p>
        )}

        {/* Version List */}
        <ScrollArea className="h-[400px] mt-4">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <History className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">{labels.noVersions}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions
                .slice()
                .reverse()
                .map((version, index) => (
                  <VersionItem
                    key={version.id}
                    version={version}
                    isLatest={index === 0}
                    isCurrent={version.version === state.currentVersion}
                    isSelected={selectedVersions.includes(version.id)}
                    compareMode={compareMode}
                    onSelect={() => handleVersionSelect(version.id)}
                    onRestore={() => onRestore(version.id)}
                    onPreview={onPreview ? () => onPreview(version.id) : undefined}
                    language={language}
                    labels={labels}
                  />
                ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface VersionItemProps {
  version: DocumentVersion;
  isLatest: boolean;
  isCurrent: boolean;
  isSelected: boolean;
  compareMode: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onPreview?: () => void;
  language: 'en' | 'ar';
  labels: Record<string, string>;
}

function VersionItem({
  version,
  isLatest,
  isCurrent,
  isSelected,
  compareMode,
  onSelect,
  onRestore,
  onPreview,
  language,
  labels,
}: VersionItemProps) {
  const isRTL = language === 'ar';

  const timeAgo = React.useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - version.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
    }
    if (hours > 0) {
      return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    if (minutes > 0) {
      return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    }
    return isRTL ? 'الآن' : 'Just now';
  }, [version.timestamp, isRTL]);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        compareMode && 'cursor-pointer',
        isSelected && 'border-primary bg-primary/5',
        isCurrent && !isSelected && 'border-blue-500/50 bg-blue-500/5',
        !isSelected && !isCurrent && 'hover:border-muted-foreground/30'
      )}
      onClick={compareMode ? onSelect : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {isRTL ? 'الإصدار' : 'Version'} {version.version}
            </span>
            {isCurrent && (
              <Badge variant="secondary" className="text-[10px]">
                {labels.current}
              </Badge>
            )}
            {version.isAutoSave && (
              <Badge variant="outline" className="text-[10px]">
                {labels.autoSave}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {version.userName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
          {version.comment && (
            <p className="mt-1 text-xs text-muted-foreground italic">
              "{version.comment}"
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-[10px]">
            <span className="flex items-center gap-0.5 text-green-600">
              <Plus className="h-3 w-3" />
              {version.changes.filter((c) => c.type === 'insertion').length}
            </span>
            <span className="flex items-center gap-0.5 text-red-600">
              <Minus className="h-3 w-3" />
              {version.changes.filter((c) => c.type === 'deletion').length}
            </span>
            <span className="flex items-center gap-0.5 text-blue-600">
              <Edit3 className="h-3 w-3" />
              {version.changes.filter((c) => c.type === 'modification').length}
            </span>
          </div>
        </div>

        {!compareMode && (
          <div className="flex items-center gap-1">
            {onPreview && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
                title={labels.preview}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isCurrent && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                title={labels.restore}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {compareMode && (
          <div
            className={cn(
              'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30'
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        )}
      </div>
    </div>
  );
}

export default VersionHistory;

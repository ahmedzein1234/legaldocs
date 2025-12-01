'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  History,
  Clock,
  FileText,
  User,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface RecentDocument {
  id: string;
  type: string;
  typeName: string;
  createdAt: string;
  partyA: {
    name: string;
    idNumber: string;
    nationality: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
  };
  partyB: {
    name: string;
    idNumber: string;
    nationality: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
  };
}

interface RecentFillProps {
  onSelectPartyA: (data: RecentDocument['partyA']) => void;
  onSelectPartyB: (data: RecentDocument['partyB']) => void;
  onSelectBoth: (partyA: RecentDocument['partyA'], partyB: RecentDocument['partyB']) => void;
  locale?: string;
  className?: string;
}

const STORAGE_KEY = 'legaldocs-recent-documents';

// Save a document to recent history
export function saveToRecentDocuments(doc: Omit<RecentDocument, 'id' | 'createdAt'>) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const documents: RecentDocument[] = saved ? JSON.parse(saved) : [];

    const newDoc: RecentDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Add to beginning, keep only last 10
    const updated = [newDoc, ...documents.slice(0, 9)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save recent document:', err);
  }
}

export function RecentFill({
  onSelectPartyA,
  onSelectPartyB,
  onSelectBoth,
  locale = 'en',
  className,
}: RecentFillProps) {
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const isArabic = locale === 'ar';

  const translations = {
    recentDocuments: isArabic ? 'المستندات الأخيرة' : 'Recent Documents',
    fillFrom: isArabic ? 'تعبئة من السابق' : 'Fill from Previous',
    noRecent: isArabic ? 'لا توجد مستندات سابقة' : 'No recent documents',
    usePartyA: isArabic ? 'استخدام الطرف الأول' : 'Use Party A',
    usePartyB: isArabic ? 'استخدام الطرف الثاني' : 'Use Party B',
    useBoth: isArabic ? 'استخدام كلاهما' : 'Use Both',
    createdAt: isArabic ? 'أنشئ في' : 'Created',
    quickFill: isArabic ? 'تعبئة سريعة' : 'Quick Fill',
  };

  // Load recent documents
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDocuments(JSON.parse(saved));
      }
    } catch {
      console.error('Failed to load recent documents');
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    }
    return date.toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDocTypeIcon = (type: string) => {
    if (type.includes('company') || type.includes('business')) {
      return Building2;
    }
    return FileText;
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2 h-9', className)}
        >
          <History className="h-4 w-4" />
          {translations.fillFrom}
          <Badge variant="secondary" className="text-[10px] px-1.5">
            {documents.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
      >
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            {translations.recentDocuments}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isArabic
              ? 'اختر مستنداً سابقاً لتعبئة البيانات'
              : 'Select a previous document to fill data'}
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {documents.map((doc) => {
            const Icon = getDocTypeIcon(doc.type);
            return (
              <div
                key={doc.id}
                className="p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                {/* Document Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.typeName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Parties Preview */}
                <div className="space-y-1.5 mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">A:</span>
                    <span className="font-medium truncate">{doc.partyA.name || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">B:</span>
                    <span className="font-medium truncate">{doc.partyB.name || '-'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => {
                      onSelectPartyA(doc.partyA);
                      setIsOpen(false);
                    }}
                  >
                    {translations.usePartyA}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => {
                      onSelectPartyB(doc.partyB);
                      setIsOpen(false);
                    }}
                  >
                    {translations.usePartyB}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      onSelectBoth(doc.partyA, doc.partyB);
                      setIsOpen(false);
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                    {translations.useBoth}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Quick action cards for the most recent documents
export function RecentDocumentCards({
  onSelectBoth,
  locale = 'en',
  className,
}: {
  onSelectBoth: (partyA: RecentDocument['partyA'], partyB: RecentDocument['partyB']) => void;
  locale?: string;
  className?: string;
}) {
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const isArabic = locale === 'ar';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDocuments(JSON.parse(saved).slice(0, 3)); // Only show last 3
      }
    } catch {
      console.error('Failed to load recent documents');
    }
  }, []);

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        {isArabic ? 'تعبئة سريعة من المستندات الأخيرة' : 'Quick fill from recent documents'}
      </p>
      <div className="flex flex-wrap gap-2">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelectBoth(doc.partyA, doc.partyB)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/30 hover:bg-muted/50 transition-colors text-xs"
          >
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="max-w-[120px] truncate">{doc.typeName}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Search,
  FileText,
  FolderOpen,
  Sparkles,
  Scale,
  PenTool,
  Handshake,
  ScanLine,
  Shield,
  Settings,
  HelpCircle,
  Plus,
  Moon,
  Sun,
  Globe,
  Home,
  Command,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings' | 'recent';
}

interface CommandPaletteProps {
  onThemeToggle?: () => void;
  currentTheme?: 'light' | 'dark';
}

export function CommandPalette({ onThemeToggle, currentTheme }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const translations = {
    placeholder: isArabic ? 'ابحث عن صفحة أو إجراء...' : 'Search for a page or action...',
    navigation: isArabic ? 'التنقل' : 'Navigation',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    settings: isArabic ? 'الإعدادات' : 'Settings',
    recent: isArabic ? 'الأخيرة' : 'Recent',
    noResults: isArabic ? 'لا توجد نتائج' : 'No results found',
    tip: isArabic ? 'نصيحة: اضغط' : 'Tip: Press',
    toOpen: isArabic ? 'للفتح السريع' : 'to quickly open',
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'dashboard',
      title: 'Dashboard',
      titleAr: 'لوحة التحكم',
      icon: <Home className="h-4 w-4" />,
      shortcut: 'G D',
      action: () => router.push(`/${locale}/dashboard`),
      category: 'navigation',
    },
    {
      id: 'documents',
      title: 'Documents',
      titleAr: 'المستندات',
      icon: <FileText className="h-4 w-4" />,
      shortcut: 'G O',
      action: () => router.push(`/${locale}/dashboard/documents`),
      category: 'navigation',
    },
    {
      id: 'templates',
      title: 'Templates',
      titleAr: 'القوالب',
      icon: <FolderOpen className="h-4 w-4" />,
      shortcut: 'G T',
      action: () => router.push(`/${locale}/dashboard/templates`),
      category: 'navigation',
    },
    {
      id: 'generate',
      title: 'AI Generate',
      titleAr: 'إنشاء بالذكاء',
      icon: <Sparkles className="h-4 w-4" />,
      shortcut: 'G G',
      action: () => router.push(`/${locale}/dashboard/generate`),
      category: 'navigation',
    },
    {
      id: 'advisor',
      title: 'Legal Advisor',
      titleAr: 'المستشار القانوني',
      icon: <Scale className="h-4 w-4" />,
      shortcut: 'G A',
      action: () => router.push(`/${locale}/dashboard/advisor`),
      category: 'navigation',
    },
    {
      id: 'signatures',
      title: 'Digital Signatures',
      titleAr: 'التوقيعات الرقمية',
      icon: <PenTool className="h-4 w-4" />,
      shortcut: 'G S',
      action: () => router.push(`/${locale}/dashboard/signatures`),
      category: 'navigation',
    },
    {
      id: 'negotiate',
      title: 'Contract Negotiation',
      titleAr: 'التفاوض على العقود',
      icon: <Handshake className="h-4 w-4" />,
      shortcut: 'G N',
      action: () => router.push(`/${locale}/dashboard/negotiate`),
      category: 'navigation',
    },
    {
      id: 'scan',
      title: 'OCR Scanner',
      titleAr: 'ماسح المستندات',
      icon: <ScanLine className="h-4 w-4" />,
      shortcut: 'G C',
      action: () => router.push(`/${locale}/dashboard/scan`),
      category: 'navigation',
    },
    {
      id: 'certify',
      title: 'Blockchain Certify',
      titleAr: 'التوثيق بالبلوكشين',
      icon: <Shield className="h-4 w-4" />,
      shortcut: 'G B',
      action: () => router.push(`/${locale}/dashboard/certify`),
      category: 'navigation',
    },
    // Actions
    {
      id: 'new-document',
      title: 'Create New Document',
      titleAr: 'إنشاء مستند جديد',
      description: 'Generate a new legal document with AI',
      descriptionAr: 'إنشاء مستند قانوني جديد بالذكاء الاصطناعي',
      icon: <Plus className="h-4 w-4" />,
      shortcut: 'N',
      action: () => router.push(`/${locale}/dashboard/generate`),
      category: 'actions',
    },
    {
      id: 'new-signature',
      title: 'Request Signature',
      titleAr: 'طلب توقيع',
      description: 'Send a document for digital signing',
      descriptionAr: 'إرسال مستند للتوقيع الرقمي',
      icon: <PenTool className="h-4 w-4" />,
      action: () => router.push(`/${locale}/dashboard/signatures/new`),
      category: 'actions',
    },
    {
      id: 'consult',
      title: 'Ask Legal Question',
      titleAr: 'اسأل سؤالاً قانونياً',
      description: 'Get AI-powered legal consultation',
      descriptionAr: 'احصل على استشارة قانونية بالذكاء الاصطناعي',
      icon: <Scale className="h-4 w-4" />,
      action: () => router.push(`/${locale}/dashboard/advisor/consult`),
      category: 'actions',
    },
    // Settings
    {
      id: 'theme',
      title: currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      titleAr: currentTheme === 'dark' ? 'التبديل للوضع الفاتح' : 'التبديل للوضع الداكن',
      icon: currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      shortcut: 'T',
      action: () => onThemeToggle?.(),
      category: 'settings',
    },
    {
      id: 'settings',
      title: 'Settings',
      titleAr: 'الإعدادات',
      icon: <Settings className="h-4 w-4" />,
      shortcut: ',',
      action: () => router.push(`/${locale}/dashboard/settings`),
      category: 'settings',
    },
    {
      id: 'help',
      title: 'Help & Support',
      titleAr: 'المساعدة والدعم',
      icon: <HelpCircle className="h-4 w-4" />,
      shortcut: '?',
      action: () => router.push(`/${locale}/dashboard/help`),
      category: 'settings',
    },
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    const title = isArabic ? (cmd.titleAr || cmd.title) : cmd.title;
    const description = isArabic ? (cmd.descriptionAr || cmd.description) : cmd.description;
    return (
      title.toLowerCase().includes(searchLower) ||
      (description?.toLowerCase().includes(searchLower))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const categoryOrder: Array<'navigation' | 'actions' | 'settings' | 'recent'> = ['actions', 'navigation', 'settings'];
  const orderedGroups = categoryOrder.filter((cat) => groupedCommands[cat]?.length > 0);

  // Flatten for keyboard navigation
  const flatCommands = orderedGroups.flatMap((cat) => groupedCommands[cat]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle arrow navigation and enter
  const handleKeyDownInPalette = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatCommands[selectedIndex]) {
      e.preventDefault();
      flatCommands[selectedIndex].action();
      setIsOpen(false);
      setSearch('');
    }
  }, [flatCommands, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => {
          setIsOpen(false);
          setSearch('');
        }}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="overflow-hidden rounded-xl border bg-background shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDownInPalette}
              placeholder={translations.placeholder}
              className="flex-1 bg-transparent py-4 px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {flatCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {translations.noResults}
              </div>
            ) : (
              orderedGroups.map((category) => (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {translations[category]}
                  </div>
                  {groupedCommands[category].map((cmd) => {
                    const index = flatCommands.findIndex((c) => c.id === cmd.id);
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                          setSearch('');
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <span className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-md',
                          isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                        )}>
                          {cmd.icon}
                        </span>
                        <div className="flex-1 text-start">
                          <div className="font-medium">
                            {isArabic ? (cmd.titleAr || cmd.title) : cmd.title}
                          </div>
                          {(cmd.description || cmd.descriptionAr) && (
                            <div className={cn(
                              'text-xs',
                              isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {isArabic ? (cmd.descriptionAr || cmd.description) : cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className={cn(
                            'hidden sm:inline-flex h-6 items-center gap-1 rounded border px-2 text-xs',
                            isSelected
                              ? 'border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground'
                              : 'border-border bg-muted text-muted-foreground'
                          )}>
                            {cmd.shortcut}
                          </kbd>
                        )}
                        <ArrowRight className={cn(
                          'h-4 w-4 opacity-0 transition-opacity',
                          isSelected && 'opacity-100'
                        )} />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/50 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{translations.tip}</span>
                <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5">
                  <Command className="h-3 w-3" />K
                </kbd>
                <span>{translations.toOpen}</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5">↑↓</kbd>
                <span>navigate</span>
                <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5">↵</kbd>
                <span>select</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Command palette trigger button
export function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border transition-colors"
    >
      <Search className="h-4 w-4" />
      <span>{isArabic ? 'بحث...' : 'Search...'}</span>
      <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-xs">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}

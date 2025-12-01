'use client';

import * as React from 'react';
import {
  FileText,
  FolderOpen,
  Search,
  Plus,
  Inbox,
  LucideIcon,
  FileQuestion,
  FolderSearch,
  Upload,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type EmptyStateType = 'documents' | 'templates' | 'search' | 'inbox' | 'default' | 'no-results' | 'upload';

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
  suggestions?: string[];
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const icons: Record<EmptyStateType, LucideIcon> = {
  documents: FileText,
  templates: FolderOpen,
  search: Search,
  inbox: Inbox,
  default: FileText,
  'no-results': FileQuestion,
  upload: Upload,
};

const iconColors: Record<EmptyStateType, string> = {
  documents: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  templates: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  search: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  inbox: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  default: 'text-muted-foreground bg-muted',
  'no-results': 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  upload: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
};

export function EmptyState({
  type = 'default',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
  suggestions,
  secondaryAction,
}: EmptyStateProps) {
  const IconComponent = icon || icons[type];
  const iconColorClass = iconColors[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Animated Icon with Gradient Background */}
      <div className="relative mb-6">
        <div className={cn(
          'rounded-full p-6 animate-pulse-subtle',
          iconColorClass
        )}>
          <IconComponent className="h-16 w-16" />
        </div>
        {/* Decorative ring */}
        <div className={cn(
          'absolute inset-0 rounded-full opacity-20 animate-ping',
          iconColorClass
        )} style={{ animationDuration: '2s' }} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold mb-2 max-w-md">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
        {description}
      </p>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mb-6 w-full max-w-md">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggestions
          </p>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors"
              >
                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-start">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {action}
        {!action && actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-5 w-5" />
            {actionLabel}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Specialized Empty States
export function EmptyDocuments({ onCreateDocument }: { onCreateDocument: () => void }) {
  return (
    <EmptyState
      type="documents"
      title="No documents yet"
      description="Get started by creating your first legal document. Our AI-powered system will guide you through the process."
      actionLabel="Create Document"
      onAction={onCreateDocument}
      suggestions={[
        'Generate documents from templates',
        'Upload existing documents',
        'Use AI to draft custom contracts',
      ]}
    />
  );
}

export function EmptySearchResults({ onClearFilters, searchTerm }: { onClearFilters?: () => void; searchTerm?: string }) {
  return (
    <EmptyState
      type="no-results"
      icon={FolderSearch}
      title={searchTerm ? `No results for "${searchTerm}"` : 'No results found'}
      description="We couldn't find any documents matching your search criteria. Try adjusting your filters or search terms."
      actionLabel={onClearFilters ? "Clear Filters" : undefined}
      onAction={onClearFilters}
      suggestions={[
        'Check your spelling',
        'Use different keywords',
        'Remove some filters',
        'Try broader search terms',
      ]}
    />
  );
}

export function EmptyTemplates({ onBrowseTemplates }: { onBrowseTemplates?: () => void }) {
  return (
    <EmptyState
      type="templates"
      title="No templates available"
      description="We're constantly adding new legal document templates to help you work faster."
      actionLabel={onBrowseTemplates ? "Browse Templates" : undefined}
      onAction={onBrowseTemplates}
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      type="inbox"
      title="Inbox is empty"
      description="You're all caught up! No pending signatures or document requests at the moment."
      suggestions={[
        'All your documents are up to date',
        'Check back later for new updates',
      ]}
    />
  );
}

export function EmptyUpload({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      type="upload"
      title="No files uploaded"
      description="Drag and drop your documents here, or click the button below to browse your files."
      actionLabel="Browse Files"
      onAction={onUpload}
      suggestions={[
        'Supported formats: PDF, DOC, DOCX',
        'Maximum file size: 10MB',
      ]}
    />
  );
}

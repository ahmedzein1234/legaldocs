'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  PenTool,
  Upload,
  Sparkles,
  Scale,
  ScanLine,
  Shield,
  Handshake,
  Search,
  Settings,
  Users,
  Calendar,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  gradient: string;
  badge?: string;
  shortcut?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
  variant?: 'grid' | 'list' | 'compact';
  columns?: 2 | 3 | 4;
  onActionClick?: (actionId: string) => void;
}

const defaultActions: QuickAction[] = [
  {
    id: 'create-document',
    title: 'Create Document',
    description: 'Generate a new legal document with AI',
    icon: Sparkles,
    href: '/dashboard/generate',
    color: 'from-blue-600 to-indigo-600',
    gradient: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    badge: 'AI',
    shortcut: 'Ctrl+N',
  },
  {
    id: 'request-signature',
    title: 'Request Signature',
    description: 'Send a document for digital signing',
    icon: PenTool,
    href: '/dashboard/signatures/new',
    color: 'from-green-600 to-emerald-600',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600',
    shortcut: 'Ctrl+S',
  },
  {
    id: 'upload-document',
    title: 'Upload Document',
    description: 'Upload and manage existing documents',
    icon: Upload,
    href: '/dashboard/documents',
    color: 'from-orange-600 to-red-600',
    gradient: 'bg-gradient-to-br from-orange-600 to-red-600',
    shortcut: 'Ctrl+U',
  },
  {
    id: 'legal-advisor',
    title: 'Legal Advisor',
    description: 'Get AI-powered legal advice',
    icon: Scale,
    href: '/dashboard/advisor/consult',
    color: 'from-purple-600 to-pink-600',
    gradient: 'bg-gradient-to-br from-purple-600 to-pink-600',
    badge: 'AI',
  },
  {
    id: 'scan-document',
    title: 'Scan Document',
    description: 'Extract data from IDs and documents',
    icon: ScanLine,
    href: '/dashboard/scan',
    color: 'from-cyan-600 to-blue-600',
    gradient: 'bg-gradient-to-br from-cyan-600 to-blue-600',
  },
  {
    id: 'certify',
    title: 'Blockchain Certify',
    description: 'Certify documents on blockchain',
    icon: Shield,
    href: '/dashboard/certify',
    color: 'from-violet-600 to-purple-600',
    gradient: 'bg-gradient-to-br from-violet-600 to-purple-600',
    badge: 'New',
  },
];

function QuickActionCard({ action, onClick }: { action: QuickAction; onClick?: (id: string) => void }) {
  const Icon = action.icon;

  return (
    <Link href={action.href} onClick={() => onClick?.(action.id)}>
      <Card className="group relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        {/* Gradient background on hover */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity',
          action.gradient
        )} />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'p-3 rounded-xl text-white transition-transform group-hover:scale-110',
              action.gradient
            )}>
              <Icon className="h-6 w-6" />
            </div>
            {action.badge && (
              <Badge variant="secondary" className="text-xs font-bold">
                {action.badge}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {action.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {action.description}
          </p>

          {action.shortcut && (
            <div className="flex items-center gap-2 mt-3">
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                {action.shortcut}
              </kbd>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickActionListItem({ action, onClick }: { action: QuickAction; onClick?: (id: string) => void }) {
  const Icon = action.icon;

  return (
    <Link href={action.href} onClick={() => onClick?.(action.id)}>
      <div className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all">
        <div className={cn(
          'p-3 rounded-xl text-white',
          action.gradient
        )}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold group-hover:text-primary transition-colors">
              {action.title}
            </h4>
            {action.badge && (
              <Badge variant="secondary" className="text-xs">
                {action.badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {action.description}
          </p>
        </div>

        {action.shortcut && (
          <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border hidden sm:block">
            {action.shortcut}
          </kbd>
        )}
      </div>
    </Link>
  );
}

function QuickActionCompact({ action, onClick }: { action: QuickAction; onClick?: (id: string) => void }) {
  const Icon = action.icon;

  return (
    <Link href={action.href} onClick={() => onClick?.(action.id)}>
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3 hover:bg-accent"
      >
        <div className={cn(
          'p-2 rounded-lg text-white',
          action.gradient
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium">{action.title}</span>
        {action.badge && (
          <Badge variant="secondary" className="ms-auto text-xs">
            {action.badge}
          </Badge>
        )}
      </Button>
    </Link>
  );
}

export function QuickActions({
  actions = defaultActions,
  className,
  variant = 'grid',
  columns = 3,
  onActionClick,
}: QuickActionsProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {actions.map((action) => (
          <QuickActionListItem key={action.id} action={action} onClick={onActionClick} />
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {actions.map((action) => (
          <QuickActionCompact key={action.id} action={action} onClick={onActionClick} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {actions.map((action) => (
        <QuickActionCard key={action.id} action={action} onClick={onActionClick} />
      ))}
    </div>
  );
}

// Floating Action Button
export function FloatingActionButton({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  return (
    <Link href={action.href}>
      <Button
        size="lg"
        className={cn(
          'fixed bottom-6 end-6 z-50 h-14 w-14 rounded-full shadow-2xl',
          action.gradient
        )}
      >
        <Icon className="h-6 w-6" />
      </Button>
    </Link>
  );
}

// Command Bar (search-style quick actions)
export function QuickActionsCommandBar({ actions = defaultActions, onSelect }: {
  actions?: QuickAction[];
  onSelect?: (action: QuickAction) => void;
}) {
  const [search, setSearch] = React.useState('');

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(search.toLowerCase()) ||
    action.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search actions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full ps-10 pe-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onSelect?.(action)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-start"
            >
              <div className={cn('p-2 rounded-lg text-white', action.gradient)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              {action.shortcut && (
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                  {action.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

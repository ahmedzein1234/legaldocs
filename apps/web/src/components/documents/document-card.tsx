'use client';

import { FileText, MoreVertical, Send, Download, Trash2, Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface DocumentCardProps {
  id: string;
  documentNumber: string;
  title: string;
  type: string;
  status: 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';
  signersCount: number;
  signedCount: number;
  createdAt: string;
  onView?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  signed: 'Signed',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export function DocumentCard({
  documentNumber,
  title,
  type,
  status,
  signersCount,
  signedCount,
  createdAt,
  onView,
  onSend,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  return (
    <Card className="card-hover group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium truncate" title={title}>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{documentNumber}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant={status as 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled'}>
                  {statusLabels[status]}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
                {signersCount > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {signedCount}/{signersCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{createdAt}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 me-2" />
                  View
                </DropdownMenuItem>
                {status === 'draft' && (
                  <DropdownMenuItem onClick={onSend}>
                    <Send className="h-4 w-4 me-2" />
                    Send for Signing
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="h-4 w-4 me-2" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 me-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DocumentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted animate-pulse w-9 h-9" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

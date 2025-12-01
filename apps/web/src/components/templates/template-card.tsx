'use client';

import * as React from 'react';
import { FileText, Star, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  language: 'en' | 'ar' | 'ur';
  popularity?: number;
  estimatedTime?: string;
  isNew?: boolean;
  isPremium?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
}

const languageLabels: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
};

export function TemplateCard({
  name,
  description,
  category,
  language,
  popularity,
  estimatedTime,
  isNew,
  isPremium,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  return (
    <Card className="card-hover group flex flex-col h-full">
      <CardContent className="p-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate" title={name}>
                {name}
              </h3>
              {isNew && (
                <Badge variant="default" className="bg-accent text-accent-foreground text-[10px] px-1.5">
                  New
                </Badge>
              )}
              {isPremium && (
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
              <span className="capitalize">{category.replace('_', ' ')}</span>
              <span className="text-border">•</span>
              <span>{languageLabels[language]}</span>
              {popularity !== undefined && (
                <>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-secondary" />
                    {popularity}
                  </span>
                </>
              )}
              {estimatedTime && (
                <>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {estimatedTime}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onPreview}>
          Preview
        </Button>
        <Button size="sm" className="flex-1" onClick={onSelect}>
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}

export function TemplateCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="p-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted animate-pulse w-10 h-10" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
        <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}

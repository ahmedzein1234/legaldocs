'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { FileStack, Filter, Globe, Search, Star, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateCard, TemplateCardSkeleton } from '@/components/templates/template-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getTemplatesForLanguage,
  categoryLabels,
  type LocalizedTemplate,
} from '@/lib/templates-data';
import { useTemplatesWithCategories } from '@/hooks/useTemplates';

export default function TemplatesPage() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'ar' | 'ur';
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [languageFilter, setLanguageFilter] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState('all');
  const [previewTemplate, setPreviewTemplate] = React.useState<LocalizedTemplate | null>(null);

  // Fetch templates and categories with React Query
  const { templates: apiTemplates, categories: apiCategories, isLoading, error } = useTemplatesWithCategories();

  // Map API templates to LocalizedTemplate format and filter by language
  const templates = React.useMemo(() => {
    // Fallback to static templates if API fails
    if (!apiTemplates.length) {
      if (languageFilter === 'all') {
        return getTemplatesForLanguage(locale);
      }
      return getTemplatesForLanguage(languageFilter as 'en' | 'ar' | 'ur');
    }

    // Use API templates
    return apiTemplates.map((template): LocalizedTemplate => ({
      id: template.id,
      name: locale === 'ar' && template.nameAr ? template.nameAr :
            locale === 'ur' && template.nameUr ? template.nameUr :
            template.name,
      description: locale === 'ar' && template.descriptionAr ? template.descriptionAr :
                   locale === 'ur' && template.descriptionUr ? template.descriptionUr :
                   template.description || '',
      category: template.category,
      language: locale,
      popularity: template.usageCount,
      isPremium: !template.isPublic,
      isNew: false, // You can add logic to determine if template is new
      estimatedTime: '5-10 min', // Default estimated time
    }));
  }, [apiTemplates, locale, languageFilter]);

  // Get localized category labels
  const categories = React.useMemo(() => {
    const result: Record<string, string> = {};
    Object.keys(categoryLabels).forEach((key) => {
      result[key] = categoryLabels[key][locale] || categoryLabels[key].en;
    });
    return result;
  }, [locale]);

  // Language options
  const languages: Record<string, string> = {
    all: t('templates.languages.all'),
    en: t('templates.languages.en'),
    ar: t('templates.languages.ar'),
    ur: t('templates.languages.ur'),
  };

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || template.category === categoryFilter;
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'popular' && template.popularity >= 100) ||
        (activeTab === 'new' && template.isNew) ||
        (activeTab === 'premium' && template.isPremium);

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [templates, searchQuery, categoryFilter, activeTab]);

  const handleSelectTemplate = (template: LocalizedTemplate) => {
    // Navigate to generate page with template pre-selected
    router.push(`/${locale}/dashboard/generate?type=${template.id}&lang=${template.language}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('templates.title')}</h1>
          <p className="text-muted-foreground">{t('templates.subtitle')}</p>
        </div>
        <Link href={`/${locale}/dashboard/generate`}>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t('templates.aiGenerateCustom')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <SearchInput
              placeholder={t('actions.search')}
              onSearch={setSearchQuery}
              className="flex-1"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 me-2" />
                  <SelectValue placeholder={t('templates.categories.all')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-[140px]">
                  <Globe className="h-4 w-4 me-2" />
                  <SelectValue placeholder={t('templates.languages.all')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t('templates.allTemplates')}</TabsTrigger>
          <TabsTrigger value="popular">
            <Star className="h-4 w-4 me-1" />
            {t('templates.popular')}
          </TabsTrigger>
          <TabsTrigger value="new">{t('templates.new')}</TabsTrigger>
          <TabsTrigger value="premium">{t('templates.premium')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <EmptyState
              icon={FileStack}
              title={t('templates.noTemplates')}
              description={t('templates.noTemplatesFiltered')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  {...template}
                  onSelect={() => handleSelectTemplate(template)}
                  onPreview={() => setPreviewTemplate(template)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="p-6 border rounded-lg bg-muted/30 min-h-[300px]">
              <p className="text-sm text-muted-foreground text-center">
                {t('templates.previewTitle')}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                {t('actions.close')}
              </Button>
              <Button
                onClick={() => {
                  if (previewTemplate) {
                    handleSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }
                }}
              >
                {t('templates.useThis')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

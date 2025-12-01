'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaqSearch, highlightText } from './faq-search';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: string;
  answer: string;
  keywords?: string[];
}

export interface FaqCategory {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items: FaqItem[];
}

interface FaqAccordionProps {
  categories: FaqCategory[];
  className?: string;
}

export function FaqAccordion({ categories, className }: FaqAccordionProps) {
  const t = useTranslations('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'all');

  // Filter items based on search query
  const filterItems = (items: FaqItem[]) => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const questionMatch = item.question.toLowerCase().includes(query);
      const answerMatch = item.answer.toLowerCase().includes(query);
      const keywordMatch = item.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(query)
      );
      return questionMatch || answerMatch || keywordMatch;
    });
  };

  // Get filtered categories
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        items: filterItems(category.items),
      }))
      .filter((category) => category.items.length > 0);
  };

  const filteredCategories = getFilteredCategories();
  const hasResults = filteredCategories.length > 0;

  return (
    <div className={cn('w-full', className)}>
      {/* Search */}
      <div className="mb-8">
        <FaqSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.icon && <span className="mr-2">{category.icon}</span>}
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-6">
          {hasResults ? (
            <>
              <p className="text-sm text-muted-foreground">
                {t('searchResults', { count: filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0) })}
              </p>
              {filteredCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {category.icon}
                    {category.title}
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-semibold">
                            {highlightText(item.question, searchQuery)}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {highlightText(item.answer, searchQuery)}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noResults')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('noResultsHint')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

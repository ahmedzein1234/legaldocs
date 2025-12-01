'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Building2,
  DollarSign,
  Users,
  User,
  Briefcase,
  Home,
  Car,
  Handshake,
  Shield,
  Scale,
  MessageSquarePlus,
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  Check,
} from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  categoryAr: string;
  popular?: boolean;
  new?: boolean;
  aiPowered?: boolean;
  estimatedTime?: string;
  estimatedTimeAr?: string;
}

const documentTypes: DocumentType[] = [
  {
    id: 'deposit_receipt',
    name: 'Deposit Receipt',
    nameAr: 'إيصال الإيداع',
    description: 'Receipt for property deposit payments',
    descriptionAr: 'إيصال لدفعات الإيداع العقاري',
    icon: DollarSign,
    category: 'Real Estate',
    categoryAr: 'العقارات',
    popular: true,
    estimatedTime: '2 min',
    estimatedTimeAr: '2 دقيقة',
  },
  {
    id: 'rental_agreement',
    name: 'Rental Agreement',
    nameAr: 'عقد الإيجار',
    description: 'Comprehensive rental contract for properties',
    descriptionAr: 'عقد إيجار شامل للعقارات',
    icon: Home,
    category: 'Real Estate',
    categoryAr: 'العقارات',
    popular: true,
    estimatedTime: '5 min',
    estimatedTimeAr: '5 دقائق',
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    nameAr: 'اتفاقية عدم الإفصاح',
    description: 'Protect confidential business information',
    descriptionAr: 'حماية المعلومات التجارية السرية',
    icon: Shield,
    category: 'Business',
    categoryAr: 'الأعمال',
    popular: true,
    estimatedTime: '3 min',
    estimatedTimeAr: '3 دقائق',
  },
  {
    id: 'service_agreement',
    name: 'Service Agreement',
    nameAr: 'اتفاقية الخدمات',
    description: 'Contract for professional services',
    descriptionAr: 'عقد للخدمات المهنية',
    icon: Briefcase,
    category: 'Business',
    categoryAr: 'الأعمال',
    estimatedTime: '4 min',
    estimatedTimeAr: '4 دقائق',
  },
  {
    id: 'employment_contract',
    name: 'Employment Contract',
    nameAr: 'عقد العمل',
    description: 'UAE labor law compliant employment agreement',
    descriptionAr: 'عقد عمل متوافق مع قانون العمل الإماراتي',
    icon: User,
    category: 'Employment',
    categoryAr: 'التوظيف',
    popular: true,
    estimatedTime: '5 min',
    estimatedTimeAr: '5 دقائق',
  },
  {
    id: 'power_of_attorney',
    name: 'Power of Attorney',
    nameAr: 'التوكيل الرسمي',
    description: 'Legal authorization document',
    descriptionAr: 'وثيقة التفويض القانوني',
    icon: Scale,
    category: 'Legal',
    categoryAr: 'قانوني',
    estimatedTime: '3 min',
    estimatedTimeAr: '3 دقائق',
  },
  {
    id: 'partnership_agreement',
    name: 'Partnership Agreement',
    nameAr: 'اتفاقية الشراكة',
    description: 'Business partnership terms and conditions',
    descriptionAr: 'شروط وأحكام الشراكة التجارية',
    icon: Handshake,
    category: 'Business',
    categoryAr: 'الأعمال',
    new: true,
    estimatedTime: '6 min',
    estimatedTimeAr: '6 دقائق',
  },
  {
    id: 'vehicle_sale',
    name: 'Vehicle Sale Agreement',
    nameAr: 'عقد بيع المركبات',
    description: 'Contract for buying or selling vehicles',
    descriptionAr: 'عقد لبيع أو شراء المركبات',
    icon: Car,
    category: 'Sales',
    categoryAr: 'المبيعات',
    new: true,
    estimatedTime: '3 min',
    estimatedTimeAr: '3 دقائق',
  },
  {
    id: 'custom',
    name: 'Custom Document',
    nameAr: 'مستند مخصص',
    description: 'Create any document with AI assistance',
    descriptionAr: 'أنشئ أي مستند بمساعدة الذكاء الاصطناعي',
    icon: MessageSquarePlus,
    category: 'Custom',
    categoryAr: 'مخصص',
    aiPowered: true,
    estimatedTime: '5-10 min',
    estimatedTimeAr: '5-10 دقائق',
  },
];

interface DocumentTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
  locale: string;
}

export function DocumentTypeSelector({ selectedType, onSelect, locale }: DocumentTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isArabic = locale === 'ar';

  const translations = {
    search: isArabic ? 'ابحث عن نوع المستند...' : 'Search document types...',
    all: isArabic ? 'الكل' : 'All',
    popular: isArabic ? 'الأكثر استخداماً' : 'Popular',
    new: isArabic ? 'جديد' : 'New',
    aiPowered: isArabic ? 'بالذكاء الاصطناعي' : 'AI-Powered',
    estimatedTime: isArabic ? 'الوقت المتوقع' : 'Est. time',
    selectType: isArabic ? 'اختر نوع المستند' : 'Select document type',
    recommended: isArabic ? 'موصى به' : 'Recommended',
  };

  // Get unique categories
  const categories = Array.from(new Set(documentTypes.map(d => isArabic ? d.categoryAr : d.category)));

  // Filter documents
  const filteredTypes = documentTypes.filter(type => {
    const matchesSearch = searchQuery === '' ||
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.nameAr.includes(searchQuery) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.descriptionAr.includes(searchQuery);

    const matchesCategory = !selectedCategory ||
      (isArabic ? type.categoryAr : type.category) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Popular types
  const popularTypes = documentTypes.filter(t => t.popular);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={translations.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10 h-12 text-base rounded-xl"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            !selectedCategory
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {translations.all}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedCategory === category
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Popular Section (only when no search/filter) */}
      {!searchQuery && !selectedCategory && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-muted-foreground">
              {translations.popular}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all text-start',
                  selectedType === type.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  selectedType === type.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <type.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm truncate">
                  {isArabic ? type.nameAr : type.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Document Types */}
      <div className="space-y-3">
        <span className="text-sm font-semibold text-muted-foreground">
          {searchQuery || selectedCategory ? `${filteredTypes.length} ${isArabic ? 'نتيجة' : 'results'}` : translations.selectType}
        </span>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className={cn(
                  'group relative flex flex-col p-4 rounded-2xl border transition-all duration-200 text-start',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-lg'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 end-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {type.popular && (
                    <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      <TrendingUp className="h-3 w-3 me-1" />
                      {translations.popular}
                    </Badge>
                  )}
                  {type.new && (
                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {translations.new}
                    </Badge>
                  )}
                  {type.aiPowered && (
                    <Badge variant="default" className="text-[10px]">
                      <Sparkles className="h-3 w-3 me-1" />
                      {translations.aiPowered}
                    </Badge>
                  )}
                </div>

                {/* Icon and Title */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  )}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      'font-semibold text-base',
                      isSelected && 'text-primary'
                    )}>
                      {isArabic ? type.nameAr : type.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {isArabic ? type.descriptionAr : type.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {isArabic ? type.categoryAr : type.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {isArabic ? type.estimatedTimeAr : type.estimatedTime}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

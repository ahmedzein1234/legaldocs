'use client';

import * as React from 'react';
import {
  standardVariables,
  categoryLabels,
  type TemplateVariable,
} from '@/lib/template-variables';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Variable,
  Search,
  User,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Home,
  Plus,
  ChevronRight,
} from 'lucide-react';

interface VariablePickerProps {
  onInsert: (placeholder: string) => void;
  language?: 'en' | 'ar';
  className?: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  party_a: User,
  party_b: Users,
  document: FileText,
  financial: DollarSign,
  dates: Calendar,
  property: Home,
  custom: Plus,
};

export function VariablePicker({
  onInsert,
  language = 'en',
  className,
}: VariablePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const isRTL = language === 'ar';

  // Group variables by category
  const groupedVariables = React.useMemo(() => {
    const groups: Record<string, TemplateVariable[]> = {};
    for (const variable of standardVariables) {
      if (!groups[variable.category]) {
        groups[variable.category] = [];
      }
      groups[variable.category].push(variable);
    }
    return groups;
  }, []);

  // Filter variables based on search
  const filteredVariables = React.useMemo(() => {
    if (!searchQuery) return groupedVariables;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, TemplateVariable[]> = {};

    for (const [category, variables] of Object.entries(groupedVariables)) {
      const matchingVars = variables.filter(
        v =>
          v.name.toLowerCase().includes(query) ||
          v.nameAr.includes(query) ||
          v.id.includes(query) ||
          v.description.toLowerCase().includes(query)
      );
      if (matchingVars.length > 0) {
        filtered[category] = matchingVars;
      }
    }

    return filtered;
  }, [groupedVariables, searchQuery]);

  const handleInsert = (variable: TemplateVariable) => {
    onInsert(variable.placeholder);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const categories = Object.keys(filteredVariables);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 px-2 gap-1', className)}
          title={isRTL ? 'إدراج متغير' : 'Insert Variable'}
        >
          <Variable className="h-4 w-4" />
          <span className="text-xs">{isRTL ? 'متغير' : 'Variable'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Search Header */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? 'بحث عن متغير...' : 'Search variables...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex max-h-[300px]">
          {/* Categories Sidebar */}
          <div className="w-1/3 border-r bg-muted/30 p-1 overflow-y-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded text-xs transition-colors',
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Variable;
              const label = categoryLabels[category];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors',
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span className="truncate">
                    {isRTL ? label?.ar : label?.en}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Variables List */}
          <div className="w-2/3 p-2 overflow-y-auto">
            {(selectedCategory
              ? { [selectedCategory]: filteredVariables[selectedCategory] }
              : filteredVariables
            ) &&
              Object.entries(
                selectedCategory
                  ? { [selectedCategory]: filteredVariables[selectedCategory] }
                  : filteredVariables
              ).map(([category, variables]) => (
                <div key={category} className="mb-3">
                  {!selectedCategory && (
                    <div className="text-xs font-medium text-muted-foreground mb-1 px-1">
                      {isRTL
                        ? categoryLabels[category]?.ar
                        : categoryLabels[category]?.en}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {variables?.map((variable) => (
                      <button
                        key={variable.id}
                        onClick={() => handleInsert(variable)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-muted transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {isRTL ? variable.nameAr : variable.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {variable.placeholder}
                          </div>
                        </div>
                        {variable.required && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 h-4 ml-1"
                          >
                            {isRTL ? 'مطلوب' : 'Required'}
                          </Badge>
                        )}
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {Object.keys(filteredVariables).length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isRTL ? 'لا توجد متغيرات مطابقة' : 'No matching variables'}
              </div>
            )}
          </div>
        </div>

        {/* Footer with hint */}
        <div className="p-2 border-t bg-muted/30 text-[10px] text-muted-foreground">
          {isRTL
            ? 'انقر على متغير لإدراجه في الموضع الحالي'
            : 'Click a variable to insert it at the current position'}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default VariablePicker;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Scale,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  onMenuClick?: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      label: isArabic ? 'الرئيسية' : 'Home',
      exact: true,
    },
    {
      href: `/${locale}/dashboard/documents`,
      icon: FileText,
      label: isArabic ? 'المستندات' : 'Docs',
    },
    {
      href: `/${locale}/dashboard/generate`,
      icon: Sparkles,
      label: isArabic ? 'إنشاء' : 'Create',
      highlight: true,
    },
    {
      href: `/${locale}/dashboard/advisor`,
      icon: Scale,
      label: isArabic ? 'المستشار' : 'Advisor',
    },
    {
      action: onMenuClick,
      icon: Menu,
      label: isArabic ? 'المزيد' : 'More',
    },
  ];

  const isActive = (href?: string, exact?: boolean) => {
    if (!href) return false;
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item, index) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;

          if (item.action) {
            return (
              <button
                key={index}
                onClick={item.action}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px]"
              >
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                  'text-muted-foreground'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href!}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px] -mt-4"
              >
                <div className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg',
                  active
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'bg-primary text-primary-foreground'
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  'text-[10px] font-medium mt-1',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px]"
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-[10px] font-medium mt-0.5',
                active ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

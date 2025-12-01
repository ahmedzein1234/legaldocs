'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  HelpCircle,
  X,
  Sparkles,
  Scale,
  PenTool,
  Handshake,
  ScanLine,
  Shield,
  ChevronRight,
  ChevronDown,
  LogOut,
  Star,
  StarOff,
  Clock,
  Plus,
  Briefcase,
  Home,
  Cpu,
  Wrench,
  Crown,
  TrendingUp,
  Zap,
  Users,
  Gavel,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  labelAr?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  exact?: boolean;
  description?: string;
  descriptionAr?: string;
}

interface NavSection {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    ai: true,
    tools: true,
    marketplace: true,
  });

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState<string[]>([]);

  // Recent pages state
  const [recentPages, setRecentPages] = useState<string[]>([]);

  // Load favorites and recent from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sidebar-favorites');
    const savedRecent = localStorage.getItem('sidebar-recent');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentPages(JSON.parse(savedRecent));
  }, []);

  // Save recent page
  useEffect(() => {
    if (pathname) {
      setRecentPages(prev => {
        const updated = [pathname, ...prev.filter(p => p !== pathname)].slice(0, 5);
        localStorage.setItem('sidebar-recent', JSON.stringify(updated));
        return updated;
      });
    }
  }, [pathname]);

  // Toggle favorite
  const toggleFavorite = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(href)
        ? prev.filter(f => f !== href)
        : [...prev, href];
      localStorage.setItem('sidebar-favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle section
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Navigation sections
  const navSections: NavSection[] = [
    {
      id: 'main',
      title: 'Main',
      titleAr: 'الرئيسية',
      icon: Home,
      collapsible: false,
      defaultOpen: true,
      items: [
        {
          href: `/${locale}/dashboard`,
          icon: LayoutDashboard,
          label: 'Dashboard',
          labelAr: 'لوحة التحكم',
          exact: true,
          description: 'Overview & stats',
          descriptionAr: 'نظرة عامة والإحصائيات',
        },
        {
          href: `/${locale}/dashboard/documents`,
          icon: FileText,
          label: 'Documents',
          labelAr: 'المستندات',
          description: 'Manage documents',
          descriptionAr: 'إدارة المستندات',
        },
        {
          href: `/${locale}/dashboard/templates`,
          icon: FolderOpen,
          label: 'Templates',
          labelAr: 'القوالب',
          description: 'Document templates',
          descriptionAr: 'قوالب المستندات',
        },
      ],
    },
    {
      id: 'ai',
      title: 'AI Tools',
      titleAr: 'أدوات الذكاء',
      icon: Cpu,
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          href: `/${locale}/dashboard/generate`,
          icon: Sparkles,
          label: 'AI Generate',
          labelAr: 'إنشاء بالذكاء',
          badge: 'AI',
          badgeVariant: 'default',
          description: 'Create with AI',
          descriptionAr: 'إنشاء بالذكاء الاصطناعي',
        },
        {
          href: `/${locale}/dashboard/advisor`,
          icon: Scale,
          label: 'Legal Advisor',
          labelAr: 'المستشار القانوني',
          badge: 'AI',
          badgeVariant: 'default',
          description: 'Get legal advice',
          descriptionAr: 'احصل على استشارة قانونية',
        },
        {
          href: `/${locale}/dashboard/negotiate`,
          icon: Handshake,
          label: 'Negotiate',
          labelAr: 'التفاوض',
          badge: 'New',
          badgeVariant: 'secondary',
          description: 'Contract negotiation',
          descriptionAr: 'التفاوض على العقود',
        },
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      titleAr: 'الأدوات',
      icon: Wrench,
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          href: `/${locale}/dashboard/signatures`,
          icon: PenTool,
          label: 'Signatures',
          labelAr: 'التوقيعات',
          description: 'Digital signing',
          descriptionAr: 'التوقيع الرقمي',
        },
        {
          href: `/${locale}/dashboard/scan`,
          icon: ScanLine,
          label: 'OCR Scanner',
          labelAr: 'ماسح OCR',
          description: 'Extract from images',
          descriptionAr: 'استخراج من الصور',
        },
        {
          href: `/${locale}/dashboard/certify`,
          icon: Shield,
          label: 'Certify',
          labelAr: 'التوثيق',
          badge: 'New',
          badgeVariant: 'secondary',
          description: 'Blockchain certification',
          descriptionAr: 'التوثيق بالبلوكشين',
        },
      ],
    },
    {
      id: 'marketplace',
      title: 'Legal Marketplace',
      titleAr: 'السوق القانوني',
      icon: Gavel,
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          href: `/${locale}/dashboard/lawyers`,
          icon: Users,
          label: 'Find Lawyers',
          labelAr: 'ابحث عن محامي',
          badge: 'New',
          badgeVariant: 'secondary',
          description: 'Browse verified lawyers',
          descriptionAr: 'تصفح المحامين المعتمدين',
        },
        {
          href: `/${locale}/dashboard/lawyers/requests`,
          icon: FileText,
          label: 'My Requests',
          labelAr: 'طلباتي',
          description: 'Track your quotes',
          descriptionAr: 'تتبع عروض الأسعار',
        },
        {
          href: `/${locale}/dashboard/lawyer-portal`,
          icon: Briefcase,
          label: 'Lawyer Portal',
          labelAr: 'بوابة المحامي',
          badge: 'Pro',
          badgeVariant: 'default',
          description: 'Manage your practice',
          descriptionAr: 'إدارة ممارستك',
        },
      ],
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
      label: 'Settings',
      labelAr: 'الإعدادات',
    },
    {
      href: `/${locale}/dashboard/help`,
      icon: HelpCircle,
      label: 'Help',
      labelAr: 'المساعدة',
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Get all items for favorites lookup
  const allItems = navSections.flatMap(s => s.items);

  // Favorite items
  const favoriteItems = favorites
    .map(href => allItems.find(item => item.href === href))
    .filter(Boolean) as NavItem[];

  const NavLink = ({
    item,
    showFavorite = true,
    compact = false,
  }: {
    item: NavItem;
    showFavorite?: boolean;
    compact?: boolean;
  }) => {
    const active = isActive(item.href, item.exact);
    const isFavorite = favorites.includes(item.href);

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
          compact ? 'px-3 py-2' : 'px-3 py-2.5',
          active
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-primary-foreground/50" />
        )}

        <item.icon className={cn(
          'h-5 w-5 flex-shrink-0 transition-all duration-200',
          !active && 'group-hover:scale-110 group-hover:text-primary'
        )} />

        <div className="flex-1 min-w-0">
          <span className="block truncate">
            {isArabic ? (item.labelAr || item.label) : item.label}
          </span>
          {!compact && item.description && (
            <span className={cn(
              'block text-xs truncate',
              active ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}>
              {isArabic ? (item.descriptionAr || item.description) : item.description}
            </span>
          )}
        </div>

        {/* Badge */}
        {item.badge && (
          <Badge
            variant={item.badgeVariant || 'default'}
            className={cn(
              'text-[10px] px-1.5 py-0 h-5',
              active && item.badgeVariant !== 'secondary' && 'bg-primary-foreground/20 text-primary-foreground'
            )}
          >
            {item.badge}
          </Badge>
        )}

        {/* Favorite button */}
        {showFavorite && (
          <button
            onClick={(e) => toggleFavorite(item.href, e)}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10',
              isFavorite && 'opacity-100'
            )}
          >
            {isFavorite ? (
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Active arrow */}
        {active && (
          <ChevronRight className="h-4 w-4 opacity-70" />
        )}
      </Link>
    );
  };

  const SectionHeader = ({ section }: { section: NavSection }) => {
    const isOpen = openSections[section.id] ?? section.defaultOpen;

    return (
      <button
        onClick={() => section.collapsible && toggleSection(section.id)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
          section.collapsible && 'hover:text-foreground cursor-pointer'
        )}
      >
        <section.icon className="h-4 w-4" />
        <span className="flex-1 text-start">
          {isArabic ? section.titleAr : section.title}
        </span>
        {section.collapsible && (
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform duration-200',
            !isOpen && '-rotate-90'
          )} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 w-72 bg-background border-e flex flex-col transition-transform duration-300 ease-out md:translate-x-0 md:static md:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">LegalDocs</span>
              <span className="block text-xs text-muted-foreground">
                {isArabic ? 'الوثائق القانونية' : 'Legal Documents'}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b">
          <Link href={`/${locale}/dashboard/generate`} onClick={onClose}>
            <Button className="w-full gap-2 h-11 rounded-xl shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-5 w-5" />
              <span className="font-medium">
                {isArabic ? 'مستند جديد' : 'New Document'}
              </span>
              <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-0">
                AI
              </Badge>
            </Button>
          </Link>
        </div>

        {/* Favorites Section */}
        {favoriteItems.length > 0 && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isArabic ? 'المفضلة' : 'Favorites'}
              </span>
            </div>
            <div className="space-y-1">
              {favoriteItems.map((item) => (
                <NavLink key={item.href} item={item} showFavorite={false} compact />
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
          {navSections.map((section) => {
            const isOpen = openSections[section.id] ?? section.defaultOpen;
            return (
              <div key={section.id}>
                <SectionHeader section={section} />
                {isOpen && (
                  <div className="space-y-1 mt-1">
                    {section.items.map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Usage Stats */}
        <div className="hidden md:block px-4 py-3 border-t">
          <div className="rounded-xl bg-muted/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {isArabic ? 'استخدامك هذا الشهر' : 'Your usage this month'}
              </span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-blue-500 rounded-full" />
                </div>
              </div>
              <span className="text-xs font-medium">75%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic ? '15 من 20 مستند' : '15 of 20 documents'}
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} showFavorite={false} compact />
          ))}

          {/* Logout button */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
            <LogOut className="h-5 w-5" />
            <span>{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>

        {/* Pro upgrade card - Desktop only */}
        <div className="hidden md:block p-4 border-t">
          <div className="rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-4 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5" />
                <span className="font-bold text-sm">
                  {isArabic ? 'ترقية للمحترف' : 'Upgrade to Pro'}
                </span>
              </div>
              <p className="text-xs text-white/80 mb-3">
                {isArabic
                  ? 'مستندات غير محدودة، دعم أولوية، وميزات حصرية'
                  : 'Unlimited docs, priority support & exclusive features'}
              </p>
              <Button size="sm" variant="secondary" className="w-full text-xs font-semibold bg-white text-orange-600 hover:bg-white/90">
                <Zap className="h-3.5 w-3.5 me-1" />
                {isArabic ? 'ترقية الآن' : 'Upgrade Now'}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2025 LegalDocs</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {isArabic ? 'متصل' : 'Online'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, Bell, Search, Command, User, Settings, LogOut, Shield, CreditCard, Zap, Briefcase, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from './language-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { CommandPalette } from '@/components/ui/command-palette';
import { useTheme } from '@/components/ui/theme-switcher';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useUserPreferences } from '@/lib/user-preferences-context';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { preferences, toggleInterfaceMode, isProMode, isSimpleMode } = useUserPreferences();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const notifications = [
    { id: 1, title: 'Document signed', message: 'Ahmed Hassan signed the contract', time: '2m ago', unread: true },
    { id: 2, title: 'Review requested', message: 'New document needs your review', time: '1h ago', unread: true },
    { id: 3, title: 'Export complete', message: 'Your document export is ready', time: '3h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          {/* Mobile menu button - hidden on desktop, hidden on mobile (we use bottom nav) */}
          <Button variant="ghost" size="icon" className="hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-semibold">
            <Image
              src="/logo.jpg"
              alt="Qannoni"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
              priority
            />
            <span className="hidden sm:inline-block text-lg">Qannoni</span>
          </Link>

          {/* Search / Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border transition-colors flex-1 max-w-md mx-4"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-start">{locale === 'ar' ? 'بحث...' : 'Search anything...'}</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-xs font-mono">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowCommandPalette(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Spacer */}
          <div className="flex-1 md:hidden" />

          {/* Right side actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mode Toggle */}
            <div className="relative hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModeMenu(!showModeMenu)}
                className={cn(
                  'gap-2 rounded-full px-3 h-9 font-medium transition-all',
                  isProMode
                    ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-indigo-500/20'
                    : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 hover:from-green-500/20 hover:to-emerald-500/20'
                )}
              >
                {isProMode ? (
                  <>
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden md:inline">Pro</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span className="hidden md:inline">{locale === 'ar' ? 'بسيط' : 'Simple'}</span>
                  </>
                )}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>

              {/* Mode dropdown */}
              {showModeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeMenu(false)}
                  />
                  <div className="absolute end-0 top-full mt-2 w-64 rounded-xl border bg-background shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-2">
                    <button
                      onClick={() => {
                        if (isProMode) toggleInterfaceMode();
                        setShowModeMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                        isSimpleMode ? 'bg-green-500/10' : 'hover:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isSimpleMode ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'
                      )}>
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="text-start flex-1">
                        <p className="font-medium text-sm">{locale === 'ar' ? 'الوضع البسيط' : 'Simple Mode'}</p>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'ar' ? 'واجهة سهلة للمبتدئين' : 'Easy interface for beginners'}
                        </p>
                      </div>
                      {isSimpleMode && (
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600">
                          {locale === 'ar' ? 'نشط' : 'Active'}
                        </Badge>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (isSimpleMode) toggleInterfaceMode();
                        setShowModeMenu(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                        isProMode ? 'bg-purple-500/10' : 'hover:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isProMode ? 'bg-purple-500/20 text-purple-600' : 'bg-muted text-muted-foreground'
                      )}>
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="text-start flex-1">
                        <p className="font-medium text-sm">{locale === 'ar' ? 'الوضع المتقدم' : 'Pro Mode'}</p>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'ar' ? 'جميع الميزات للمحترفين' : 'All features for professionals'}
                        </p>
                      </div>
                      {isProMode && (
                        <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-600">
                          {locale === 'ar' ? 'نشط' : 'Active'}
                        </Badge>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Theme Switcher - compact on mobile */}
            <ThemeSwitcher compact />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute end-0 top-full mt-2 w-80 rounded-xl border bg-background shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">{locale === 'ar' ? 'الإشعارات' : 'Notifications'}</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors',
                            notification.unread && 'bg-primary/5'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {notification.unread && (
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <div className={cn('flex-1', !notification.unread && 'ms-5')}>
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t">
                      <Button variant="ghost" size="sm" className="w-full">
                        {locale === 'ar' ? 'عرض الكل' : 'View all notifications'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar className="h-9 w-9 ring-2 ring-background">
                  <AvatarImage src={user?.avatarUrl || ''} alt={user?.fullName || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute end-0 top-full mt-2 w-64 rounded-xl border bg-background shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User info */}
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatarUrl || ''} alt={user?.fullName || 'User'} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user?.fullName || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <Link
                        href={`/${locale}/dashboard/settings`}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{locale === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                      </Link>
                      <Link
                        href={`/${locale}/dashboard/settings`}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                      </Link>
                      <Link
                        href={`/${locale}/dashboard/signatures`}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>{locale === 'ar' ? 'الأمان' : 'Security'}</span>
                      </Link>
                      <Link
                        href={`/${locale}/dashboard`}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>{locale === 'ar' ? 'الفواتير' : 'Billing'}</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? (locale === 'ar' ? 'جاري الخروج...' : 'Logging out...') : (locale === 'ar' ? 'تسجيل الخروج' : 'Log out')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          onThemeToggle={toggleTheme}
          currentTheme={resolvedTheme}
        />
      )}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ToastProvider } from '@/components/ui/toast';
import { AuthGuard } from '@/components/auth/auth-guard';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { useUserPreferences } from '@/lib/user-preferences-context';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { preferences, isLoading } = useUserPreferences();

  // Show onboarding modal if user hasn't completed it
  useEffect(() => {
    if (!isLoading && !preferences.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isLoading, preferences.hasCompletedOnboarding]);

  return (
    <>
      <div className="min-h-screen bg-muted/30">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">{children}</main>
        </div>
        <MobileNav onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth>
      <ToastProvider>
        <DashboardContent>{children}</DashboardContent>
      </ToastProvider>
    </AuthGuard>
  );
}

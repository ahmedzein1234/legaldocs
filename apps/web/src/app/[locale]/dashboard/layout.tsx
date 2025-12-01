'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ToastProvider } from '@/components/ui/toast';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard requireAuth>
      <ToastProvider>
        <div className="min-h-screen bg-muted/30">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">{children}</main>
          </div>
          <MobileNav onMenuClick={() => setSidebarOpen(true)} />
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}

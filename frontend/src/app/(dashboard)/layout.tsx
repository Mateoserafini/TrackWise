'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-raisin-950 flex items-center justify-center">
        <div className="font-mono text-xs text-timberwolf-400 tracking-wider animate-pulse">
          VERIFICANDO SESIÓN DE USUARIO...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-raisin-950 flex flex-col md:flex-row antialiased overflow-x-hidden max-w-[100vw]">
      {/* Desktop Sidebar (≥ 768px) */}
      <DesktopSidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8 max-w-full overflow-x-hidden">
        <TopNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileBottomNav />
    </div>
  );
}

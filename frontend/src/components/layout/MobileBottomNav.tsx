'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, LayoutDashboard, Settings, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Inicio',
      href: '/overview',
      icon: LayoutDashboard,
    },
    {
      label: 'Finanzas',
      href: '/finances',
      icon: Wallet,
    },
    {
      label: 'Hábitos',
      href: '/habits',
      icon: CheckSquare,
    },
    {
      label: 'Ajustes',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-raisin-950/90 backdrop-blur-lg border-t border-raisin-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 min-h-[48px] relative',
                isActive
                  ? 'text-coral-400 font-semibold'
                  : 'text-timberwolf-400 hover:text-timberwolf-200'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  isActive ? 'bg-coral-500/20 text-coral-400 scale-105' : 'text-current'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider mt-0.5">
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-coral-500 rounded-full shadow-[0_0_8px_#FC2626]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

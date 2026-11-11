'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Flame, LayoutDashboard, Settings, Wallet, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DesktopSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      index: '01',
      label: 'Visión General',
      href: '/overview',
      icon: LayoutDashboard,
      tag: 'OVERVIEW',
    },
    {
      index: '02',
      label: 'Finanzas',
      href: '/finances',
      icon: Wallet,
      tag: 'FLOW',
    },
    {
      index: '03',
      label: 'Hábitos',
      href: '/habits',
      icon: CheckSquare,
      tag: 'STREAK',
    },
    {
      index: '04',
      label: 'Ajustes',
      href: '/settings',
      icon: Settings,
      tag: 'CONFIG',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-raisin-border bg-raisin-950 min-h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-raisin-border flex flex-col gap-1">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center text-white shadow-brutal transition-transform group-hover:scale-105">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold tracking-widest text-timberwolf-100 uppercase">
                TRACKWISE
              </span>
              <span className="font-mono text-[9px] bg-raisin-800 text-coral-400 px-1 py-0.5 rounded border border-coral-500/30">
                v1.0
              </span>
            </div>
            <p className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-widest">
              [LIFE // OS ENGINE]
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-timberwolf-500">
          // NAVEGACIÓN PRINCIPAL
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all duration-150',
                isActive
                  ? 'bg-raisin-850 border-coral-500/80 text-timberwolf-100 shadow-[0_0_15px_rgba(252,38,38,0.12)]'
                  : 'bg-raisin-900/40 border-transparent text-timberwolf-400 hover:text-timberwolf-100 hover:bg-raisin-850 hover:border-raisin-border'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-coral-500 text-white'
                      : 'bg-raisin-800 text-timberwolf-400 group-hover:text-timberwolf-100 group-hover:bg-raisin-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-semibold tracking-tight">
                    {item.label}
                  </span>
                  <span className="block font-mono text-[9px] text-timberwolf-500 uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  'font-mono text-[10px] transition-colors',
                  isActive ? 'text-coral-400 font-bold' : 'text-timberwolf-600 group-hover:text-timberwolf-400'
                )}
              >
                {item.index}
              </span>

              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-coral-500 rounded-r shadow-[0_0_8px_#FC2626]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-raisin-border">
        <div className="p-3.5 rounded-xl bg-raisin-900 border border-raisin-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-timberwolf-400 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              FOCUS MODE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
          </div>
          <p className="text-[11px] text-timberwolf-400 leading-snug">
            Control de hábitos diarios y finanzas personales sincronizados sin fricción.
          </p>
        </div>
      </div>
    </aside>
  );
}

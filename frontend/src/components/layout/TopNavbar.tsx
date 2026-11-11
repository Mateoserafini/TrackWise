'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, User as UserIcon, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function TopNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-raisin-950/80 backdrop-blur-md border-b border-raisin-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Left: Mobile Brand */}
        <div className="flex items-center gap-3">
          <Link href="/overview" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center text-white shadow-brutal transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold tracking-widest text-timberwolf-100 uppercase">
                  TrackWise
                </span>
                <span className="font-mono text-[9px] bg-raisin-700 text-coral-400 px-1 rounded border border-coral-500/30">
                  OS
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Status & User Info */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-raisin-900 border border-raisin-border px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
            <span className="font-mono text-[10px] text-timberwolf-300 tracking-wider uppercase">
              ONLINE // 2026
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-raisin-border">
              <div className="flex items-center gap-2 bg-raisin-900/90 border border-timberwolf-300/20 rounded-xl px-3 py-1.5">
                <div className="w-6 h-6 rounded-lg bg-coral-500/20 text-coral-400 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-xs font-semibold text-timberwolf-100 max-w-[120px] truncate">
                  {user.username}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                className="w-9 h-9 rounded-xl bg-raisin-900 border border-raisin-border hover:border-coral-500/60 hover:text-coral-400 text-timberwolf-400 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

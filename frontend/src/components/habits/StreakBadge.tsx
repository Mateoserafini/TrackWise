'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreakBadgeProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function StreakBadge({ streak, className, size = 'md' }: StreakBadgeProps) {
  const isSm = size === 'sm';
  const hasStreak = streak > 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono font-bold border transition-all duration-200 select-none',
        hasStreak
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
          : 'bg-raisin-800 border-raisin-border text-timberwolf-500',
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Flame
        className={cn(
          isSm ? 'w-3 h-3' : 'w-3.5 h-3.5',
          hasStreak ? 'text-amber-400 fill-amber-400/30 animate-pulse' : 'text-timberwolf-500'
        )}
      />
      <span>
        {streak} {streak === 1 ? 'DÍA' : 'DÍAS'}
      </span>
    </div>
  );
}

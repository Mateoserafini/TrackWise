'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'coral' | 'emerald' | 'amber' | 'cobalt' | 'neutral' | 'outline';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    coral: 'bg-coral-500/15 text-coral-400 border-coral-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    cobalt: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    neutral: 'bg-raisin-700 text-timberwolf-200 border-raisin-border',
    outline: 'bg-transparent text-timberwolf-300 border-timberwolf-300/30',
  };

  const dotColors = {
    coral: 'bg-coral-500 shadow-[0_0_8px_rgba(252,38,38,0.8)]',
    emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    amber: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    cobalt: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
    neutral: 'bg-timberwolf-400',
    outline: 'bg-timberwolf-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] font-medium px-2.5 py-0.5 rounded-full border tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

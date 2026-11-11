'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  indexTag?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'brutal' | 'ghost';
}

export function Card({
  className,
  indexTag,
  badge,
  title,
  subtitle,
  action,
  children,
  variant = 'default',
  ...props
}: CardProps) {
  const variants = {
    default:
      'bg-raisin-900 border border-raisin-border hover:border-timberwolf-300/25 shadow-card transition-all duration-200',
    elevated:
      'bg-raisin-850 border border-timberwolf-300/20 shadow-card-elevated hover:border-coral-500/40 transition-all duration-200',
    brutal:
      'bg-raisin-900 border-2 border-timberwolf-300/40 shadow-brutal hover:shadow-coral-glow transition-all duration-200',
    ghost:
      'bg-raisin-900/40 border border-raisin-border/60 hover:border-timberwolf-300/20 backdrop-blur-sm',
  };

  return (
    <div
      className={cn('rounded-2xl p-4 sm:p-5 md:p-6 relative overflow-hidden', variants[variant], className)}
      {...props}
    >
      {(indexTag || badge || title || action) && (
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-raisin-border/70 shrink-0">
          <div className="min-w-0 flex-1">
            {(indexTag || badge) && (
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {indexTag && (
                  <span className="font-mono text-[10px] font-bold text-coral-500 uppercase tracking-widest shrink-0">
                    {indexTag}
                  </span>
                )}
                {badge && (
                  <span className="font-mono text-[10px] bg-raisin-700 text-timberwolf-300 px-2 py-0.5 rounded border border-raisin-border uppercase tracking-wider shrink-0">
                    {badge}
                  </span>
                )}
              </div>
            )}
            {title && (
              <h4 className="text-sm md:text-base font-bold text-timberwolf-100 tracking-tight">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-xs text-timberwolf-500 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

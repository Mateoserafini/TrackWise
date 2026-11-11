'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  tag?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  tag = '[EMPTY // NULL]',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-timberwolf-300/20 bg-raisin-900/40 relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-3 left-4 font-mono text-[9px] text-timberwolf-500 uppercase tracking-widest">
        {tag}
      </div>

      <div className="w-14 h-14 rounded-2xl bg-raisin-850 border border-raisin-border flex items-center justify-center text-coral-500 mb-4 shadow-card">
        {icon}
      </div>

      <h4 className="text-base font-bold text-timberwolf-100 font-sans tracking-tight mb-1">
        {title}
      </h4>

      <p className="text-xs text-timberwolf-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

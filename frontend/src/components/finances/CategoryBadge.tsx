'use client';

import React from 'react';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { cn } from '@/lib/utils';

export interface CategoryBadgeProps {
  name: string;
  icon: string;
  color?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({
  name,
  icon,
  color = '#FC2626',
  className,
  size = 'md',
}: CategoryBadgeProps) {
  const isSm = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-mono font-medium transition-colors select-none',
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <DynamicIcon name={icon} className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="truncate max-w-[120px]">{name}</span>
    </span>
  );
}

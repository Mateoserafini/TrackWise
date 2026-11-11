'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Tag } from 'lucide-react';

export interface DynamicIconProps extends LucideIcons.LucideProps {
  name: string;
}

export function DynamicIcon({ name, className, ...props }: DynamicIconProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as Record<string, any>)[name] || Tag;
  return <IconComponent className={className} {...props} />;
}

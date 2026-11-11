'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export interface AuthCardProps {
  tag?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({
  tag = '[SECURE // ACCESS_GATE]',
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-raisin-900 border border-timberwolf-300/20 rounded-3xl p-6 sm:p-8 shadow-card-elevated relative overflow-hidden backdrop-blur-sm">
        {/* Top Tag & Logo */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-raisin-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center text-white shadow-brutal transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-mono text-xs font-bold tracking-widest text-timberwolf-100 uppercase">
              TRACKWISE
            </span>
          </Link>
          <span className="font-mono text-[9px] text-coral-400 font-bold uppercase tracking-widest bg-coral-500/10 px-2 py-0.5 rounded border border-coral-500/20">
            {tag}
          </span>
        </div>

        {/* Headings */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-timberwolf-100 font-sans tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-timberwolf-400 mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 pt-5 border-t border-raisin-border text-center">{footer}</div>}
      </div>
    </div>
  );
}

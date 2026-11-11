'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-medium select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-raisin-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]';

    const variants = {
      primary:
        'bg-coral-500 hover:bg-coral-400 active:bg-coral-600 text-white shadow-brutal border border-coral-400 tracking-wider uppercase',
      secondary:
        'bg-raisin-700 hover:bg-raisin-600 active:bg-raisin-800 text-timberwolf-100 border border-raisin-border hover:border-timberwolf-300/40 tracking-wider',
      outline:
        'bg-transparent hover:bg-raisin-800 text-timberwolf-200 hover:text-timberwolf-100 border border-timberwolf-300/25 hover:border-coral-500/60 tracking-wider',
      danger:
        'bg-coral-700/20 hover:bg-coral-600 active:bg-coral-700 text-coral-400 hover:text-white border border-coral-500/50 tracking-wider',
      ghost:
        'bg-transparent hover:bg-raisin-800/80 text-timberwolf-400 hover:text-timberwolf-100 tracking-wider',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[36px]',
      md: 'text-xs md:text-sm px-4 py-2.5 rounded-xl gap-2 min-h-[44px]',
      lg: 'text-sm md:text-base px-6 py-3.5 rounded-xl gap-2.5 min-h-[48px]',
      icon: 'w-10 h-10 p-2 rounded-xl flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

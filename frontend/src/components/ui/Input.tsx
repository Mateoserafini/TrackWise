'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={generatedId}
            className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-timberwolf-500">
              {leftIcon}
            </div>
          )}
          <input
            id={generatedId}
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-raisin-900 border text-timberwolf-100 placeholder:text-timberwolf-600 font-sans text-sm rounded-xl px-4 py-2.5 transition-all duration-200 outline-none',
              'focus:bg-raisin-850 focus:border-coral-500 focus:ring-1 focus:ring-coral-500',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              error
                ? 'border-coral-500/80 bg-coral-950/20 focus:border-coral-400 focus:ring-coral-400'
                : 'border-raisin-border hover:border-timberwolf-300/30',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-timberwolf-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="font-mono text-xs text-coral-400 flex items-center gap-1 mt-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-timberwolf-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

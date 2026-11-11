'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputBoxProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInputBox({ length = 6, value, onChange, disabled = false }: OtpInputBoxProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty input on mount
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputsRef.current[targetIndex]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      // Clear current digit
      const next = digits.slice();
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    // Single or multiple digits
    const next = digits.slice();
    if (val.length > 1) {
      // Paste of multiple chars
      for (let i = 0; i < val.length && index + i < length; i++) {
        next[index + i] = val[i]!;
      }
      onChange(next.join(''));
      const nextFocus = Math.min(length - 1, index + val.length);
      inputsRef.current[nextFocus]?.focus();
      return;
    }

    next[index] = val[val.length - 1]!;
    onChange(next.join(''));

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const targetIdx = Math.min(length - 1, pasted.length);
    inputsRef.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 py-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-13 sm:w-13 sm:h-16 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border bg-raisin-850 text-timberwolf-100 transition-all duration-150 outline-none select-none',
            'focus:border-coral-500 focus:bg-raisin-800 focus:ring-2 focus:ring-coral-500/30 focus:shadow-[0_0_12px_rgba(252,38,38,0.25)]',
            digit
              ? 'border-coral-500/60 bg-raisin-800 text-coral-400'
              : 'border-raisin-border hover:border-timberwolf-300/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
}

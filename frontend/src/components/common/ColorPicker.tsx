'use client';

import React from 'react';
import { COLOR_PALETTE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  className?: string;
}

export function ColorPicker({ selectedColor, onSelectColor, className }: ColorPickerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-8 gap-2">
        {COLOR_PALETTE.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onSelectColor(color.hex)}
              title={color.name}
              className={cn(
                'w-full aspect-square rounded-lg transition-transform cursor-pointer relative flex items-center justify-center',
                isSelected
                  ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-raisin-900 shadow-lg'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div
          className="w-8 h-8 rounded-lg border border-raisin-border shrink-0 shadow-inner"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="relative flex-1">
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => onSelectColor(e.target.value)}
            placeholder="#FC2626"
            className="w-full bg-raisin-850 border border-raisin-border text-xs rounded-xl px-3 py-2 font-mono text-timberwolf-100 uppercase focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500"
          />
        </div>
      </div>
    </div>
  );
}

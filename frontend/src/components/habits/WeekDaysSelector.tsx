'use client';

import React from 'react';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface WeekDaysSelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  className?: string;
}

export function WeekDaysSelector({
  selectedDays,
  onChange,
  className,
}: WeekDaysSelectorProps) {
  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length <= 1) return; // Prevent removing last active day
      onChange(selectedDays.filter((d) => d !== dayId));
    } else {
      onChange([...selectedDays, dayId].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    onChange([0, 1, 2, 3, 4, 5, 6]);
  };

  const selectWeekdays = () => {
    onChange([1, 2, 3, 4, 5]);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer',
                isSelected
                  ? 'bg-coral-500 text-white border-coral-400 shadow-[0_0_10px_rgba(252,38,38,0.35)] scale-102'
                  : 'bg-raisin-900 text-timberwolf-500 border-raisin-border hover:border-timberwolf-300/30 hover:text-timberwolf-300'
              )}
            >
              <span>{day.label}</span>
              <span className="text-[8px] font-normal opacity-70 hidden sm:inline">
                {day.name.slice(0, 3)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
        <button
          type="button"
          onClick={selectAll}
          className="text-coral-400 hover:text-coral-300 underline cursor-pointer"
        >
          Todos los días
        </button>
        <span className="text-timberwolf-600">•</span>
        <button
          type="button"
          onClick={selectWeekdays}
          className="text-timberwolf-400 hover:text-timberwolf-200 underline cursor-pointer"
        >
          Lunes a Viernes
        </button>
      </div>
    </div>
  );
}

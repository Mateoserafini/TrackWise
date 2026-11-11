'use client';

import React from 'react';
import { Check, Edit2, Trash2 } from 'lucide-react';
import { StreakBadge } from './StreakBadge';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Habit } from '@/types/habit.types';

export interface HabitCheckCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  isCompact?: boolean;
}

export function HabitCheckCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  isCompact = false,
}: HabitCheckCardProps) {
  const isCompleted = habit.completed_today ?? false;
  const habitColor = habit.color || '#10B981';
  const streak = habit.current_streak || 0;

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between w-full min-w-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden',
        isCompleted
          ? 'bg-raisin-850/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
          : 'bg-raisin-900 border-raisin-border hover:border-timberwolf-300/30'
      )}
    >
      {/* Side Color Glow Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 transition-all"
        style={{
          backgroundColor: isCompleted ? '#10B981' : habitColor,
          boxShadow: isCompleted ? '0 0 10px #10B981' : undefined,
        }}
      />

      {/* Left: Check Button & Details */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 pl-1.5 sm:pl-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggle(habit.id)}
          className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 active:scale-95',
            isCompleted
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-102'
              : 'bg-raisin-800 border-timberwolf-300/30 text-transparent hover:border-coral-500 hover:text-coral-500/50'
          )}
          aria-label={isCompleted ? `Desmarcar ${habit.name}` : `Marcar ${habit.name} como completado`}
        >
          <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'text-xs sm:text-sm md:text-base font-bold tracking-tight truncate transition-colors',
                isCompleted ? 'text-timberwolf-200 line-through opacity-80' : 'text-timberwolf-100'
              )}
            >
              {habit.name}
            </h4>
          </div>

          {habit.description && !isCompact && (
            <p className="text-[11px] sm:text-xs text-timberwolf-500 mt-0.5 line-clamp-1">
              {habit.description}
            </p>
          )}

          {/* Days of week chips */}
          {!isCompact && (
            <div className="flex items-center gap-1 mt-1.5 sm:mt-2 overflow-x-auto scrollbar-none py-0.5">
              {DAYS_OF_WEEK.map((d) => {
                const isActive = habit.days_of_week.includes(d.id);
                return (
                  <span
                    key={d.id}
                    className={cn(
                      'w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center font-mono text-[8px] sm:text-[9px] font-bold shrink-0',
                      isActive
                        ? 'bg-raisin-700 text-timberwolf-200 border border-timberwolf-300/20'
                        : 'text-timberwolf-600 opacity-40'
                    )}
                  >
                    {d.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Streak & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 pl-1.5 sm:pl-2">
        <StreakBadge streak={streak} size={isCompact ? 'sm' : 'md'} />

        {(onEdit || onDelete) && !isCompact && (
          <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(habit)}
                title="Editar hábito"
                className="p-1 sm:p-1.5 rounded-lg text-timberwolf-400 hover:text-timberwolf-100 hover:bg-raisin-750 transition-colors cursor-pointer"
                aria-label="Editar hábito"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                title="Archivar hábito"
                className="p-1 sm:p-1.5 rounded-lg text-timberwolf-500 hover:text-coral-400 hover:bg-raisin-750 transition-colors cursor-pointer"
                aria-label="Archivar hábito"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { HabitCheckCard } from './HabitCheckCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Habit } from '@/types/habit.types';

export interface HabitListProps {
  habits: Habit[];
  isLoading?: boolean;
  onToggleHabit: (habitId: string) => void;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => Promise<boolean>;
  onOpenCreateModal?: () => void;
  filterTodayOnly?: boolean;
}

export function HabitList({
  habits,
  isLoading = false,
  onToggleHabit,
  onEditHabit,
  onDeleteHabit,
  onOpenCreateModal,
  filterTodayOnly = false,
}: HabitListProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayDayOfWeek = new Date().getDay();

  const displayedHabits = filterTodayOnly
    ? habits.filter((h) => h.days_of_week.includes(todayDayOfWeek))
    : habits;

  const handleDeleteConfirm = async () => {
    if (!selectedHabitId || !onDeleteHabit) return;
    setIsDeleting(true);
    try {
      await onDeleteHabit(selectedHabitId);
      setSelectedHabitId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (displayedHabits.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="w-6 h-6" />}
        tag="[HABIT // NO_DATA]"
        title={filterTodayOnly ? 'Sin hábitos para hoy' : 'No tienes hábitos activos'}
        description={
          filterTodayOnly
            ? 'No hay hábitos programados para el día de hoy. Puedes ver todos los hábitos o agregar uno nuevo.'
            : 'Comienza construyendo rutinas sólidas creando tu primer hábito diario.'
        }
        actionLabel="Crear Nuevo Hábito"
        onAction={onOpenCreateModal}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {displayedHabits.map((habit) => (
          <HabitCheckCard
            key={habit.id}
            habit={habit}
            onToggle={onToggleHabit}
            onEdit={onEditHabit}
            onDelete={onDeleteHabit ? (id) => setSelectedHabitId(id) : undefined}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!selectedHabitId}
        onClose={() => setSelectedHabitId(null)}
        onConfirm={handleDeleteConfirm}
        title="Archivar Hábito"
        description="¿Estás seguro de que deseas archivar este hábito? Su historial pasado y rachas se mantendrán preservados en las métricas."
        confirmLabel="Sí, archivar"
        isLoading={isDeleting}
      />
    </>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { getTodayDateString } from '@/lib/formatters';
import { habitService } from '@/services/habitService';
import { Habit, HabitInput, HeatmapDay, UpdateHabitInput } from '@/types/habit.types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const todayStr = getTodayDateString();
      const [habitsRes, heatmapRes] = await Promise.all([
        habitService.getHabits(todayStr),
        habitService.getHeatmap(90),
      ]);

      if (habitsRes.success) {
        setHabits(habitsRes.data);
      }
      if (heatmapRes.success) {
        setHeatmap(heatmapRes.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar hábitos';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createHabit = async (input: HabitInput): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await habitService.createHabit(input);
      if (res.success) {
        success('Hábito creado', res.message || 'Hábito iniciado exitosamente');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear hábito';
      toastError('Error', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateHabit = async (id: string, input: UpdateHabitInput): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await habitService.updateHabit(id, input);
      if (res.success) {
        success('Hábito actualizado', res.message || 'Cambios guardados');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar hábito';
      toastError('Error', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteHabit = async (id: string): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await habitService.deleteHabit(id);
      if (res.success) {
        success('Hábito archivado', res.message || 'Hábito archivado correctamente');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al archivar hábito';
      toastError('Error', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const toggleCheckIn = async (habitId: string, targetDate?: string): Promise<boolean> => {
    const date = targetDate || getTodayDateString();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return false;

    const newCompleted = !habit.completed_today;

    // Actualización optimista inmediata
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completed_today: newCompleted,
          current_streak: Math.max(0, (h.current_streak || 0) + (newCompleted ? 1 : -1)),
        };
      })
    );

    try {
      const res = await habitService.checkIn({
        habitId,
        date,
        completed: newCompleted,
      });

      if (res.success) {
        if (newCompleted) {
          success('¡Completado!', `Check-in registrado para "${habit.name}"`);
        } else {
          success('Hábito desmarcado', `Check-in retirado para "${habit.name}"`);
        }
        // Recargar silenciosamente usando la misma fecha para sincronizar racha exacta y heatmap
        const [hRes, heatRes] = await Promise.all([
          habitService.getHabits(date),
          habitService.getHeatmap(90),
        ]);
        if (hRes.success) setHabits(hRes.data);
        if (heatRes.success) setHeatmap(heatRes.data);
        return true;
      }
      return false;
    } catch (err: unknown) {
      // Revertir optimismo en caso de fallo
      await loadData();
      const msg = err instanceof Error ? err.message : 'Error al registrar check-in';
      toastError('Fallo al actualizar', msg);
      return false;
    }
  };

  return {
    habits,
    heatmap,
    isLoading,
    isMutating,
    error,
    refresh: loadData,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCheckIn,
  };
}

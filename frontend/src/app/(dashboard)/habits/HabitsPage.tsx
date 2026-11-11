'use client';

import React, { useState } from 'react';
import { Calendar, CheckSquare, Flame, Plus, Sparkles } from 'lucide-react';
import { HabitHeatmap } from '@/components/habits/HabitHeatmap';
import { HabitList } from '@/components/habits/HabitList';
import { HabitModal } from '@/components/habits/HabitModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';
import { Habit } from '@/types/habit.types';

export default function HabitsPage() {
  const {
    habits,
    heatmap,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCheckIn,
  } = useHabits();

  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayDayOfWeek = new Date().getDay();
  const todayHabits = habits.filter((h) => h.days_of_week.includes(todayDayOfWeek));
  const completedTodayCount = todayHabits.filter((h) => h.completed_today).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak || 0), 0);

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (input: any) => {
    if (editingHabit) {
      return updateHabit(editingHabit.id, input);
    }
    return createHabit(input);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-raisin-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-coral-400 font-bold uppercase tracking-widest bg-coral-500/10 px-2 py-0.5 rounded border border-coral-500/20">
              SYS // HABIT_TRACKER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-timberwolf-100 font-sans tracking-tight mt-1">
            Tracker de Hábitos
          </h1>
          <p className="text-xs sm:text-sm text-timberwolf-400">
            Construye consistencia día tras día con cálculo automático de rachas y mapa de calor.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo Hábito
        </Button>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hábitos de Hoy */}
        <Card indexTag="[01 // TODAY_GOAL]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
              Cumplimiento de Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">
            {completedTodayCount} / {todayHabits.length}
          </div>
          <p className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider mt-2">
            {todayHabits.length > 0
              ? `${Math.round((completedTodayCount / todayHabits.length) * 100)}% de los hábitos del día`
              : 'Sin hábitos activos para hoy'}
          </p>
        </Card>

        {/* Hábitos Activos Totales */}
        <Card indexTag="[02 // ACTIVE_HABITS]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
              Hábitos Activos
            </span>
            <div className="w-8 h-8 rounded-lg bg-coral-500/15 text-coral-400 flex items-center justify-center border border-coral-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl lg:text-3xl font-extrabold text-timberwolf-100 tracking-tight">
            {habits.length}
          </div>
          <p className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider mt-2">
            Rutinas programadas en tu sistema
          </p>
        </Card>

        {/* Mejor Racha */}
        <Card indexTag="[03 // MAX_STREAK]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
              Mayor Racha Activa
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl lg:text-3xl font-extrabold text-amber-400 tracking-tight">
            {bestStreak} {bestStreak === 1 ? 'Día' : 'Días'}
          </div>
          <p className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider mt-2">
            Máxima consistencia ininterrumpida
          </p>
        </Card>
      </div>

      {/* Heatmap de Consistencia */}
      <HabitHeatmap data={heatmap} days={84} />

      {/* Selector de Pestañas & Lista de Hábitos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-raisin-900 rounded-xl border border-raisin-border">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={cn(
                'px-4 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                activeTab === 'today'
                  ? 'bg-coral-500 text-white shadow-brutal border border-coral-400'
                  : 'text-timberwolf-400 hover:text-timberwolf-200'
              )}
            >
              Para Hoy ({todayHabits.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                activeTab === 'all'
                  ? 'bg-coral-500 text-white shadow-brutal border border-coral-400'
                  : 'text-timberwolf-400 hover:text-timberwolf-200'
              )}
            >
              Todos los Hábitos ({habits.length})
            </button>
          </div>
        </div>

        <HabitList
          habits={habits}
          filterTodayOnly={activeTab === 'today'}
          isLoading={isLoading}
          onToggleHabit={toggleCheckIn}
          onEditHabit={handleOpenEdit}
          onDeleteHabit={deleteHabit}
          onOpenCreateModal={handleOpenCreate}
        />
      </div>

      {/* Modal Crear / Editar Hábito */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialHabit={editingHabit}
      />
    </div>
  );
}

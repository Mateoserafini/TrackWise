'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Flame, Plus, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { BalanceSummaryCard } from '@/components/finances/BalanceSummaryCard';
import { ExpensePieChart } from '@/components/finances/ExpensePieChart';
import { IncomeExpenseBarChart } from '@/components/finances/IncomeExpenseBarChart';
import { TransactionList } from '@/components/finances/TransactionList';
import { TransactionModal } from '@/components/finances/TransactionModal';
import { HabitCheckCard } from '@/components/habits/HabitCheckCard';
import { HabitHeatmap } from '@/components/habits/HabitHeatmap';
import { HabitModal } from '@/components/habits/HabitModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useFinances } from '@/hooks/useFinances';
import { useHabits } from '@/hooks/useHabits';
import { formatDate } from '@/lib/formatters';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { summary, transactions, isLoading: isFinLoading, createTransaction, deleteTransaction } = useFinances();
  const { habits, heatmap, isLoading: isHabitsLoading, toggleCheckIn, createHabit } = useHabits();
  const { categories } = useCategories();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  const todayDayOfWeek = new Date().getDay();
  const todayHabits = habits.filter((h) => h.days_of_week.includes(todayDayOfWeek));
  const completedTodayCount = todayHabits.filter((h) => h.completed_today).length;
  const progressPercent = todayHabits.length > 0 ? Math.round((completedTodayCount / todayHabits.length) * 100) : 0;

  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-raisin-900 border border-timberwolf-300/20 relative overflow-hidden shadow-card-elevated">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-coral-400 font-bold uppercase tracking-widest bg-coral-500/10 px-2 py-0.5 rounded border border-coral-500/20">
              SYS // UNIFIED_DASHBOARD
            </span>
            <span className="font-mono text-xs text-timberwolf-500">
              • {todayStr}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-timberwolf-100 font-sans tracking-tight">
            Hola, <span className="text-coral-500">{user?.username || 'Usuario'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-timberwolf-400 max-w-xl">
            Tu centro de comando personal. Monitorea el progreso de hábitos diarios y finanzas sincronizadas en tiempo real.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsHabitModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}
          >
            Nuevo Hábito
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsTxModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Registrar Movimiento
          </Button>
        </div>
      </div>

      {/* 1. Finanzas: Métricas del Período */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-coral-500" />
            <h2 className="text-base sm:text-lg font-bold text-timberwolf-100 tracking-tight">
              Control Financiero del Mes
            </h2>
          </div>
          <Link
            href="/finances"
            className="font-mono text-xs text-coral-400 hover:text-coral-300 flex items-center gap-1 group font-semibold uppercase tracking-wider"
          >
            Ver Detalle Completo
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isFinLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <BalanceSummaryCard
            totalIncome={summary?.total_income || 0}
            totalExpense={summary?.total_expense || 0}
            netBalance={summary?.net_balance || 0}
          />
        )}
      </div>

      {/* 2. Hábitos de Hoy & Consistencia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0 max-w-full">
        {/* Widget Hábitos de Hoy */}
        <div className="lg:col-span-5 flex flex-col min-w-0 w-full">
          <Card
            indexTag="[DAILY // HABITS]"
            title="Hábitos para Hoy"
            subtitle={`${completedTodayCount} de ${todayHabits.length} completados (${progressPercent}%)`}
            action={
              <Link
                href="/habits"
                className="font-mono text-xs text-coral-400 hover:text-coral-300 font-semibold flex items-center gap-1 group"
              >
                Gestionar
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            }
            className="flex-1 flex flex-col h-full min-h-[360px] lg:min-h-[420px]"
          >
            {/* Progress Bar */}
            <div className="space-y-2 mb-4 shrink-0">
              <div className="w-full h-2 rounded-full bg-raisin-800 overflow-hidden border border-raisin-border">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* List / Empty State */}
            {isHabitsLoading ? (
              <div className="space-y-2.5 flex-1 flex flex-col justify-center">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : todayHabits.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-timberwolf-300/20 bg-raisin-950/40 my-auto min-h-[200px]">
                <div className="w-12 h-12 rounded-xl bg-raisin-800 border border-timberwolf-300/20 text-coral-400 flex items-center justify-center mb-3 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h5 className="font-mono text-xs font-bold text-timberwolf-200 uppercase tracking-wider mb-1">
                  {habits.length === 0 ? 'Sin Hábitos Registrados' : 'Sin Hábitos para Hoy'}
                </h5>
                <p className="text-xs text-timberwolf-500 max-w-xs mb-4">
                  {habits.length === 0
                    ? 'Comienza a construir tus rachas y consistencia creando tu primer hábito.'
                    : 'No tienes rutinas asignadas para hoy. Puedes agregar una nueva rutina o gestionar las existentes.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHabitModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-coral-400" />}
                >
                  Crear Hábito
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[300px] lg:max-h-[340px] scrollbar-thin">
                {todayHabits.map((habit) => (
                  <HabitCheckCard
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleCheckIn}
                    isCompact
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Heatmap de Consistencia (90 Días) */}
        <div className="lg:col-span-7 flex flex-col min-w-0 w-full">
          <HabitHeatmap data={heatmap} days={84} className="h-full" />
        </div>
      </div>

      {/* 3. Analítica Visual de Finanzas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensePieChart
          data={summary?.by_category || []}
          totalExpense={summary?.total_expense || 0}
        />

        <IncomeExpenseBarChart data={summary?.monthly_comparison || []} />
      </div>

      {/* 4. Transacciones Recientes */}
      <Card
        indexTag="[STREAM // RECENT_TX]"
        title="Últimos Movimientos Financieros"
        subtitle="Historial cronológico reciente"
        action={
          <Link
            href="/finances"
            className="font-mono text-xs text-coral-400 hover:text-coral-300 font-semibold uppercase tracking-wider"
          >
            Historial Completo ({transactions.length}) →
          </Link>
        }
      >
        <TransactionList
          transactions={transactions.slice(0, 5)}
          isLoading={isFinLoading}
          onDeleteTransaction={deleteTransaction}
          onOpenCreateModal={() => setIsTxModalOpen(true)}
        />
      </Card>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={createTransaction}
        categories={categories}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSubmit={createHabit}
      />
    </div>
  );
}

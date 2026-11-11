'use client';

import React, { useState } from 'react';
import { Filter, FolderKanban, Plus, RefreshCw, Wallet } from 'lucide-react';
import { BalanceSummaryCard } from '@/components/finances/BalanceSummaryCard';
import { CategoryManagerModal } from '@/components/finances/CategoryManagerModal';
import { ExpensePieChart } from '@/components/finances/ExpensePieChart';
import { IncomeExpenseBarChart } from '@/components/finances/IncomeExpenseBarChart';
import { TransactionList } from '@/components/finances/TransactionList';
import { TransactionModal } from '@/components/finances/TransactionModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCategories } from '@/hooks/useCategories';
import { useFinances } from '@/hooks/useFinances';
import { cn } from '@/lib/utils';
import { TransactionType } from '@/types/finance.types';

export default function FinancesPage() {
  const {
    transactions,
    summary,
    filters,
    setFilters,
    isLoading,
    refresh,
    createTransaction,
    deleteTransaction,
  } = useFinances();

  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const months = [
    { num: 1, name: 'Enero' },
    { num: 2, name: 'Febrero' },
    { num: 3, name: 'Marzo' },
    { num: 4, name: 'Abril' },
    { num: 5, name: 'Mayo' },
    { num: 6, name: 'Junio' },
    { num: 7, name: 'Julio' },
    { num: 8, name: 'Agosto' },
    { num: 9, name: 'Septiembre' },
    { num: 10, name: 'Octubre' },
    { num: 11, name: 'Noviembre' },
    { num: 12, name: 'Diciembre' },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const handleTypeFilter = (type?: TransactionType) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type === type ? undefined : type,
    }));
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
  };

  const handleMonthFilter = (mStr: string) => {
    const m = mStr ? parseInt(mStr, 10) : undefined;
    setFilters((prev) => ({ ...prev, month: m }));
  };

  const handleYearFilter = (yStr: string) => {
    const y = yStr ? parseInt(yStr, 10) : undefined;
    setFilters((prev) => ({ ...prev, year: y }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = !!(filters.type || filters.categoryId || filters.month || filters.year);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-raisin-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-coral-400 font-bold uppercase tracking-widest bg-coral-500/10 px-2 py-0.5 rounded border border-coral-500/20">
              SYS // FINANCIAL_MODULE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-timberwolf-100 font-sans tracking-tight mt-1">
            Control de Finanzas
          </h1>
          <p className="text-xs sm:text-sm text-timberwolf-400">
            Administración ágil de ingresos y gastos con categorización y analítica visual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCatModalOpen(true)}
            leftIcon={<FolderKanban className="w-4 h-4 text-timberwolf-300" />}
          >
            Categorías
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsTxModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* 1. Resumen de Balance del Período */}
      <BalanceSummaryCard
        totalIncome={summary?.total_income || 0}
        totalExpense={summary?.total_expense || 0}
        netBalance={summary?.net_balance || 0}
      />

      {/* 2. Barra de Filtros */}
      <Card className="p-4 bg-raisin-900 border-raisin-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tipo de movimiento */}
          <div className="flex items-center gap-1.5 p-1 bg-raisin-950 rounded-xl border border-raisin-border shrink-0">
            <button
              type="button"
              onClick={() => handleTypeFilter(undefined)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                !filters.type
                  ? 'bg-raisin-750 text-timberwolf-100 shadow'
                  : 'text-timberwolf-400 hover:text-timberwolf-200'
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilter('EXPENSE')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                filters.type === 'EXPENSE'
                  ? 'bg-coral-500 text-white shadow-brutal border border-coral-400'
                  : 'text-timberwolf-400 hover:text-coral-400'
              )}
            >
              Gastos
            </button>
            <button
              type="button"
              onClick={() => handleTypeFilter('INCOME')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                filters.type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-brutal border border-emerald-400'
                  : 'text-timberwolf-400 hover:text-emerald-400'
              )}
            >
              Ingresos
            </button>
          </div>

          {/* Selectores Mes / Año / Categoría */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Categoría */}
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="bg-raisin-850 border border-raisin-border text-xs rounded-xl px-3 py-2 text-timberwolf-200 focus:outline-none focus:border-coral-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Mes */}
            <select
              value={filters.month ? String(filters.month) : ''}
              onChange={(e) => handleMonthFilter(e.target.value)}
              className="bg-raisin-850 border border-raisin-border text-xs rounded-xl px-3 py-2 text-timberwolf-200 focus:outline-none focus:border-coral-500"
            >
              <option value="">Cualquier mes</option>
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Año */}
            <select
              value={filters.year ? String(filters.year) : ''}
              onChange={(e) => handleYearFilter(e.target.value)}
              className="bg-raisin-850 border border-raisin-border text-xs rounded-xl px-3 py-2 text-timberwolf-200 focus:outline-none focus:border-coral-500"
            >
              <option value="">Cualquier año</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-mono text-xs text-coral-400 hover:text-coral-300 underline cursor-pointer px-2"
              >
                Limpiar filtros
              </button>
            )}

            <button
              type="button"
              onClick={refresh}
              title="Refrescar datos"
              className="p-2 rounded-xl bg-raisin-850 border border-raisin-border hover:border-timberwolf-300/30 text-timberwolf-400 hover:text-timberwolf-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* 3. Gráficos interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensePieChart
          data={summary?.by_category || []}
          totalExpense={summary?.total_expense || 0}
        />

        <IncomeExpenseBarChart data={summary?.monthly_comparison || []} />
      </div>

      {/* 4. Historial Completo de Movimientos */}
      <Card
        indexTag="[RECORDS // TRANSACTION_HISTORY]"
        title="Historial de Transacciones"
        subtitle={`Mostrando ${transactions.length} registros según los filtros seleccionados`}
      >
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          onDeleteTransaction={deleteTransaction}
          onOpenCreateModal={() => setIsTxModalOpen(true)}
        />
      </Card>

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={createTransaction}
        categories={categories}
      />

      <CategoryManagerModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
}

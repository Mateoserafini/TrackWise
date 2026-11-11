'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { financeService } from '@/services/financeService';
import { FinanceSummary, Transaction, TransactionFilterOptions, TransactionInput } from '@/types/finance.types';

export function useFinances(initialFilters?: TransactionFilterOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [filters, setFilters] = useState<TransactionFilterOptions>(initialFilters || {});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [txRes, sumRes] = await Promise.all([
        financeService.getTransactions(filters),
        financeService.getSummary(filters.month, filters.year),
      ]);

      if (txRes.success) {
        setTransactions(txRes.data);
      }
      if (sumRes.success) {
        setSummary(sumRes.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos financieros';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createTransaction = async (input: TransactionInput): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await financeService.createTransaction(input);
      if (res.success) {
        success('Transacción registrada', res.message || 'El movimiento fue guardado');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la transacción';
      toastError('No se pudo guardar', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await financeService.deleteTransaction(id);
      if (res.success) {
        success('Transacción eliminada', res.message || 'El registro fue removido');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar transacción';
      toastError('Fallo al eliminar', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    transactions,
    summary,
    filters,
    setFilters,
    isLoading,
    isMutating,
    error,
    refresh: loadData,
    createTransaction,
    deleteTransaction,
  };
}

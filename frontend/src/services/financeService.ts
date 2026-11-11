import { api } from './api';
import { FinanceSummary, Transaction, TransactionFilterOptions, TransactionInput } from '@/types/finance.types';

export const financeService = {
  async getTransactions(filters?: TransactionFilterOptions): Promise<{ success: boolean; data: Transaction[] }> {
    const params = new URLSearchParams();
    if (filters?.month !== undefined) params.append('month', String(filters.month));
    if (filters?.year !== undefined) params.append('year', String(filters.year));
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const qs = params.toString();
    const endpoint = `/finance/transactions${qs ? `?${qs}` : ''}`;
    return api.get<{ success: boolean; data: Transaction[] }>(endpoint);
  },

  async createTransaction(payload: TransactionInput): Promise<{ success: boolean; data: Transaction; message: string }> {
    return api.post<{ success: boolean; data: Transaction; message: string }>('/finance/transactions', payload);
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/finance/transactions/${id}`);
  },

  async getSummary(month?: number, year?: number): Promise<{ success: boolean; data: FinanceSummary }> {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', String(month));
    if (year !== undefined) params.append('year', String(year));

    const qs = params.toString();
    const endpoint = `/finance/summary${qs ? `?${qs}` : ''}`;
    return api.get<{ success: boolean; data: FinanceSummary }>(endpoint);
  },
};

export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface TransactionInput {
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string | null;
}

export interface TransactionFilterOptions {
  month?: number;
  year?: number;
  categoryId?: string;
  type?: TransactionType;
  limit?: number;
  offset?: number;
}

export interface CategoryExpenseSummary {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
}

export interface MonthlyComparison {
  period: string; // YYYY-MM
  income: number;
  expense: number;
}

export interface FinanceSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  by_category: CategoryExpenseSummary[];
  monthly_comparison: MonthlyComparison[];
}

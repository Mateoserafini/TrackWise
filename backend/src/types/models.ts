export type TransactionType = 'EXPENSE' | 'INCOME';
export type CategoryType = 'EXPENSE' | 'INCOME' | 'BOTH';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  is_verified: boolean;
  otp_code: string | null;
  otp_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  is_verified: boolean;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  is_default: boolean;
  created_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionWithCategory extends Transaction {
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  days_of_week: number[];
  color: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface HabitWithStreak extends Habit {
  current_streak: number;
  completed_today: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: Date;
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
  period: string; // e.g. "2026-11" o semana
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

export interface HeatmapDay {
  date: string;
  count: number;
}

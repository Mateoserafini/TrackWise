export type CategoryType = 'EXPENSE' | 'INCOME' | 'BOTH';

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  is_default: boolean;
  created_at?: string;
}

export interface CategoryInput {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export type UpdateCategoryInput = Partial<CategoryInput>;

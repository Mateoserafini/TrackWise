import { api } from './api';
import { Category, CategoryInput, UpdateCategoryInput } from '@/types/category.types';

export const categoryService = {
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return api.get<{ success: boolean; data: Category[] }>('/finance/categories');
  },

  async createCategory(payload: CategoryInput): Promise<{ success: boolean; data: Category; message: string }> {
    return api.post<{ success: boolean; data: Category; message: string }>('/finance/categories', payload);
  },

  async updateCategory(id: string, payload: UpdateCategoryInput): Promise<{ success: boolean; data: Category; message: string }> {
    return api.put<{ success: boolean; data: Category; message: string }>(`/finance/categories/${id}`, payload);
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/finance/categories/${id}`);
  },
};

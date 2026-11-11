'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { categoryService } from '@/services/categoryService';
import { Category, CategoryInput, UpdateCategoryInput } from '@/types/category.types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createCategory = async (input: CategoryInput): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await categoryService.createCategory(input);
      if (res.success) {
        success('Categoría creada', res.message || 'Nueva categoría disponible');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la categoría';
      toastError('Fallo al crear', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updateCategory = async (id: string, input: UpdateCategoryInput): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await categoryService.updateCategory(id, input);
      if (res.success) {
        success('Categoría actualizada', res.message || 'Cambios guardados');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar categoría';
      toastError('Fallo al actualizar', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setIsMutating(true);
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.success) {
        success('Categoría eliminada', res.message || 'Categoría removida');
        await loadData();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar categoría';
      toastError('No se pudo eliminar', msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    categories,
    isLoading,
    isMutating,
    error,
    refresh: loadData,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

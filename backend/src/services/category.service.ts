import { query } from '../db';
import { AppError } from '../middlewares/error.middleware';
import { CategoryInput, UpdateCategoryInput } from '../schemas/category.schema';
import { Category } from '../types/models';

export class CategoryService {
  /**
   * Obtiene todas las categorías disponibles para el usuario:
   * Categorías globales del sistema (user_id IS NULL) + categorías personalizadas del usuario.
   */
  public static async getCategories(userId: string): Promise<Category[]> {
    const result = await query<Category>(
      `SELECT id, user_id, name, icon, color, type, is_default, created_at
       FROM categories
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY is_default DESC, name ASC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Crea una categoría personalizada para el usuario.
   */
  public static async createCategory(userId: string, input: CategoryInput): Promise<Category> {
    const result = await query<Category>(
      `INSERT INTO categories (user_id, name, icon, color, type, is_default)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING id, user_id, name, icon, color, type, is_default, created_at`,
      [userId, input.name, input.icon, input.color, input.type]
    );

    return result.rows[0]!;
  }

  /**
   * Modifica una categoría existente.
   * Si es una categoría personalizada del usuario, se actualiza directamente.
   * Si es una categoría default del sistema, se genera una copia personalizada para el usuario.
   */
  public static async updateCategory(
    userId: string,
    categoryId: string,
    input: UpdateCategoryInput
  ): Promise<Category> {
    // Buscar la categoría solicitada
    const existingResult = await query<Category>(
      'SELECT * FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
      [categoryId, userId]
    );

    const category = existingResult.rows[0];
    if (!category) {
      throw new AppError('Categoría no encontrada o no tienes permisos para editarla', 404);
    }

    // Si es una categoría propia del usuario, actualizar directamente
    if (category.user_id === userId) {
      const updatedName = input.name ?? category.name;
      const updatedIcon = input.icon ?? category.icon;
      const updatedColor = input.color ?? category.color;
      const updatedType = input.type ?? category.type;

      const result = await query<Category>(
        `UPDATE categories 
         SET name = $1, icon = $2, color = $3, type = $4
         WHERE id = $5 AND user_id = $6
         RETURNING id, user_id, name, icon, color, type, is_default, created_at`,
        [updatedName, updatedIcon, updatedColor, updatedType, categoryId, userId]
      );

      return result.rows[0]!;
    }

    // Si es una categoría del sistema (user_id IS NULL), crear una versión personalizada para el usuario
    const newName = input.name ?? category.name;
    const newIcon = input.icon ?? category.icon;
    const newColor = input.color ?? category.color;
    const newType = input.type ?? category.type;

    const result = await query<Category>(
      `INSERT INTO categories (user_id, name, icon, color, type, is_default)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING id, user_id, name, icon, color, type, is_default, created_at`,
      [userId, newName, newIcon, newColor, newType]
    );

    return result.rows[0]!;
  }

  /**
   * Elimina una categoría personalizada del usuario.
   * Las categorías por defecto no pueden ser eliminadas.
   */
  public static async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const existingResult = await query<Category>(
      'SELECT id, is_default, user_id FROM categories WHERE id = $1',
      [categoryId]
    );

    const category = existingResult.rows[0];
    if (!category) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (category.is_default || category.user_id === null) {
      throw new AppError('No se pueden eliminar categorías predeterminadas del sistema', 400);
    }

    if (category.user_id !== userId) {
      throw new AppError('No tienes permisos para eliminar esta categoría', 403);
    }

    // Verificar si existen transacciones asociadas
    const transCheck = await query(
      'SELECT id FROM transactions WHERE category_id = $1 LIMIT 1',
      [categoryId]
    );

    if (transCheck.rows.length > 0) {
      throw new AppError(
        'No se puede eliminar la categoría porque existen transacciones financieras asociadas a ella',
        400
      );
    }

    await query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [categoryId, userId]);
  }
}

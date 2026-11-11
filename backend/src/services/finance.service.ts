import { query } from '../db';
import { AppError } from '../middlewares/error.middleware';
import { TransactionFilterInput, TransactionInput } from '../schemas/finance.schema';
import { Category, TransactionWithCategory } from '../types/models';

export class FinanceService {
  /**
   * Crea una nueva transacción (gasto o ingreso).
   * La descripción es 100% opcional (NULLABLE).
   */
  public static async createTransaction(
    userId: string,
    input: TransactionInput
  ): Promise<TransactionWithCategory> {
    // 1. Validar que la categoría exista y sea accesible para este usuario
    const categoryResult = await query<Category>(
      'SELECT id, name, icon, color, type FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
      [input.categoryId, userId]
    );

    const category = categoryResult.rows[0];
    if (!category) {
      throw new AppError('La categoría seleccionada no existe o no tienes acceso a ella', 400);
    }

    // 2. Insertar la transacción
    const result = await query<TransactionWithCategory>(
      `INSERT INTO transactions (user_id, category_id, type, amount, date, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, category_id, type, amount, date, description, created_at, updated_at`,
      [
        userId,
        input.categoryId,
        input.type,
        input.amount,
        input.date,
        input.description, // null si no se envió
      ]
    );

    const inserted = result.rows[0]!;

    return {
      ...inserted,
      amount: Number(inserted.amount),
      category_name: category.name,
      category_icon: category.icon,
      category_color: category.color,
    };
  }

  /**
   * Obtiene la lista de transacciones del usuario con filtros opcionales.
   */
  public static async getTransactions(
    userId: string,
    filters: TransactionFilterInput
  ): Promise<TransactionWithCategory[]> {
    const conditions: string[] = ['t.user_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (filters.type) {
      conditions.push(`t.type = $${paramIndex}`);
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.categoryId) {
      conditions.push(`t.category_id = $${paramIndex}`);
      params.push(filters.categoryId);
      paramIndex++;
    }

    if (filters.year) {
      conditions.push(`EXTRACT(YEAR FROM t.date) = $${paramIndex}`);
      params.push(parseInt(filters.year, 10));
      paramIndex++;
    }

    if (filters.month) {
      conditions.push(`EXTRACT(MONTH FROM t.date) = $${paramIndex}`);
      params.push(parseInt(filters.month, 10));
      paramIndex++;
    }

    let sql = `
      SELECT 
        t.id, 
        t.user_id, 
        t.category_id, 
        t.type, 
        t.amount, 
        t.date, 
        t.description, 
        t.created_at, 
        t.updated_at,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.date DESC, t.created_at DESC
    `;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
      paramIndex++;
    }

    const result = await query<TransactionWithCategory>(sql, params);

    return result.rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
    }));
  }

  /**
   * Elimina una transacción por su ID.
   */
  public static async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const result = await query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [transactionId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Transacción no encontrada o no tienes permisos para eliminarla', 404);
    }
  }
}

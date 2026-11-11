import { query } from '../db';
import { CategoryExpenseSummary, FinanceSummary, HeatmapDay, MonthlyComparison } from '../types/models';

export class StatsService {
  /**
   * Obtiene el resumen financiero completo para el dashboard:
   * Totales del mes, balance neto, desglose por categorías (pie chart)
   * y comparativa de los últimos 6 meses (bar chart).
   */
  public static async getFinanceSummary(
    userId: string,
    month?: number,
    year?: number
  ): Promise<FinanceSummary> {
    const targetMonth = month ?? new Date().getMonth() + 1;
    const targetYear = year ?? new Date().getFullYear();

    // 1. Totales de ingresos y gastos del mes
    const totalsResult = await query<{
      type: 'EXPENSE' | 'INCOME';
      total: string;
    }>(
      `SELECT type, COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3
       GROUP BY type`,
      [userId, targetMonth, targetYear]
    );

    let totalIncome = 0;
    let totalExpense = 0;

    for (const row of totalsResult.rows) {
      if (row.type === 'INCOME') totalIncome = Number(row.total);
      if (row.type === 'EXPENSE') totalExpense = Number(row.total);
    }

    const netBalance = totalIncome - totalExpense;

    // 2. Desglose de gastos por categoría (para gráfico de torta/dona)
    const categoryResult = await query<{
      category_id: string;
      category_name: string;
      category_icon: string;
      category_color: string;
      total: string;
    }>(
      `SELECT 
         c.id AS category_id,
         c.name AS category_name,
         c.icon AS category_icon,
         c.color AS category_color,
         COALESCE(SUM(t.amount), 0) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
         AND t.type = 'EXPENSE'
         AND EXTRACT(MONTH FROM t.date) = $2 
         AND EXTRACT(YEAR FROM t.date) = $3
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total DESC`,
      [userId, targetMonth, targetYear]
    );

    const byCategory: CategoryExpenseSummary[] = categoryResult.rows.map((row) => {
      const catTotal = Number(row.total);
      const percentage = totalExpense > 0 ? Number(((catTotal / totalExpense) * 100).toFixed(1)) : 0;
      return {
        category_id: row.category_id,
        category_name: row.category_name,
        category_icon: row.category_icon,
        category_color: row.category_color,
        total: catTotal,
        percentage,
      };
    });

    // 3. Comparativa de ingresos vs gastos de los últimos 6 meses (para gráfico de barras)
    const monthlyResult = await query<{
      period: string;
      type: 'EXPENSE' | 'INCOME';
      total: string;
    }>(
      `SELECT 
         TO_CHAR(date, 'YYYY-MM') AS period,
         type,
         COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE user_id = $1 
         AND date >= (CURRENT_DATE - INTERVAL '5 months')::date
       GROUP BY period, type
       ORDER BY period ASC`,
      [userId]
    );

    const monthlyMap = new Map<string, { income: number; expense: number }>();
    for (const row of monthlyResult.rows) {
      const current = monthlyMap.get(row.period) || { income: 0, expense: 0 };
      if (row.type === 'INCOME') current.income = Number(row.total);
      if (row.type === 'EXPENSE') current.expense = Number(row.total);
      monthlyMap.set(row.period, current);
    }

    const monthlyComparison: MonthlyComparison[] = Array.from(monthlyMap.entries()).map(
      ([period, vals]) => ({
        period,
        income: vals.income,
        expense: vals.expense,
      })
    );

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_balance: netBalance,
      by_category: byCategory,
      monthly_comparison: monthlyComparison,
    };
  }

  /**
   * Obtiene la matriz de cumplimiento de hábitos (por defecto los últimos 365 días / 1 año completo)
   * para renderizar el Activity Heatmap estilo GitHub.
   */
  public static async getHabitHeatmap(userId: string, daysCount: number = 365): Promise<HeatmapDay[]> {
    const safeDays = Math.max(30, Math.min(daysCount, 730));

    const result = await query<{
      date: string;
      count: string;
    }>(
      `SELECT 
         TO_CHAR(hl.date, 'YYYY-MM-DD') AS date,
         COUNT(hl.id) AS count
       FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE h.user_id = $1 
         AND hl.completed = TRUE
         AND hl.date >= CURRENT_DATE - ($2 * INTERVAL '1 day')
       GROUP BY hl.date
       ORDER BY hl.date ASC`,
      [userId, safeDays]
    );

    return result.rows.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));
  }
}

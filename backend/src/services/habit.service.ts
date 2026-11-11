import { query } from '../db';
import { AppError } from '../middlewares/error.middleware';
import { HabitCheckInInput, HabitInput, UpdateHabitInput } from '../schemas/habit.schema';
import { Habit, HabitLog, HabitWithStreak } from '../types/models';

export class HabitService {
  /**
   * Calcula la racha (streak) actual de días consecutivos cumplidos para un hábito,
   * respetando sus días activos de la semana (days_of_week) y la zona horaria/fecha del cliente.
   */
  public static calculateStreak(habit: Habit, logs: HabitLog[], referenceDateStr?: string): number {
    const completedDates = new Set(
      logs.filter((log) => log.completed).map((log) => {
        if (typeof log.date === 'string') {
          return log.date.split('T')[0]!;
        }
        const d = log.date as Date;
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })
    );

    let streak = 0;
    let checkDate: Date;
    let todayStr: string;

    if (referenceDateStr && /^\d{4}-\d{2}-\d{2}$/.test(referenceDateStr)) {
      todayStr = referenceDateStr;
      const [year, month, day] = referenceDateStr.split('-').map(Number);
      checkDate = new Date(Date.UTC(year!, month! - 1, day!, 12, 0, 0));
    } else {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      todayStr = `${y}-${m}-${d}`;
      checkDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
    }

    const scheduledDays = new Set(habit.days_of_week);

    // Si hoy está programado pero aún no se completó, no rompemos la racha; empezamos a evaluar desde ayer
    const todayDayOfWeek = checkDate.getUTCDay();
    if (scheduledDays.has(todayDayOfWeek) && !completedDates.has(todayStr)) {
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    const formatUTC = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    for (let i = 0; i < 365; i++) {
      const dateStr = formatUTC(checkDate);
      const dayOfWeek = checkDate.getUTCDay();

      if (scheduledDays.has(dayOfWeek)) {
        if (completedDates.has(dateStr)) {
          streak++;
        } else {
          // Día programado que no se cumplió: la racha se corta
          break;
        }
      }

      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    return streak;
  }

  /**
   * Obtiene la lista de hábitos activos con su estado de hoy y racha calculada,
   * permitiendo especificar la fecha local del cliente para sincronía perfecta de husos horarios.
   */
  public static async getHabits(userId: string, clientDate?: string): Promise<HabitWithStreak[]> {
    const habitsResult = await query<Habit>(
      `SELECT id, user_id, name, description, days_of_week, color, is_archived, created_at, updated_at
       FROM habits
       WHERE user_id = $1 AND is_archived = FALSE
       ORDER BY created_at ASC`,
      [userId]
    );

    const habits = habitsResult.rows;
    if (habits.length === 0) return [];

    const habitIds = habits.map((h) => h.id);

    let todayStr: string;
    if (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)) {
      todayStr = clientDate;
    } else {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      todayStr = `${y}-${m}-${d}`;
    }

    // Obtener los logs de los últimos 365 días para calcular rachas
    const logsResult = await query<HabitLog>(
      `SELECT id, habit_id, date, completed, created_at
       FROM habit_logs
       WHERE habit_id = ANY($1::uuid[]) AND date >= CURRENT_DATE - INTERVAL '365 days'`,
      [habitIds]
    );

    const logsByHabit = new Map<string, HabitLog[]>();
    for (const log of logsResult.rows) {
      const list = logsByHabit.get(log.habit_id) || [];
      list.push(log);
      logsByHabit.set(log.habit_id, list);
    }

    return habits.map((habit) => {
      const habitLogs = logsByHabit.get(habit.id) || [];
      const completedToday = habitLogs.some((l) => {
        let dStr = '';
        if (typeof l.date === 'string') {
          dStr = l.date.split('T')[0]!;
        } else {
          const d = l.date as Date;
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          dStr = `${y}-${m}-${day}`;
        }
        return dStr === todayStr && l.completed;
      });

      const currentStreak = this.calculateStreak(habit, habitLogs, todayStr);

      return {
        ...habit,
        completed_today: completedToday,
        current_streak: currentStreak,
      };
    });
  }

  /**
   * Crea un nuevo hábito diario con días configurables y descripción opcional.
   */
  public static async createHabit(userId: string, input: HabitInput): Promise<HabitWithStreak> {
    const result = await query<Habit>(
      `INSERT INTO habits (user_id, name, description, days_of_week, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, name, description, days_of_week, color, is_archived, created_at, updated_at`,
      [userId, input.name, input.description, input.daysOfWeek, input.color]
    );

    const habit = result.rows[0]!;

    return {
      ...habit,
      completed_today: false,
      current_streak: 0,
    };
  }

  /**
   * Actualiza los datos de un hábito.
   */
  public static async updateHabit(
    userId: string,
    habitId: string,
    input: UpdateHabitInput
  ): Promise<Habit> {
    const existing = await query<Habit>(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );

    const habit = existing.rows[0];
    if (!habit) {
      throw new AppError('Hábito no encontrado o no tienes permisos para editarlo', 404);
    }

    const updatedName = input.name ?? habit.name;
    const updatedDesc = input.description !== undefined ? input.description : habit.description;
    const updatedDays = input.daysOfWeek ?? habit.days_of_week;
    const updatedColor = input.color ?? habit.color;

    const result = await query<Habit>(
      `UPDATE habits
       SET name = $1, description = $2, days_of_week = $3, color = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, name, description, days_of_week, color, is_archived, created_at, updated_at`,
      [updatedName, updatedDesc, updatedDays, updatedColor, habitId, userId]
    );

    return result.rows[0]!;
  }

  /**
   * Archiva o elimina un hábito.
   */
  public static async deleteHabit(userId: string, habitId: string): Promise<void> {
    const result = await query(
      `UPDATE habits 
       SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [habitId, userId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Hábito no encontrado', 404);
    }
  }

  /**
   * Alterna o registra el cumplimiento diario de un hábito (check-in).
   */
  public static async checkIn(
    userId: string,
    input: HabitCheckInInput
  ): Promise<{ completed: boolean; habitId: string; date: string }> {
    // 1. Validar propiedad del hábito
    const habitResult = await query<Habit>(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2 AND is_archived = FALSE',
      [input.habitId, userId]
    );

    if (habitResult.rows.length === 0) {
      throw new AppError('Hábito no encontrado o archivado', 404);
    }

    // 2. Insertar o actualizar el log de cumplimiento
    const result = await query<HabitLog>(
      `INSERT INTO habit_logs (habit_id, date, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, date)
       DO UPDATE SET completed = EXCLUDED.completed
       RETURNING id, habit_id, date, completed`,
      [input.habitId, input.date, input.completed]
    );

    const log = result.rows[0]!;

    return {
      habitId: log.habit_id,
      date: input.date,
      completed: log.completed,
    };
  }
}

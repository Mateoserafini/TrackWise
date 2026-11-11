import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { QueryResult, QueryResultRow } from 'pg';
import { Category, Habit, HabitLog, Transaction, User } from '../types/models';

export interface MockStore {
  users: User[];
  categories: Category[];
  transactions: Transaction[];
  habits: Habit[];
  habitLogs: HabitLog[];
  resetAt?: string;
}

const MOCK_FILE_PATH = path.join(__dirname, '../../.mock-db.json');

// Semillas iniciales en memoria idénticas a seeds.sql con paleta moderna sin tonos naranjas/opacos
export const initialCategories: Category[] = [
  { id: '11111111-1111-4111-8111-111111111111', user_id: null, name: 'Comida', icon: 'Utensils', color: '#D2F865', type: 'EXPENSE', is_default: true, created_at: new Date() },
  { id: '22222222-2222-4222-8222-222222222222', user_id: null, name: 'Transporte', icon: 'Bus', color: '#3E63F6', type: 'EXPENSE', is_default: true, created_at: new Date() },
  { id: '33333333-3333-4333-8333-333333333333', user_id: null, name: 'Vivienda / Alquiler', icon: 'Home', color: '#6366F1', type: 'EXPENSE', is_default: true, created_at: new Date() },
  { id: '44444444-4444-4444-8444-444444444444', user_id: null, name: 'Servicios', icon: 'Zap', color: '#F9D976', type: 'EXPENSE', is_default: true, created_at: new Date() },
  { id: '55555555-5555-4555-8555-555555555555', user_id: null, name: 'Ocio / Entretenimiento', icon: 'Gamepad2', color: '#EC4899', type: 'EXPENSE', is_default: true, created_at: new Date() },
  { id: '66666666-6666-4666-8666-666666666666', user_id: null, name: 'Salud', icon: 'HeartPulse', color: '#FF4D2D', type: 'EXPENSE', is_default: true, created_at: new Date() },
  { id: '77777777-7777-4777-8777-777777777777', user_id: null, name: 'Salario / Sueldo', icon: 'Briefcase', color: '#10B981', type: 'INCOME', is_default: true, created_at: new Date() },
  { id: '88888888-8888-4888-8888-888888888888', user_id: null, name: 'Otros', icon: 'Tag', color: '#94A3B8', type: 'BOTH', is_default: true, created_at: new Date() },
];

export class MockDatabase {
  private lastMtime = 0;
  private isTest = process.env.NODE_ENV === 'test';

  private store: MockStore = {
    users: [],
    categories: [...initialCategories],
    transactions: [],
    habits: [],
    habitLogs: [],
  };

  constructor() {
    if (!this.isTest) {
      this.loadFromFile();
    }
  }

  private loadFromFile(): void {
    if (this.isTest) return;
    try {
      if (fs.existsSync(MOCK_FILE_PATH)) {
        const stats = fs.statSync(MOCK_FILE_PATH);
        if (stats.mtimeMs > this.lastMtime) {
          const raw = fs.readFileSync(MOCK_FILE_PATH, 'utf8');
          const parsed = JSON.parse(raw) as MockStore;
          if (parsed && Array.isArray(parsed.users)) {
            this.store = {
              users: parsed.users.map((u) => ({
                ...u,
                created_at: new Date(u.created_at),
                updated_at: new Date(u.updated_at),
                otp_expires_at: u.otp_expires_at ? new Date(u.otp_expires_at) : null,
              })),
              categories:
                Array.isArray(parsed.categories) && parsed.categories.length > 0
                  ? parsed.categories.map((c) => ({ ...c, created_at: new Date(c.created_at) }))
                  : [...initialCategories],
              transactions: (parsed.transactions || []).map((t) => ({
                ...t,
                created_at: new Date(t.created_at),
                updated_at: new Date(t.updated_at),
              })),
              habits: (parsed.habits || []).map((h) => ({
                ...h,
                created_at: new Date(h.created_at),
                updated_at: new Date(h.updated_at),
              })),
              habitLogs: (parsed.habitLogs || []).map((l) => ({
                ...l,
                created_at: new Date(l.created_at),
              })),
              resetAt: parsed.resetAt,
            };
            this.lastMtime = stats.mtimeMs;
          }
        }
      } else {
        this.saveToFile();
      }
    } catch {
      // Ignorar errores de lectura momentáneos y usar el almacén en memoria
    }
  }

  private saveToFile(): void {
    if (this.isTest) return;
    try {
      fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf8');
      if (fs.existsSync(MOCK_FILE_PATH)) {
        this.lastMtime = fs.statSync(MOCK_FILE_PATH).mtimeMs;
      }
    } catch {
      // Ignorar errores de escritura momentáneos
    }
  }

  public reset(): void {
    this.store = {
      users: [],
      categories: [...initialCategories],
      transactions: [],
      habits: [],
      habitLogs: [],
      resetAt: new Date().toISOString(),
    };
    if (!this.isTest) {
      this.saveToFile();
    }
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    if (!this.isTest) {
      this.loadFromFile();
    }

    const cleanSql = sql.replace(/\s+/g, ' ').trim();
    const result = this.executeQuery<T>(cleanSql, params);

    if (
      !this.isTest &&
      (cleanSql.includes('INSERT INTO') || cleanSql.includes('UPDATE ') || cleanSql.includes('DELETE FROM'))
    ) {
      this.saveToFile();
    }

    return result;
  }

  private executeQuery<T extends QueryResultRow = QueryResultRow>(
    cleanSql: string,
    params: unknown[] = []
  ): QueryResult<T> {
    // 1. USERS
    if (cleanSql.startsWith('SELECT id FROM users WHERE email = $1')) {
      const email = params[0] as string;
      const found = this.store.users.filter((u) => u.email.toLowerCase() === email.toLowerCase());
      return this.toResult(found.map((u) => ({ id: u.id })) as unknown as T[]);
    }

    if (cleanSql.startsWith('INSERT INTO users')) {
      const username = params[0] as string;
      const email = params[1] as string;
      const password_hash = params[2] as string;
      const otp_code = params[3] as string;
      const otp_expires_at = params[4] as Date;
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        email,
        password_hash,
        is_verified: false,
        otp_code,
        otp_expires_at,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.store.users.push(newUser);
      return this.toResult([newUser] as unknown as T[]);
    }

    if (cleanSql.includes('FROM users WHERE email = $1')) {
      const email = params[0] as string;
      const found = this.store.users.filter((u) => u.email.toLowerCase() === email.toLowerCase());
      return this.toResult(found as unknown as T[]);
    }

    if (cleanSql.includes('UPDATE users SET is_verified = TRUE')) {
      const userId = params[0] as string;
      const user = this.store.users.find((u) => u.id === userId);
      if (user) {
        user.is_verified = true;
        user.otp_code = null;
        user.otp_expires_at = null;
        user.updated_at = new Date();
      }
      return this.toResult((user ? [user] : []) as unknown as T[]);
    }

    if (cleanSql.includes('UPDATE users SET otp_code = $1')) {
      const code = params[0] as string;
      const expiresAt = params[1] as Date;
      const userId = params[2] as string;
      const user = this.store.users.find((u) => u.id === userId);
      if (user) {
        user.otp_code = code;
        user.otp_expires_at = expiresAt;
        user.updated_at = new Date();
      }
      return this.toResult((user ? [user] : []) as unknown as T[]);
    }

    if (cleanSql.includes('FROM users WHERE id = $1')) {
      const userId = params[0] as string;
      const found = this.store.users.filter((u) => u.id === userId);
      return this.toResult(found as unknown as T[]);
    }

    // 2. CATEGORIES
    if (cleanSql.includes('FROM categories WHERE user_id IS NULL OR user_id = $1')) {
      const userId = params[0] as string;
      const categories = this.store.categories.filter((c) => c.user_id === null || c.user_id === userId);
      return this.toResult(categories as unknown as T[]);
    }

    if (cleanSql.includes('INSERT INTO categories')) {
      const user_id = params[0] as string;
      const name = params[1] as string;
      const icon = params[2] as string;
      const color = params[3] as string;
      const type = params[4] as Category['type'];
      const newCat: Category = {
        id: crypto.randomUUID(),
        user_id,
        name,
        icon,
        color,
        type,
        is_default: false,
        created_at: new Date(),
      };
      this.store.categories.push(newCat);
      return this.toResult([newCat] as unknown as T[]);
    }

    if (cleanSql.includes('FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)')) {
      const id = params[0] as string;
      const userId = params[1] as string;
      const found = this.store.categories.filter((c) => c.id === id && (c.user_id === null || c.user_id === userId));
      return this.toResult(found as unknown as T[]);
    }

    if (cleanSql.includes('FROM categories WHERE id = $1')) {
      const id = params[0] as string;
      const found = this.store.categories.filter((c) => c.id === id);
      return this.toResult(found as unknown as T[]);
    }

    if (cleanSql.includes('UPDATE categories SET name = $1')) {
      const name = params[0] as string;
      const icon = params[1] as string;
      const color = params[2] as string;
      const type = params[3] as Category['type'];
      const id = params[4] as string;
      const userId = params[5] as string;
      const cat = this.store.categories.find((c) => c.id === id && c.user_id === userId);
      if (cat) {
        cat.name = name;
        cat.icon = icon;
        cat.color = color;
        cat.type = type;
      }
      return this.toResult((cat ? [cat] : []) as unknown as T[]);
    }

    if (cleanSql.includes('DELETE FROM categories WHERE id = $1 AND user_id = $2')) {
      const id = params[0] as string;
      const userId = params[1] as string;
      this.store.categories = this.store.categories.filter((c) => !(c.id === id && c.user_id === userId));
      return this.toResult([] as unknown as T[]);
    }

    // 3. TRANSACTIONS
    if (cleanSql.includes('INSERT INTO transactions')) {
      const user_id = params[0] as string;
      const category_id = params[1] as string;
      const type = params[2] as Transaction['type'];
      const amount = params[3] as number;
      const date = params[4] as string;
      const description = (params[5] as string | null) ?? null;
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        user_id,
        category_id,
        type,
        amount,
        date,
        description,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.store.transactions.push(newTx);
      return this.toResult([newTx] as unknown as T[]);
    }

    if (cleanSql.includes('FROM transactions WHERE category_id = $1 LIMIT 1')) {
      const catId = params[0] as string;
      const found = this.store.transactions.filter((t) => t.category_id === catId);
      return this.toResult(found as unknown as T[]);
    }

    // Resumen financiero: categorías de gastos (Pie Chart) - Evaluado antes de getTransactions
    if (cleanSql.includes('SELECT c.id AS category_id, c.name AS category_name')) {
      const userId = params[0] as string;
      const targetMonth = typeof params[1] === 'number' ? params[1] : undefined;
      const targetYear = typeof params[2] === 'number' ? params[2] : undefined;

      const expenses = this.store.transactions.filter((t) => {
        if (t.user_id !== userId || t.type !== 'EXPENSE') return false;
        if (targetMonth !== undefined && targetYear !== undefined) {
          const [y, m] = t.date.split('-').map(Number);
          if (y !== targetYear || m !== targetMonth) return false;
        }
        return true;
      });

      const map = new Map<string, number>();
      for (const exp of expenses) {
        map.set(exp.category_id, (map.get(exp.category_id) || 0) + Number(exp.amount));
      }

      const rows = Array.from(map.entries()).map(([catId, total]) => {
        const cat = this.store.categories.find((c) => c.id === catId);
        return {
          category_id: catId,
          category_name: cat?.name ?? 'Otros',
          category_icon: cat?.icon ?? 'Tag',
          category_color: cat?.color ?? '#6B7280',
          total: total.toString(),
        };
      });

      return this.toResult(rows as unknown as T[]);
    }

    if (cleanSql.includes('SELECT t.id, t.user_id') || cleanSql.includes('FROM transactions t JOIN categories c')) {
      const userId = params[0] as string;
      let txs = this.store.transactions.filter((t) => t.user_id === userId);

      // Filtrar por type si está presente
      const typeMatch = cleanSql.match(/t\.type\s*=\s*\$(\d+)/);
      if (typeMatch && typeMatch[1]) {
        const pIdx = parseInt(typeMatch[1], 10) - 1;
        const typeVal = params[pIdx] as string;
        if (typeVal) txs = txs.filter((t) => t.type === typeVal);
      }

      // Filtrar por category_id si está presente
      const catMatch = cleanSql.match(/t\.category_id\s*=\s*\$(\d+)/);
      if (catMatch && catMatch[1]) {
        const pIdx = parseInt(catMatch[1], 10) - 1;
        const catVal = params[pIdx] as string;
        if (catVal) txs = txs.filter((t) => t.category_id === catVal);
      }

      // Filtrar por año si está presente
      const yearMatch = cleanSql.match(/EXTRACT\(YEAR FROM t\.date\)\s*=\s*\$(\d+)/);
      if (yearMatch && yearMatch[1]) {
        const pIdx = parseInt(yearMatch[1], 10) - 1;
        const yearVal = Number(params[pIdx]);
        if (!isNaN(yearVal)) txs = txs.filter((t) => parseInt(t.date.split('-')[0]!, 10) === yearVal);
      }

      // Filtrar por mes si está presente
      const monthMatch = cleanSql.match(/EXTRACT\(MONTH FROM t\.date\)\s*=\s*\$(\d+)/);
      if (monthMatch && monthMatch[1]) {
        const pIdx = parseInt(monthMatch[1], 10) - 1;
        const monthVal = Number(params[pIdx]);
        if (!isNaN(monthVal)) txs = txs.filter((t) => parseInt(t.date.split('-')[1]!, 10) === monthVal);
      }

      // Ordenar por date DESC, created_at DESC
      txs.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Offset y Limit
      const offsetMatch = cleanSql.match(/OFFSET\s+\$(\d+)/);
      if (offsetMatch && offsetMatch[1]) {
        const pIdx = parseInt(offsetMatch[1], 10) - 1;
        const offsetVal = Number(params[pIdx]);
        if (!isNaN(offsetVal)) txs = txs.slice(offsetVal);
      }

      const limitMatch = cleanSql.match(/LIMIT\s+\$(\d+)/);
      if (limitMatch && limitMatch[1]) {
        const pIdx = parseInt(limitMatch[1], 10) - 1;
        const limitVal = Number(params[pIdx]);
        if (!isNaN(limitVal)) txs = txs.slice(0, limitVal);
      }

      const rows = txs.map((t) => {
        const cat = this.store.categories.find((c) => c.id === t.category_id);
        return {
          ...t,
          category_name: cat ? cat.name : 'Desconocida',
          category_icon: cat ? cat.icon : 'Tag',
          category_color: cat ? cat.color : '#6B7280',
        };
      });
      return this.toResult(rows as unknown as T[]);
    }

    if (cleanSql.includes('DELETE FROM transactions WHERE id = $1 AND user_id = $2')) {
      const id = params[0] as string;
      const userId = params[1] as string;
      const before = this.store.transactions.length;
      this.store.transactions = this.store.transactions.filter((t) => !(t.id === id && t.user_id === userId));
      const deleted = before - this.store.transactions.length;
      return this.toResult((deleted > 0 ? [{ id }] : []) as unknown as T[], deleted);
    }

    // Resumen financiero: totales de mes
    if (cleanSql.includes('SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions')) {
      const userId = params[0] as string;
      const targetMonth = typeof params[1] === 'number' ? params[1] : undefined;
      const targetYear = typeof params[2] === 'number' ? params[2] : undefined;

      const userTxs = this.store.transactions.filter((t) => {
        if (t.user_id !== userId) return false;
        if (targetMonth !== undefined && targetYear !== undefined) {
          const [y, m] = t.date.split('-').map(Number);
          if (y !== targetYear || m !== targetMonth) return false;
        }
        return true;
      });

      let income = 0;
      let expense = 0;
      for (const t of userTxs) {
        if (t.type === 'INCOME') income += Number(t.amount);
        if (t.type === 'EXPENSE') expense += Number(t.amount);
      }
      const rows = [
        { type: 'INCOME', total: income.toString() },
        { type: 'EXPENSE', total: expense.toString() },
      ];
      return this.toResult(rows as unknown as T[]);
    }

    // Resumen financiero: mensual consolidado (Bar Chart)
    if (cleanSql.includes("TO_CHAR(date, 'YYYY-MM') AS period")) {
      const userId = params[0] as string;
      const txs = this.store.transactions.filter((t) => t.user_id === userId);
      const map = new Map<string, { period: string; type: 'INCOME' | 'EXPENSE'; total: number }>();
      for (const t of txs) {
        const period = t.date.substring(0, 7);
        const key = `${period}_${t.type}`;
        const existing = map.get(key) || { period, type: t.type, total: 0 };
        existing.total += Number(t.amount);
        map.set(key, existing);
      }
      const rows = Array.from(map.values()).map((v) => ({
        period: v.period,
        type: v.type,
        total: v.total.toString(),
      }));
      return this.toResult(rows as unknown as T[]);
    }

    // 4. HABITS
    if (cleanSql.includes('FROM habits WHERE user_id = $1 AND is_archived = FALSE')) {
      const userId = params[0] as string;
      const habits = this.store.habits.filter((h) => h.user_id === userId && !h.is_archived);
      return this.toResult(habits as unknown as T[]);
    }

    if (cleanSql.includes('INSERT INTO habits')) {
      const user_id = params[0] as string;
      const name = params[1] as string;
      const description = (params[2] as string | null) ?? null;
      const days_of_week = params[3] as number[];
      const color = params[4] as string;
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        user_id,
        name,
        description,
        days_of_week,
        color,
        is_archived: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.store.habits.push(newHabit);
      return this.toResult([newHabit] as unknown as T[]);
    }

    if (cleanSql.includes('FROM habits WHERE id = $1 AND user_id = $2')) {
      const id = params[0] as string;
      const userId = params[1] as string;
      const found = this.store.habits.filter((h) => h.id === id && h.user_id === userId);
      return this.toResult(found as unknown as T[]);
    }

    if (cleanSql.includes('UPDATE habits SET name = $1')) {
      const name = params[0] as string;
      const description = (params[1] as string | null) ?? null;
      const days_of_week = params[2] as number[];
      const color = params[3] as string;
      const id = params[4] as string;
      const userId = params[5] as string;
      const habit = this.store.habits.find((h) => h.id === id && h.user_id === userId);
      if (habit) {
        habit.name = name;
        habit.description = description;
        habit.days_of_week = days_of_week;
        habit.color = color;
        habit.updated_at = new Date();
      }
      return this.toResult((habit ? [habit] : []) as unknown as T[]);
    }

    if (cleanSql.includes('UPDATE habits SET is_archived = TRUE')) {
      const id = params[0] as string;
      const userId = params[1] as string;
      const habit = this.store.habits.find((h) => h.id === id && h.user_id === userId);
      if (habit) {
        habit.is_archived = true;
        habit.updated_at = new Date();
      }
      return this.toResult((habit ? [habit] : []) as unknown as T[], habit ? 1 : 0);
    }

    // 5. HABIT LOGS
    if (cleanSql.includes('FROM habit_logs WHERE habit_id = ANY($1::uuid[])')) {
      const habitIds = params[0] as string[];
      const logs = this.store.habitLogs.filter((l) => habitIds.includes(l.habit_id));
      return this.toResult(logs as unknown as T[]);
    }

    if (cleanSql.includes('INSERT INTO habit_logs')) {
      const habit_id = params[0] as string;
      const date = params[1] as string;
      const completed = params[2] as boolean;
      let log = this.store.habitLogs.find((l) => l.habit_id === habit_id && l.date === date);
      if (log) {
        log.completed = completed;
      } else {
        log = {
          id: crypto.randomUUID(),
          habit_id,
          date,
          completed,
          created_at: new Date(),
        };
        this.store.habitLogs.push(log);
      }
      return this.toResult([log] as unknown as T[]);
    }

    // Heatmap
    if (cleanSql.includes('COUNT(hl.id) AS count FROM habit_logs hl')) {
      const userId = params[0] as string;
      const userHabitIds = new Set(this.store.habits.filter((h) => h.user_id === userId).map((h) => h.id));
      const userLogs = this.store.habitLogs.filter((l) => userHabitIds.has(l.habit_id) && l.completed);
      const countMap = new Map<string, number>();
      for (const log of userLogs) {
        countMap.set(log.date, (countMap.get(log.date) || 0) + 1);
      }
      const rows = Array.from(countMap.entries()).map(([date, count]) => ({
        date,
        count: count.toString(),
      }));
      return this.toResult(rows as unknown as T[]);
    }

    // Default fallback vacío
    return this.toResult([] as unknown as T[]);
  }

  private toResult<T extends QueryResultRow>(rows: T[], rowCount?: number): QueryResult<T> {
    return {
      rows,
      command: 'MOCK',
      rowCount: rowCount !== undefined ? rowCount : rows.length,
      oid: 0,
      fields: [],
    };
  }
}

export const mockDb = new MockDatabase();

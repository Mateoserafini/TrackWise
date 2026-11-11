export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  days_of_week: number[];
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  completed_today?: boolean;
  current_streak?: number;
}

export interface HabitInput {
  name: string;
  description?: string | null;
  daysOfWeek: number[];
  color: string;
}

export type UpdateHabitInput = Partial<HabitInput>;

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface HabitCheckInPayload {
  habitId: string;
  date: string;
  completed: boolean;
}

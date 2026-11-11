import { api } from './api';
import { Habit, HabitCheckInPayload, HabitInput, HeatmapDay, UpdateHabitInput } from '@/types/habit.types';

export const habitService = {
  async getHabits(clientDate?: string): Promise<{ success: boolean; data: Habit[] }> {
    const query = clientDate ? `?date=${encodeURIComponent(clientDate)}` : '';
    return api.get<{ success: boolean; data: Habit[] }>(`/habits${query}`, {
      headers: clientDate ? { 'x-client-date': clientDate } : undefined,
    });
  },

  async createHabit(payload: HabitInput): Promise<{ success: boolean; data: Habit; message: string }> {
    return api.post<{ success: boolean; data: Habit; message: string }>('/habits', payload);
  },

  async updateHabit(id: string, payload: UpdateHabitInput): Promise<{ success: boolean; data: Habit; message: string }> {
    return api.put<{ success: boolean; data: Habit; message: string }>(`/habits/${id}`, payload);
  },

  async deleteHabit(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/habits/${id}`);
  },

  async checkIn(payload: HabitCheckInPayload): Promise<{ success: boolean; data: { habitId: string; date: string; completed: boolean }; message: string }> {
    return api.post<{ success: boolean; data: { habitId: string; date: string; completed: boolean }; message: string }>('/habits/check', payload);
  },

  async getHeatmap(days: number = 365): Promise<{ success: boolean; data: HeatmapDay[] }> {
    return api.get<{ success: boolean; data: HeatmapDay[] }>(`/habits/heatmap?days=${days}`);
  },
};

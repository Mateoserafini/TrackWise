import { z } from 'zod';

export const HabitSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del hábito es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .trim(),
  // DESCRIPCIÓN ES NULLABLE / OPCIONAL:
  description: z
    .string()
    .nullish()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  daysOfWeek: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'Selecciona al menos un día')
    .default([0, 1, 2, 3, 4, 5, 6]),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Color hexadecimal válido')
    .default('#10B981'),
});

export const UpdateHabitSchema = HabitSchema.partial();

export const HabitCheckInSchema = z.object({
  habitId: z.string().uuid('ID de hábito inválido'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD'),
  completed: z.boolean().default(true),
});

export type HabitInput = z.infer<typeof HabitSchema>;
export type UpdateHabitInput = z.infer<typeof UpdateHabitSchema>;
export type HabitCheckInInput = z.infer<typeof HabitCheckInSchema>;

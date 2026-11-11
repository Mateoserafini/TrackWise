import { z } from 'zod';

export const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(2, 'El nombre de usuario debe tener al menos 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .trim(),
  email: z.string().email('Ingresa un correo electrónico válido').trim().toLowerCase(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const LoginFormSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido').trim().toLowerCase(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const VerifyOtpFormSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos numéricos')
    .regex(/^\d{6}$/, 'Solo dígitos numéricos'),
});

export const TransactionFormSchema = z.object({
  categoryId: z.string().uuid('Debes seleccionar una categoría'),
  type: z.enum(['EXPENSE', 'INCOME'] as const),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  description: z.string().max(255, 'Máximo 255 caracteres').nullish(),
});

export const HabitFormSchema = z.object({
  name: z.string().min(1, 'El nombre del hábito es obligatorio').max(100, 'Máximo 100 caracteres').trim(),
  description: z.string().max(500, 'Máximo 500 caracteres').nullish(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, 'Selecciona al menos un día activo'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Color hexadecimal inválido'),
});

export const CategoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es obligatorio').max(50, 'Máximo 50 caracteres').trim(),
  icon: z.string().min(1, 'Debes elegir un icono'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Color hexadecimal inválido'),
  type: z.enum(['EXPENSE', 'INCOME', 'BOTH'] as const),
});

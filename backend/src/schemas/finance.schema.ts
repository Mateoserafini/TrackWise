import { z } from 'zod';

export const TransactionSchema = z.object({
  categoryId: z.string().uuid('Categoría inválida'),
  type: z.enum(['EXPENSE', 'INCOME'] as const),
  amount: z.number().positive('El monto debe ser un número positivo mayor a 0'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD')
    .default(() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }),
  // DESCRIPCIÓN ES NULLABLE / OPCIONAL:
  description: z
    .string()
    .max(255, 'La descripción no puede superar los 255 caracteres')
    .nullish()
    .transform((val) => (val?.trim() ? val.trim() : null)),
});

export const TransactionFilterSchema = z.object({
  month: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, 'El mes debe estar entre 1 y 12')
    .optional(),
  year: z
    .string()
    .regex(/^\d{4}$/, 'El año debe tener 4 dígitos')
    .optional(),
  categoryId: z.string().uuid('ID de categoría inválido').optional(),
  type: z.enum(['EXPENSE', 'INCOME'] as const).optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .optional(),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionFilterInput = z.infer<typeof TransactionFilterSchema>;

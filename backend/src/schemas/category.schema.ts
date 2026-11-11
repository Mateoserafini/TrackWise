import { z } from 'zod';

export const CategorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la categoría es requerido')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
    .trim(),
  icon: z
    .string()
    .min(1, 'Debes seleccionar un icono')
    .max(50)
    .trim(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Color hexadecimal válido (ej. #EF4444)'),
  type: z.enum(['EXPENSE', 'INCOME', 'BOTH'] as const),
});

export const UpdateCategorySchema = CategorySchema.partial();

export type CategoryInput = z.infer<typeof CategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

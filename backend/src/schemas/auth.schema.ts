import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(2, 'El nombre de usuario debe tener al menos 2 caracteres')
    .max(50, 'El nombre de usuario no puede exceder los 50 caracteres')
    .trim(),
  email: z
    .string()
    .email('Ingresa un correo electrónico válido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const VerifyOtpSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .trim()
    .toLowerCase(),
  code: z
    .string()
    .length(6, 'El código debe ser de exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener únicamente números'),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export const ResendOtpSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .trim()
    .toLowerCase(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;

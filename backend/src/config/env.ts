import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Cargar variables de entorno desde el archivo .env en la raíz del backend si existe
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: isProduction
    ? z
        .string()
        .min(1, 'DATABASE_URL es obligatoria')
        .refine(
          (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
          'DATABASE_URL debe comenzar con postgresql:// o postgres://'
        )
    : z
        .string()
        .default('postgresql://postgres:postgres@localhost:5432/trackwise'),
  JWT_SECRET: isProduction
    ? z
        .string()
        .min(32, 'JWT_SECRET debe tener al menos 32 caracteres para ser seguro')
    : z
        .string()
        .default('super_secreto_para_firmar_tokens_jwt_32_chars_min'),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Error de validación en variables de entorno:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Configuración de variables de entorno inválida.');
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;

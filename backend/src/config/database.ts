import { Pool, PoolConfig } from 'pg';
import { env } from './env';

const isNeon = env.DATABASE_URL.includes('neon.tech');
const isProduction = env.NODE_ENV === 'production';
const requiresSsl = isNeon || isProduction || env.DATABASE_URL.includes('sslmode=require');

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  ssl: requiresSsl
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  if (env.NODE_ENV === 'development') {
    console.log('📦 Conexión establecida con la base de datos PostgreSQL (Neon)');
  }
});

pool.on('error', (err: Error) => {
  if (
    env.NODE_ENV !== 'production' &&
    (err.message.includes('ECONNREFUSED') || err.message.includes('Connection terminated'))
  ) {
    return;
  }
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

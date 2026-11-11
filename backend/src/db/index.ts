import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { pool } from '../config/database';
import { env } from '../config/env';
import { mockDb } from './mockDb';

let activeMock = process.env.USE_MOCK_DB === 'true';
let warnedAboutMock = false;

function isConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as {
    code?: string;
    message?: string;
    errors?: Array<unknown>;
  };

  if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND' || e.code === 'ETIMEDOUT') {
    return true;
  }
  if (
    typeof e.message === 'string' &&
    (e.message.includes('ECONNREFUSED') ||
      e.message.includes('connect ENOTFOUND') ||
      e.message.includes('Connection terminated') ||
      e.message.includes('timeout'))
  ) {
    return true;
  }
  if (Array.isArray(e.errors) && e.errors.some((inner) => isConnectionError(inner))) {
    return true;
  }
  return false;
}

function notifyMockFallback(): void {
  if (!warnedAboutMock) {
    console.warn('\n=============================================================');
    console.warn('⚠️  [DATABASE] No se detectó PostgreSQL activo en puerto 5432 (ECONNREFUSED).');
    console.warn('💡 Activando automáticamente base de datos en memoria (Mock DB) para desarrollo.');
    console.warn('👉 Podés registrarte, verificar tu cuenta e interactuar con toda la app.');
    console.warn('👉 Para conectar Neon PostgreSQL, colocá DATABASE_URL en backend/.env y ejecutá:');
    console.warn('   npm run db:migrate');
    console.warn('=============================================================\n');
    warnedAboutMock = true;
  }
}

/**
 * Comprueba el estado de la conexión a la base de datos al iniciar el servidor.
 */
export async function checkDatabaseConnection(): Promise<void> {
  if (activeMock) {
    console.log('📦 Base de datos en memoria (Mock DB) activa.');
    return;
  }

  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de datos PostgreSQL conectada exitosamente.');
  } catch (error) {
    if (isConnectionError(error) && env.NODE_ENV !== 'production') {
      activeMock = true;
      notifyMockFallback();
    } else {
      console.error('❌ Error al conectar a la base de datos PostgreSQL:', error);
    }
  }
}

/**
 * Ejecuta una consulta SQL tipada sobre el pool de conexiones o mock en tests/desarrollo.
 * Cero 'any': utiliza genéricos estrictos que extienden QueryResultRow.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  if (activeMock) {
    return mockDb.query<T>(text, params);
  }

  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    if (env.NODE_ENV === 'development') {
      console.log(`[SQL] (${duration}ms) ${text.replace(/\s+/g, ' ').trim()}`);
    }

    return res;
  } catch (error) {
    if (isConnectionError(error) && env.NODE_ENV !== 'production') {
      activeMock = true;
      notifyMockFallback();
      return mockDb.query<T>(text, params);
    }

    console.error(`[SQL ERROR] en consulta: ${text}`);
    throw error;
  }
}

/**
 * Obtiene un cliente dedicado del pool para operaciones manuales o transacciones.
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Ejecuta una función dentro de una transacción con BEGIN / COMMIT / ROLLBACK automático.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { pool };

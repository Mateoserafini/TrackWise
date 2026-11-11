import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { initialCategories } from './mockDb';

const MOCK_FILE_PATH = path.join(__dirname, '../../.mock-db.json');

async function resetDatabase() {
  console.log('\n=============================================================');
  console.log('🧹 REINICIANDO BASE DE DATOS (TrackWise)');
  console.log('=============================================================');

  // 1. Limpiar base de datos Mock (.mock-db.json)
  try {
    const cleanStore = {
      users: [],
      categories: initialCategories.map((c) => ({
        ...c,
        created_at: new Date().toISOString(),
      })),
      transactions: [],
      habits: [],
      habitLogs: [],
      resetAt: new Date().toISOString(),
    };

    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(cleanStore, null, 2), 'utf8');
    console.log('✅ Base de datos Mock (.mock-db.json) reseteada exitosamente:');
    console.log('   - 0 usuarios registrados');
    console.log('   - 0 transacciones financieras');
    console.log('   - 0 hábitos y registros de check-in');
    console.log(`   - ${initialCategories.length} categorías por defecto restauradas`);
  } catch (err) {
    console.warn('⚠️ No se pudo reiniciar el archivo .mock-db.json:', err);
  }

  // 2. Si PostgreSQL está conectado y disponible, limpiar tablas y re-sembrar
  try {
    const client = await pool.connect();
    try {
      console.log('\n🐘 PostgreSQL conectado: limpiando tablas y re-sembrando...');
      await client.query(`
        TRUNCATE TABLE habit_logs, transactions, habits, categories, users CASCADE;
      `);
      console.log('   - Tablas truncadas exitosamente.');

      const seedsPath = path.join(__dirname, 'seeds.sql');
      if (fs.existsSync(seedsPath)) {
        const seedsSql = fs.readFileSync(seedsPath, 'utf8');
        await client.query(seedsSql);
        console.log('   - 8 categorías por defecto sembradas.');
      }
      console.log('✅ PostgreSQL reseteado exitosamente.');
    } finally {
      client.release();
    }
  } catch {
    console.log('\nℹ️  PostgreSQL no conectado (modo Mock DB en uso).');
    console.log('   El almacenamiento local en memoria y archivo quedó completamente limpio.');
  }

  console.log('=============================================================');
  console.log('🎉 BASE DE DATOS LIMPIA Y LISTA PARA PROBAR');
  console.log('👉 Podés levantar el backend con: npm run dev');
  console.log('=============================================================\n');
  process.exit(0);
}

void resetDatabase();

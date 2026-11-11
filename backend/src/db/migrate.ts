import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  console.log('🚀 Iniciando migración y sembrado de la base de datos en Neon...');

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedsPath = path.join(__dirname, 'seeds.sql');

    console.log('📄 Ejecutando schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Esquema y tablas creados exitosamente.');

    console.log('🌱 Ejecutando seeds.sql...');
    const seedsSql = fs.readFileSync(seedsPath, 'utf8');
    await pool.query(seedsSql);
    console.log('✅ Categorías por defecto sembradas exitosamente.');

    console.log('🎉 Migración completada con éxito.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void runMigrations();

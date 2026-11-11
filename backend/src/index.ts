import { app } from './app';
import { pool } from './config/database';
import { env } from './config/env';
import { checkDatabaseConnection } from './db';

const server = app.listen(env.PORT, '0.0.0.0', async () => {
  console.log(`====================================================`);
  console.log(`🚀 TrackWise API Server running on port ${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://127.0.0.1:${env.PORT}/api`);
  console.log(`====================================================`);
  await checkDatabaseConnection();
});

// Manejo de apagado elegante (Graceful Shutdown)
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor y conexiones...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('✅ Pool de PostgreSQL cerrado.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error al cerrar el pool de PostgreSQL:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => void handleShutdown('SIGINT'));
process.on('SIGTERM', () => void handleShutdown('SIGTERM'));

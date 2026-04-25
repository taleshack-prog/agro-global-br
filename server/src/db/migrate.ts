import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index';
import { logger } from '../services/logger';

async function runMigrations() {
  logger.info('Running database migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  logger.info('Migrations complete');
  await pool.end();
}

runMigrations().catch((err) => {
  logger.error('Migration failed', { error: err.message });
  process.exit(1);
});

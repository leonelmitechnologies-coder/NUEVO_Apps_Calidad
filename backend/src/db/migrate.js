import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

async function runMigrations() {
  const migrationClient = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const db = drizzle(migrationClient);

  console.log('🔄 Ejecutando migraciones...');

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('✅ Migraciones completadas');

  await migrationClient.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Error al ejecutar migraciones:', err);
  process.exit(1);
});

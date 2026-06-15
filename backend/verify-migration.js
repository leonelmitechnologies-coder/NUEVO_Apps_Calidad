#!/usr/bin/env node

/**
 * Script de verificación de migración PostgreSQL → MySQL
 * Verifica que todos los archivos se hayan actualizado correctamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = [];
let passed = 0;
let failed = 0;

function check(description, condition, details = '') {
  const result = condition;
  checks.push({ description, result, details });
  if (result) {
    passed++;
    console.log(`✅ ${description}`);
  } else {
    failed++;
    console.log(`❌ ${description}`);
    if (details) console.log(`   ${details}`);
  }
}

console.log('\n🔍 Verificando migración a MySQL...\n');

// 1. Verificar package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
check(
  'package.json: mysql2 en dependencies',
  packageJson.dependencies.hasOwnProperty('mysql2'),
  'Debe tener mysql2 en dependencies'
);
check(
  'package.json: postgres eliminado',
  !packageJson.dependencies.hasOwnProperty('postgres'),
  'No debe tener postgres en dependencies'
);

// 2. Verificar .env
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
check(
  '.env: DB_PORT=3306',
  envContent.includes('DB_PORT=3306'),
  'Puerto debe ser 3306'
);
check(
  '.env: DB_HOST actualizado',
  envContent.includes('DB_HOST=192.168.80.103'),
  'Host debe ser 192.168.80.103'
);
check(
  '.env: PORT=3005',
  envContent.includes('PORT=3005'),
  'Puerto del servidor debe ser 3005'
);
check(
  '.env: HOST=0.0.0.0',
  envContent.includes('HOST=0.0.0.0'),
  'Host del servidor debe ser 0.0.0.0'
);

// 3. Verificar drizzle.config.js
const drizzleConfig = fs.readFileSync(path.join(__dirname, 'drizzle.config.js'), 'utf8');
check(
  'drizzle.config.js: dialect mysql',
  drizzleConfig.includes("dialect: 'mysql'"),
  "Dialect debe ser 'mysql'"
);

// 4. Verificar database.js
const databaseJs = fs.readFileSync(path.join(__dirname, 'config', 'database.js'), 'utf8');
check(
  'database.js: import mysql2',
  databaseJs.includes("import mysql from 'mysql2/promise'"),
  'Debe importar mysql2/promise'
);
check(
  'database.js: drizzle-orm/mysql2',
  databaseJs.includes("from 'drizzle-orm/mysql2'"),
  'Debe usar drizzle-orm/mysql2'
);
check(
  'database.js: mysql.createPool',
  databaseJs.includes('mysql.createPool'),
  'Debe usar createPool de mysql2'
);

// 5. Verificar schema.js
const schemaJs = fs.readFileSync(path.join(__dirname, 'src', 'db', 'schema.js'), 'utf8');
check(
  'schema.js: import mysql-core',
  schemaJs.includes("from 'drizzle-orm/mysql-core'"),
  'Debe importar de mysql-core'
);
check(
  'schema.js: mysqlTable',
  schemaJs.includes('mysqlTable'),
  'Debe usar mysqlTable'
);
check(
  'schema.js: int() en lugar de integer()',
  schemaJs.includes('int(') && !schemaJs.includes('integer('),
  'Debe usar int() no integer()'
);
check(
  'schema.js: json() en lugar de jsonb()',
  schemaJs.includes('json(') && !schemaJs.includes('jsonb('),
  'Debe usar json() no jsonb()'
);
check(
  'schema.js: .autoincrement()',
  schemaJs.includes('.autoincrement()'),
  'Los seriales deben tener .autoincrement()'
);

// 6. Verificar migrate.js
const migrateJs = fs.readFileSync(path.join(__dirname, 'src', 'db', 'migrate.js'), 'utf8');
check(
  'migrate.js: import mysql2',
  migrateJs.includes("import mysql from 'mysql2/promise'"),
  'Debe importar mysql2/promise'
);
check(
  'migrate.js: drizzle-orm/mysql2',
  migrateJs.includes("from 'drizzle-orm/mysql2/migrator'"),
  'Debe importar de mysql2/migrator'
);

// 7. Verificar asistencia.controller.js
const asistenciaController = fs.readFileSync(
  path.join(__dirname, 'src', 'controllers', 'asistencia.controller.js'),
  'utf8'
);
check(
  'asistencia.controller.js: usa CONCAT',
  asistenciaController.includes('CONCAT(') && !asistenciaController.includes("|| ' ' ||"),
  'Debe usar CONCAT() para concatenar strings SQL'
);

// 8. Verificar tiempo-extra.controller.js
const tiempoExtraController = fs.readFileSync(
  path.join(__dirname, 'src', 'controllers', 'tiempo-extra.controller.js'),
  'utf8'
);
check(
  'tiempo-extra.controller.js: CAST sin NUMERIC',
  !tiempoExtraController.includes('AS NUMERIC'),
  'No debe usar CAST AS NUMERIC'
);

// 9. Verificar migraciones generadas
const drizzleDir = path.join(__dirname, 'drizzle');
const hasMigrations = fs.existsSync(drizzleDir) && fs.readdirSync(drizzleDir).length > 0;
check(
  'Migraciones MySQL generadas',
  hasMigrations,
  'Debe tener archivos en carpeta drizzle/'
);

if (hasMigrations) {
  const migrationFiles = fs.readdirSync(drizzleDir).filter(f => f.endsWith('.sql'));
  if (migrationFiles.length > 0) {
    const migrationContent = fs.readFileSync(
      path.join(drizzleDir, migrationFiles[0]),
      'utf8'
    );
    check(
      'Migración usa sintaxis MySQL',
      migrationContent.includes('AUTO_INCREMENT') && migrationContent.includes('CREATE TABLE'),
      'Debe usar sintaxis MySQL'
    );
  }
}

// 10. Verificar server.js
const serverJs = fs.readFileSync(path.join(__dirname, 'src', 'server.js'), 'utf8');
check(
  'server.js: ruta correcta a database.js',
  serverJs.includes("from '../config/database.js'"),
  "Debe usar '../config/database.js'"
);

// 11. Verificar archivos del frontend
const authJsPath = path.join(__dirname, '..', 'src', 'assets', 'js', 'auth.js');
if (fs.existsSync(authJsPath)) {
  const authJs = fs.readFileSync(authJsPath, 'utf8');
  check(
    'auth.js: URL del API actualizada',
    authJs.includes('192.168.80.103:3005/api'),
    'Debe apuntar a 192.168.80.103:3005'
  );
}

const asistenciaServicePath = path.join(__dirname, '..', 'src', 'assets', 'js', 'asistencia-service.js');
if (fs.existsSync(asistenciaServicePath)) {
  const asistenciaServiceJs = fs.readFileSync(asistenciaServicePath, 'utf8');
  check(
    'asistencia-service.js: URL del API actualizada',
    asistenciaServiceJs.includes('192.168.80.103:3005/api'),
    'Debe apuntar a 192.168.80.103:3005'
  );
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log(`✅ Verificaciones pasadas: ${passed}`);
console.log(`❌ Verificaciones fallidas: ${failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 ¡Migración verificada exitosamente!');
  console.log('\nPróximos pasos:');
  console.log('1. Crear la base de datos MySQL en el servidor');
  console.log('2. Ejecutar: npm run db:migrate');
  console.log('3. Ejecutar: npm run seed');
  console.log('4. Ejecutar: npm run dev');
  process.exit(0);
} else {
  console.log('\n⚠️  Hay verificaciones fallidas. Revisa los archivos indicados.');
  process.exit(1);
}

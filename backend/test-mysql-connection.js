import 'dotenv/config';
import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('Intentando conectar a MySQL...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('✅ Conectado exitosamente a MySQL');

    // Intentar listar bases de datos
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\nBases de datos disponibles:');
    databases.forEach(db => console.log(`  - ${db.Database}`));

    // Verificar si existe la base de datos misync
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    if (dbExists) {
      console.log(`\n✅ La base de datos '${process.env.DB_NAME}' ya existe`);
    } else {
      console.log(`\n⚠️ La base de datos '${process.env.DB_NAME}' NO existe`);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Código de error:', error.code);
    process.exit(1);
  }
}

testConnection();

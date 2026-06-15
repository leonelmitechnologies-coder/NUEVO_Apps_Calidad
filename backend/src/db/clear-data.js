import 'dotenv/config';
import db from '../config/database.js';
import { colaboradores, asistencia, tiempoExtra } from './schema.js';
import { sql } from 'drizzle-orm';

/**
 * Script para limpiar todos los datos de colaboradores, asistencia y tiempo extra
 * Mantiene solo el usuario admin
 */
async function clearData() {
  try {
    console.log('🗑️  Limpiando base de datos...');
    console.log('');

    // 1. Eliminar tiempo extra (tiene FK a colaboradores)
    const deletedTE = await db.delete(tiempoExtra);
    console.log(`✅ Eliminados registros de tiempo extra`);

    // 2. Eliminar asistencia (tiene FK a colaboradores)
    const deletedAsistencia = await db.delete(asistencia);
    console.log(`✅ Eliminados registros de asistencia`);

    // 3. Eliminar colaboradores
    const deletedColaboradores = await db.delete(colaboradores);
    console.log(`✅ Eliminados todos los colaboradores`);

    // 4. Resetear secuencias (autoincrement)
    await db.execute(sql`ALTER SEQUENCE colaboradores_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE asistencia_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE tiempo_extra_id_seq RESTART WITH 1`);
    console.log(`✅ Secuencias de ID reseteadas`);

    console.log('');
    console.log('🎉 Base de datos limpia');
    console.log('📝 Usuario admin mantenido');
    console.log('');
    console.log('Ahora puedes:');
    console.log('  - Agregar nuevos colaboradores desde http://localhost:8080/pages/index1000.html');
    console.log('  - Los IDs empezarán desde 1');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    process.exit(1);
  }
}

clearData();

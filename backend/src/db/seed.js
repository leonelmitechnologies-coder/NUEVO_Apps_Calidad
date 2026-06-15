import 'dotenv/config';
import db from '../../config/database.js';
import { users } from './schema.js';
import { hashPassword } from '../utils/password.js';
import { eq } from 'drizzle-orm';

/**
 * Script de seed para crear usuario administrador inicial
 */
async function seed() {
  try {
    console.log('🌱 Iniciando seed de base de datos...');

    // Verificar si ya existe el usuario admin
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.usuario, 'admin'))
      .limit(1);

    if (existingAdmin) {
      console.log('ℹ️  Usuario admin ya existe, omitiendo creación');
      process.exit(0);
    }

    // Crear usuario administrador
    const adminPassword = 'admin123'; // Contraseña por defecto
    const hashedPassword = await hashPassword(adminPassword);

    await db.insert(users).values({
      usuario: 'admin',
      password_hash: hashedPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      puesto: 'Administrador',
      departamento: null,
      departamentos_pasar_asistencia: [],
      departamentos_tiempo_extra: [],
      photo: null,
      security_question: null,
      security_answer_hash: null,
      permisos: {
        usuarios: true,
        asistencia: true,
        pasarAsistencia: true,
        agregarColaborador: true,
        historial: true,
        inasistencia: true,
        colaboradores: true,
        bajas: true,
        tiempoExtra: true,
        miPerfil: true,
      },
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('');
    console.log('📝 Credenciales de administrador:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();

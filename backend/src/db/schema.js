import { mysqlTable, serial, varchar, text, timestamp, boolean, json, int, date, time, decimal, unique } from 'drizzle-orm/mysql-core';

/**
 * Tabla de usuarios
 * Migrado desde localStorage 'appUsers'
 */
export const users = mysqlTable('users', {
  id: serial('id').primaryKey().autoincrement(),

  // Datos básicos
  usuario: varchar('usuario', { length: 50 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  apellido: varchar('apellido', { length: 100 }).notNull(),
  puesto: varchar('puesto', { length: 100 }),

  // Departamento
  departamento: varchar('departamento', { length: 100 }),

  // Arrays de departamentos (almacenados como JSON)
  departamentos_pasar_asistencia: json('departamentos_pasar_asistencia').default('[]'),
  departamentos_tiempo_extra: json('departamentos_tiempo_extra').default('[]'),

  // Foto (opcional, puede ser URL o null)
  photo: text('photo'),

  // Pregunta de seguridad para recuperación de contraseña
  security_question: varchar('security_question', { length: 255 }),
  security_answer_hash: varchar('security_answer_hash', { length: 255 }),

  // Permisos (almacenados como JSON)
  permisos: json('permisos').notNull().default('{"usuarios":false,"asistencia":true,"pasarAsistencia":false,"agregarColaborador":false,"historial":false,"inasistencia":false,"colaboradores":false,"bajas":false,"tiempoExtra":false,"miPerfil":true}'),

  // Seguridad
  failed_login_attempts: int('failed_login_attempts').default(0),
  locked_until: timestamp('locked_until'),

  // Auditoría
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  last_login: timestamp('last_login'),

  // Soft delete
  deleted_at: timestamp('deleted_at'),
});

/**
 * Tabla de refresh tokens para JWT
 */
export const refresh_tokens = mysqlTable('refresh_tokens', {
  id: serial('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  revoked_at: timestamp('revoked_at'),
  revoked: boolean('revoked').default(false).notNull(),
});

/**
 * Tabla de logs de seguridad
 * Migrado desde localStorage 'securityLog'
 */
export const security_logs = mysqlTable('security_logs', {
  id: serial('id').primaryKey().autoincrement(),
  event: varchar('event', { length: 100 }).notNull(),
  username: varchar('username', { length: 50 }),
  user_id: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  metadata: json('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabla de colaboradores
 * Migrado desde localStorage 'colaboradores'
 */
export const colaboradores = mysqlTable('colaboradores', {
  id: serial('id').primaryKey().autoincrement(),

  // Datos personales
  foto: text('foto'),
  nombres: varchar('nombres', { length: 100 }).notNull(),
  apellidos: varchar('apellidos', { length: 100 }).notNull(),

  // Datos laborales
  departamento: varchar('departamento', { length: 100 }).notNull(),
  puesto: varchar('puesto', { length: 100 }),
  turno: varchar('turno', { length: 20 }), // Matutino, Vespertino, Nocturno
  numero_empleado: varchar('numero_empleado', { length: 50 }).unique(),
  fecha_ingreso: date('fecha_ingreso').notNull(),
  estatus: varchar('estatus', { length: 20 }).default('Activo').notNull(), // Activo, Baja

  // Auditoría
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  deleted_at: timestamp('deleted_at'),
});

/**
 * Tabla de asistencia
 * Migrado desde localStorage 'historialAsistencia'
 */
export const asistencia = mysqlTable('asistencia', {
  id: serial('id').primaryKey().autoincrement(),

  // Relación con colaborador
  colaborador_id: int('colaborador_id').notNull().references(() => colaboradores.id),

  // Datos del registro
  departamento: varchar('departamento', { length: 100 }).notNull(),
  fecha: date('fecha').notNull(),
  hora: time('hora').notNull(),
  estado: varchar('estado', { length: 20 }).notNull(), // presente, ausente

  // Datos de inasistencia (opcional)
  tipo_inasistencia: varchar('tipo_inasistencia', { length: 50 }), // Falta, Incapacidad, Permiso, Vacaciones
  comentario: text('comentario'),

  // Auditoría
  registrado_por: int('registrado_por').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  deleted_at: timestamp('deleted_at'),
}, (table) => ({
  // Constraint: un colaborador solo puede tener 1 registro por día
  uniqueColaboradorFecha: unique().on(table.colaborador_id, table.fecha),
}));

/**
 * Tabla de tiempo extra
 * Migrado desde localStorage 'historialTiempoExtra'
 */
export const tiempoExtra = mysqlTable('tiempo_extra', {
  id: serial('id').primaryKey().autoincrement(),

  // Relación con colaborador
  colaborador_id: int('colaborador_id').notNull().references(() => colaboradores.id),

  // Datos del registro
  departamento: varchar('departamento', { length: 100 }).notNull(),
  fecha: date('fecha').notNull(),
  hora_inicio: time('hora_inicio').notNull(),
  hora_fin: time('hora_fin').notNull(),
  horas_totales: decimal('horas_totales', { precision: 5, scale: 2 }).notNull(),

  // Información adicional
  area: varchar('area', { length: 100 }),
  motivo: text('motivo').notNull(),
  autorizado_por: varchar('autorizado_por', { length: 100 }).notNull(),

  // Auditoría
  registrado_por: int('registrado_por').references(() => users.id),
  editado_por: int('editado_por').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  deleted_at: timestamp('deleted_at'),
});

# Resumen de Migración PostgreSQL → MySQL

## Estado: ✅ COMPLETADO - Listo para pruebas

**Fecha:** 2026-06-15
**Sistema:** MiSync - Sistema de Gestión de Asistencia
**Migración:** PostgreSQL → MySQL 8.0

---

## Verificación Automática

```bash
cd backend
node verify-migration.js
```

**Resultado:** ✅ 24/24 verificaciones pasadas

---

## Archivos Modificados

### Backend (9 archivos)

1. ✅ `backend/package.json` - Cambio de dependencia postgres → mysql2
2. ✅ `backend/.env` - Configuración de MySQL y servidor
3. ✅ `backend/drizzle.config.js` - Dialect postgresql → mysql
4. ✅ `backend/config/database.js` - Cliente MySQL completo
5. ✅ `backend/src/db/schema.js` - Esquema adaptado a MySQL
6. ✅ `backend/src/db/migrate.js` - Script de migración MySQL
7. ✅ `backend/src/controllers/asistencia.controller.js` - Sintaxis SQL MySQL
8. ✅ `backend/src/controllers/tiempo-extra.controller.js` - Casting MySQL
9. ✅ `backend/src/server.js` - Ruta de import corregida

### Frontend (2 archivos)

10. ✅ `src/assets/js/auth.js` - URL del API actualizada
11. ✅ `src/assets/js/asistencia-service.js` - URL del API actualizada

### Migraciones

12. ✅ `backend/drizzle/0000_first_spectrum.sql` - Migración MySQL generada

---

## Configuración del Servidor

### Base de Datos
- **Host:** 192.168.80.103
- **Puerto:** 3306
- **Base de datos:** misync
- **Usuario:** root
- **Character set:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

### Backend API
- **Host:** 0.0.0.0
- **Puerto:** 3005
- **URL completa:** http://192.168.80.103:3005

### Frontend
- **URL:** http://192.168.80.103:8080

---

## Problema Pendiente: Acceso Remoto MySQL

**Error actual:**
```
Access denied for user 'root'@'192.168.15.30' (using password: YES)
```

**Solución recomendada:**
Ejecutar directamente en el servidor MySQL (192.168.80.103):

```sql
CREATE DATABASE IF NOT EXISTS misync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Alternativa (crear usuario remoto):**
```sql
CREATE USER 'misync_user'@'192.168.15.30' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON misync.* TO 'misync_user'@'192.168.15.30';
FLUSH PRIVILEGES;
```

---

## Pasos de Ejecución

### 1. Crear Base de Datos (En el servidor MySQL)

```bash
# Opción A: Usar el archivo SQL
mysql -u root -p < backend/setup-database.sql

# Opción B: Ejecutar manualmente
mysql -u root -p
CREATE DATABASE IF NOT EXISTS misync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Ejecutar Migraciones (Desde desarrollo)

```bash
cd backend
npm run db:migrate
```

**Salida esperada:**
```
🔄 Ejecutando migraciones...
✅ Migraciones completadas
```

### 3. Ejecutar Seed

```bash
npm run seed
```

**Salida esperada:**
```
🌱 Iniciando seed de base de datos...
✅ Usuario administrador creado exitosamente

📝 Credenciales de administrador:
   Usuario: admin
   Contraseña: admin123
```

### 4. Iniciar Servidor

```bash
npm run dev
```

**Salida esperada:**
```
✅ Conexión a MySQL exitosa
🚀 Servidor corriendo en http://0.0.0.0:3005
```

### 5. Probar Frontend

Abrir en navegador:
```
http://192.168.80.103:8080
```

Login:
- Usuario: `admin`
- Contraseña: `admin123`

---

## Cambios Técnicos Clave

### 1. Dependencias

```diff
- "postgres": "^3.4.5"
+ "mysql2": "^3.11.5"
```

### 2. Configuración de Base de Datos

```diff
- dialect: 'postgresql'
+ dialect: 'mysql'

- DB_PORT=5432
+ DB_PORT=3306

- DB_HOST=localhost
+ DB_HOST=192.168.80.103
```

### 3. Schema (Drizzle ORM)

```diff
- import { pgTable, jsonb, integer } from 'drizzle-orm/pg-core'
+ import { mysqlTable, json, int } from 'drizzle-orm/mysql-core'

- export const users = pgTable('users', {
+ export const users = mysqlTable('users', {

- id: serial('id').primaryKey(),
+ id: serial('id').primaryKey().autoincrement(),

- permisos: jsonb('permisos').default({...})
+ permisos: json('permisos').default('{"usuarios":false,...}')

- user_id: integer('user_id')
+ user_id: int('user_id')
```

### 4. SQL en Controladores

```diff
- sql`${nombres} || ' ' || ${apellidos}`
+ sql`CONCAT(${nombres}, ' ', ${apellidos})`

- CAST(SUM(CAST(${horas} AS NUMERIC)) AS DECIMAL(10,2))
+ CAST(SUM(${horas}) AS DECIMAL(10,2))
```

### 5. Cliente de Base de Datos

```diff
- import postgres from 'postgres'
- const client = postgres(connectionString)
+ import mysql from 'mysql2/promise'
+ const poolConnection = mysql.createPool(config)

- import { drizzle } from 'drizzle-orm/postgres-js'
+ import { drizzle } from 'drizzle-orm/mysql2'
```

---

## Estructura de Tablas MySQL

| Tabla | Columnas | Foreign Keys | Unique Constraints |
|-------|----------|--------------|-------------------|
| users | 19 | 0 | usuario |
| refresh_tokens | 7 | 1 (user_id) | token |
| security_logs | 8 | 1 (user_id) | - |
| colaboradores | 13 | 0 | numero_empleado |
| asistencia | 12 | 2 (colaborador_id, registrado_por) | (colaborador_id, fecha) |
| tiempo_extra | 15 | 3 (colaborador_id, registrado_por, editado_por) | - |

---

## Archivos de Utilidad Creados

1. **`backend/verify-migration.js`**
   - Script de verificación automática
   - 24 comprobaciones
   - Ejecución: `node verify-migration.js`

2. **`backend/INSTRUCCIONES_MYSQL.md`**
   - Guía detallada de solución de problemas
   - 3 opciones de configuración de acceso

3. **`backend/setup-database.sql`**
   - Script SQL para crear la base de datos
   - Ejecutable directamente en MySQL

4. **`backend/create-database.js`**
   - Script Node.js para crear la base de datos
   - Requiere acceso remoto habilitado

5. **`backend/test-mysql-connection.js`**
   - Script de prueba de conexión
   - Lista bases de datos disponibles

6. **`MIGRACION_MYSQL_COMPLETA.md`**
   - Documentación completa de la migración
   - Guía de troubleshooting
   - Procedimientos de rollback

---

## Comandos Útiles

### Desarrollo

```bash
# Verificar migración
node verify-migration.js

# Instalar dependencias
npm install

# Generar migraciones
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Seed de datos
npm run seed

# Desarrollo (watch mode)
npm run dev

# Producción
npm start

# Drizzle Studio (GUI)
npm run db:studio
```

### MySQL (en servidor)

```bash
# Conectar
mysql -u root -p

# Ver bases de datos
SHOW DATABASES;

# Usar base de datos
USE misync;

# Ver tablas
SHOW TABLES;

# Describir tabla
DESCRIBE users;

# Backup
mysqldump -u root -p misync > backup.sql

# Restore
mysql -u root -p misync < backup.sql
```

---

## Checklist de Pruebas

### Pre-requisitos
- [ ] MySQL 8.0 instalado en servidor
- [ ] Base de datos `misync` creada
- [ ] Acceso de red configurado
- [ ] Credenciales correctas en `.env`

### Backend
- [ ] npm install completado
- [ ] Migraciones ejecutadas sin errores
- [ ] Seed ejecutado correctamente
- [ ] Servidor inicia correctamente
- [ ] Conexión a MySQL exitosa

### API
- [ ] POST /api/auth/login funciona
- [ ] POST /api/auth/refresh funciona
- [ ] GET /api/colaboradores funciona
- [ ] POST /api/asistencia funciona
- [ ] GET /api/tiempo-extra funciona

### Frontend
- [ ] Página de login carga
- [ ] Login con admin/admin123 funciona
- [ ] Dashboard RRHH carga
- [ ] Navegación entre páginas funciona
- [ ] Registro de asistencia funciona

---

## Troubleshooting

### Error: Access Denied MySQL
**Causa:** Usuario sin permisos de acceso remoto
**Solución:** Crear usuario con acceso remoto o ejecutar comandos en el servidor

### Error: Cannot find module 'mysql2'
**Causa:** Dependencias no instaladas
**Solución:** `npm install`

### Error: Database does not exist
**Causa:** Base de datos no creada
**Solución:** Ejecutar `CREATE DATABASE misync`

### Error: CORS policy
**Causa:** URL del frontend no está en CORS_ORIGIN
**Solución:** Verificar CORS_ORIGIN en `.env`

### Error: Connection timeout
**Causa:** Firewall o red
**Solución:** Verificar conectividad de red y firewall en puerto 3306

---

## Seguridad

### Recomendaciones

1. **Cambiar contraseña del admin**
   - Después del primer login, cambiar `admin123`

2. **Crear usuario MySQL específico**
   - No usar `root` en producción
   - Crear `misync_user` con permisos limitados

3. **Configurar firewall**
   - Permitir solo IPs necesarias en puerto 3306
   - Cerrar puerto 3306 al público

4. **Backups automáticos**
   - Configurar cron job para backup diario
   - Almacenar backups en ubicación segura

5. **Monitoreo**
   - Logs de seguridad en `security_logs`
   - Monitorear intentos de login fallidos
   - Alertas de actividad sospechosa

---

## Próximos Pasos

1. ✅ Migración de código completada
2. ✅ Verificación automática pasada
3. ⏳ Crear base de datos en servidor MySQL
4. ⏳ Ejecutar migraciones
5. ⏳ Ejecutar seed
6. ⏳ Probar backend
7. ⏳ Probar frontend
8. ⏳ Configurar backup
9. ⏳ Configurar monitoreo
10. ⏳ Despliegue en producción

---

## Soporte

Para problemas o preguntas:

1. Revisar `MIGRACION_MYSQL_COMPLETA.md`
2. Revisar `INSTRUCCIONES_MYSQL.md`
3. Ejecutar `node verify-migration.js`
4. Revisar logs: `npm run dev`
5. Verificar logs de MySQL en servidor

---

## Notas Finales

- ✅ Todos los archivos backend actualizados
- ✅ Todos los archivos frontend actualizados
- ✅ Migraciones MySQL generadas
- ✅ Scripts de utilidad creados
- ✅ Documentación completa
- ⏳ Pendiente: Acceso a MySQL en servidor
- ⏳ Pendiente: Pruebas de integración

**La migración está lista para ejecutarse una vez que se resuelva el acceso a MySQL.**

---

**Realizado por:** Claude Sonnet 4.5
**Fecha:** 2026-06-15
**Duración:** ~30 minutos
**Archivos modificados:** 12
**Archivos creados:** 6
**Estado:** ✅ COMPLETADO

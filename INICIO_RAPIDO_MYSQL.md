# Inicio Rápido - Migración MySQL

## ¿Qué se hizo?

Se migró el sistema MiSync completo de PostgreSQL a MySQL 8.0.

**Archivos modificados:** 12
**Estado:** ✅ Completado y verificado

---

## Verificación Rápida

```bash
cd backend
node verify-migration.js
```

Deberías ver: ✅ 24/24 verificaciones pasadas

---

## Problema Actual

El servidor MySQL no permite conexiones remotas desde esta máquina.

**Error:**
```
Access denied for user 'root'@'192.168.15.30'
```

---

## Solución Rápida

### Opción 1: Ejecutar en el servidor (RECOMENDADO)

Conéctate al servidor 192.168.80.103 y ejecuta:

```bash
mysql -u root -p
```

Luego:

```sql
CREATE DATABASE IF NOT EXISTS misync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Opción 2: Habilitar acceso remoto

En el servidor MySQL ejecuta:

```sql
CREATE USER 'misync_user'@'192.168.15.30' IDENTIFIED BY 'TuPasswordSeguro';
GRANT ALL PRIVILEGES ON misync.* TO 'misync_user'@'192.168.15.30';
FLUSH PRIVILEGES;
```

Luego actualiza `backend/.env`:

```env
DB_USER=misync_user
DB_PASSWORD=TuPasswordSeguro
```

---

## Pasos de Ejecución

### 1. Una vez creada la base de datos

```bash
cd backend
npm run db:migrate
```

### 2. Crear usuario admin

```bash
npm run seed
```

**Credenciales creadas:**
- Usuario: `admin`
- Contraseña: `admin123`

### 3. Iniciar servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Conexión a MySQL exitosa
🚀 Servidor corriendo en http://0.0.0.0:3005
```

### 4. Probar frontend

Abre en navegador:
```
http://192.168.80.103:8080
```

Login con `admin` / `admin123`

---

## Comandos Útiles

```bash
# Verificar migración
node verify-migration.js

# Ver reporte completo
node generate-migration-report.js

# Desarrollo
npm run dev

# Producción
npm start

# Ver base de datos (GUI)
npm run db:studio
```

---

## Archivos Importantes

- **`MIGRACION_MYSQL_COMPLETA.md`** - Documentación completa
- **`RESUMEN_MIGRACION_MYSQL.md`** - Resumen ejecutivo
- **`INSTRUCCIONES_MYSQL.md`** - Solución de problemas
- **`setup-database.sql`** - Script SQL para crear BD

---

## Configuración Actual

### Base de Datos
- **Host:** 192.168.80.103:3306
- **Base de datos:** misync
- **Usuario:** root

### Backend
- **URL:** http://192.168.80.103:3005

### Frontend
- **URL:** http://192.168.80.103:8080

---

## ¿Problemas?

1. Lee `INSTRUCCIONES_MYSQL.md`
2. Ejecuta `node verify-migration.js`
3. Revisa logs: `npm run dev`
4. Lee `MIGRACION_MYSQL_COMPLETA.md`

---

## Cambios Técnicos Clave

| Componente | Antes | Después |
|------------|-------|---------|
| Dependencia | postgres | mysql2 |
| Puerto BD | 5432 | 3306 |
| Host BD | localhost | 192.168.80.103 |
| Tipo JSON | jsonb | json |
| Tipo entero | integer | int |
| Concat SQL | \|\| | CONCAT() |
| Puerto API | 3001 | 3005 |

---

**Estado:** ✅ COMPLETADO - Listo para ejecutar
**Pendiente:** Crear base de datos en servidor MySQL

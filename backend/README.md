# MiSync Backend API

Backend REST API para el Sistema de Registro de Asistencia MiSync.

## 🚀 Stack Tecnológico

- **Node.js** 18+ con ES Modules
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Drizzle ORM** - ORM type-safe
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hash de contraseñas

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 8.0.0

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar PostgreSQL

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE misync;
```

### 3. Configurar variables de entorno

El archivo `.env` ya existe con la configuración. Verifica que los datos de PostgreSQL sean correctos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=misync
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Generar y ejecutar migraciones

```bash
# Generar archivos de migración
npm run db:generate

# Ejecutar migraciones (crear tablas)
npm run db:push

# O usar migrate
npm run db:migrate
```

### 5. Crear usuario administrador

```bash
npm run seed
```

Esto creará el usuario:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

## 🏃 Ejecutar el Servidor

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 📡 Endpoints Disponibles

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | No |
| POST | `/api/auth/refresh` | Renovar access token | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |

## 🔐 Autenticación

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "usuario": "admin",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "permisos": {...}
  }
}
```

### Usar Access Token

Incluir en el header `Authorization` de cada request:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Renovar Access Token

Cuando el access token expire (15 minutos), usar el refresh token:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🗄️ Estructura de Base de Datos

### Tabla: `users`

Almacena todos los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | serial | ID único |
| usuario | varchar(50) | Username único |
| password_hash | varchar(255) | Contraseña hasheada con bcrypt |
| nombre | varchar(100) | Nombre |
| apellido | varchar(100) | Apellido |
| puesto | varchar(100) | Puesto de trabajo |
| departamento | varchar(100) | Departamento |
| departamentos_pasar_asistencia | jsonb | Array de departamentos |
| departamentos_tiempo_extra | jsonb | Array de departamentos |
| photo | text | Foto en base64 o URL |
| security_question | varchar(255) | Pregunta de seguridad |
| security_answer_hash | varchar(255) | Respuesta hasheada |
| permisos | jsonb | Objeto de permisos |
| failed_login_attempts | integer | Intentos fallidos de login |
| locked_until | timestamp | Fecha de desbloqueo |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |
| last_login | timestamp | Último login |
| deleted_at | timestamp | Soft delete |

### Tabla: `refresh_tokens`

Almacena los refresh tokens activos.

### Tabla: `security_logs`

Almacena eventos de seguridad para auditoría.

## 🛡️ Seguridad

### Características implementadas:

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ JWT con access token (15 min) y refresh token (7-30 días)
- ✅ Rate limiting (100 requests/15min global, 5 logins/15min)
- ✅ Bloqueo de cuenta después de 5 intentos fallidos (15 min)
- ✅ CORS configurado
- ✅ Helmet.js para headers seguros
- ✅ Logs de auditoría de eventos de seguridad
- ✅ Validación de permisos por endpoint

## 📦 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Inicia servidor con auto-reload |
| Producción | `npm start` | Inicia servidor |
| Generar Migración | `npm run db:generate` | Genera archivos de migración |
| Ejecutar Migración | `npm run db:migrate` | Ejecuta migraciones pendientes |
| Push Schema | `npm run db:push` | Sincroniza schema directamente (dev) |
| Drizzle Studio | `npm run db:studio` | Abre UI visual de la DB |
| Seed | `npm run seed` | Crea usuario admin inicial |

## 🔧 Configuración Avanzada

### Variables de Entorno (.env)

```env
# Servidor
NODE_ENV=development
PORT=3000
HOST=localhost

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=misync
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=20

# JWT
JWT_ACCESS_SECRET=<secret-key>
JWT_REFRESH_SECRET=<secret-key>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_REFRESH_EXPIRY_REMEMBER=30d

# Seguridad
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_MAX_LOGIN_REQUESTS=5

# CORS
CORS_ORIGIN=http://localhost:8080
```

## 🧪 Testing (Próximamente)

```bash
npm test
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB, etc.)
│   ├── controllers/     # Controladores de rutas
│   ├── db/              # Schema, migraciones, seeds
│   ├── middleware/      # Middleware de Express
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades (JWT, password, etc.)
│   └── server.js        # Punto de entrada
├── drizzle/             # Archivos de migración generados
├── logs/                # Logs del servidor
├── .env                 # Variables de entorno
├── drizzle.config.js    # Configuración de Drizzle Kit
└── package.json
```

## 🐛 Troubleshooting

### Error: "Cannot connect to PostgreSQL"

- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `misync` exista

### Error: "Port 3000 already in use"

Cambia el puerto en `.env`:
```env
PORT=3001
```

### Error: "ECONNREFUSED"

Verifica que PostgreSQL esté escuchando en el puerto 5432:
```bash
netstat -an | grep 5432
```

## 📝 Próximos Pasos

- [ ] Implementar endpoints de usuarios (CRUD)
- [ ] Implementar endpoints de colaboradores
- [ ] Implementar endpoints de asistencia
- [ ] Implementar endpoints de tiempo extra
- [ ] Tests unitarios con Jest
- [ ] Tests de integración
- [ ] Documentación con Swagger/OpenAPI

## 👥 Autor

**MI Technologies, Inc.**

---

**Versión:** 1.0.0
**Última actualización:** Junio 2026

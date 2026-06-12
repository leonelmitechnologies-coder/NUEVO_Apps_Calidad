# MiSync - API REST Endpoints Completos

## Estado Actual del Proyecto

**Backend:** 100% Completo
**Frontend:** 75% Migrado (Pendiente: Tiempo Extra)

---

## Endpoints Disponibles

### 1. Autenticación (4 endpoints)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| POST | `/api/auth/refresh` | Renovar token | Sí |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

**Estado:** ✅ Backend Completo | ✅ Frontend Migrado

---

### 2. Usuarios (7 endpoints)

| Método | Endpoint | Descripción | Auth | Permiso |
|--------|----------|-------------|------|---------|
| GET | `/api/users` | Listar usuarios | Sí | usuarios |
| POST | `/api/users` | Crear usuario | Sí | usuarios |
| GET | `/api/users/:id` | Obtener usuario | Sí | usuarios o propio |
| PUT | `/api/users/:id` | Actualizar usuario | Sí | usuarios o propio |
| DELETE | `/api/users/:id` | Eliminar usuario | Sí | usuarios |
| PUT | `/api/users/:id/password` | Cambiar contraseña | Sí | propio |
| PUT | `/api/users/:id/security-question` | Actualizar pregunta seguridad | Sí | propio |

**Estado:** ✅ Backend Completo | ✅ Frontend Migrado

---

### 3. Colaboradores (6 endpoints)

| Método | Endpoint | Descripción | Auth | Permiso |
|--------|----------|-------------|------|---------|
| GET | `/api/colaboradores` | Listar colaboradores | Sí | colaboradores o asistencia |
| POST | `/api/colaboradores` | Crear colaborador | Sí | agregarColaborador o colaboradores |
| GET | `/api/colaboradores/:id` | Obtener colaborador | Sí | colaboradores o asistencia |
| PUT | `/api/colaboradores/:id` | Actualizar colaborador | Sí | colaboradores |
| DELETE | `/api/colaboradores/:id` | Eliminar colaborador | Sí | colaboradores |
| PUT | `/api/colaboradores/:id/baja` | Dar de baja | Sí | bajas o colaboradores |

**Filtros disponibles:**
- `?departamento=X` - Filtrar por departamento
- `?estatus=X` - Filtrar por estatus (Activo, Baja)

**Estado:** ✅ Backend Completo | ✅ Frontend Migrado

---

### 4. Asistencia (6 endpoints)

| Método | Endpoint | Descripción | Auth | Permiso |
|--------|----------|-------------|------|---------|
| GET | `/api/asistencia` | Listar asistencias | Sí | asistencia o historial |
| POST | `/api/asistencia` | Registrar asistencia | Sí | pasarAsistencia o asistencia |
| GET | `/api/asistencia/stats` | Estadísticas | Sí | asistencia o historial |
| GET | `/api/asistencia/:id` | Obtener asistencia | Sí | asistencia o historial |
| PUT | `/api/asistencia/:id` | Actualizar asistencia | Sí | asistencia |
| DELETE | `/api/asistencia/:id` | Eliminar asistencia | Sí | asistencia |

**Filtros disponibles:**
- `?fecha=YYYY-MM-DD` - Filtrar por fecha
- `?mes=YYYY-MM` - Filtrar por mes
- `?departamento=X` - Filtrar por departamento
- `?colaboradorId=X` - Filtrar por colaborador
- `?estado=X` - Filtrar por estado (presente, ausente)

**Estado:** ✅ Backend Completo | ✅ Frontend Migrado

---

### 5. Tiempo Extra (6 endpoints) - NUEVO

| Método | Endpoint | Descripción | Auth | Permiso |
|--------|----------|-------------|------|---------|
| GET | `/api/tiempo-extra` | Listar registros | Sí | tiempoExtra o historial |
| POST | `/api/tiempo-extra` | Crear registro | Sí | tiempoExtra |
| GET | `/api/tiempo-extra/stats` | Estadísticas | Sí | tiempoExtra o historial |
| GET | `/api/tiempo-extra/:id` | Obtener registro | Sí | tiempoExtra o historial |
| PUT | `/api/tiempo-extra/:id` | Actualizar registro | Sí | tiempoExtra |
| DELETE | `/api/tiempo-extra/:id` | Eliminar registro | Sí | tiempoExtra |

**Filtros disponibles:**
- `?fecha=YYYY-MM-DD` - Filtrar por fecha
- `?mes=YYYY-MM` - Filtrar por mes
- `?departamento=X` - Filtrar por departamento
- `?colaboradorId=X` - Filtrar por colaborador

**Características especiales:**
- Cálculo automático de horas en backend
- Manejo de turnos que cruzan medianoche
- JOIN con colaboradores (incluye nombre, foto, puesto)
- Estadísticas por departamento y colaborador

**Estado:** ✅ Backend Completo | ⏳ Frontend Pendiente

---

## Resumen de Endpoints

```
Total de Endpoints: 29

Por Módulo:
├─ Autenticación:   4 endpoints (14%)
├─ Usuarios:        7 endpoints (24%)
├─ Colaboradores:   6 endpoints (21%)
├─ Asistencia:      6 endpoints (21%)
└─ Tiempo Extra:    6 endpoints (21%)

Por Método HTTP:
├─ GET:     16 endpoints (55%)
├─ POST:     6 endpoints (21%)
├─ PUT:      6 endpoints (21%)
└─ DELETE:   1 endpoint   (3%)

Todos requieren autenticación excepto:
- POST /api/auth/login
```

---

## Base de Datos

### Tablas Implementadas

```sql
1. users (19 columnas)
   - Datos básicos, permisos, seguridad
   - FK: ninguna

2. refresh_tokens (7 columnas)
   - Tokens de refresco JWT
   - FK: user_id → users.id

3. security_logs (8 columnas)
   - Logs de eventos de seguridad
   - FK: user_id → users.id

4. colaboradores (13 columnas)
   - Datos de colaboradores
   - FK: ninguna

5. asistencia (12 columnas)
   - Registros de asistencia
   - FK: colaborador_id → colaboradores.id
   - FK: registrado_por → users.id
   - Constraint: UNIQUE(colaborador_id, fecha)

6. tiempo_extra (15 columnas) - NUEVA
   - Registros de tiempo extra
   - FK: colaborador_id → colaboradores.id
   - FK: registrado_por → users.id
   - FK: editado_por → users.id
```

### Migraciones Aplicadas

```
0001_initial_setup.sql      - users, refresh_tokens, security_logs
0002_colaboradores_asistencia.sql - colaboradores, asistencia
0003_cold_red_shift.sql     - tiempo_extra
```

---

## Autenticación y Autorización

### Sistema de Permisos

```javascript
// Permisos disponibles en users.permisos (JSONB)
{
  usuarios: boolean,           // Administrar usuarios
  asistencia: boolean,         // Ver asistencias
  pasarAsistencia: boolean,    // Registrar asistencia
  agregarColaborador: boolean, // Crear colaboradores
  historial: boolean,          // Ver historial
  inasistencia: boolean,       // Gestionar inasistencias
  colaboradores: boolean,      // Administrar colaboradores
  bajas: boolean,              // Dar de baja colaboradores
  tiempoExtra: boolean,        // Gestionar tiempo extra
  miPerfil: boolean            // Ver/editar perfil propio
}
```

### Flujo de Autenticación

```
1. Login: POST /api/auth/login
   → Retorna: accessToken (15min) + refreshToken (7 días)

2. Usar accessToken en headers:
   Authorization: Bearer <token>

3. Si expira accessToken:
   POST /api/auth/refresh
   → Retorna nuevo accessToken

4. Logout:
   POST /api/auth/logout
   → Revoca refreshToken
```

---

## Características Implementadas

### Seguridad

- ✅ JWT con access + refresh tokens
- ✅ Bcrypt para hashing de passwords
- ✅ Rate limiting (global y en login)
- ✅ Helmet para headers seguros
- ✅ CORS configurado
- ✅ Intento de login fallidos (max 5)
- ✅ Bloqueo temporal de cuenta
- ✅ Security logs

### Validaciones

- ✅ Formato de fecha (YYYY-MM-DD)
- ✅ Formato de hora (HH:MM)
- ✅ Formato de email
- ✅ Longitud de campos
- ✅ Unicidad (usuario, numeroEmpleado)
- ✅ Foreign keys
- ✅ Campos requeridos
- ✅ Permisos por endpoint

### Auditoría

- ✅ created_at en todas las tablas
- ✅ updated_at en todas las tablas
- ✅ deleted_at para soft delete
- ✅ registrado_por (user_id)
- ✅ editado_por (user_id)
- ✅ last_login en users
- ✅ security_logs para eventos

### Performance

- ✅ Índices automáticos en FK
- ✅ Queries optimizadas con Drizzle
- ✅ JOIN eficientes
- ✅ Soft delete sin afectar queries
- ✅ Timestamps con default now()

---

## Configuración del Servidor

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
HOST=localhost
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=misync_db
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_super_secreto
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=tu_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_MAX_LOGIN_REQUESTS=5
```

### Iniciar Servidor

```bash
cd backend
npm install
npm run db:push  # Aplicar migraciones
npm start        # Iniciar servidor
```

### URL Base

```
Desarrollo:  http://localhost:3000
Producción:  https://api.misync.com (TBD)
```

---

## Ejemplos de Uso

### 1. Login y Crear Tiempo Extra

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario: 'admin',
    password: 'admin123'
  })
});

const { accessToken } = await loginResponse.json();

// 2. Crear tiempo extra
const response = await fetch('http://localhost:3000/api/tiempo-extra', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    colaboradorId: 1,
    departamento: 'Produccion',
    fecha: '2024-06-12',
    horaInicio: '18:00',
    horaFin: '21:00',
    motivo: 'Entrega urgente',
    autorizadoPor: 'Ing. García'
  })
});

const data = await response.json();
console.log('Registro creado:', data.registro);
// Backend calculó automáticamente: horasTotales = 3.00
```

### 2. Obtener Estadísticas del Mes

```javascript
const response = await fetch('http://localhost:3000/api/tiempo-extra/stats?mes=2024-06', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const stats = await response.json();
console.log('Total horas:', stats.totalGeneral.horas);
console.log('Por departamento:', stats.porDepartamento);
console.log('Por colaborador:', stats.porColaborador);
```

---

## Roadmap

### Completado ✅

- [x] Fase 1: Autenticación (Login, JWT, Refresh Tokens)
- [x] Fase 2: Usuarios CRUD
- [x] Fase 2.5: Frontend Usuarios
- [x] Fase 3: Colaboradores CRUD
- [x] Fase 3.5: Frontend Colaboradores
- [x] Fase 4: Asistencia CRUD
- [x] Fase 4.5: Frontend Asistencia
- [x] Fase 5: Tiempo Extra Backend

### En Progreso ⏳

- [ ] Fase 5.1: Frontend Tiempo Extra

### Pendiente 📋

- [ ] Fase 6: Reportes y Exportación
- [ ] Fase 7: Dashboard y Analytics
- [ ] Fase 8: Notificaciones
- [ ] Fase 9: Configuración del Sistema
- [ ] Fase 10: Deploy a Producción

---

## Tecnologías Utilizadas

### Backend

- **Node.js** v22+
- **Express** 4.x - Framework web
- **PostgreSQL** 17 - Base de datos
- **Drizzle ORM** - Type-safe queries
- **JWT** - Autenticación
- **Bcrypt** - Hashing de passwords
- **Helmet** - Seguridad
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logger
- **express-rate-limit** - Rate limiting

### Frontend

- **HTML5**
- **CSS3** (Variables CSS)
- **Vanilla JavaScript**
- **Fetch API**
- **LocalStorage** (en migración)

### DevOps

- **Git** - Control de versiones
- **npm** - Gestión de paquetes
- **Drizzle Kit** - Migraciones de BD
- **VS Code** - Editor

---

## Documentación

### Archivos de Referencia

```
FASE1_AUTH.md                  - Autenticación
FASE2_USUARIOS_API.md          - Usuarios Backend
FASE2.5_FRONTEND_USUARIOS.md   - Usuarios Frontend
FASE3_COLABORADORES.md         - Colaboradores
FASE4_ASISTENCIA.md            - Asistencia Backend
FASE4_RESUMEN.md               - Resumen Asistencia
FASE5_TIEMPO_EXTRA.md          - Tiempo Extra Backend
FASE5_FRONTEND_MIGRATION.md    - Guía Migración Frontend
RESUMEN_FASE5_COMPLETADA.md    - Resumen Fase 5
API_ENDPOINTS_COMPLETOS.md     - Este archivo
```

### Pruebas HTTP

```
backend/test-auth.http
backend/test-users.http
backend/test-colaboradores.http
backend/test-asistencia.http
backend/test-tiempo-extra.http
```

---

## Soporte

### Logs

```bash
# Ver logs del servidor
npm start

# Los logs se muestran en consola con Morgan
```

### Errores Comunes

1. **Error de conexión a BD**
   - Verificar que PostgreSQL esté corriendo
   - Verificar credenciales en .env
   - Verificar que la base de datos exista

2. **Token expirado**
   - Usar /api/auth/refresh para renovar
   - Si refresh token expiró, hacer login de nuevo

3. **403 Forbidden**
   - Verificar que el usuario tenga el permiso requerido
   - Verificar que el token sea válido

4. **404 Not Found**
   - Verificar URL del endpoint
   - Verificar que el ID exista en la BD

---

## Métricas del Proyecto

```
Archivos Backend:    ~25 archivos
Líneas de Código:    ~5,500 líneas
Endpoints:           29 endpoints
Tablas BD:           6 tablas
Migraciones:         3 migraciones
Tests HTTP:          ~50 casos de prueba
Documentación:       ~4,000 líneas
```

---

**Última Actualización:** 2026-06-12
**Versión API:** 1.0.0
**Estado:** Backend 100% | Frontend 75%

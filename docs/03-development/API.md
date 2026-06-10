# Documentación de API

Documentación de la API REST del Sistema de Registro de Asistencia (Futuro Backend).

> **Estado:** 🚧 En Planificación - Esta API aún no está implementada.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Error](#códigos-de-error)
- [Rate Limiting](#rate-limiting)
- [Ejemplos](#ejemplos)

## 🌐 Visión General

### Base URL

```
Desarrollo:  http://localhost:3000/api/v1
Staging:     https://staging-api.mitechnologies.com/api/v1
Producción:  https://api.mitechnologies.com/api/v1
```

### Formato de Datos

- **Request:** JSON (`Content-Type: application/json`)
- **Response:** JSON
- **Encoding:** UTF-8
- **Fechas:** ISO 8601 (e.g., `2026-06-04T10:30:00Z`)

### Versionado

La API usa versionado en la URL (`/api/v1/`).

### Headers Requeridos

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # Excepto endpoints públicos
```

## 🔐 Autenticación

### JWT (JSON Web Tokens)

La API usa JWT para autenticación. Los tokens expiran en 24 horas.

### POST /auth/login

Autenticar usuario y obtener token JWT.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-06-05T10:30:00Z",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@mitechnologies.com",
      "role": "employee",
      "department": "Calidad",
      "createdAt": "2026-01-15T08:00:00Z"
    }
  }
}
```

**Errores:**
- `400` - Datos inválidos
- `401` - Credenciales incorrectas
- `429` - Demasiados intentos

### POST /auth/logout

Invalidar token actual.

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### POST /auth/refresh

Renovar token antes de expiración.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-06-05T10:30:00Z"
  }
}
```

## 📍 Endpoints

### Usuarios

#### GET /users/me

Obtener información del usuario autenticado.

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@mitechnologies.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "employee",
    "department": "Calidad",
    "position": "Supervisor de Calidad",
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-06-04T10:30:00Z"
  }
}
```

#### PUT /users/me

Actualizar información del usuario.

**Request:**
```json
{
  "email": "nuevo.email@mitechnologies.com",
  "firstName": "Juan Carlos",
  "lastName": "Pérez García"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "nuevo.email@mitechnologies.com",
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "updatedAt": "2026-06-04T11:00:00Z"
  }
}
```

#### PUT /users/me/password

Cambiar contraseña del usuario.

**Request:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### Asistencia

#### POST /attendance/check-in

Registrar entrada.

**Request:**
```json
{
  "location": {
    "latitude": 25.6866,
    "longitude": -100.3161
  },
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.100"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Entrada registrada exitosamente",
  "data": {
    "id": 123,
    "userId": 1,
    "checkIn": "2026-06-04T08:00:00Z",
    "checkOut": null,
    "location": {
      "latitude": 25.6866,
      "longitude": -100.3161
    },
    "status": "active"
  }
}
```

#### POST /attendance/check-out

Registrar salida.

**Request:**
```json
{
  "attendanceId": 123
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Salida registrada exitosamente",
  "data": {
    "id": 123,
    "userId": 1,
    "checkIn": "2026-06-04T08:00:00Z",
    "checkOut": "2026-06-04T17:00:00Z",
    "totalHours": 9.0,
    "status": "completed"
  }
}
```

#### GET /attendance/history

Obtener historial de asistencias.

**Query Params:**
```
?startDate=2026-06-01
&endDate=2026-06-30
&page=1
&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 123,
        "date": "2026-06-04",
        "checkIn": "2026-06-04T08:00:00Z",
        "checkOut": "2026-06-04T17:00:00Z",
        "totalHours": 9.0,
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### GET /attendance/summary

Resumen de asistencias del mes actual.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "month": "2026-06",
    "totalDays": 20,
    "presentDays": 18,
    "absentDays": 2,
    "totalHours": 162.0,
    "averageHoursPerDay": 9.0,
    "punctuality": {
      "onTime": 16,
      "late": 2,
      "punctualityRate": 88.9
    }
  }
}
```

### Reportes

#### GET /reports/attendance

Generar reporte de asistencia.

**Query Params:**
```
?startDate=2026-06-01
&endDate=2026-06-30
&format=pdf  # pdf, excel, csv
&userId=1    # opcional, para admin
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportId": "abc123",
    "downloadUrl": "https://api.mitechnologies.com/downloads/abc123.pdf",
    "expiresAt": "2026-06-05T10:30:00Z"
  }
}
```

## 📊 Modelos de Datos

### User

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'supervisor' | 'employee';
  department: string;
  position: string;
  isActive: boolean;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

### Attendance

```typescript
interface Attendance {
  id: number;
  userId: number;
  checkIn: string;   // ISO 8601
  checkOut: string | null;  // ISO 8601
  location?: {
    latitude: number;
    longitude: number;
  };
  totalHours: number | null;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;  // ISO 8601
  };
}
```

## ❌ Códigos de Error

### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

### Códigos de Error Personalizados

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Usuario o contraseña incorrectos",
    "timestamp": "2026-06-04T10:30:00Z"
  }
}
```

**Códigos:**
- `AUTH_INVALID_CREDENTIALS` - Credenciales incorrectas
- `AUTH_TOKEN_EXPIRED` - Token expirado
- `AUTH_TOKEN_INVALID` - Token inválido
- `VALIDATION_ERROR` - Error de validación
- `RESOURCE_NOT_FOUND` - Recurso no encontrado
- `PERMISSION_DENIED` - Sin permisos
- `RATE_LIMIT_EXCEEDED` - Límite de requests excedido
- `SERVER_ERROR` - Error interno del servidor

## 🚦 Rate Limiting

### Límites por Endpoint

| Endpoint | Límite |
|----------|--------|
| `/auth/login` | 5 intentos / 15 min |
| `/auth/*` | 20 requests / hora |
| `/attendance/*` | 100 requests / hora |
| `/reports/*` | 10 requests / hora |
| Otros | 200 requests / hora |

### Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1654346400
```

## 💡 Ejemplos

### JavaScript (Fetch API)

```javascript
// Login
async function login(username, password) {
  const response = await fetch('https://api.mitechnologies.com/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const data = await response.json();
  return data.data;  // { token, expiresAt, user }
}

// Check-in
async function checkIn(token, location) {
  const response = await fetch('https://api.mitechnologies.com/api/v1/attendance/check-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ location })
  });

  const data = await response.json();
  return data.data;
}
```

### cURL

```bash
# Login
curl -X POST https://api.mitechnologies.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Get user info
curl https://api.mitechnologies.com/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Check-in
curl -X POST https://api.mitechnologies.com/api/v1/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "location": {
      "latitude": 25.6866,
      "longitude": -100.3161
    }
  }'
```

## 🔄 Migración del Mock Actual

### Antes (Mock)

```javascript
async function login(username, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        token: 'mock-token-' + Date.now(),
        user: { id: 1, username }
      });
    }, 800);
  });
}
```

### Después (API Real)

```javascript
async function login(username, password) {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}
```

---

**Última actualización:** Junio 2026
**Versión de API:** v1 (Planificación)
**Estado:** 🚧 En desarrollo

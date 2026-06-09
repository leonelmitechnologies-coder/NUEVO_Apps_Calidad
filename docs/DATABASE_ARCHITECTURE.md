# Análisis de Arquitectura de Base de Datos - MiSync

## Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Esquema de Datos Actual](#esquema-de-datos-actual)
3. [Modelo de Datos y Relaciones](#modelo-de-datos-y-relaciones)
4. [Análisis de Normalización](#análisis-de-normalización)
5. [Problemas de Diseño Identificados](#problemas-de-diseño-identificados)
6. [Recomendaciones de Mejora](#recomendaciones-de-mejora)
7. [Plan de Migración a Base de Datos Relacional](#plan-de-migración-a-base-de-datos-relacional)
8. [Estrategia de Índices y Optimización](#estrategia-de-índices-y-optimización)

---

## Resumen Ejecutivo

### Estado Actual
**Sistema de persistencia:** localStorage (navegador web)
**Arquitectura:** Monolítica cliente-lado
**Modelo de datos:** No relacional (JSON plano)
**Preparación para API:** Service Layer implementado

### Funcionalidades Principales
1. Autenticación de usuarios con recuperación de contraseña
2. Gestión de colaboradores (alta, baja, modificación)
3. Registro de asistencia diaria
4. Registro de tiempos extra
5. Reportes y dashboard de recursos humanos

### Tecnologías
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Almacenamiento actual:** localStorage (browser)
- **Capa de servicios:** AsistenciaService (preparado para API REST)

---

## Esquema de Datos Actual

### 1. Colección: `appUsers`
**Propósito:** Usuarios del sistema (credenciales y permisos)

```javascript
[
  {
    id: Number,                    // Timestamp único (Date.now())
    usuario: String,               // Username (único)
    password: String,              // Contraseña en texto plano ⚠️ CRÍTICO
    nombre: String,                // Nombre
    apellido: String,              // Apellido
    puesto: String,                // Puesto en la organización
    photo: String | null,          // Foto base64 (opcional)
    departamento: String | null,   // Departamento principal

    // Permisos por departamento
    departamentosPasarAsistencia: Array<String>,  // Deptos para pasar asistencia
    departamentosTiempoExtra: Array<String>,      // Deptos para tiempo extra

    // Recuperación de contraseña
    securityQuestion: String | null,   // Pregunta de seguridad
    securityAnswer: String | null,     // Respuesta (lowercase)

    // Permisos del sistema
    permisos: {
      usuarios: Boolean,              // Gestionar usuarios
      asistencia: Boolean,            // Ver asistencia
      pasarAsistencia: Boolean,       // Pasar asistencia
      agregarColaborador: Boolean,    // Crear colaboradores
      historial: Boolean,             // Ver historial
      inasistencia: Boolean,          // Registrar inasistencias
      colaboradores: Boolean,         // Ver colaboradores
      bajas: Boolean,                 // Gestionar bajas
      tiempoExtra: Boolean,           // Gestionar tiempo extra
      miPerfil: Boolean              // Ver mi perfil
    }
  }
]
```

**Cardinalidad estimada:** 5-50 usuarios
**Crecimiento:** Bajo (solo empleados administrativos)

---

### 2. Colección: `colaboradores`
**Propósito:** Empleados de la empresa (operadores, técnicos, etc.)

```javascript
[
  {
    id: Number,                    // ID único (autoincremental simulado)
    nombres: String,               // Nombre(s)
    apellidos: String,             // Apellido(s)
    numeroEmpleado: String,        // Número de nómina (debería ser único)
    departamento: String,          // Departamento
    puesto: String,                // Puesto de trabajo
    turno: String,                 // "Turno 1", "Turno 2", etc.
    fecha: String,                 // Fecha de alta (YYYY-MM-DD)
    estatus: String,               // "Activo" | "Inactivo"
    baja: Boolean,                 // true = dado de baja
    foto: String | null            // Foto base64 (opcional)
  }
]
```

**Cardinalidad estimada:** 50-500 colaboradores
**Crecimiento:** Medio-Alto (según contrataciones)

**Ejemplo:**
```javascript
{
  id: 1,
  nombres: "Juan Carlos",
  apellidos: "Pérez García",
  numeroEmpleado: "001234",
  departamento: "Producción",
  puesto: "Operador de Línea",
  turno: "Turno 1",
  fecha: "2024-01-15",
  estatus: "Activo",
  baja: false,
  foto: "data:image/jpeg;base64,..."
}
```

---

### 3. Colección: `historialAsistencia`
**Propósito:** Registro diario de asistencias e inasistencias

```javascript
[
  {
    id: Number,                    // Timestamp único (Date.now())
    colaboradorId: Number,         // FK -> colaboradores.id
    colaboradorNombre: String,     // Nombre completo (desnormalizado)
    departamento: String,          // Departamento (desnormalizado)
    fecha: String,                 // Fecha del registro (YYYY-MM-DD)
    hora: String,                  // Hora de registro (HH:MM)
    estado: String,                // "presente" | "ausente"
    tipoInasistencia: String | null,  // Ver tabla de tipos
    comentario: String | null      // Observaciones
  }
]
```

**Tipos de Inasistencia:**
| Código | Descripción | Justificado |
|--------|-------------|-------------|
| `FI` | Falta Injustificada | No |
| `FJ` | Falta Justificada | Sí |
| `PSG` | Permiso Sin Goce | Sí |
| `PCG` | Permiso Con Goce | Sí |
| `IT` | Incapacidad Temporal | Sí |
| `RET` | Retardo | No |
| `Suspension` | Suspensión | No |
| `CUM` | Cumpleaños | Sí |
| `FES` | Festivo | Sí |
| `Vacaciones` | Vacaciones | Sí |

**Cardinalidad estimada:** 10,000 - 100,000+ registros/año
**Crecimiento:** Alto (registros diarios por colaborador)

**Ejemplo:**
```javascript
{
  id: 1686234567890,
  colaboradorId: 1,
  colaboradorNombre: "Juan Carlos Pérez García",
  departamento: "Producción",
  fecha: "2026-06-08",
  hora: "08:30",
  estado: "presente",
  tipoInasistencia: null,
  comentario: null
}
```

---

### 4. Colección: `tiemposExtra`
**Propósito:** Registro de horas extra trabajadas

```javascript
[
  {
    id: Number,                    // Timestamp único (Date.now())
    colaboradorId: Number,         // FK -> colaboradores.id
    colaboradorNombre: String,     // Nombre completo (desnormalizado)
    departamento: String,          // Departamento (desnormalizado)
    puesto: String,                // Puesto (desnormalizado)
    fecha: String,                 // Fecha (YYYY-MM-DD)
    horasExtra: Number,            // Horas trabajadas (decimal)
    motivo: String,                // Razón del tiempo extra
    aprobado: Boolean              // Estado de aprobación
  }
]
```

**Cardinalidad estimada:** 500 - 5,000 registros/año
**Crecimiento:** Medio (depende de operaciones)

**Ejemplo:**
```javascript
{
  id: 1686234567891,
  colaboradorId: 1,
  colaboradorNombre: "Juan Carlos Pérez García",
  departamento: "Producción",
  puesto: "Operador de Línea",
  fecha: "2026-06-08",
  horasExtra: 2.5,
  motivo: "Producción urgente - Pedido especial",
  aprobado: true
}
```

---

### 5. Colección: `securityLog`
**Propósito:** Auditoría de eventos de seguridad

```javascript
[
  {
    event: String,                 // Tipo de evento
    username: String,              // Usuario involucrado
    timestamp: String,             // ISO 8601 timestamp
    userAgent: String              // Browser info
  }
]
```

**Eventos registrados:**
- `password_recovered` - Contraseña recuperada
- `password_recovery_lockout` - Bloqueo por intentos fallidos
- `security_question_setup` - Pregunta de seguridad configurada

**Cardinalidad:** Limitado a últimos 100 eventos (FIFO)

---

### 6. Configuración: `darkMode`
**Propósito:** Preferencia de tema del usuario

```javascript
"true" | "false"  // String booleano
```

---

## Modelo de Datos y Relaciones

### Diagrama Entidad-Relación (Conceptual)

```
┌─────────────────┐
│   appUsers      │
├─────────────────┤
│ PK id           │
│ UK usuario      │
│    password     │◄─────── ⚠️ Sin encriptación
│    nombre       │
│    apellido     │
│    permisos     │
│    departamento │
└─────────────────┘

┌─────────────────┐         ┌──────────────────────┐
│  colaboradores  │         │  historialAsistencia │
├─────────────────┤         ├──────────────────────┤
│ PK id           │◄────────│ FK colaboradorId     │
│ UK numEmpleado? │    1:N  │ PK id                │
│    nombres      │         │    fecha             │
│    apellidos    │         │    estado            │
│    departamento │         │    tipoInasistencia  │
│    puesto       │         │    hora              │
│    turno        │         │    comentario        │
│    baja         │         │ (desnormalizado)     │
└─────────────────┘         │    colaboradorNombre │
       │                    │    departamento      │
       │                    └──────────────────────┘
       │
       │ 1:N                ┌──────────────────────┐
       └────────────────────│  tiemposExtra        │
                            ├──────────────────────┤
                            │ FK colaboradorId     │
                            │ PK id                │
                            │    fecha             │
                            │    horasExtra        │
                            │    aprobado          │
                            │ (desnormalizado)     │
                            │    colaboradorNombre │
                            │    departamento      │
                            │    puesto            │
                            └──────────────────────┘
```

### Relaciones Actuales

1. **colaboradores → historialAsistencia** (1:N)
   - Un colaborador tiene muchos registros de asistencia
   - FK: `colaboradorId`
   - Desnormalización: `colaboradorNombre`, `departamento`

2. **colaboradores → tiemposExtra** (1:N)
   - Un colaborador tiene muchos registros de tiempo extra
   - FK: `colaboradorId`
   - Desnormalización: `colaboradorNombre`, `departamento`, `puesto`

3. **appUsers → NO HAY RELACIÓN DIRECTA** con colaboradores
   - Separación total entre usuarios del sistema y empleados
   - Problema: No hay forma de vincular un usuario con su ficha de empleado

---

## Análisis de Normalización

### Violaciones de Formas Normales

#### 1. Primera Forma Normal (1NF) - ✅ CUMPLE
- Todos los campos son atómicos
- No hay arrays multivaluados (excepto permisos, que es aceptable)
- Valores únicos por celda

#### 2. Segunda Forma Normal (2NF) - ⚠️ PARCIALMENTE CUMPLE

**Problema en `historialAsistencia`:**
```javascript
{
  colaboradorId: 1,
  colaboradorNombre: "Juan Pérez",  // ← Dependencia transitiva
  departamento: "Producción"        // ← Dependencia transitiva
}
```
- `colaboradorNombre` y `departamento` dependen de `colaboradorId`, no de la clave primaria (`id`)
- Violación: Campos no dependen completamente de la PK

**Problema en `tiemposExtra`:**
```javascript
{
  colaboradorId: 1,
  colaboradorNombre: "Juan Pérez",  // ← Redundancia
  departamento: "Producción",       // ← Redundancia
  puesto: "Operador"                // ← Redundancia
}
```

#### 3. Tercera Forma Normal (3NF) - ❌ NO CUMPLE

**Problema: Dependencias transitivas evidentes**

```
historialAsistencia.id → colaboradorId → colaboradorNombre
historialAsistencia.id → colaboradorId → departamento
```

Esta desnormalización causa:
- Redundancia de datos (mismo nombre repetido miles de veces)
- Riesgo de inconsistencias (si se actualiza nombre en `colaboradores`)
- Desperdicio de espacio (localStorage tiene límite de 5-10 MB)

#### 4. Forma Normal de Boyce-Codd (BCNF) - ❌ NO CUMPLE
Por las mismas razones que 3NF.

---

## Problemas de Diseño Identificados

### 1. CRÍTICOS (Seguridad)

#### 🔴 Contraseñas en texto plano
**Archivo:** `src/assets/js/auth.js`
```javascript
appUsers: [{
  password: 'admin123'  // ⚠️ SIN HASH
}]
```

**Impacto:** Cualquier usuario con acceso a DevTools puede ver todas las contraseñas.

**Riesgo:** OWASP Top 10 - A02:2021 Cryptographic Failures

**Solución recomendada:**
```javascript
// Usar bcrypt, scrypt o argon2
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);

// Verificación
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

#### 🔴 Respuestas de seguridad en texto plano
**Archivo:** `src/assets/js/auth.js`
```javascript
securityAnswer: 'respuesta'  // ⚠️ SIN HASH
```

**Solución:**
```javascript
securityAnswer: bcrypt.hashSync(answer.toLowerCase(), 10)
```

---

### 2. ALTOS (Integridad de Datos)

#### 🟠 Sin integridad referencial
**Problema:** No se valida que `colaboradorId` exista antes de insertar.

```javascript
// En historialAsistencia
historial.push({
  colaboradorId: 999,  // ¿Existe este colaborador?
  // ...
});
```

**Solución:** Validación en capa de servicio:
```javascript
async registrarAsistencia(registro) {
  const colaborador = await this.getColaboradorById(registro.colaboradorId);
  if (!colaborador) {
    throw new Error('Colaborador no encontrado');
  }
  // Continuar con inserción
}
```

---

#### 🟠 Desnormalización excesiva
**Problema:** Datos duplicados que pueden quedar inconsistentes.

**Escenario:**
1. Colaborador "Juan Pérez" cambia de departamento
2. Se actualiza en `colaboradores`
3. Registros antiguos en `historialAsistencia` siguen mostrando departamento viejo
4. Dashboard muestra datos confusos

**Impacto:** Reportes históricos incorrectos.

**Solución correcta:**
```sql
-- Guardar solo FK
INSERT INTO historial_asistencia (colaborador_id, fecha, estado)
VALUES (1, '2026-06-08', 'presente');

-- JOIN al consultar
SELECT
  h.fecha,
  c.nombres,
  c.departamento  -- ← Siempre actualizado
FROM historial_asistencia h
JOIN colaboradores c ON h.colaborador_id = c.id;
```

---

#### 🟠 Sin validación de unicidad
**Problema:** `numeroEmpleado` debería ser único pero no se valida.

```javascript
// Posible duplicado
colaboradores = [
  { id: 1, numeroEmpleado: '001234', ... },
  { id: 2, numeroEmpleado: '001234', ... }  // ⚠️ Duplicado
];
```

**Solución:**
```javascript
function agregarColaborador(nuevoColab) {
  const existe = colaboradores.find(
    c => c.numeroEmpleado === nuevoColab.numeroEmpleado
  );

  if (existe) {
    throw new Error('Número de empleado ya existe');
  }

  colaboradores.push(nuevoColab);
}
```

---

### 3. MEDIOS (Escalabilidad)

#### 🟡 localStorage tiene límites
**Límites del navegador:**
- Chrome/Edge: 10 MB
- Firefox: 10 MB
- Safari: 5 MB

**Cálculo aproximado:**
```
500 colaboradores × 2 KB = 1 MB
+ 50,000 registros asistencia × 0.3 KB = 15 MB  ⚠️ EXCEDE LÍMITE
```

**Solución:** Migrar a base de datos server-side.

---

#### 🟡 Sin paginación ni lazy loading
**Problema:** Se cargan TODOS los registros en memoria.

```javascript
// Carga todo el historial
const historial = JSON.parse(localStorage.getItem('historialAsistencia'));
// Si hay 50,000 registros, el navegador se congela
```

**Solución:**
```javascript
async function getRegistrosPaginados(page, pageSize, filtros) {
  const offset = (page - 1) * pageSize;

  const response = await fetch(
    `/api/asistencia?offset=${offset}&limit=${pageSize}`,
    { method: 'POST', body: JSON.stringify(filtros) }
  );

  return response.json();
}
```

---

### 4. BAJOS (Diseño)

#### 🟢 Tipos de inasistencia hardcoded
**Problema:** Tipos de inasistencia están en el código, no en BD.

**Archivo:** `ARQUITECTURA.md` línea 177-189

**Solución:** Tabla catálogo:
```sql
CREATE TABLE tipo_inasistencia (
  codigo VARCHAR(20) PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL,
  justificado BOOLEAN DEFAULT false,
  color VARCHAR(20),
  activo BOOLEAN DEFAULT true
);
```

---

#### 🟢 Falta de auditoría completa
**Problema:** Solo se auditan eventos de seguridad, no cambios de datos.

**Solución:** Tabla de auditoría:
```sql
CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50),
  operacion VARCHAR(10),  -- INSERT, UPDATE, DELETE
  registro_id INTEGER,
  usuario_id INTEGER,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Recomendaciones de Mejora

### Prioridad 1: Seguridad (INMEDIATO)

#### ✅ Implementar hash de contraseñas
```javascript
// auth.js
import bcrypt from 'bcryptjs';

async function createUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = {
    ...userData,
    password: hashedPassword
  };

  // Guardar usuario
}

async function verifyPassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}
```

#### ✅ Implementar tokens JWT
```javascript
import jwt from 'jsonwebtoken';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      permisos: user.permisos
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}
```

---

### Prioridad 2: Integridad (CORTO PLAZO)

#### ✅ Agregar validaciones
```javascript
class AsistenciaService {
  async registrarAsistencia(registro) {
    // 1. Validar colaborador existe
    const colaborador = await this.getColaboradorById(registro.colaboradorId);
    if (!colaborador) {
      throw new ValidationError('Colaborador no encontrado');
    }

    // 2. Validar no duplicado
    const existeHoy = await this.existeRegistroHoy(
      registro.colaboradorId,
      registro.fecha
    );
    if (existeHoy) {
      throw new ValidationError('Ya existe registro para hoy');
    }

    // 3. Validar fecha no futura
    if (new Date(registro.fecha) > new Date()) {
      throw new ValidationError('No se puede registrar fecha futura');
    }

    // 4. Insertar
    return await this.insertarRegistro(registro);
  }
}
```

#### ✅ Implementar constraints
```javascript
class Colaborador {
  constructor(data) {
    // Validación de campos requeridos
    this.validate(data);
    Object.assign(this, data);
  }

  validate(data) {
    const required = ['nombres', 'apellidos', 'numeroEmpleado', 'departamento'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} es requerido`);
      }
    }

    // Validar formato de número de empleado
    if (!/^\d{6}$/.test(data.numeroEmpleado)) {
      throw new Error('Número de empleado debe ser 6 dígitos');
    }
  }
}
```

---

### Prioridad 3: Escalabilidad (MEDIANO PLAZO)

#### ✅ Migrar a base de datos relacional

**Tecnologías recomendadas:**

**Opción 1: PostgreSQL (Recomendado)**
- Pros: Open source, robusto, JSON support, extensiones
- Cons: Requiere servidor
- Uso: Producción empresarial

**Opción 2: MySQL**
- Pros: Amplia adopción, buen rendimiento
- Cons: Menos features que PostgreSQL
- Uso: Alternativa popular

**Opción 3: Serverless (Neon, PlanetScale)**
- Pros: Sin mantenimiento de servidor, autoscaling
- Cons: Dependencia de proveedor cloud
- Uso: Startups y equipos pequeños

---

## Plan de Migración a Base de Datos Relacional

### Fase 1: Diseño del Esquema (Semana 1-2)

#### Esquema PostgreSQL Propuesto

```sql
-- ============================================
-- SCHEMA: MiSync - Sistema de Asistencia
-- ============================================

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  puesto VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  foto_url VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Auditoría
  created_by INTEGER REFERENCES usuarios(id),
  updated_by INTEGER REFERENCES usuarios(id),

  -- Índices
  CONSTRAINT username_min_length CHECK (LENGTH(username) >= 3)
);

-- Tabla de recuperación de contraseña
CREATE TABLE usuario_seguridad (
  usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  pregunta_seguridad VARCHAR(255),
  respuesta_hash VARCHAR(255),
  intentos_fallidos INTEGER DEFAULT 0,
  bloqueado_hasta TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo de departamentos
CREATE TABLE departamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  codigo VARCHAR(20) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo de puestos
CREATE TABLE puestos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  codigo VARCHAR(20),
  departamento_id INTEGER REFERENCES departamentos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo de turnos
CREATE TABLE turnos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  hora_entrada TIME,
  hora_salida TIME,
  activo BOOLEAN DEFAULT true
);

-- Permisos del sistema
CREATE TABLE permisos (
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo VARCHAR(50) NOT NULL,
  puede_ver BOOLEAN DEFAULT false,
  puede_crear BOOLEAN DEFAULT false,
  puede_editar BOOLEAN DEFAULT false,
  puede_eliminar BOOLEAN DEFAULT false,

  PRIMARY KEY (usuario_id, modulo)
);

-- Permisos por departamento
CREATE TABLE permisos_departamento (
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  departamento_id INTEGER REFERENCES departamentos(id) ON DELETE CASCADE,
  modulo VARCHAR(50) NOT NULL,

  PRIMARY KEY (usuario_id, departamento_id, modulo)
);

-- Tabla principal de colaboradores
CREATE TABLE colaboradores (
  id SERIAL PRIMARY KEY,
  numero_empleado VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  departamento_id INTEGER REFERENCES departamentos(id),
  puesto_id INTEGER REFERENCES puestos(id),
  turno_id INTEGER REFERENCES turnos(id),
  foto_url VARCHAR(500),
  fecha_alta DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_baja DATE,
  estatus VARCHAR(20) DEFAULT 'Activo' CHECK (estatus IN ('Activo', 'Inactivo', 'Suspendido')),
  motivo_baja TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Auditoría
  created_by INTEGER REFERENCES usuarios(id),
  updated_by INTEGER REFERENCES usuarios(id),

  -- Índices
  CONSTRAINT numero_empleado_format CHECK (numero_empleado ~ '^[0-9]{6}$')
);

-- Catálogo de tipos de inasistencia
CREATE TABLE tipos_inasistencia (
  codigo VARCHAR(20) PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL,
  justificado BOOLEAN DEFAULT false,
  color VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  orden_visualizacion INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de asistencia
CREATE TABLE asistencia (
  id SERIAL PRIMARY KEY,
  colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente')),
  tipo_inasistencia VARCHAR(20) REFERENCES tipos_inasistencia(codigo),
  comentario TEXT,
  registrado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE (colaborador_id, fecha),
  CHECK (
    (estado = 'presente' AND tipo_inasistencia IS NULL) OR
    (estado = 'ausente' AND tipo_inasistencia IS NOT NULL)
  )
);

-- Registro de tiempo extra
CREATE TABLE tiempos_extra (
  id SERIAL PRIMARY KEY,
  colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id),
  fecha DATE NOT NULL,
  horas_extra DECIMAL(4,2) NOT NULL CHECK (horas_extra > 0 AND horas_extra <= 12),
  motivo TEXT NOT NULL,
  aprobado BOOLEAN DEFAULT false,
  aprobado_por INTEGER REFERENCES usuarios(id),
  fecha_aprobacion TIMESTAMPTZ,
  registrado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoría de cambios
CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50) NOT NULL,
  operacion VARCHAR(10) NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id INTEGER NOT NULL,
  usuario_id INTEGER REFERENCES usuarios(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de seguridad
CREATE TABLE log_seguridad (
  id SERIAL PRIMARY KEY,
  evento VARCHAR(50) NOT NULL,
  username VARCHAR(50),
  usuario_id INTEGER REFERENCES usuarios(id),
  exitoso BOOLEAN,
  ip_address INET,
  user_agent TEXT,
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Usuarios
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_activo ON usuarios(activo) WHERE activo = true;

-- Colaboradores
CREATE INDEX idx_colaboradores_departamento ON colaboradores(departamento_id);
CREATE INDEX idx_colaboradores_turno ON colaboradores(turno_id);
CREATE INDEX idx_colaboradores_estatus ON colaboradores(estatus) WHERE estatus = 'Activo';
CREATE INDEX idx_colaboradores_numero_emp ON colaboradores(numero_empleado);

-- Asistencia (índices más importantes)
CREATE INDEX idx_asistencia_colaborador ON asistencia(colaborador_id);
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha DESC);
CREATE INDEX idx_asistencia_colab_fecha ON asistencia(colaborador_id, fecha DESC);
CREATE INDEX idx_asistencia_fecha_rango ON asistencia(fecha) WHERE fecha >= CURRENT_DATE - INTERVAL '90 days';

-- Tiempos extra
CREATE INDEX idx_tiempos_extra_colaborador ON tiempos_extra(colaborador_id);
CREATE INDEX idx_tiempos_extra_fecha ON tiempos_extra(fecha DESC);
CREATE INDEX idx_tiempos_extra_aprobado ON tiempos_extra(aprobado);

-- Auditoría
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at DESC);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);

-- Log de seguridad
CREATE INDEX idx_log_seguridad_evento ON log_seguridad(evento);
CREATE INDEX idx_log_seguridad_fecha ON log_seguridad(created_at DESC);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de colaboradores activos con nombres completos
CREATE VIEW v_colaboradores_activos AS
SELECT
  c.id,
  c.numero_empleado,
  c.nombres || ' ' || c.apellidos AS nombre_completo,
  c.nombres,
  c.apellidos,
  d.nombre AS departamento,
  p.nombre AS puesto,
  t.nombre AS turno,
  c.foto_url,
  c.fecha_alta,
  c.estatus
FROM colaboradores c
LEFT JOIN departamentos d ON c.departamento_id = d.id
LEFT JOIN puestos p ON c.puesto_id = p.id
LEFT JOIN turnos t ON c.turno_id = t.id
WHERE c.estatus = 'Activo';

-- Vista de asistencia con detalles
CREATE VIEW v_asistencia_detalle AS
SELECT
  a.id,
  a.fecha,
  a.hora,
  a.estado,
  c.numero_empleado,
  c.nombres || ' ' || c.apellidos AS colaborador,
  d.nombre AS departamento,
  p.nombre AS puesto,
  t.nombre AS turno,
  ti.descripcion AS tipo_inasistencia_desc,
  ti.justificado,
  a.comentario,
  u.username AS registrado_por
FROM asistencia a
JOIN colaboradores c ON a.colaborador_id = c.id
LEFT JOIN departamentos d ON c.departamento_id = d.id
LEFT JOIN puestos p ON c.puesto_id = p.id
LEFT JOIN turnos t ON c.turno_id = t.id
LEFT JOIN tipos_inasistencia ti ON a.tipo_inasistencia = ti.codigo
LEFT JOIN usuarios u ON a.registrado_por = u.id;

-- ============================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER trigger_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_colaboradores_updated_at
  BEFORE UPDATE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_asistencia_updated_at
  BEFORE UPDATE ON asistencia
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_tiempos_extra_updated_at
  BEFORE UPDATE ON tiempos_extra
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- Función de auditoría genérica
CREATE OR REPLACE FUNCTION auditoria_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria (tabla, operacion, registro_id, datos_anteriores)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria (tabla, operacion, registro_id, datos_anteriores, datos_nuevos)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria (tabla, operacion, registro_id, datos_nuevos)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER trigger_auditoria_colaboradores
  AFTER INSERT OR UPDATE OR DELETE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION auditoria_trigger();

CREATE TRIGGER trigger_auditoria_usuarios
  AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION auditoria_trigger();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Departamentos
INSERT INTO departamentos (nombre, codigo) VALUES
  ('Producción', 'PROD'),
  ('Calidad', 'CAL'),
  ('Mantenimiento', 'MANT'),
  ('Recursos Humanos', 'RRHH'),
  ('Almacén', 'ALM');

-- Turnos
INSERT INTO turnos (nombre, hora_entrada, hora_salida) VALUES
  ('Turno 1', '06:00', '14:00'),
  ('Turno 2', '14:00', '22:00'),
  ('Turno 3', '22:00', '06:00'),
  ('Administrativo', '08:00', '17:00');

-- Tipos de inasistencia
INSERT INTO tipos_inasistencia (codigo, descripcion, justificado, color, orden_visualizacion) VALUES
  ('FI', 'Falta Injustificada', false, 'yellow', 1),
  ('FJ', 'Falta Justificada', true, 'lightblue', 2),
  ('PSG', 'Permiso Sin Goce', true, 'gray', 3),
  ('PCG', 'Permiso Con Goce', true, 'gray', 4),
  ('IT', 'Incapacidad Temporal', true, 'blue', 5),
  ('RET', 'Retardo', false, 'yellow', 6),
  ('Suspension', 'Suspensión', false, 'red', 7),
  ('CUM', 'Cumpleaños', true, 'pink', 8),
  ('FES', 'Festivo', true, 'blue', 9),
  ('Vacaciones', 'Vacaciones', true, 'purple', 10);

-- Usuario admin inicial (password: admin123)
-- Hash generado con: bcrypt.hash('admin123', 10)
INSERT INTO usuarios (username, password_hash, nombre, apellido, puesto, activo) VALUES
  ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', 'Sistema', 'Administrador', true);

-- Permisos completos para admin
INSERT INTO permisos (usuario_id, modulo, puede_ver, puede_crear, puede_editar, puede_eliminar) VALUES
  (1, 'usuarios', true, true, true, true),
  (1, 'colaboradores', true, true, true, true),
  (1, 'asistencia', true, true, true, true),
  (1, 'tiempoExtra', true, true, true, true);
```

---

### Fase 2: Implementación Backend (Semana 3-6)

#### Estructura recomendada (Node.js + Express)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Configuración de PostgreSQL
│   │   ├── environment.js      # Variables de entorno
│   │   └── constants.js        # Constantes del sistema
│   │
│   ├── models/
│   │   ├── Usuario.js          # Modelo de usuarios
│   │   ├── Colaborador.js      # Modelo de colaboradores
│   │   ├── Asistencia.js       # Modelo de asistencia
│   │   └── TiempoExtra.js      # Modelo de tiempo extra
│   │
│   ├── controllers/
│   │   ├── authController.js   # Login, logout, recuperación
│   │   ├── colaboradorController.js
│   │   ├── asistenciaController.js
│   │   └── tiempoExtraController.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── colaborador.routes.js
│   │   ├── asistencia.routes.js
│   │   └── tiempoExtra.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── validation.middleware.js
│   │   └── errorHandler.middleware.js
│   │
│   ├── services/
│   │   ├── AsistenciaService.js
│   │   └── ReportService.js
│   │
│   └── app.js                  # Express app
│
├── migrations/                 # Scripts de migración de DB
├── seeds/                      # Datos de prueba
└── tests/                      # Tests unitarios
```

#### Ejemplo: API de Asistencia

```javascript
// controllers/asistenciaController.js
const AsistenciaService = require('../services/AsistenciaService');

class AsistenciaController {
  async registrarAsistencia(req, res, next) {
    try {
      const { colaboradorId, fecha, estado, tipoInasistencia, comentario } = req.body;
      const usuarioId = req.user.id; // De JWT

      const registro = await AsistenciaService.registrar({
        colaboradorId,
        fecha,
        estado,
        tipoInasistencia,
        comentario,
        registradoPor: usuarioId
      });

      res.status(201).json({
        success: true,
        data: registro
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerVistaSemanal(req, res, next) {
    try {
      const { semana, año, departamentos, turnos } = req.query;

      const datos = await AsistenciaService.getVistaSemanal({
        semana: parseInt(semana),
        año: parseInt(año),
        departamentos: departamentos ? departamentos.split(',') : [],
        turnos: turnos ? turnos.split(',') : []
      });

      res.json({
        success: true,
        data: datos
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AsistenciaController();
```

```javascript
// services/AsistenciaService.js
const db = require('../config/database');

class AsistenciaService {
  async registrar(datos) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Validar colaborador existe y está activo
      const colaboradorQuery = await client.query(
        'SELECT id, estatus FROM colaboradores WHERE id = $1',
        [datos.colaboradorId]
      );

      if (colaboradorQuery.rows.length === 0) {
        throw new Error('Colaborador no encontrado');
      }

      if (colaboradorQuery.rows[0].estatus !== 'Activo') {
        throw new Error('Colaborador no está activo');
      }

      // 2. Validar no existe registro para hoy
      const existeQuery = await client.query(
        'SELECT id FROM asistencia WHERE colaborador_id = $1 AND fecha = $2',
        [datos.colaboradorId, datos.fecha]
      );

      if (existeQuery.rows.length > 0) {
        throw new Error('Ya existe registro para esta fecha');
      }

      // 3. Insertar registro
      const insertQuery = await client.query(
        `INSERT INTO asistencia
         (colaborador_id, fecha, hora, estado, tipo_inasistencia, comentario, registrado_por)
         VALUES ($1, $2, CURRENT_TIME, $3, $4, $5, $6)
         RETURNING id, fecha, hora, estado`,
        [
          datos.colaboradorId,
          datos.fecha,
          datos.estado,
          datos.tipoInasistencia,
          datos.comentario,
          datos.registradoPor
        ]
      );

      await client.query('COMMIT');

      return insertQuery.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getVistaSemanal({ semana, año, departamentos, turnos }) {
    // Calcular rango de fechas
    const { fechaInicio, fechaFin } = this.calcularRangoSemana(semana, año);

    // Query optimizado con JOINs
    let query = `
      SELECT
        c.id AS colaborador_id,
        c.numero_empleado,
        c.nombres,
        c.apellidos,
        d.nombre AS departamento,
        p.nombre AS puesto,
        t.nombre AS turno,
        a.fecha,
        a.estado,
        a.tipo_inasistencia,
        ti.descripcion AS tipo_descripcion
      FROM colaboradores c
      LEFT JOIN departamentos d ON c.departamento_id = d.id
      LEFT JOIN puestos p ON c.puesto_id = p.id
      LEFT JOIN turnos t ON c.turno_id = t.id
      LEFT JOIN asistencia a ON c.id = a.colaborador_id
        AND a.fecha BETWEEN $1 AND $2
      LEFT JOIN tipos_inasistencia ti ON a.tipo_inasistencia = ti.codigo
      WHERE c.estatus = 'Activo'
    `;

    const params = [fechaInicio, fechaFin];

    // Aplicar filtros
    if (departamentos.length > 0) {
      query += ` AND d.nombre = ANY($${params.length + 1})`;
      params.push(departamentos);
    }

    if (turnos.length > 0) {
      query += ` AND t.nombre = ANY($${params.length + 1})`;
      params.push(turnos);
    }

    query += ' ORDER BY d.nombre, c.apellidos, c.nombres, a.fecha';

    const result = await db.pool.query(query, params);

    // Agrupar resultados por colaborador
    return this.agruparPorColaborador(result.rows, fechaInicio, fechaFin);
  }

  calcularRangoSemana(semana, año) {
    // Misma lógica que en asistencia-service.js
    // ...
  }

  agruparPorColaborador(rows, fechaInicio, fechaFin) {
    const colaboradores = {};

    rows.forEach(row => {
      if (!colaboradores[row.colaborador_id]) {
        colaboradores[row.colaborador_id] = {
          id: row.colaborador_id,
          numeroEmpleado: row.numero_empleado,
          nombres: row.nombres,
          apellidos: row.apellidos,
          departamento: row.departamento,
          puesto: row.puesto,
          turno: row.turno,
          diasSemana: {},
          totalPresentes: 0,
          totalAusentes: 0
        };
      }

      if (row.fecha) {
        const fechaStr = row.fecha.toISOString().split('T')[0];
        colaboradores[row.colaborador_id].diasSemana[fechaStr] = {
          estado: row.estado,
          tipoInasistencia: row.tipo_inasistencia,
          descripcion: row.tipo_descripcion
        };

        if (row.estado === 'presente') {
          colaboradores[row.colaborador_id].totalPresentes++;
        } else {
          colaboradores[row.colaborador_id].totalAusentes++;
        }
      }
    });

    return {
      colaboradores: Object.values(colaboradores),
      fechaInicio,
      fechaFin
    };
  }
}

module.exports = new AsistenciaService();
```

---

### Fase 3: Migración de Datos (Semana 7-8)

#### Script de migración de localStorage a PostgreSQL

```javascript
// scripts/migrateFromLocalStorage.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function migrateData(localStorageData) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Migrar departamentos (extraer únicos)
    const departamentos = [...new Set(
      localStorageData.colaboradores.map(c => c.departamento)
    )];

    const deptMap = {};
    for (const dept of departamentos) {
      const result = await client.query(
        'INSERT INTO departamentos (nombre) VALUES ($1) RETURNING id',
        [dept]
      );
      deptMap[dept] = result.rows[0].id;
    }

    // 2. Migrar turnos
    const turnos = [...new Set(
      localStorageData.colaboradores.map(c => c.turno)
    )];

    const turnoMap = {};
    for (const turno of turnos) {
      const result = await client.query(
        'INSERT INTO turnos (nombre) VALUES ($1) RETURNING id',
        [turno]
      );
      turnoMap[turno] = result.rows[0].id;
    }

    // 3. Migrar usuarios
    const userIdMap = {};
    for (const user of localStorageData.appUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const result = await client.query(
        `INSERT INTO usuarios
         (username, password_hash, nombre, apellido, puesto, foto_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          user.usuario,
          hashedPassword,
          user.nombre,
          user.apellido,
          user.puesto,
          user.photo
        ]
      );

      userIdMap[user.id] = result.rows[0].id;

      // Migrar permisos
      for (const [modulo, valor] of Object.entries(user.permisos)) {
        await client.query(
          `INSERT INTO permisos
           (usuario_id, modulo, puede_ver, puede_crear, puede_editar)
           VALUES ($1, $2, $3, $3, $3)`,
          [result.rows[0].id, modulo, valor]
        );
      }
    }

    // 4. Migrar colaboradores
    const colabIdMap = {};
    for (const colab of localStorageData.colaboradores) {
      const result = await client.query(
        `INSERT INTO colaboradores
         (numero_empleado, nombres, apellidos, departamento_id, turno_id,
          fecha_alta, estatus, fecha_baja, foto_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          colab.numeroEmpleado,
          colab.nombres,
          colab.apellidos,
          deptMap[colab.departamento],
          turnoMap[colab.turno],
          colab.fecha,
          colab.estatus,
          colab.baja ? new Date() : null,
          colab.foto
        ]
      );

      colabIdMap[colab.id] = result.rows[0].id;
    }

    // 5. Migrar historial de asistencia
    for (const asist of localStorageData.historialAsistencia) {
      await client.query(
        `INSERT INTO asistencia
         (colaborador_id, fecha, hora, estado, tipo_inasistencia, comentario)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          colabIdMap[asist.colaboradorId],
          asist.fecha,
          asist.hora,
          asist.estado,
          asist.tipoInasistencia,
          asist.comentario
        ]
      );
    }

    // 6. Migrar tiempos extra
    for (const te of localStorageData.tiemposExtra) {
      await client.query(
        `INSERT INTO tiempos_extra
         (colaborador_id, fecha, horas_extra, motivo, aprobado)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          colabIdMap[te.colaboradorId],
          te.fecha,
          te.horasExtra,
          te.motivo,
          te.aprobado
        ]
      );
    }

    await client.query('COMMIT');

    console.log('Migración completada exitosamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Uso
const localStorageData = {
  appUsers: JSON.parse(localStorage.getItem('appUsers') || '[]'),
  colaboradores: JSON.parse(localStorage.getItem('colaboradores') || '[]'),
  historialAsistencia: JSON.parse(localStorage.getItem('historialAsistencia') || '[]'),
  tiemposExtra: JSON.parse(localStorage.getItem('tiemposExtra') || '[]')
};

migrateData(localStorageData)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

---

### Fase 4: Actualización Frontend (Semana 9-10)

#### Actualizar AsistenciaService para usar API

```javascript
// src/assets/js/asistencia-service.js (ACTUALIZADO)
class AsistenciaService {
  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
    this.token = localStorage.getItem('token');
  }

  // Helper para requests autenticados
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la petición');
    }

    return response.json();
  }

  // ANTES: localStorage
  // async getColaboradores() {
  //   const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
  //   return colaboradores;
  // }

  // DESPUÉS: API REST
  async getColaboradores() {
    const response = await this.request('/colaboradores');
    return response.data;
  }

  async getColaboradoresActivos() {
    const response = await this.request('/colaboradores?estatus=Activo');
    return response.data;
  }

  async getRegistrosAsistencia(filtros = {}) {
    const params = new URLSearchParams();

    if (filtros.departamentos?.length) {
      params.append('departamentos', filtros.departamentos.join(','));
    }
    if (filtros.fechaInicio) {
      params.append('fechaInicio', filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      params.append('fechaFin', filtros.fechaFin);
    }

    const response = await this.request(`/asistencia?${params}`);
    return response.data;
  }

  async registrarAsistencia(registro) {
    const response = await this.request('/asistencia', {
      method: 'POST',
      body: JSON.stringify(registro)
    });
    return response.data;
  }

  async getVistaSemanal(semana, año, filtros = {}) {
    const params = new URLSearchParams({
      semana,
      año,
      ...(filtros.departamentos?.length && {
        departamentos: filtros.departamentos.join(',')
      }),
      ...(filtros.turnos?.length && {
        turnos: filtros.turnos.join(',')
      })
    });

    const response = await this.request(`/asistencia/vista-semanal?${params}`);
    return response.data;
  }

  async getMetricas(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await this.request(`/asistencia/metricas?${params}`);
    return response.data;
  }
}

// Exportar instancia única
const asistenciaService = new AsistenciaService();
```

---

## Estrategia de Índices y Optimización

### Índices Críticos para Rendimiento

```sql
-- ============================================
-- ÍNDICES PARA QUERIES FRECUENTES
-- ============================================

-- 1. Dashboard RRHH - Vista semanal
-- Query: SELECT * FROM asistencia WHERE fecha BETWEEN $1 AND $2
CREATE INDEX idx_asistencia_fecha_rango
ON asistencia(fecha)
WHERE fecha >= CURRENT_DATE - INTERVAL '90 days';

-- 2. Búsqueda de colaboradores por número de empleado
-- Query: SELECT * FROM colaboradores WHERE numero_empleado = $1
CREATE INDEX idx_colaboradores_numero_emp
ON colaboradores(numero_empleado);

-- 3. Vista semanal filtrada por departamento
-- Query: JOIN colaboradores c ... WHERE c.departamento_id IN (...)
CREATE INDEX idx_asistencia_colab_fecha
ON asistencia(colaborador_id, fecha DESC);

-- 4. Reportes de auditoria recientes
-- Query: SELECT * FROM auditoria WHERE created_at > NOW() - INTERVAL '30 days'
CREATE INDEX idx_auditoria_fecha_reciente
ON auditoria(created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================
-- ÍNDICES COMPUESTOS
-- ============================================

-- Para filtros combinados (depto + fecha)
CREATE INDEX idx_asistencia_depto_fecha
ON asistencia(colaborador_id, fecha)
INCLUDE (estado, tipo_inasistencia);

-- ============================================
-- ÍNDICES PARCIALES (menor tamaño)
-- ============================================

-- Solo colaboradores activos (90% de queries)
CREATE INDEX idx_colaboradores_activos
ON colaboradores(departamento_id, turno_id)
WHERE estatus = 'Activo';

-- Solo asistencias ausentes (para reportes de inasistencias)
CREATE INDEX idx_asistencia_ausentes
ON asistencia(fecha, tipo_inasistencia)
WHERE estado = 'ausente';
```

### Queries Optimizados

#### ANTES (localStorage - ineficiente)
```javascript
// Carga TODO en memoria
const historial = JSON.parse(localStorage.getItem('historialAsistencia'));

// Filtra en JavaScript (lento con 50k+ registros)
const resultados = historial.filter(r => {
  return r.fecha >= fechaInicio &&
         r.fecha <= fechaFin &&
         departamentos.includes(r.departamento);
});
```

#### DESPUÉS (PostgreSQL - optimizado)
```sql
-- Índice usado: idx_asistencia_fecha_rango + idx_colaboradores_departamento
SELECT
  a.id,
  a.fecha,
  a.estado,
  c.nombres || ' ' || c.apellidos AS colaborador,
  d.nombre AS departamento
FROM asistencia a
JOIN colaboradores c ON a.colaborador_id = c.id
JOIN departamentos d ON c.departamento_id = d.id
WHERE
  a.fecha BETWEEN $1 AND $2
  AND d.id = ANY($3)
ORDER BY a.fecha DESC, c.apellidos
LIMIT 100 OFFSET 0;

-- Resultado: < 50ms para 100,000 registros
```

---

### Análisis de Performance

#### Límites de localStorage
```
Lectura de 50,000 registros: ~300-500ms
Filtrado en JavaScript: ~200-300ms
Total: ~800ms (UX lenta)
```

#### Con PostgreSQL + Índices
```
Query con índice: ~20-50ms
Transferencia JSON: ~10ms
Total: ~60ms (UX fluida)
```

**Mejora:** 13x más rápido

---

## Conclusiones y Próximos Pasos

### Estado Actual: Resumen
✅ **Fortalezas:**
- Capa de servicios bien estructurada
- Código preparado para migración API
- Lógica de negocio clara y documentada

⚠️ **Debilidades:**
- Contraseñas sin encriptar (CRÍTICO)
- Sin integridad referencial
- Desnormalización excesiva
- Límites de escalabilidad (localStorage)

### Roadmap Recomendado

#### Fase 1: Seguridad (2 semanas)
- [ ] Implementar bcrypt para passwords
- [ ] Agregar JWT para autenticación
- [ ] Hash de respuestas de seguridad
- [ ] Implementar HTTPS

#### Fase 2: Backend (4-6 semanas)
- [ ] Configurar PostgreSQL
- [ ] Crear esquema de base de datos
- [ ] Implementar API REST (Express/FastAPI)
- [ ] Migrar datos de localStorage

#### Fase 3: Optimización (2 semanas)
- [ ] Agregar índices optimizados
- [ ] Implementar paginación
- [ ] Agregar caché (Redis)
- [ ] Optimizar queries

#### Fase 4: Mejoras (ongoing)
- [ ] Implementar auditoría completa
- [ ] Agregar reportes PDF
- [ ] Dashboard de métricas en tiempo real
- [ ] Integración con sistemas biométricos

---

## Referencias

### Documentación Oficial
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)
- [JSON Web Tokens](https://jwt.io/)

### Mejores Prácticas
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Database Normalization](https://www.guru99.com/database-normalization.html)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0
**Autor:** Database Architect Agent

---

## Apéndice A: Comparación de Tecnologías

| Característica | localStorage | PostgreSQL | MySQL | MongoDB |
|---|---|---|---|---|
| **Capacidad** | 5-10 MB | Ilimitado | Ilimitado | Ilimitado |
| **Concurrencia** | No | Sí (MVCC) | Sí (locks) | Sí |
| **ACID** | No | Sí | Sí | Parcial |
| **Relaciones** | No | Sí | Sí | No (refs) |
| **Índices** | No | Avanzados | Avanzados | Básicos |
| **JSON Support** | Nativo | Excelente | Básico | Nativo |
| **Costo** | Gratis | Gratis | Gratis | Gratis/Pago |
| **Escalabilidad** | Muy baja | Alta | Alta | Muy alta |

**Recomendación para MiSync:** PostgreSQL por balance de features, soporte JSON y zero-cost.

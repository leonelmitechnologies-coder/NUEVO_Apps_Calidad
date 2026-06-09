# Guía de Implementación - Migración de Base de Datos

## Introducción

Esta guía proporciona pasos detallados para implementar las mejoras de base de datos en MiSync, desde soluciones rápidas hasta la migración completa a PostgreSQL.

---

## Opción A: Mejoras Rápidas (1-2 semanas)

### Para mantener localStorage temporalmente mientras se planifica la migración completa.

### 1. Implementar Hash de Contraseñas (CRÍTICO)

#### Instalar dependencia

```bash
npm install bcryptjs
```

#### Actualizar `auth.js`

```javascript
// src/assets/js/auth.js
import bcrypt from 'bcryptjs';

/**
 * Migra contraseñas existentes a hashes
 * Ejecutar UNA VEZ al cargar la aplicación
 */
async function migratePasswordsToHash() {
  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  let updated = false;

  for (const user of appUsers) {
    // Verificar si ya está hasheada (empieza con $2a$ o $2b$)
    if (!user.password.startsWith('$2')) {
      console.log(`Migrando password para usuario: ${user.usuario}`);
      user.password = await bcrypt.hash(user.password, 10);
      updated = true;
    }
  }

  if (updated) {
    localStorage.setItem('appUsers', JSON.stringify(appUsers));
    console.log('Contraseñas migradas exitosamente');
  }
}

/**
 * Login actualizado con bcrypt
 */
async function login(username, password) {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
      const foundUser = appUsers.find(u => u.usuario === username);

      if (foundUser) {
        // Verificar password hasheada
        const isValid = await bcrypt.compare(password, foundUser.password);

        if (isValid) {
          resolve({
            success: true,
            token: 'mock-token-' + Date.now(),
            user: {
              id: foundUser.id,
              username: foundUser.usuario,
              name: `${foundUser.nombre} ${foundUser.apellido}`,
              // NO incluir password en respuesta
              permisos: foundUser.permisos
            }
          });
        } else {
          reject(new Error('Usuario o contraseña incorrectos'));
        }
      } else {
        reject(new Error('Usuario o contraseña incorrectos'));
      }
    }, 200);
  });
}

// Ejecutar migración al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  await migratePasswordsToHash();
});
```

#### Actualizar recuperación de contraseña

```javascript
/**
 * Hash de respuestas de seguridad
 */
window.saveSecurityQuestion = async function() {
  const questionSelect = document.getElementById('setupSecurityQuestion');
  const answerInput = document.getElementById('setupSecurityAnswer');

  const question = questionSelect.value;
  const answer = answerInput.value.trim().toLowerCase();

  // Validaciones...

  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  const userIndex = appUsers.findIndex(u => u.usuario === window.currentUser.username);

  if (userIndex !== -1) {
    // Hash de la respuesta
    const hashedAnswer = await bcrypt.hash(answer, 10);

    appUsers[userIndex].securityQuestion = question;
    appUsers[userIndex].securityAnswer = hashedAnswer;  // ✓ Hasheada
    localStorage.setItem('appUsers', JSON.stringify(appUsers));

    showToast('Pregunta de seguridad configurada exitosamente', 'success');
    // ...
  }
};

/**
 * Verificación de respuesta con bcrypt
 */
async function verifySecurityAnswer() {
  const answerInput = document.getElementById('recoveryAnswer');
  const userAnswer = answerInput.value.trim().toLowerCase();

  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  const user = appUsers.find(u => u.usuario === recoveryState.username);

  if (!user) {
    handleRecoveryFailedAttempt();
    return;
  }

  // Verificar hash
  const isCorrect = await bcrypt.compare(userAnswer, user.securityAnswer);

  if (isCorrect) {
    // Success
    recoveryState.attempts = 0;
    // Mostrar contraseña temporal o enviar email
    // ...
  } else {
    handleRecoveryFailedAttempt();
  }
}
```

**Tiempo estimado:** 2-4 horas
**Impacto:** Soluciona vulnerabilidad CRÍTICA de seguridad

---

### 2. Agregar Validaciones de Integridad

#### Actualizar `asistencia-service.js`

```javascript
class AsistenciaService {
  /**
   * Registrar asistencia con validaciones
   */
  async registrarAsistencia(registro) {
    // 1. Validar colaborador existe
    const colaborador = this.getColaboradorById(registro.colaboradorId);
    if (!colaborador) {
      throw new Error('Colaborador no encontrado');
    }

    // 2. Validar colaborador está activo
    if (colaborador.estatus !== 'Activo' || colaborador.baja) {
      throw new Error('Colaborador no está activo');
    }

    // 3. Validar fecha no es futura
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaRegistro = new Date(registro.fecha + 'T00:00:00');

    if (fechaRegistro > hoy) {
      throw new Error('No se puede registrar asistencia futura');
    }

    // 4. Validar no duplicado
    const historial = JSON.parse(localStorage.getItem('historialAsistencia') || '[]');
    const yaRegistrado = historial.some(h =>
      h.colaboradorId === registro.colaboradorId && h.fecha === registro.fecha
    );

    if (yaRegistrado) {
      throw new Error('Ya existe un registro de asistencia para esta fecha');
    }

    // 5. Validar tipo de inasistencia si es ausente
    if (registro.estado === 'ausente' && !registro.tipoInasistencia) {
      throw new Error('Debe especificar el tipo de inasistencia');
    }

    if (registro.estado === 'presente' && registro.tipoInasistencia) {
      throw new Error('No se puede especificar tipo de inasistencia si está presente');
    }

    // 6. Insertar
    const nuevoRegistro = {
      id: Date.now(),
      colaboradorId: registro.colaboradorId,
      colaboradorNombre: `${colaborador.nombres} ${colaborador.apellidos}`,
      departamento: colaborador.departamento,
      fecha: registro.fecha,
      hora: new Date().toTimeString().slice(0, 5),
      estado: registro.estado,
      tipoInasistencia: registro.tipoInasistencia || null,
      comentario: registro.comentario || null
    };

    historial.push(nuevoRegistro);
    localStorage.setItem('historialAsistencia', JSON.stringify(historial));

    return nuevoRegistro;
  }

  /**
   * Validar unicidad de número de empleado
   */
  validarNumeroEmpleadoUnico(numeroEmpleado, excludeId = null) {
    const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');

    const duplicado = colaboradores.find(c =>
      c.numeroEmpleado === numeroEmpleado &&
      c.id !== excludeId
    );

    if (duplicado) {
      throw new Error('El número de empleado ya está en uso');
    }

    return true;
  }

  /**
   * Soft delete para colaboradores
   */
  darDeBajaColaborador(colaboradorId, motivo) {
    const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
    const index = colaboradores.findIndex(c => c.id === colaboradorId);

    if (index === -1) {
      throw new Error('Colaborador no encontrado');
    }

    // Soft delete en vez de eliminar
    colaboradores[index].baja = true;
    colaboradores[index].estatus = 'Inactivo';
    colaboradores[index].fechaBaja = this.formatFecha(new Date());
    colaboradores[index].motivoBaja = motivo;

    localStorage.setItem('colaboradores', JSON.stringify(colaboradores));

    return colaboradores[index];
  }
}
```

**Tiempo estimado:** 4-6 horas
**Impacto:** Previene datos inconsistentes y errores

---

### 3. Implementar Compresión de Datos

Para extender el límite de localStorage:

```bash
npm install lz-string
```

```javascript
// src/assets/js/storage-manager.js
import LZString from 'lz-string';

class StorageManager {
  /**
   * Guardar datos comprimidos
   */
  setCompressed(key, data) {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToUTF16(jsonString);
    localStorage.setItem(key, compressed);

    // Log del ratio de compresión
    const originalSize = new Blob([jsonString]).size;
    const compressedSize = new Blob([compressed]).size;
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);
    console.log(`Compresión ${key}: ${ratio}% reducción`);
  }

  /**
   * Leer datos comprimidos
   */
  getCompressed(key) {
    const compressed = localStorage.getItem(key);
    if (!compressed) return null;

    const decompressed = LZString.decompressFromUTF16(compressed);
    return JSON.parse(decompressed);
  }

  /**
   * Migrar datos existentes a formato comprimido
   */
  migrateToCompressed(keys) {
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data && !data.startsWith('䰀')) {  // No está comprimido
        try {
          const parsed = JSON.parse(data);
          this.setCompressed(key, parsed);
          console.log(`Migrado ${key} a formato comprimido`);
        } catch (e) {
          console.error(`Error migrando ${key}:`, e);
        }
      }
    });
  }
}

const storageManager = new StorageManager();

// Migrar al cargar
document.addEventListener('DOMContentLoaded', () => {
  storageManager.migrateToCompressed([
    'historialAsistencia',
    'tiemposExtra',
    'colaboradores'
  ]);
});
```

**Tiempo estimado:** 2-3 horas
**Impacto:** Reduce uso de localStorage en 60-70%

---

### 4. Implementar Purga Automática de Datos Antiguos

```javascript
class DataRetentionManager {
  constructor() {
    this.retentionDays = {
      asistencia: 365,      // 1 año
      tiemposExtra: 730,    // 2 años
      securityLog: 90       // 3 meses
    };
  }

  /**
   * Purgar datos antiguos
   */
  purgeOldData() {
    const now = new Date();

    // Purgar asistencia
    let historial = JSON.parse(localStorage.getItem('historialAsistencia') || '[]');
    const cutoffAsistencia = new Date(now);
    cutoffAsistencia.setDate(cutoffAsistencia.getDate() - this.retentionDays.asistencia);

    const asistenciaCount = historial.length;
    historial = historial.filter(h => new Date(h.fecha) >= cutoffAsistencia);
    const purgadoAsistencia = asistenciaCount - historial.length;

    if (purgadoAsistencia > 0) {
      localStorage.setItem('historialAsistencia', JSON.stringify(historial));
      console.log(`Purgados ${purgadoAsistencia} registros de asistencia antiguos`);
    }

    // Purgar tiempos extra
    let tiempos = JSON.parse(localStorage.getItem('tiemposExtra') || '[]');
    const cutoffTiempos = new Date(now);
    cutoffTiempos.setDate(cutoffTiempos.getDate() - this.retentionDays.tiemposExtra);

    const tiemposCount = tiempos.length;
    tiempos = tiempos.filter(t => new Date(t.fecha) >= cutoffTiempos);
    const purgadoTiempos = tiemposCount - tiempos.length;

    if (purgadoTiempos > 0) {
      localStorage.setItem('tiemposExtra', JSON.stringify(tiempos));
      console.log(`Purgados ${purgadoTiempos} registros de tiempo extra antiguos`);
    }

    // Purgar security log
    let secLog = JSON.parse(localStorage.getItem('securityLog') || '[]');
    const cutoffSec = new Date(now);
    cutoffSec.setDate(cutoffSec.getDate() - this.retentionDays.securityLog);

    secLog = secLog.filter(log => new Date(log.timestamp) >= cutoffSec);
    localStorage.setItem('securityLog', JSON.stringify(secLog));
  }

  /**
   * Configurar purga automática (ejecutar semanalmente)
   */
  setupAutoPurge() {
    // Verificar última purga
    const lastPurge = localStorage.getItem('lastPurgeDate');
    const now = new Date();

    if (!lastPurge || (now - new Date(lastPurge)) > 7 * 24 * 60 * 60 * 1000) {
      this.purgeOldData();
      localStorage.setItem('lastPurgeDate', now.toISOString());
    }
  }
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
  const retentionManager = new DataRetentionManager();
  retentionManager.setupAutoPurge();
});
```

**Tiempo estimado:** 2 horas
**Impacto:** Previene saturación de localStorage

---

## Opción B: Migración Completa a PostgreSQL (8-12 semanas)

### Fase 1: Setup de Infraestructura (Semana 1-2)

#### 1.1. Configurar PostgreSQL

**Opción A: Local (Desarrollo)**

```bash
# En macOS con Homebrew
brew install postgresql@16
brew services start postgresql@16

# Crear base de datos
createdb misync_dev
createdb misync_test

# Crear usuario
createuser -s misync_admin
```

**Opción B: Cloud (Producción)**

Opciones recomendadas:

1. **Neon** (Recomendado para startups)
   - Serverless PostgreSQL
   - Free tier generoso
   - Database branching
   - https://neon.tech

2. **Supabase**
   - PostgreSQL + Auth + Storage
   - Free tier: 500 MB
   - https://supabase.com

3. **Railway**
   - Fácil deploy
   - $5/mes plan
   - https://railway.app

4. **AWS RDS**
   - Escalable
   - Más complejo
   - $15-50/mes

#### 1.2. Setup Backend (Node.js + Express)

```bash
# Crear proyecto backend
mkdir misync-backend
cd misync-backend
npm init -y

# Instalar dependencias
npm install express pg dotenv bcryptjs jsonwebtoken cors helmet
npm install -D nodemon

# Instalar herramientas de base de datos
npm install -D db-migrate db-migrate-pg
```

**Estructura del proyecto:**

```
misync-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── colaboradorController.js
│   │   ├── asistenciaController.js
│   │   └── tiempoExtraController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── index.js
│   ├── services/
│   │   ├── AsistenciaService.js
│   │   └── ColaboradorService.js
│   └── app.js
├── migrations/
│   └── sqls/
├── .env
├── .env.example
└── package.json
```

#### 1.3. Configurar Variables de Entorno

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=misync_dev
DB_USER=misync_admin
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=http://localhost:8080
```

#### 1.4. Configurar Conexión a Base de Datos

```javascript
// src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params)
};
```

---

### Fase 2: Migración de Base de Datos (Semana 3-4)

#### 2.1. Crear Esquema

```bash
# Crear migración inicial
npx db-migrate create initial-schema --sql-file
```

Copiar el esquema SQL del documento `DATABASE_ARCHITECTURE.md` en:
- `migrations/sqls/xxx-initial-schema-up.sql`
- `migrations/sqls/xxx-initial-schema-down.sql` (rollback)

```bash
# Ejecutar migración
npx db-migrate up
```

#### 2.2. Script de Migración de Datos

```javascript
// scripts/migrate-from-localstorage.js
const db = require('../src/config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function migrateData(localStorageFile) {
  const data = JSON.parse(fs.readFileSync(localStorageFile, 'utf8'));
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Migrando departamentos...');
    const departamentos = [...new Set(data.colaboradores.map(c => c.departamento))];
    const deptMap = {};

    for (const dept of departamentos) {
      const result = await client.query(
        'INSERT INTO departamentos (nombre, codigo) VALUES ($1, $2) RETURNING id',
        [dept, dept.substring(0, 4).toUpperCase()]
      );
      deptMap[dept] = result.rows[0].id;
    }
    console.log(`✓ ${departamentos.length} departamentos migrados`);

    console.log('🔄 Migrando turnos...');
    const turnos = [...new Set(data.colaboradores.map(c => c.turno))];
    const turnoMap = {};

    for (const turno of turnos) {
      const result = await client.query(
        'INSERT INTO turnos (nombre) VALUES ($1) RETURNING id',
        [turno]
      );
      turnoMap[turno] = result.rows[0].id;
    }
    console.log(`✓ ${turnos.length} turnos migrados`);

    console.log('🔄 Migrando usuarios...');
    const userIdMap = {};
    for (const user of data.appUsers) {
      // Hash de password si no lo está
      let passwordHash = user.password;
      if (!passwordHash.startsWith('$2')) {
        passwordHash = await bcrypt.hash(passwordHash, 10);
      }

      const result = await client.query(
        `INSERT INTO usuarios (username, password_hash, nombre, apellido, puesto, foto_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [user.usuario, passwordHash, user.nombre, user.apellido, user.puesto, user.photo]
      );

      const userId = result.rows[0].id;
      userIdMap[user.id] = userId;

      // Migrar permisos
      for (const [modulo, valor] of Object.entries(user.permisos)) {
        await client.query(
          `INSERT INTO permisos (usuario_id, modulo, puede_ver, puede_crear, puede_editar)
           VALUES ($1, $2, $3, $3, $3)`,
          [userId, modulo, valor]
        );
      }

      // Migrar pregunta de seguridad
      if (user.securityQuestion && user.securityAnswer) {
        let answerHash = user.securityAnswer;
        if (!answerHash.startsWith('$2')) {
          answerHash = await bcrypt.hash(answerHash, 10);
        }

        await client.query(
          `INSERT INTO usuario_seguridad (usuario_id, pregunta_seguridad, respuesta_hash)
           VALUES ($1, $2, $3)`,
          [userId, user.securityQuestion, answerHash]
        );
      }
    }
    console.log(`✓ ${data.appUsers.length} usuarios migrados`);

    console.log('🔄 Migrando colaboradores...');
    const colabIdMap = {};
    for (const colab of data.colaboradores) {
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
    console.log(`✓ ${data.colaboradores.length} colaboradores migrados`);

    console.log('🔄 Migrando historial de asistencia...');
    let asistenciaCount = 0;
    for (const asist of data.historialAsistencia) {
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
      asistenciaCount++;

      if (asistenciaCount % 1000 === 0) {
        console.log(`  ... ${asistenciaCount} registros migrados`);
      }
    }
    console.log(`✓ ${asistenciaCount} registros de asistencia migrados`);

    console.log('🔄 Migrando tiempos extra...');
    for (const te of data.tiemposExtra) {
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
    console.log(`✓ ${data.tiemposExtra.length} registros de tiempo extra migrados`);

    await client.query('COMMIT');
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Uso
const localStorageFile = process.argv[2] || './data/localStorage-export.json';
migrateData(localStorageFile)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

**Ejecutar migración:**

```bash
# 1. Exportar datos de localStorage a JSON
# (Desde DevTools Console en el navegador)
const data = {
  appUsers: JSON.parse(localStorage.getItem('appUsers') || '[]'),
  colaboradores: JSON.parse(localStorage.getItem('colaboradores') || '[]'),
  historialAsistencia: JSON.parse(localStorage.getItem('historialAsistencia') || '[]'),
  tiemposExtra: JSON.parse(localStorage.getItem('tiemposExtra') || '[]')
};
console.log(JSON.stringify(data));

# 2. Copiar el JSON a archivo
# 3. Ejecutar migración
node scripts/migrate-from-localstorage.js ./data/localStorage-export.json
```

---

### Fase 3: Implementar API REST (Semana 5-8)

#### 3.1. Configurar Express App

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
```

#### 3.2. Implementar Controlador de Asistencia

```javascript
// src/controllers/asistenciaController.js
const AsistenciaService = require('../services/AsistenciaService');

class AsistenciaController {
  async registrar(req, res, next) {
    try {
      const { colaboradorId, fecha, estado, tipoInasistencia, comentario } = req.body;
      const usuarioId = req.user.id;

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

  async obtenerMetricas(req, res, next) {
    try {
      const { fechaInicio, fechaFin, departamentos } = req.query;

      const metricas = await AsistenciaService.getMetricas({
        fechaInicio,
        fechaFin,
        departamentos: departamentos ? departamentos.split(',') : []
      });

      res.json({
        success: true,
        data: metricas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AsistenciaController();
```

Ver archivo `DATABASE_ARCHITECTURE.md` para implementación completa de servicios.

---

### Fase 4: Actualizar Frontend (Semana 9-10)

#### 4.1. Actualizar AsistenciaService

Ya está documentado en `DATABASE_ARCHITECTURE.md` - Fase 4.

#### 4.2. Agregar Manejo de Errores

```javascript
// src/assets/js/api-client.js
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        // Errores de autenticación
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login.html';
          throw new Error('Sesión expirada');
        }

        // Errores de validación
        if (response.status === 400) {
          throw new ValidationError(data.message, data.errors);
        }

        // Otros errores
        throw new Error(data.message || 'Error en la petición');
      }

      return data;

    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      // Errores de red
      if (error.name === 'TypeError') {
        throw new Error('Error de conexión. Verifica tu internet.');
      }

      throw error;
    }
  }

  // Métodos de conveniencia
  get(endpoint, options) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

const apiClient = new ApiClient(process.env.API_URL || 'http://localhost:3000/api');
```

---

## Checklist de Implementación

### Opción A: Mejoras Rápidas

#### Semana 1
- [ ] Instalar bcryptjs
- [ ] Implementar hash de contraseñas
- [ ] Migrar contraseñas existentes
- [ ] Hash de respuestas de seguridad
- [ ] Testing de autenticación

#### Semana 2
- [ ] Agregar validaciones en AsistenciaService
- [ ] Implementar soft deletes
- [ ] Validar unicidad de número de empleado
- [ ] Implementar compresión LZ-string
- [ ] Setup purga automática
- [ ] Testing completo

### Opción B: Migración Completa

#### Semanas 1-2: Infraestructura
- [ ] Setup PostgreSQL (local/cloud)
- [ ] Crear proyecto backend
- [ ] Configurar conexión a BD
- [ ] Ejecutar migración de esquema
- [ ] Verificar tablas creadas

#### Semanas 3-4: Migración de Datos
- [ ] Exportar datos de localStorage
- [ ] Crear script de migración
- [ ] Ejecutar migración en desarrollo
- [ ] Validar integridad de datos
- [ ] Testing de queries

#### Semanas 5-8: API REST
- [ ] Implementar autenticación JWT
- [ ] Endpoint /api/auth/login
- [ ] Endpoint /api/auth/logout
- [ ] Endpoints de colaboradores (CRUD)
- [ ] Endpoints de asistencia (CRUD)
- [ ] Endpoints de tiempo extra (CRUD)
- [ ] Middleware de validación
- [ ] Middleware de autorización
- [ ] Error handling global
- [ ] Testing de API (Postman/Jest)

#### Semanas 9-10: Actualización Frontend
- [ ] Actualizar AsistenciaService
- [ ] Implementar ApiClient
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Testing E2E con Playwright
- [ ] Verificar funcionalidad completa

#### Semanas 11-12: Despliegue
- [ ] Configurar CI/CD
- [ ] Desplegar a staging
- [ ] Testing QA completo
- [ ] Desplegar a producción
- [ ] Monitoreo y logs
- [ ] Documentación final

---

## Testing

### Testing de Seguridad

```javascript
// tests/security.test.js
const bcrypt = require('bcryptjs');

describe('Seguridad de Contraseñas', () => {
  test('Las contraseñas deben estar hasheadas', async () => {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test('Verificación de contraseña correcta', async () => {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);

    expect(isValid).toBe(true);
  });

  test('Verificación de contraseña incorrecta', async () => {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare('wrongpassword', hash);

    expect(isValid).toBe(false);
  });
});
```

---

## Monitoreo Post-Migración

### Métricas a Vigilar

1. **Rendimiento de Queries**
   ```sql
   -- Top 10 queries lentos
   SELECT
     query,
     mean_exec_time,
     calls,
     total_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. **Uso de Índices**
   ```sql
   -- Índices no utilizados
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0
   ORDER BY tablename;
   ```

3. **Conexiones Activas**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

---

**Última actualización:** 2026-06-09
**Versión:** 1.0

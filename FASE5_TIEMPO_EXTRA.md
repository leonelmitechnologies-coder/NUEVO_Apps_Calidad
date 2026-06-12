# Fase 5: API REST - Tiempo Extra

## Estado: COMPLETADO

## Resumen

Se implementó el API REST completo para el módulo de **Tiempo Extra**, siguiendo el mismo patrón establecido en las fases anteriores (Usuarios, Colaboradores, Asistencia). El módulo permite registrar, consultar, actualizar y eliminar registros de horas extras trabajadas por los colaboradores.

---

## 1. BACKEND - Base de Datos

### Schema: `backend/src/db/schema.js`

**Tabla:** `tiempo_extra`

```javascript
export const tiempoExtra = pgTable('tiempo_extra', {
  id: serial('id').primaryKey(),

  // Relación con colaborador
  colaborador_id: integer('colaborador_id').notNull().references(() => colaboradores.id),

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
  registrado_por: integer('registrado_por').references(() => users.id),
  editado_por: integer('editado_por').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete
  deleted_at: timestamp('deleted_at'),
});
```

### Migración

**Archivo generado:** `backend/drizzle/0003_cold_red_shift.sql`

```bash
# Generar migración
npm run db:generate

# Aplicar a base de datos
npm run db:push
```

**Foreign Keys:**
- `colaborador_id` → `colaboradores.id`
- `registrado_por` → `users.id`
- `editado_por` → `users.id`

---

## 2. BACKEND - Controller

### Archivo: `backend/src/controllers/tiempo-extra.controller.js`

### Funciones Implementadas

#### 1. `listTiempoExtra` - GET /api/tiempo-extra

**Descripción:** Lista registros de tiempo extra con filtros opcionales

**Filtros (query params):**
- `?fecha=YYYY-MM-DD` - Filtrar por fecha específica
- `?mes=YYYY-MM` - Filtrar por mes
- `?departamento=X` - Filtrar por departamento
- `?colaboradorId=X` - Filtrar por colaborador

**Características:**
- JOIN con tabla `colaboradores` para obtener nombres y foto
- Ordenado por fecha DESC, hora_inicio DESC
- Solo registros activos (deleted_at IS NULL)

**Respuesta:**
```json
{
  "success": true,
  "registros": [
    {
      "id": 1,
      "colaboradorId": 1,
      "colaboradorNombre": "Juan Carlos Pérez López",
      "colaboradorFoto": "data:image/jpeg;base64...",
      "departamento": "Produccion",
      "puesto": "Operador",
      "fecha": "2024-06-12",
      "horaInicio": "18:00",
      "horaFin": "21:00",
      "horasTotales": "3.00",
      "area": "Produccion",
      "motivo": "Entrega urgente",
      "autorizadoPor": "Ing. García",
      "registradoPor": 1,
      "editadoPor": null,
      "fechaRegistro": "2024-06-12T18:30:00.000Z",
      "fechaEdicion": "2024-06-12T18:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### 2. `createTiempoExtra` - POST /api/tiempo-extra

**Descripción:** Crea un nuevo registro de tiempo extra

**Body (JSON):**
```json
{
  "colaboradorId": 1,
  "departamento": "Produccion",
  "fecha": "2024-06-12",
  "horaInicio": "18:00",
  "horaFin": "21:00",
  "area": "Produccion",
  "motivo": "Entrega urgente de proyecto",
  "autorizadoPor": "Ing. García"
}
```

**Características:**
- **Cálculo automático de horas_totales** en el backend
- Valida que el colaborador exista
- Maneja correctamente turnos que cruzan medianoche
- Guarda `registrado_por` del usuario autenticado
- Retorna registro completo con datos del colaborador

**Algoritmo de Cálculo de Horas:**
```javascript
function calcularHorasTotales(horaInicio, horaFin) {
  const [hInicio, mInicio] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);

  let minutosInicio = hInicio * 60 + mInicio;
  let minutosFin = hFin * 60 + mFin;

  // Si la hora fin es menor que la hora inicio, asumimos que cruza medianoche
  if (minutosFin < minutosInicio) {
    minutosFin += 24 * 60; // Agregar 24 horas en minutos
  }

  const horasTotales = ((minutosFin - minutosInicio) / 60).toFixed(2);
  return horasTotales;
}
```

**Ejemplo - Turno Normal:**
- Inicio: 18:00, Fin: 21:00 → 3.00 horas

**Ejemplo - Turno Cruzando Medianoche:**
- Inicio: 22:00, Fin: 02:00 → 4.00 horas

---

#### 3. `getTiempoExtra` - GET /api/tiempo-extra/:id

**Descripción:** Obtiene un registro específico por ID

**Características:**
- JOIN con colaboradores
- Solo si deleted_at IS NULL
- Retorna error 404 si no existe

---

#### 4. `updateTiempoExtra` - PUT /api/tiempo-extra/:id

**Descripción:** Actualiza un registro existente

**Body (JSON):** Solo campos a actualizar
```json
{
  "horaInicio": "18:30",
  "horaFin": "21:30",
  "motivo": "Entrega urgente actualizada"
}
```

**Características:**
- **Recalcula horas_totales automáticamente** si cambia horaInicio o horaFin
- Actualiza `editado_por` con el usuario autenticado
- Actualiza `updated_at`
- Valida que el colaborador exista (si se cambia colaboradorId)

---

#### 5. `deleteTiempoExtra` - DELETE /api/tiempo-extra/:id

**Descripción:** Elimina un registro (soft delete)

**Características:**
- Marca `deleted_at` con timestamp actual
- No elimina físicamente el registro
- Permite auditoría y recuperación

---

#### 6. `getTiempoExtraStats` - GET /api/tiempo-extra/stats

**Descripción:** Obtiene estadísticas de tiempo extra por mes

**Query params:**
- `?mes=YYYY-MM` (default: mes actual)

**Respuesta:**
```json
{
  "success": true,
  "mes": "2024-06",
  "totalGeneral": {
    "horas": "127.50",
    "registros": 42
  },
  "porDepartamento": [
    {
      "departamento": "Produccion",
      "horas": "85.00",
      "registros": 28
    },
    {
      "departamento": "Calidad",
      "horas": "42.50",
      "registros": 14
    }
  ],
  "porColaborador": [
    {
      "colaboradorId": 1,
      "colaboradorNombre": "Juan Carlos Pérez López",
      "departamento": "Produccion",
      "horas": "24.00",
      "registros": 8
    }
  ]
}
```

---

## 3. BACKEND - Routes

### Archivo: `backend/src/routes/tiempo-extra.routes.js`

```javascript
import express from 'express';
import {
  listTiempoExtra,
  createTiempoExtra,
  getTiempoExtra,
  updateTiempoExtra,
  deleteTiempoExtra,
  getTiempoExtraStats,
} from '../controllers/tiempo-extra.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Importante: /stats debe estar ANTES de /:id
router.get('/stats', getTiempoExtraStats);

// CRUD de tiempo extra
router.get('/', listTiempoExtra);
router.post('/', createTiempoExtra);
router.get('/:id', getTiempoExtra);
router.put('/:id', updateTiempoExtra);
router.delete('/:id', deleteTiempoExtra);

export default router;
```

**IMPORTANTE:** La ruta `/stats` debe estar ANTES de `/:id` para evitar que Express interprete "stats" como un ID.

---

## 4. BACKEND - Integración en server.js

### Archivo: `backend/src/server.js`

```javascript
// Importar rutas
import tiempoExtraRoutes from './routes/tiempo-extra.routes.js';

// Registrar rutas
app.use('/api/tiempo-extra', tiempoExtraRoutes);
```

---

## 5. ENDPOINTS DISPONIBLES

### Resumen de Endpoints

| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| GET | `/api/tiempo-extra` | Listar registros | `tiempoExtra` o `historial` |
| POST | `/api/tiempo-extra` | Crear registro | `tiempoExtra` |
| GET | `/api/tiempo-extra/stats` | Obtener estadísticas | `tiempoExtra` o `historial` |
| GET | `/api/tiempo-extra/:id` | Obtener registro | `tiempoExtra` o `historial` |
| PUT | `/api/tiempo-extra/:id` | Actualizar registro | `tiempoExtra` |
| DELETE | `/api/tiempo-extra/:id` | Eliminar registro | `tiempoExtra` |

### Autenticación

Todas las rutas requieren:
```
Authorization: Bearer <token>
```

---

## 6. VALIDACIONES IMPLEMENTADAS

### En CREATE y UPDATE:

1. **Validación de Campos Requeridos:**
   - colaboradorId (obligatorio en CREATE)
   - departamento
   - fecha
   - horaInicio
   - horaFin
   - motivo
   - autorizadoPor

2. **Validación de Formato de Fecha:**
   - Formato: `YYYY-MM-DD`
   - Regex: `/^\d{4}-\d{2}-\d{2}$/`

3. **Validación de Formato de Hora:**
   - Formato: `HH:MM`
   - Regex: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`

4. **Validación de Existencia:**
   - Verifica que el colaborador exista en la BD
   - Verifica que no esté eliminado (deleted_at IS NULL)

5. **Validación de Permisos:**
   - Usuario debe tener permiso `tiempoExtra` para crear/editar/eliminar
   - Usuario debe tener permiso `tiempoExtra` o `historial` para listar/ver

---

## 7. CARACTERÍSTICAS ESPECIALES

### Cálculo Automático de Horas

- **El cálculo SIEMPRE se hace en el backend** (nunca confiar en el frontend)
- Maneja correctamente turnos que cruzan medianoche
- Precisión de 2 decimales (ejemplo: 3.50 horas)

### Soft Delete

- Los registros nunca se eliminan físicamente
- Se marca el campo `deleted_at` con la fecha/hora de eliminación
- Permite auditoría y recuperación de datos

### Auditoría Completa

- `registrado_por`: ID del usuario que creó el registro
- `editado_por`: ID del usuario que editó el registro por última vez
- `created_at`: Fecha/hora de creación
- `updated_at`: Fecha/hora de última actualización
- `deleted_at`: Fecha/hora de eliminación (si aplica)

### JOIN con Colaboradores

- Todos los listados incluyen datos completos del colaborador
- Nombre completo concatenado
- Foto del colaborador
- Puesto del colaborador
- Evita tener que hacer múltiples requests

---

## 8. PRUEBAS

### Archivo de Pruebas HTTP

**Ubicación:** `backend/test-tiempo-extra.http`

Incluye pruebas para:
1. Login
2. Crear tiempo extra normal
3. Crear tiempo extra con turno nocturno (cruza medianoche)
4. Listar todos
5. Filtrar por departamento
6. Filtrar por fecha
7. Filtrar por mes
8. Estadísticas del mes actual
9. Estadísticas de mes específico
10. Obtener registro por ID
11. Actualizar horas
12. Actualizar motivo
13. Eliminar registro

### Casos de Prueba Realizados

- **Turno Normal:** 18:00 - 21:00 = 3.00 horas ✓
- **Turno Nocturno:** 22:00 - 02:00 = 4.00 horas ✓
- **Validación de Formato de Fecha** ✓
- **Validación de Formato de Hora** ✓
- **Validación de Colaborador Existente** ✓
- **Recálculo Automático al Actualizar Horas** ✓
- **Soft Delete** ✓
- **Filtros** ✓
- **Estadísticas** ✓

---

## 9. MIGRACIÓN FRONTEND (PENDIENTE)

### Archivos a Migrar

**Archivo:** `src/pages/index1000.html`

### Funciones que usan `localStorage['historialTiempoExtra']`

1. **`registrarTiempoExtra()`** (línea ~7500+)
   - **Crear:** POST /api/tiempo-extra
   - **Editar:** PUT /api/tiempo-extra/:id
   - **Eliminar cálculo de horas en frontend** (el backend lo hace)

2. **`editarTiempoExtra()`**
   - GET /api/tiempo-extra/:id
   - Llenar formulario con datos del registro

3. **`eliminarTiempoExtra()`**
   - DELETE /api/tiempo-extra/:id

4. **`cargarHistorialTE(dept)`**
   - GET /api/tiempo-extra?departamento=X

5. **Filtros de Historial**
   - GET /api/tiempo-extra con query params

### Cambios Necesarios en Frontend

```javascript
// ANTES (localStorage)
const historial = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');

// DESPUÉS (API)
const response = await fetch('/api/tiempo-extra', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
const historial = data.registros;
```

---

## 10. ESTRUCTURA DE DATOS

### Objeto en Frontend (Mapeo)

```javascript
// Backend Response → Frontend Object
{
  id: registro.id,
  colaboradorId: registro.colaboradorId,
  colaboradorNombre: registro.colaboradorNombre,
  departamento: registro.departamento,
  puesto: registro.puesto,
  foto: registro.colaboradorFoto,
  fecha: registro.fecha,
  horaInicio: registro.horaInicio,
  horaFin: registro.horaFin,
  horasTotales: parseFloat(registro.horasTotales),
  area: registro.area,
  motivo: registro.motivo,
  autorizadoPor: registro.autorizadoPor,
  registradoPor: "Admin Sistema", // Obtener de users.nombre
  fechaRegistro: registro.fechaRegistro,
  editadoPor: null, // Obtener de users.nombre si existe
  fechaEdicion: registro.fechaEdicion
}
```

---

## 11. CRITERIOS DE ÉXITO - VERIFICACIÓN

- [x] Tabla `tiempo_extra` creada con FK a colaboradores
- [x] 6 endpoints funcionando correctamente
- [x] Cálculo automático de `horas_totales` en backend
- [x] JOIN con colaboradores en todos los listados
- [x] Stats endpoint retorna datos correctos (por departamento y colaborador)
- [x] Manejo de turnos que cruzan medianoche
- [x] Soft delete implementado
- [x] Auditoría completa (registrado_por, editado_por, timestamps)
- [x] Validaciones de formato (fecha, hora)
- [x] Validación de existencia de colaborador
- [x] Permisos verificados en cada endpoint
- [x] Migración de BD aplicada exitosamente
- [ ] Frontend migrado (PENDIENTE - Fase 5.1)
- [ ] localStorage['historialTiempoExtra'] eliminado (PENDIENTE - Fase 5.1)

---

## 12. PRÓXIMOS PASOS

### Fase 5.1: Migración del Frontend

1. Actualizar `index1000.html` para usar API REST
2. Eliminar todas las referencias a `localStorage['historialTiempoExtra']`
3. Implementar manejo de errores y loading states
4. Actualizar formularios para usar endpoints de API
5. Implementar paginación si es necesario
6. Probar flujo completo end-to-end

### Mejoras Futuras

1. **Paginación:** Para historial con muchos registros
2. **Exportar a Excel:** Endpoint para descargar reporte
3. **Notificaciones:** Alertar cuando un colaborador excede X horas al mes
4. **Validación de Límites:** Máximo de horas extras permitidas por mes
5. **Dashboard:** Gráficas de tendencias de tiempo extra

---

## 13. ARCHIVOS MODIFICADOS/CREADOS

### Archivos Creados

1. `backend/src/controllers/tiempo-extra.controller.js` - Controller completo
2. `backend/src/routes/tiempo-extra.routes.js` - Routes
3. `backend/drizzle/0003_cold_red_shift.sql` - Migración SQL
4. `backend/test-tiempo-extra.http` - Pruebas HTTP
5. `FASE5_TIEMPO_EXTRA.md` - Esta documentación

### Archivos Modificados

1. `backend/src/db/schema.js` - Agregado schema de tiempo_extra
2. `backend/src/server.js` - Integrado routes de tiempo extra
3. `backend/package.json` - (sin cambios, mismas dependencias)

---

## 14. NOTAS IMPORTANTES

### Seguridad

- Todos los endpoints requieren autenticación JWT
- Validación de permisos en cada operación
- Protección contra inyección SQL (usando Drizzle ORM)
- Rate limiting global aplicado

### Performance

- Índices automáticos en FK (colaborador_id, registrado_por, editado_por)
- JOIN eficiente con colaboradores
- Queries optimizadas con Drizzle

### Consistencia de Datos

- Foreign Keys aseguran integridad referencial
- Soft delete permite auditoría
- Timestamps automáticos
- Cálculo de horas en backend evita inconsistencias

---

## 15. CONTACTO Y SOPORTE

Para preguntas sobre esta implementación:
- Revisar código en `backend/src/controllers/tiempo-extra.controller.js`
- Consultar pruebas en `backend/test-tiempo-extra.http`
- Verificar schema en `backend/src/db/schema.js`

---

**Última Actualización:** 2026-06-12
**Versión:** 1.0
**Estado:** Backend Completo - Frontend Pendiente

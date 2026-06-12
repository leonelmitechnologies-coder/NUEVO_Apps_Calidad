# Fase 5.1: Migración Frontend - Tiempo Extra

## Archivo a Modificar

**`src/pages/index1000.html`**

---

## Funciones a Migrar

### 1. Registrar/Editar Tiempo Extra (líneas ~7670-7755)

#### ANTES (localStorage):
```javascript
// Línea 7679
let historial = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');

// Modo Edición (línea 7682-7724)
if (window.currentTERegistroEditando) {
  const index = historial.findIndex(r => r.id === window.currentTERegistroEditando);
  historial[index] = { /* datos actualizados */ };
  localStorage.setItem('historialTiempoExtra', JSON.stringify(historial));
  showToast('Tiempo extra actualizado exitosamente', 'success');
}
// Modo Crear (línea 7726-7755)
else {
  const registro = {
    id: Date.now(),
    /* datos del registro */
  };
  historial.push(registro);
  localStorage.setItem('historialTiempoExtra', JSON.stringify(historial));
  showToast('Tiempo extra registrado exitosamente', 'success');
}
```

#### DESPUÉS (API):
```javascript
// NO calcular horas en frontend, el backend lo hace
// Eliminar líneas 7671-7676

try {
  const token = localStorage.getItem('token');

  if (window.currentTERegistroEditando) {
    // MODO EDICIÓN: PUT /api/tiempo-extra/:id
    const response = await fetch(`/api/tiempo-extra/${window.currentTERegistroEditando}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        colaboradorId: colaborador.id,
        departamento: window.currentTEDept,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin,
        area: area,
        motivo: motivo,
        autorizadoPor: autorizadoPor
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar tiempo extra');
    }

    const data = await response.json();
    showToast('Tiempo extra actualizado exitosamente', 'success');

    window.currentTERegistroEditando = null;
    limpiarFormularioTE();
    navigateToLocation('tiempo-extra-dept:' + window.currentTEDept);

  } else {
    // MODO CREAR: POST /api/tiempo-extra
    const response = await fetch('/api/tiempo-extra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        colaboradorId: colaborador.id,
        departamento: window.currentTEDept,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin,
        area: area,
        motivo: motivo,
        autorizadoPor: autorizadoPor
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar tiempo extra');
    }

    const data = await response.json();
    showToast('Tiempo extra registrado exitosamente', 'success');

    limpiarFormularioTE();
    navigateToLocation('tiempo-extra-dept:' + window.currentTEDept);
  }
} catch (error) {
  console.error('Error:', error);
  showToast(error.message, 'error');
}
```

---

### 2. Cargar Historial (línea 7777)

#### ANTES (localStorage):
```javascript
function cargarHistorialTE(dept) {
  const historial = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');
  const registrosDept = historial.filter(r => r.departamento === dept);

  // Renderizar...
}
```

#### DESPUÉS (API):
```javascript
async function cargarHistorialTE(dept) {
  try {
    const token = localStorage.getItem('token');

    // GET /api/tiempo-extra?departamento=X
    const response = await fetch(`/api/tiempo-extra?departamento=${encodeURIComponent(dept)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar historial');
    }

    const data = await response.json();
    const registrosDept = data.registros;

    // Actualizar título
    document.getElementById('te-historial-title').textContent = 'Historial Tiempo Extra';
    document.getElementById('te-historial-subtitle').textContent = dept;

    // Guardar departamento actual
    window.currentTEHistorialDept = dept;

    const container = document.getElementById('te-historial-container');
    const emptyDiv = document.getElementById('te-historial-empty');

    if (registrosDept.length === 0) {
      container.innerHTML = '';
      emptyDiv.style.display = 'block';
      return;
    }

    emptyDiv.style.display = 'none';

    // Agrupar por semana ISO...
    // (mantener misma lógica de agrupación)

  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cargar historial', 'error');
  }
}
```

---

### 3. Cargar Detalle de Semana (línea 7908)

#### ANTES (localStorage):
```javascript
function cargarDetalleSemanaTE(dept, semanaKey) {
  const historial = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');
  const registrosDept = historial.filter(r => r.departamento === dept);

  // Procesar...
}
```

#### DESPUÉS (API):
```javascript
async function cargarDetalleSemanaTE(dept, semanaKey) {
  try {
    const token = localStorage.getItem('token');

    // GET /api/tiempo-extra?departamento=X
    const response = await fetch(`/api/tiempo-extra?departamento=${encodeURIComponent(dept)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar registros');
    }

    const data = await response.json();
    const registrosDept = data.registros;

    // Agrupar por semana para obtener los registros de esta semana específica
    const semanas = {};
    registrosDept.forEach(reg => {
      const fecha = new Date(reg.fecha + 'T00:00:00');
      const semanaNum = getWeekNumber(fecha);
      const año = fecha.getFullYear();
      const key = `${año}-W${semanaNum}`;

      if (!semanas[key]) {
        semanas[key] = {
          registros: [],
          fechaInicio: getMonday(fecha),
          semanaNum: semanaNum,
          año: año
        };
      }

      semanas[key].registros.push(reg);
    });

    const semana = semanas[semanaKey];
    if (!semana) {
      showToast('Semana no encontrada', 'error');
      navigateToLocation('asistencia-grid');
      return;
    }

    // Renderizar (mantener misma lógica)...

  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cargar semana', 'error');
  }
}
```

---

### 4. Cargar Detalle de Registro (línea 8079)

#### ANTES (localStorage):
```javascript
function cargarDetalleTiempoExtra(registroId) {
  const historial = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');
  const registro = historial.find(r => r.id === registroId);

  if (!registro) {
    showToast('Registro no encontrado', 'error');
    navigateToLocation('asistencia-grid');
    return;
  }

  // Renderizar...
}
```

#### DESPUÉS (API):
```javascript
async function cargarDetalleTiempoExtra(registroId) {
  try {
    const token = localStorage.getItem('token');

    // GET /api/tiempo-extra/:id
    const response = await fetch(`/api/tiempo-extra/${registroId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Registro no encontrado');
    }

    const data = await response.json();
    const registro = data.registro;

    // Cargar foto
    const photoDiv = document.getElementById('te-detalle-photo');
    const iniciales = registro.colaboradorNombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);

    if (registro.colaboradorFoto) {
      photoDiv.innerHTML = `<img src="${registro.colaboradorFoto}" alt="${registro.colaboradorNombre}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      photoDiv.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: white; font-weight: 700; font-size: 2rem;">
          ${iniciales}
        </div>
      `;
    }

    // Renderizar datos (mantener misma lógica)...

  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cargar registro', 'error');
    navigateToLocation('asistencia-grid');
  }
}
```

---

### 5. Borrar Registro (línea 8052)

#### ANTES (localStorage):
```javascript
function borrarRegistroTE(registroId) {
  let historial = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');
  const historialFiltrado = historial.filter(r => r.id !== registroId);
  localStorage.setItem('historialTiempoExtra', JSON.stringify(historialFiltrado));

  showToast('Registro borrado exitosamente', 'success');

  // Recargar vista...
}
```

#### DESPUÉS (API):
```javascript
async function borrarRegistroTE(registroId) {
  try {
    const token = localStorage.getItem('token');

    // DELETE /api/tiempo-extra/:id
    const response = await fetch(`/api/tiempo-extra/${registroId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar registro');
    }

    showToast('Registro borrado exitosamente', 'success');

    // Recargar la vista actual
    const currentLocation = window.navigationHistory[window.navigationHistory.length - 1];
    if (currentLocation && currentLocation.startsWith('tiempo-extra-semana:')) {
      const params = currentLocation.replace('tiempo-extra-semana:', '').split(':');
      const dept = params[0];
      const semanaKey = params[1];
      await cargarDetalleSemanaTE(dept, semanaKey);
    }

  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}
```

---

### 6. Obtener Estadísticas (líneas 7297, 7364, 8018)

#### ANTES (localStorage):
```javascript
// Línea 7297
const registros = JSON.parse(localStorage.getItem('historialTiempoExtra') || '[]');
const totalHoras = registros.reduce((sum, r) => sum + r.horasTotales, 0);
```

#### DESPUÉS (API):
```javascript
async function cargarEstadisticasTE(mes = null) {
  try {
    const token = localStorage.getItem('token');

    // Obtener mes actual si no se proporciona
    if (!mes) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      mes = `${year}-${month}`;
    }

    // GET /api/tiempo-extra/stats?mes=YYYY-MM
    const response = await fetch(`/api/tiempo-extra/stats?mes=${mes}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar estadísticas');
    }

    const data = await response.json();

    // data.totalGeneral.horas
    // data.totalGeneral.registros
    // data.porDepartamento[]
    // data.porColaborador[]

    return data;

  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cargar estadísticas', 'error');
    return null;
  }
}
```

---

## Mapeo de Campos

### Backend Response → Frontend

```javascript
// Backend devuelve:
{
  id: 1,
  colaboradorId: 1,
  colaboradorNombre: "Juan Carlos Pérez López",
  colaboradorFoto: "data:image/jpeg;base64...",
  departamento: "Produccion",
  puesto: "Operador",
  fecha: "2024-06-12",
  horaInicio: "18:00",
  horaFin: "21:00",
  horasTotales: "3.00",  // STRING (decimal)
  area: "Produccion",
  motivo: "Entrega urgente",
  autorizadoPor: "Ing. García",
  registradoPor: 1,
  editadoPor: null,
  fechaRegistro: "2024-06-12T18:30:00.000Z",
  fechaEdicion: "2024-06-12T18:30:00.000Z"
}

// Frontend espera:
{
  id: registro.id,
  colaboradorId: registro.colaboradorId,
  colaboradorNombre: registro.colaboradorNombre,
  departamento: registro.departamento,
  puesto: registro.puesto,
  foto: registro.colaboradorFoto,  // ← MAPEO IMPORTANTE
  fecha: registro.fecha,
  horaInicio: registro.horaInicio,
  horaFin: registro.horaFin,
  horasTotales: parseFloat(registro.horasTotales),  // ← Convertir a número
  area: registro.area,
  motivo: registro.motivo,
  autorizadoPor: registro.autorizadoPor,
  registradoPor: "Admin Sistema",  // ← NECESITA JOIN con users.nombre
  fechaRegistro: registro.fechaRegistro,
  editadoPor: null,  // ← NECESITA JOIN con users.nombre si existe
  fechaEdicion: registro.fechaEdicion
}
```

**NOTA:** `registradoPor` y `editadoPor` actualmente son IDs. Para mostrar nombres, necesitaríamos:
1. Hacer JOIN en el backend con la tabla `users`
2. O hacer request adicional para obtener nombres de usuarios

---

## Cambios Globales Necesarios

### 1. Eliminar Cálculo de Horas en Frontend

**ELIMINAR líneas 7671-7676:**
```javascript
// ANTES - Eliminar esto
const [hInicio, mInicio] = horaInicio.split(':').map(Number);
const [hFin, mFin] = horaFin.split(':').map(Number);
let minutosInicio = hInicio * 60 + mInicio;
let minutosFin = hFin * 60 + mFin;
if (minutosFin < minutosInicio) minutosFin += 24 * 60;
const horasTotales = ((minutosFin - minutosInicio) / 60);
```

**RAZÓN:** El backend calcula automáticamente las horas. Nunca confiar en el frontend para cálculos críticos.

---

### 2. Manejo de Errores de Autenticación

Agregar en todas las funciones:

```javascript
if (!response.ok) {
  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    showToast('Sesión expirada. Por favor inicia sesión nuevamente', 'error');
    navigateToLocation('login');
    return;
  }

  if (response.status === 403) {
    showToast('No tienes permiso para realizar esta acción', 'error');
    return;
  }

  const error = await response.json();
  throw new Error(error.message || 'Error en la solicitud');
}
```

---

### 3. Loading States

Agregar indicadores de carga:

```javascript
async function cargarHistorialTE(dept) {
  // Mostrar loading
  const container = document.getElementById('te-historial-container');
  container.innerHTML = '<div style="text-align: center; padding: 40px;">Cargando...</div>';

  try {
    // ... llamada a API
  } catch (error) {
    // ... manejo de error
  }
}
```

---

## Verificación Final

### Checklist de Migración

- [ ] Función de registrar/editar migrada
- [ ] Función de cargar historial migrada
- [ ] Función de cargar detalle de semana migrada
- [ ] Función de cargar detalle de registro migrada
- [ ] Función de borrar registro migrada
- [ ] Funciones de estadísticas migradas
- [ ] Todas las referencias a `localStorage['historialTiempoExtra']` eliminadas
- [ ] Manejo de errores de autenticación implementado
- [ ] Loading states agregados
- [ ] Mapeo de campos correcto (foto, horasTotales)
- [ ] Pruebas end-to-end completadas

---

## Pruebas Necesarias

1. **Crear Registro:**
   - Turno normal (18:00 - 21:00)
   - Turno nocturno (22:00 - 02:00)
   - Validar que horasTotales se calcula correctamente en backend

2. **Editar Registro:**
   - Cambiar horas (verificar recálculo automático)
   - Cambiar motivo y autorizado por
   - Verificar que se actualiza `editadoPor`

3. **Listar Registros:**
   - Por departamento
   - Por fecha
   - Por mes
   - Verificar agrupación por semanas

4. **Ver Detalle:**
   - Verificar que se muestran todos los datos
   - Verificar foto del colaborador

5. **Eliminar:**
   - Verificar soft delete
   - Verificar que la vista se recarga

6. **Estadísticas:**
   - Mes actual
   - Mes específico
   - Verificar totales por departamento
   - Verificar totales por colaborador

7. **Manejo de Errores:**
   - Token expirado
   - Sin permisos
   - Registro no encontrado
   - Error de red

---

## Notas Importantes

1. **NO ELIMINAR localStorage['historialTiempoExtra'] hasta:**
   - Haber completado y probado toda la migración
   - Haber migrado datos históricos al backend (si es necesario)
   - Tener un backup de los datos

2. **Considerar migración de datos:**
   - ¿Hay datos históricos en localStorage que necesiten migrarse?
   - Crear script de migración si es necesario
   - Documentar proceso de migración

3. **Performance:**
   - Considerar paginación si hay muchos registros
   - Cachear resultados cuando sea apropiado
   - Evitar requests innecesarios

---

**Próximo Paso:** Comenzar migración función por función, probando cada una antes de continuar con la siguiente.

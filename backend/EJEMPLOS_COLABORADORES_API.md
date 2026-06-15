# EJEMPLOS DE USO: API DE COLABORADORES

Esta guía muestra ejemplos prácticos de cómo usar todos los endpoints de la API de colaboradores.

---

## CONFIGURACIÓN INICIAL

### 1. Obtener Token de Autenticación

Todos los endpoints de colaboradores requieren autenticación. Primero obtén un token:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Guarda el `accessToken` para usarlo en los siguientes comandos.**

---

## ENDPOINTS DE COLABORADORES

### 1. Listar Todos los Colaboradores

```bash
# Listar todos los colaboradores activos
curl -X GET http://localhost:3001/api/colaboradores \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

**Respuesta:**
```json
{
  "success": true,
  "colaboradores": [
    {
      "id": 1,
      "foto": null,
      "nombres": "Juan Carlos",
      "apellidos": "Perez Lopez",
      "departamento": "Produccion",
      "puesto": "Operador Senior",
      "turno": "Matutino",
      "numeroEmpleado": "EMP-001",
      "fechaIngreso": "2024-01-15",
      "estatus": "Activo",
      "fechaRegistro": "2026-06-12T14:25:37.687Z"
    },
    {
      "id": 2,
      "foto": null,
      "nombres": "Maria Elena",
      "apellidos": "Garcia Martinez",
      "departamento": "Calidad",
      "puesto": "Inspector",
      "turno": "Vespertino",
      "numeroEmpleado": "EMP-002",
      "fechaIngreso": "2024-02-01",
      "estatus": "Baja",
      "fechaRegistro": "2026-06-12T14:25:42.974Z"
    }
  ],
  "total": 2
}
```

---

### 2. Filtrar Colaboradores por Departamento

```bash
# Obtener solo colaboradores de Producción
curl -X GET "http://localhost:3001/api/colaboradores?departamento=Produccion" \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

**Respuesta:**
```json
{
  "success": true,
  "colaboradores": [
    {
      "id": 1,
      "departamento": "Produccion",
      ...
    }
  ],
  "total": 1
}
```

---

### 3. Filtrar Colaboradores por Estatus

```bash
# Obtener solo colaboradores activos
curl -X GET "http://localhost:3001/api/colaboradores?estatus=Activo" \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"

# Obtener solo colaboradores dados de baja
curl -X GET "http://localhost:3001/api/colaboradores?estatus=Baja" \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

---

### 4. Combinar Filtros

```bash
# Obtener colaboradores activos de Producción
curl -X GET "http://localhost:3001/api/colaboradores?departamento=Produccion&estatus=Activo" \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

---

### 5. Crear un Nuevo Colaborador

```bash
curl -X POST http://localhost:3001/api/colaboradores \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Ana Laura",
    "apellidos": "Martinez Silva",
    "departamento": "Calidad",
    "puesto": "Inspector de Calidad",
    "turno": "Matutino",
    "numeroEmpleado": "EMP-004",
    "fechaIngreso": "2026-06-01"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Colaborador creado exitosamente",
  "colaborador": {
    "id": 4,
    "foto": null,
    "nombres": "Ana Laura",
    "apellidos": "Martinez Silva",
    "departamento": "Calidad",
    "puesto": "Inspector de Calidad",
    "turno": "Matutino",
    "numeroEmpleado": "EMP-004",
    "fechaIngreso": "2026-06-01",
    "estatus": "Activo",
    "fechaRegistro": "2026-06-12T15:30:00.000Z"
  }
}
```

---

### 6. Crear Colaborador con Foto (Base64)

```bash
curl -X POST http://localhost:3001/api/colaboradores \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Roberto",
    "apellidos": "Gomez Hernandez",
    "departamento": "Produccion",
    "puesto": "Operador",
    "turno": "Nocturno",
    "numeroEmpleado": "EMP-005",
    "fechaIngreso": "2026-06-05",
    "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

---

### 7. Obtener un Colaborador Específico

```bash
# Obtener colaborador con ID 1
curl -X GET http://localhost:3001/api/colaboradores/1 \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

**Respuesta:**
```json
{
  "success": true,
  "colaborador": {
    "id": 1,
    "foto": null,
    "nombres": "Juan Carlos",
    "apellidos": "Perez Lopez",
    "departamento": "Produccion",
    "puesto": "Operador Senior",
    "turno": "Matutino",
    "numeroEmpleado": "EMP-001",
    "fechaIngreso": "2024-01-15",
    "estatus": "Activo",
    "fechaRegistro": "2026-06-12T14:25:37.687Z"
  }
}
```

---

### 8. Actualizar un Colaborador

#### Actualizar un solo campo (puesto)

```bash
curl -X PUT http://localhost:3001/api/colaboradores/1 \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "puesto": "Supervisor de Producción"
  }'
```

#### Actualizar múltiples campos

```bash
curl -X PUT http://localhost:3001/api/colaboradores/1 \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "puesto": "Supervisor de Producción",
    "turno": "Vespertino",
    "numeroEmpleado": "EMP-001-SUPER"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Colaborador actualizado exitosamente",
  "colaborador": {
    "id": 1,
    "puesto": "Supervisor de Producción",
    "turno": "Vespertino",
    "numeroEmpleado": "EMP-001-SUPER",
    "updated_at": "2026-06-12T15:45:00.000Z",
    ...
  }
}
```

---

### 9. Dar de Baja a un Colaborador

```bash
# Cambiar estatus a "Baja"
curl -X PUT http://localhost:3001/api/colaboradores/2/baja \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Colaborador dado de baja exitosamente",
  "colaborador": {
    "id": 2,
    "estatus": "Baja",
    "updated_at": "2026-06-12T15:50:00.000Z",
    ...
  }
}
```

**Nota:** El colaborador sigue en la base de datos, solo cambia su estatus a "Baja". Puede seguir apareciendo si filtras por `?estatus=Baja`.

---

### 10. Eliminar un Colaborador (Soft Delete)

```bash
# Eliminar permanentemente (marca deleted_at)
curl -X DELETE http://localhost:3001/api/colaboradores/3 \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Colaborador eliminado exitosamente"
}
```

**Nota:** El colaborador NO se borra físicamente de la base de datos. Se marca con `deleted_at` y ya no aparece en las consultas normales.

---

## USO DESDE EL FRONTEND (JavaScript)

### 1. Cargar Colaboradores

```javascript
async function loadColaboradores() {
  try {
    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(`${API_BASE_URL}/colaboradores`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return loadColaboradores();
        logout();
        return;
      }
      throw new Error('Error al cargar colaboradores');
    }

    const data = await response.json();
    const colaboradores = data.colaboradores || [];

    // Renderizar colaboradores...
    console.log('Colaboradores:', colaboradores);
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al cargar colaboradores', 'error');
  }
}
```

---

### 2. Crear Colaborador

```javascript
async function createColaborador(formData) {
  try {
    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(`${API_BASE_URL}/colaboradores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return createColaborador(formData);
        logout();
        return;
      }
      const error = await response.json();
      throw new Error(error.message || 'Error al crear colaborador');
    }

    const data = await response.json();
    showToast('Colaborador creado exitosamente', 'success');
    return data.colaborador;
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}

// Uso
const nuevoColaborador = await createColaborador({
  nombres: 'Juan',
  apellidos: 'Perez',
  departamento: 'Produccion',
  fechaIngreso: '2026-06-12'
});
```

---

### 3. Actualizar Colaborador

```javascript
async function updateColaborador(colaboradorId, updates) {
  try {
    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return updateColaborador(colaboradorId, updates);
        logout();
        return;
      }
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar colaborador');
    }

    const data = await response.json();
    showToast('Colaborador actualizado exitosamente', 'success');
    return data.colaborador;
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}

// Uso
const actualizado = await updateColaborador(1, {
  puesto: 'Supervisor'
});
```

---

### 4. Eliminar Colaborador

```javascript
async function deleteColaborador(colaboradorId) {
  try {
    const confirmed = await showConfirm(
      '¿Estás seguro de eliminar este colaborador?',
      'Eliminar Colaborador'
    );

    if (!confirmed) return;

    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return deleteColaborador(colaboradorId);
        logout();
        return;
      }
      throw new Error('Error al eliminar colaborador');
    }

    showToast('Colaborador eliminado exitosamente', 'success');
    // Recargar lista
    loadColaboradores();
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}
```

---

### 5. Dar de Baja Colaborador

```javascript
async function darDeBajaColaborador(colaboradorId) {
  try {
    const confirmed = await showConfirm(
      '¿Estás seguro de dar de baja a este colaborador?',
      'Dar de Baja'
    );

    if (!confirmed) return;

    const token = getStorage(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}/baja`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return darDeBajaColaborador(colaboradorId);
        logout();
        return;
      }
      throw new Error('Error al dar de baja colaborador');
    }

    showToast('Colaborador dado de baja exitosamente', 'success');
    // Recargar lista
    loadColaboradores();
  } catch (error) {
    console.error('Error:', error);
    showToast(error.message, 'error');
  }
}
```

---

## FUNCIONES AUXILIARES CENTRALIZADAS

El frontend incluye 3 funciones auxiliares reutilizables:

### `loadColaboradoresFromAPI(filters)`

```javascript
// Cargar todos los colaboradores
const todos = await loadColaboradoresFromAPI();

// Filtrar por departamento
const deProduccion = await loadColaboradoresFromAPI({
  departamento: 'Produccion'
});

// Filtrar por estatus
const activos = await loadColaboradoresFromAPI({
  estatus: 'Activo'
});

// Múltiples filtros
const activosDeCalidad = await loadColaboradoresFromAPI({
  departamento: 'Calidad',
  estatus: 'Activo'
});
```

### `deleteColaboradorAPI(colaboradorId)`

```javascript
const success = await deleteColaboradorAPI(123);
if (success) {
  console.log('Colaborador eliminado');
}
```

### `darDeBajaColaboradorAPI(colaboradorId)`

```javascript
const success = await darDeBajaColaboradorAPI(123);
if (success) {
  console.log('Colaborador dado de baja');
}
```

---

## ERRORES COMUNES

### 1. Token Expirado (401 Unauthorized)
**Solución:** El sistema automáticamente intenta renovar el token con `refreshAccessToken()`. Si falla, redirige al login.

### 2. Número de Empleado Duplicado (409 Conflict)
```json
{
  "error": "Número de empleado duplicado",
  "message": "El número de empleado ya existe"
}
```
**Solución:** Usa otro número de empleado.

### 3. Colaborador No Encontrado (404 Not Found)
```json
{
  "error": "No encontrado",
  "message": "Colaborador no encontrado"
}
```
**Solución:** Verifica que el ID sea correcto y que el colaborador no haya sido eliminado.

### 4. Fecha Inválida (400 Bad Request)
```json
{
  "error": "Fecha inválida",
  "message": "La fecha de ingreso debe estar en formato YYYY-MM-DD"
}
```
**Solución:** Usa el formato correcto: `2026-06-12`

---

## TIPS Y MEJORES PRÁCTICAS

1. **Siempre valida la respuesta del servidor**
   - Verifica `response.ok` antes de procesar
   - Maneja errores 401 con token refresh
   - Muestra mensajes de error al usuario

2. **Usa las funciones auxiliares centralizadas**
   - `loadColaboradoresFromAPI()` en lugar de fetch directo
   - `deleteColaboradorAPI()` para eliminar
   - `darDeBajaColaboradorAPI()` para dar de baja

3. **Confirma acciones destructivas**
   - Usa `showConfirm()` antes de eliminar o dar de baja
   - Muestra el nombre del colaborador en el mensaje

4. **Recarga listas después de modificar**
   - Después de crear: recargar lista
   - Después de actualizar: recargar lista
   - Después de eliminar: recargar lista

5. **Maneja fotos en Base64 con cuidado**
   - Las fotos pueden hacer crecer el payload
   - Considera límites de tamaño
   - Comprime imágenes antes de enviar

---

## SIGUIENTE: FASE 4 - ASISTENCIA

Una vez completada la migración de colaboradores, el siguiente módulo será **Asistencia**:
- Tabla `asistencias` vinculada a `colaboradores`
- Endpoints para pasar asistencia
- Historial de asistencia
- Reportes por departamento

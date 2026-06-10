# 📐 Convenciones del Proyecto

## 🎯 Propósito

Este documento define las convenciones y estándares de código para el proyecto MI Technologies Apps de Calidad.

---

## 📁 Estructura de Carpetas

### Organización Principal

```
NUEVO_Apps_Calidad/
├── src/                    # Código fuente de la aplicación
│   ├── assets/            # Recursos estáticos
│   │   ├── css/          # Hojas de estilo
│   │   ├── js/           # JavaScript de la aplicación
│   │   └── img/          # Imágenes y recursos visuales
│   └── pages/            # Páginas HTML de la aplicación
├── docs/                  # Documentación del proyecto
├── tests/                 # Tests automatizados (Playwright)
├── tools/                 # Herramientas de desarrollo
│   └── dev/              # Herramientas de prueba temporal
└── node_modules/         # Dependencias (no versionar)
```

### Reglas de Ubicación

**Archivos de Código Fuente** (`src/`):
- ✅ Código de producción únicamente
- ✅ Estructura modular y organizada
- ❌ Sin archivos de prueba temporales
- ❌ Sin archivos de desarrollo

**Herramientas** (`tools/`):
- ✅ Utilidades permanentes en raíz de tools/
- ✅ Pruebas temporales en `tools/dev/`
- ✅ Cada herramienta documentada en README

**Documentación** (`docs/`):
- ✅ Guías técnicas
- ✅ Diagramas de arquitectura
- ✅ Especificaciones
- ❌ README va en raíz, no en docs/

---

## 🏗️ Arquitectura del Código

### Capa de Servicios

Todo acceso a datos debe pasar por la capa de servicios:

```javascript
// ✅ CORRECTO - Usar servicio
const colaboradores = await asistenciaService.getColaboradores();

// ❌ INCORRECTO - Acceso directo
const colaboradores = JSON.parse(localStorage.getItem('colaboradores'));
```

**Razón:** Facilita migración futura a API REST.

### Separación de Responsabilidades

```
Vista (HTML) → Lógica (JS) → Servicio → Storage
```

**Ejemplo:**
```javascript
// Vista: asistencia-rrhh1000.html
// Lógica: asistencia-rrhh.js
// Servicio: asistencia-service.js
// Storage: localStorage (futuro: API REST)
```

---

## 📝 Convenciones de Código

### Nombres de Archivos

**HTML:**
```
[modulo]-[version].html
Ejemplo: asistencia-rrhh1000.html
```

**JavaScript:**
```
[modulo]-[tipo].js
Ejemplo: asistencia-service.js, asistencia-rrhh.js
```

**CSS:**
```
[modulo].css
Ejemplo: asistencia-rrhh.css
```

### Nombres de Variables

**JavaScript:**
```javascript
// Usar camelCase
const colaboradoresActivos = [];
const dashboardState = {};

// Constantes en UPPER_SNAKE_CASE
const API_BASE_URL = '/api';
const MAX_RETRIES = 3;

// Funciones descriptivas
async function cargarColaboradores() { }
function calcularAsistenciaPromedio() { }
```

### Nombres de Funciones

**Patrones recomendados:**
```javascript
// Acciones
cargar...()      // cargarDatos(), cargarColaboradores()
actualizar...()  // actualizarTabla(), actualizarMetricas()
guardar...()     // guardarAsistencia(), guardarColaborador()
eliminar...()    // eliminarRegistro()

// Validaciones
validar...()     // validarFormulario()
verificar...()   // verificarPermisos()

// Obtener datos
get...()         // getColaboradores(), getMetricas()
obtener...()     // obtenerFechaActual()

// Renderizado
renderizar...()  // renderizarTabla()
mostrar...()     // mostrarModal()
```

---

## 🎨 Convenciones de CSS

### Nomenclatura de Clases

Usar BEM (Block Element Modifier) cuando sea apropiado:

```css
/* Bloque */
.dashboard-header { }

/* Elemento */
.dashboard-header__title { }

/* Modificador */
.dashboard-header--dark { }
```

**Para el proyecto actual (ya establecido):**
```css
/* Componentes */
.metric-card { }
.badge-presente { }
.btn-icon { }

/* Estados */
.active { }
.disabled { }
.loading { }
```

### Variables CSS

Usar custom properties para temas:

```css
:root {
  --color-primary: #1E7CBA;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --bg-header: #ffffff;
  --text-primary: #333333;
}
```

---

## 💾 Convenciones de Datos

### Formato de Fechas

**SIEMPRE usar ISO 8601:**
```javascript
// ✅ CORRECTO
fecha: "2026-06-08"  // YYYY-MM-DD

// ❌ INCORRECTO
fecha: "08/06/2026"
fecha: "June 8, 2026"
```

### Estados de Registros

**Usar minúsculas:**
```javascript
// ✅ CORRECTO
estado: "presente"
estado: "ausente"

// ❌ INCORRECTO
estado: "Presente"
estado: "AUSENTE"
```

### Keys de localStorage

**Convención establecida:**
```javascript
// Datos principales
localStorage.getItem('colaboradores')
localStorage.getItem('historialAsistencia')
localStorage.getItem('tiemposExtra')

// Preferencias
localStorage.getItem('darkMode')
```

---

## 📋 Git y Versionado

### Mensajes de Commit

Seguir Conventional Commits:

```bash
# Formato
<tipo>(<alcance>): <descripción>

# Tipos válidos
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Documentación
style:    # Formato, estilos CSS
refactor: # Refactorización
test:     # Tests
chore:    # Tareas de mantenimiento

# Ejemplos
feat(asistencia): agregar filtro por turno
fix(dashboard): corregir cálculo de semanas
docs: actualizar ARQUITECTURA.md con nuevos módulos
style(header): aplicar fondo azul oscuro
```

### Ramas

```bash
main/master    # Producción
develop        # Desarrollo
feature/[nombre]  # Nueva funcionalidad
fix/[nombre]      # Corrección de bug
```

---

## 🧪 Testing

### Estructura de Tests

```
tests/
├── e2e/           # Tests end-to-end (Playwright)
├── integration/   # Tests de integración
└── fixtures/      # Datos de prueba
```

### Nomenclatura de Tests

```javascript
// Playwright
test('debería cargar colaboradores activos', async ({ page }) => {
  // ...
});

test('debería marcar asistencia correctamente', async ({ page }) => {
  // ...
});
```

---

## 📚 Documentación

### Comentarios en Código

**JavaScript:**
```javascript
/**
 * Obtiene colaboradores activos del sistema
 * @returns {Promise<Array>} Lista de colaboradores activos
 */
async function getColaboradoresActivos() {
  // ...
}
```

**Cuándo comentar:**
- ✅ Funciones públicas de servicios
- ✅ Lógica compleja o no obvia
- ✅ Algoritmos críticos
- ❌ Código auto-explicativo
- ❌ Comentarios obvios

### README en Carpetas

Cada carpeta importante debe tener un README:
- ✅ `tools/README.md`
- ✅ `tests/README.md`
- ✅ `docs/README.md`

---

## 🔒 Seguridad

### Validación de Datos

```javascript
// ✅ CORRECTO - Validar entrada de usuario
function registrarAsistencia(colaboradorId, fecha) {
  if (!colaboradorId || !fecha) {
    throw new Error('Datos inválidos');
  }
  // ...
}

// ❌ INCORRECTO - Sin validación
function registrarAsistencia(colaboradorId, fecha) {
  localStorage.setItem('asistencia', JSON.stringify({colaboradorId, fecha}));
}
```

### Datos Sensibles

```javascript
// ❌ NUNCA hacer esto
const password = "123456";
const apiKey = "sk_live_xxxxx";

// ✅ Usar variables de entorno
const apiKey = process.env.API_KEY;
```

---

## ⚡ Performance

### localStorage

```javascript
// ✅ CORRECTO - Leer una vez, usar múltiples veces
const colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
const activos = colaboradores.filter(c => c.activo);
const bajas = colaboradores.filter(c => c.baja);

// ❌ INCORRECTO - Múltiples lecturas
const activos = JSON.parse(localStorage.getItem('colaboradores')).filter(c => c.activo);
const bajas = JSON.parse(localStorage.getItem('colaboradores')).filter(c => c.baja);
```

---

## 🚀 Deploy y Producción

### Checklist Pre-Deploy

- [ ] Tests pasan correctamente
- [ ] Sin errores en consola
- [ ] Documentación actualizada
- [ ] CHANGELOG actualizado
- [ ] Version bump en package.json
- [ ] Commit final descriptivo
- [ ] Tag de versión creado

### Versionado Semántico

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  (patch: bug fix)
1.0.1 → 1.1.0  (minor: nueva funcionalidad)
1.1.0 → 2.0.0  (major: breaking change)
```

---

## 📞 Preguntas

¿Dudas sobre estas convenciones?

1. Revisar `ARQUITECTURA.md` para entender el flujo de datos
2. Consultar código existente como referencia
3. Preguntar al equipo si algo no está claro

**Última actualización:** Junio 2026

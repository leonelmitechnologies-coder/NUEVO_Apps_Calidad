# Estructura del Proyecto

Guía detallada de la organización de archivos y directorios del Sistema de Registro de Asistencia.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Estructura Completa](#estructura-completa)
- [Directorios Principales](#directorios-principales)
- [Archivos de Configuración](#archivos-de-configuración)
- [Código Fuente](#código-fuente)
- [Convenciones](#convenciones)

## 🎯 Visión General

El proyecto sigue una estructura modular y organizada que facilita el mantenimiento y la escalabilidad.

### Principios de Organización

1. **Separación de Concerns:** HTML, CSS y JS en archivos separados
2. **Modularidad:** Componentes reutilizables y bien definidos
3. **Convenciones:** Nombres descriptivos y consistentes
4. **Escalabilidad:** Preparado para crecer con el proyecto

## 📁 Estructura Completa

```
NUEVO_Apps_Calidad/
├── .claude/                      # Configuración de Claude Code
│   ├── agents/                   # Agentes especializados
│   │   └── documentation-expert.md
│   ├── skills/                   # Skills personalizados
│   │   ├── ui-ux-pro-max/       # Skill de diseño UI/UX
│   │   │   ├── scripts/
│   │   │   │   ├── core.py
│   │   │   │   ├── design_system.py
│   │   │   │   └── search.py
│   │   │   └── SKILL.md
│   │   └── using-superpowers/
│   │       └── SKILL.md
│   └── README.md                 # Documentación de Claude Code
│
├── docs/                         # Documentación técnica
│   ├── README.md                 # Índice de documentación
│   ├── GETTING_STARTED.md       # Guía de inicio rápido
│   ├── ARCHITECTURE.md          # Arquitectura del sistema
│   ├── DESIGN_SYSTEM.md         # Sistema de diseño
│   ├── API.md                   # Documentación de API (futuro)
│   ├── CODE_EXAMPLES.md         # Ejemplos de código
│   ├── TESTING.md               # Guía de testing
│   ├── DEPLOYMENT.md            # Guía de despliegue
│   ├── PROJECT_STRUCTURE.md     # Este archivo
│   └── superpowers/             # Specs avanzadas
│       └── specs/
│           └── 2026-06-04-attendance-system-design.md
│
├── src/                          # Código fuente
│   ├── pages/                    # Páginas HTML
│   │   ├── index1000.html           # Login page
│   │   └── dashboard1000.html       # Dashboard principal
│   │
│   ├── assets/                   # Recursos estáticos
│   │   ├── css/                 # Hojas de estilo
│   │   │   ├── main.css         # Estilos globales y variables
│   │   │   ├── login.css        # Estilos de login
│   │   │   └── dashboard.css    # Estilos del dashboard
│   │   │
│   │   ├── js/                  # Scripts JavaScript
│   │   │   ├── utils.js         # Utilidades reutilizables
│   │   │   └── auth.js          # Lógica de autenticación
│   │   │
│   │   └── img/                 # Imágenes
│   │       ├── logo.png         # Logo principal
│   │       └── logo_mi_backup.png
│   │
│   └── components/              # Componentes reutilizables (futuro)
│
├── tests/                        # Tests automatizados
│   └── login.spec.js            # Tests de login
│
├── node_modules/                 # Dependencias (ignorado en git)
│
├── .git/                         # Control de versiones Git
│
├── .editorconfig                 # Configuración del editor
├── .gitignore                    # Archivos ignorados por Git
├── .prettierrc                   # Configuración de Prettier
├── CHANGELOG.md                  # Registro de cambios
├── CONTRIBUTING.md               # Guía de contribución
├── LICENSE                       # Licencia del proyecto
├── package.json                  # Dependencias y scripts npm
├── package-lock.json             # Lock de dependencias
├── playwright.config.js          # Configuración de Playwright
└── README.md                     # Documentación principal
```

## 📂 Directorios Principales

### `.claude/`

Configuración de Claude Code y herramientas de IA.

**Contenido:**
- `agents/` - Agentes especializados (documentation-expert)
- `skills/` - Skills personalizados (ui-ux-pro-max)
- `README.md` - Documentación de configuración

**Propósito:**
- Automatización con Claude Code
- Generación de código asistida
- Mejores prácticas de UI/UX

### `docs/`

Documentación técnica completa del proyecto.

**Contenido:**
- Guías de usuario y desarrollador
- Arquitectura y diseño
- APIs y ejemplos de código
- Testing y deployment

**Convención:**
- Archivos en Markdown (`.md`)
- Nombres en SCREAMING_SNAKE_CASE
- Estructura jerárquica con índice

### `src/`

Código fuente de la aplicación.

**Estructura:**
```
src/
├── pages/          # Vistas HTML
├── assets/
│   ├── css/       # Estilos
│   ├── js/        # Scripts
│   └── img/       # Imágenes
└── components/    # Componentes (futuro)
```

**Convenciones:**
- Archivos organizados por tipo
- Nombres descriptivos en kebab-case
- Separación de concerns (HTML/CSS/JS)

### `tests/`

Tests automatizados end-to-end con Playwright.

**Estructura:**
```
tests/
├── *.spec.js      # Tests de especificación
├── fixtures/      # Datos de prueba (futuro)
└── pages/         # Page Objects (futuro)
```

**Convención:**
- `*.spec.js` para archivos de test
- Nombres descriptivos de funcionalidad

### `node_modules/`

Dependencias instaladas por npm.

**Nota:**
- Ignorado en `.gitignore`
- Regenerable con `npm install`
- No modificar manualmente

## ⚙️ Archivos de Configuración

### `.editorconfig`

Configuración de editor para consistencia de código.

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

**Soportado por:**
- VS Code
- WebStorm
- Sublime Text
- Atom

### `.gitignore`

Archivos y directorios ignorados por Git.

```gitignore
node_modules/
.DS_Store
.env
playwright-report/
test-results/
```

### `.prettierrc`

Configuración de formateo automático.

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### `package.json`

Metadatos del proyecto y dependencias.

```json
{
  "name": "nuevo_apps_calidad",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0"
  }
}
```

### `playwright.config.js`

Configuración de testing con Playwright.

```javascript
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'file://' + __dirname,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## 💻 Código Fuente

### `src/pages/`

Páginas HTML de la aplicación.

#### `index1000.html` - Página de Login

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Login - Sistema de Asistencia</title>
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/login.css">
</head>
<body>
  <!-- Formulario de login -->
  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/auth.js"></script>
</body>
</html>
```

**Características:**
- Semántico HTML5
- Accesible WCAG 2.1 AA
- Responsive mobile-first

#### `dashboard1000.html` - Dashboard Principal

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - Sistema de Asistencia</title>
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>
  <!-- Dashboard content -->
  <script src="../assets/js/utils.js"></script>
  <script src="../assets/js/auth.js"></script>
</body>
</html>
```

### `src/assets/css/`

Hojas de estilo organizadas por responsabilidad.

#### `main.css` - Estilos Globales

```css
/**
 * Variables CSS
 * Reset y normalización
 * Utilidades globales
 */

:root {
  --color-primary: #1E7CBA;
  --spacing-md: 1rem;
  /* ... más variables */
}
```

**Contenido:**
- Variables CSS (design tokens)
- Reset y normalización
- Clases utilitarias
- Estilos base

#### `login.css` - Estilos de Login

```css
/**
 * Estilos específicos de página de login
 * Login form, card, backgrounds
 */

.login-page { /* ... */ }
.login-form { /* ... */ }
```

**Responsabilidad:**
- Estilos específicos de login
- Formulario y validación
- Efectos glassmorphism

#### `dashboard.css` - Estilos de Dashboard

```css
/**
 * Estilos del dashboard principal
 * Header, sidebar, content areas
 */

.dashboard { /* ... */ }
.dashboard-header { /* ... */ }
```

### `src/assets/js/`

Scripts JavaScript modulares.

#### `utils.js` - Utilidades

```javascript
/**
 * Funciones utilitarias reutilizables
 * Validación, storage, helpers
 */

function isEmpty(value) { /* ... */ }
function showError(input, message) { /* ... */ }
function getStorage(key) { /* ... */ }
```

**Funciones:**
- Validación de inputs
- Gestión de localStorage
- Helpers de UI
- Utilidades generales

#### `auth.js` - Autenticación

```javascript
/**
 * Lógica de autenticación
 * Login, logout, sesiones
 */

async function login(username, password) { /* ... */ }
function isAuthenticated() { /* ... */ }
function requireAuth() { /* ... */ }
```

**Responsabilidad:**
- Flujo de login/logout
- Gestión de sesiones
- Protección de rutas
- Validación de formularios

### `src/assets/img/`

Imágenes y assets visuales.

```
img/
├── logo.png              # Logo principal (200x50px)
└── logo_mi_backup.png    # Logo de respaldo
```

**Optimización:**
- Imágenes comprimidas
- Formatos modernos (futuro: WebP)
- Responsive images (futuro: srcset)

## 📝 Convenciones

### Nomenclatura de Archivos

```
HTML:     kebab-case.html     (index1000.html, dashboard1000.html)
CSS:      kebab-case.css      (main.css, login.css)
JS:       kebab-case.js       (auth.js, utils.js)
Tests:    kebab-case.spec.js  (login.spec.js)
Docs:     SCREAMING_SNAKE.md  (GETTING_STARTED.md)
```

### Organización de CSS

```css
/* 1. Variables */
:root { /* ... */ }

/* 2. Reset */
*, *::before, *::after { /* ... */ }

/* 3. Base */
body { /* ... */ }

/* 4. Layout */
.container { /* ... */ }

/* 5. Components */
.btn { /* ... */ }

/* 6. Utilities */
.sr-only { /* ... */ }

/* 7. Media Queries */
@media (min-width: 768px) { /* ... */ }
```

### Organización de JavaScript

```javascript
/* 1. Constants */
const STORAGE_KEYS = { /* ... */ };

/* 2. Helper Functions */
function isEmpty(value) { /* ... */ }

/* 3. Main Functions */
async function login() { /* ... */ }

/* 4. Event Handlers */
function handleLogin(event) { /* ... */ }

/* 5. Initialization */
document.addEventListener('DOMContentLoaded', () => {
  // Setup
});
```

### Comentarios

```javascript
/**
 * Descripción de la función
 * @param {string} username - Nombre de usuario
 * @returns {Promise<Object>} - Resultado del login
 */
async function login(username, password) {
  // Implementación
}
```

### Imports/Dependencies

```html
<!-- Orden de scripts -->
<script src="utils.js"></script>  <!-- Primero: utilidades -->
<script src="auth.js"></script>   <!-- Segundo: dependencias -->
<script>                          <!-- Tercero: inicialización -->
  document.addEventListener('DOMContentLoaded', init);
</script>
```

## 🔄 Migración y Expansión

### Agregar Nueva Página

```bash
# 1. Crear HTML
touch src/pages/nueva-pagina.html

# 2. Crear CSS específico
touch src/assets/css/nueva-pagina.css

# 3. Crear JS si necesario
touch src/assets/js/nueva-pagina.js

# 4. Crear tests
touch tests/nueva-pagina.spec.js
```

### Agregar Componente Reutilizable

```bash
# Futuro: cuando se implemente sistema de componentes
mkdir -p src/components/button
touch src/components/button/button.html
touch src/components/button/button.css
touch src/components/button/button.js
```

### Estructura Backend (Futuro)

```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── tests/
├── .env.example
└── server.js
```

## 📊 Métricas

### Tamaño del Proyecto

```
Líneas de código:
- HTML: ~300 líneas
- CSS: ~800 líneas
- JavaScript: ~500 líneas
- Tests: ~200 líneas
Total: ~1,800 líneas

Archivos:
- HTML: 2
- CSS: 3
- JS: 2
- Tests: 1
- Docs: 9+
```

### Estructura Ideal

- [ ] Modular y organizado
- [ ] Fácil de navegar
- [ ] Escalable
- [ ] Bien documentado
- [ ] Consistente

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0

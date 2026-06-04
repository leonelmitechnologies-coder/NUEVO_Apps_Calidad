# Sistema de Registro de Asistencia - MI Technologies

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Playwright](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)

Sistema web profesional para el registro y control de asistencia de empleados en MI Technologies, Inc.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [Testing](#testing)
- [Documentación](#documentación)
- [Contribución](#contribución)
- [Licencia](#licencia)

## ✨ Características

### Módulo de Autenticación
- 🔐 Login seguro con validación de credenciales
- 👁️ Toggle de visibilidad de contraseña
- 💾 Opción "Recordar sesión"
- 📱 **Diseño mobile-first optimizado** (UX Pro Max)
- ♿ **Accesibilidad WCAG 2.1 AA** completa

### Dashboard
- 📊 Panel de control intuitivo
- 📈 Visualización de datos en tiempo real
- 🎨 Interfaz moderna con glassmorphism
- 🌓 Soporte para light/dark mode (futuro)

### UX/UI Profesional
- ✅ Touch targets mínimo 44px
- ✅ Autocomplete optimizado
- ✅ Focus states visibles
- ✅ Teclados móviles optimizados
- ✅ Loading states sin bloqueo de UI
- ✅ Animaciones con `prefers-reduced-motion`

## 🚀 Tecnologías

### Frontend
- **HTML5** - Semántico y accesible
- **CSS3** - Variables CSS, Grid, Flexbox, Animations
- **JavaScript (ES6+)** - Vanilla JS, Async/Await, Modules

### Testing
- **Playwright** - Testing end-to-end multiplataforma
- **Configuración multi-browser**: Chrome, Firefox, Safari
- **Testing móvil**: iOS Safari, Android Chrome

### Desarrollo
- **Git** - Control de versiones
- **EditorConfig** - Consistencia de código
- **Prettier** - Formateo automático

## 📦 Requisitos

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+)

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/mi-technologies/apps-calidad.git
cd apps-calidad

# Instalar dependencias
npm install

# Instalar navegadores de Playwright (primera vez)
npx playwright install
```

## 📁 Estructura del Proyecto

```
NUEVO_Apps_Calidad/
├── src/                          # Código fuente
│   ├── pages/                    # Páginas HTML
│   │   ├── index1000.html       # Página de login
│   │   └── dashboard1000.html   # Dashboard principal
│   ├── assets/                   # Recursos estáticos
│   │   ├── css/                 # Hojas de estilo
│   │   │   ├── main.css         # Estilos globales y variables
│   │   │   ├── login.css        # Estilos específicos de login
│   │   │   └── dashboard.css    # Estilos del dashboard
│   │   ├── js/                  # Scripts JavaScript
│   │   │   ├── utils.js         # Utilidades y helpers
│   │   │   └── auth.js          # Lógica de autenticación
│   │   └── img/                 # Imágenes y assets
│   │       ├── logo.png         # Logo principal
│   │       └── logo_mi_backup.png
│   └── components/              # Componentes reutilizables (futuro)
│
├── tests/                        # Tests automatizados
│   ├── login.spec.js            # Tests del módulo de login
│   └── dashboard.spec.js        # Tests del dashboard (futuro)
│
├── docs/                         # Documentación técnica
│   ├── ARCHITECTURE.md          # Arquitectura del sistema
│   ├── API.md                   # Documentación de APIs (futuro)
│   ├── DESIGN_SYSTEM.md         # Sistema de diseño y guías UI/UX
│   └── DEPLOYMENT.md            # Guía de despliegue
│
├── .claude/                      # Configuración de Claude Code
│   └── skills/                  # Skills personalizados
│
├── .github/                      # GitHub workflows (futuro)
│   └── workflows/
│
├── node_modules/                 # Dependencias (ignorado en git)
│
├── .editorconfig                 # Configuración del editor
├── .gitignore                    # Archivos ignorados por Git
├── .prettierrc                   # Configuración de Prettier
├── CHANGELOG.md                  # Registro de cambios
├── CONTRIBUTING.md               # Guía de contribución
├── LICENSE                       # Licencia del proyecto
├── package.json                  # Dependencias y scripts
├── package-lock.json             # Lock de dependencias
├── playwright.config.js          # Configuración de Playwright
└── README.md                     # Este archivo
```

## 🎯 Uso

### Desarrollo Local

1. **Abrir el proyecto en un servidor local:**

```bash
# Opción 1: Live Server (VS Code extension)
# Clic derecho en src/pages/index1000.html > "Open with Live Server"

# Opción 2: Python SimpleHTTPServer
python -m http.server 8000
# Luego abrir: http://localhost:8000/src/pages/index1000.html

# Opción 3: Node.js http-server
npx http-server -p 8000
# Luego abrir: http://localhost:8000/src/pages/index1000.html
```

2. **Credenciales de prueba:**
```
Usuario: cualquier usuario válido (mínimo 3 caracteres)
Contraseña: cualquier contraseña válida (mínimo 6 caracteres)
```

### Scripts Disponibles

```bash
# Ejecutar todos los tests
npm test

# Tests con UI visible
npm run test:headed

# Tests en modo interactivo
npm run test:ui

# Tests solo en Chrome
npm run test:chrome

# Tests móviles (iOS + Android)
npm run test:mobile

# Ver reporte de tests
npm run test:report
```

## 🧪 Testing

El proyecto usa **Playwright** para testing end-to-end:

```bash
# Ejecutar tests
npm test

# Tests en modo debug
npm run test:headed

# Tests específicos
npx playwright test login.spec.js

# Generar reporte
npm run test:report
```

### Cobertura de Tests

- ✅ Login flow completo
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Navegación entre páginas
- ✅ Responsive design (móvil + desktop)

## 📚 Documentación

### Documentación Completa

Consulta la carpeta `docs/` para documentación técnica detallada:

#### Guías de Inicio
- **[Guía de Inicio Rápido](docs/GETTING_STARTED.md)** - Instalación, configuración y primer uso
- **[Índice de Documentación](docs/README.md)** - Navegación completa de toda la documentación

#### Desarrollo
- **[Arquitectura](docs/ARCHITECTURE.md)** - Diseño del sistema y patrones
- **[Sistema de Diseño](docs/DESIGN_SYSTEM.md)** - Guías UI/UX, componentes y accesibilidad
- **[Ejemplos de Código](docs/CODE_EXAMPLES.md)** - Patrones y ejemplos prácticos
- **[Testing](docs/TESTING.md)** - Guía completa de testing con Playwright

#### Backend (Futuro)
- **[API](docs/API.md)** - Documentación de API REST planificada

#### Despliegue
- **[Deployment](docs/DEPLOYMENT.md)** - Guía de despliegue en producción

#### Contribución
- **[Contribución](CONTRIBUTING.md)** - Guías de contribución y estándares
- **[Changelog](CHANGELOG.md)** - Historial de cambios del proyecto

## 🤝 Contribución

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las guías de contribución, estándares de código y proceso de pull requests.

### Proceso Rápido

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para un historial detallado de cambios.

## 👥 Autores

- **MI Technologies Development Team**

## 📄 Licencia

Este proyecto es propiedad de **MI Technologies, Inc.** Todos los derechos reservados.

---

**Desarrollado con ❤️ por MI Technologies, Inc.**

*Última actualización: Junio 2026*

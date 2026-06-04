# Claude Code - Configuración del Proyecto

Configuración personalizada de Claude Code para el proyecto Apps Calidad.

## 📁 Estructura

```
.claude/
├── agents/                      # Agentes especializados
│   └── documentation-expert.md  # Agente de documentación
├── skills/                      # Skills personalizados
│   └── ui-ux-pro-max/          # Skill de diseño UI/UX
└── README.md                    # Este archivo
```

## 🤖 Agentes Instalados

### documentation-expert

**Propósito:** Gestión profesional de documentación técnica

**Descripción:**
Agente especializado en crear, mejorar y mantener documentación de proyectos.
Sigue estándares como "Diátaxis" framework y "Docs as Code".

**Expertise:**
- ✍️ Technical Writing
- 📚 Documentation Standards
- 🔌 API Documentation (OpenAPI/Swagger)
- 📝 Code Documentation (JSDoc, Sphinx, Doxygen)
- 📖 User Guides y Tutorials

**Cuándo usar:**
- Crear o actualizar documentación del proyecto
- Documentar nuevas features o APIs
- Mejorar claridad y completitud de docs
- Generar documentación desde código
- Crear tutoriales y guías de usuario

**Instalación:**
```bash
npx claude-code-templates@latest --agent expert-advisors/documentation-expert
```

**Uso:**
El agente se invoca automáticamente cuando Claude Code detecta tareas relacionadas con documentación.

## 🎨 Skills Instalados

### ui-ux-pro-max

**Propósito:** Diseño UI/UX profesional y accesible

**Descripción:**
Skill avanzado para crear interfaces de usuario con diseño de nivel profesional.
Incluye 50 estilos, 21 paletas de colores, y soporte para múltiples frameworks.

**Características:**
- 🎨 50 estilos de diseño (glassmorphism, neumorphism, minimalism, etc.)
- 🎨 21 paletas de colores profesionales
- 🔤 50 combinaciones de fuentes
- 📊 20 tipos de gráficos
- ⚡ 9 stacks tecnológicos (React, Next.js, Vue, Svelte, SwiftUI, etc.)

**Frameworks soportados:**
- React / Next.js
- Vue.js
- Svelte
- SwiftUI
- React Native
- Flutter
- Tailwind CSS
- shadcn/ui

**Accesibilidad:**
- ♿ WCAG 2.1 AA compliant
- 🎯 Touch targets 44px+
- 🔍 Contraste de colores verificado
- ⌨️ Navegación por teclado
- 📱 Mobile-first approach

**Uso:**
Invocado automáticamente al trabajar con UI/UX o mediante comandos relacionados con diseño.

## 📋 Comandos Disponibles

### Documentación

```bash
# Claude Code automáticamente usa el agente documentation-expert para:
# - Crear/actualizar README, CONTRIBUTING, CHANGELOG
# - Documentar APIs y funciones
# - Generar guías de usuario
```

### Diseño UI/UX

```bash
# El skill ui-ux-pro-max se activa automáticamente con:
# - Crear componentes de UI
# - Diseñar páginas o layouts
# - Mejorar estilos existentes
# - Implementar diseño responsive
```

## 🔧 Configuración Personalizada

### Hooks

Los hooks de Claude Code permiten ejecutar scripts automáticamente en eventos específicos.
Actualmente no hay hooks configurados. Para agregar hooks, consulta la documentación oficial.

### Settings

Configuraciones personalizadas del proyecto se definen en `.claude/settings.json` (si existe).

## 📚 Recursos

### Claude Code

- **Documentación:** https://docs.anthropic.com/claude/docs
- **Templates:** https://aitmpl.com
- **GitHub:** https://github.com/anthropics/claude-code

### Agentes y Skills

- **Marketplace:** https://aitmpl.com
- **Documentación de Skills:** Consulta la carpeta `skills/` para docs específicos

## 🚀 Instalación de Nuevos Agentes/Skills

### Desde Template Marketplace

```bash
# Ver templates disponibles
npx claude-code-templates@latest --list

# Instalar agente específico
npx claude-code-templates@latest --agent <nombre-agente>

# Instalar skill específico
npx claude-code-templates@latest --skill <nombre-skill>
```

### Skills Recomendados para este Proyecto

#### Testing
```bash
npx claude-code-templates@latest --skill testing/playwright-expert
```

#### Backend (Futuro)
```bash
npx claude-code-templates@latest --agent backend/api-developer
npx claude-code-templates@latest --skill backend/database-expert
```

#### DevOps (Futuro)
```bash
npx claude-code-templates@latest --skill devops/ci-cd-expert
npx claude-code-templates@latest --skill devops/docker-expert
```

## 🔄 Actualización

Para actualizar agentes y skills:

```bash
# Reinstalar desde template marketplace
npx claude-code-templates@latest --agent expert-advisors/documentation-expert
```

## 🤝 Contribución

Para agregar nuevos agentes o skills personalizados:

1. Crear archivo `.md` en `agents/` o directorio en `skills/`
2. Seguir el formato de los archivos existentes
3. Documentar en este README

## 📝 Changelog

### 2026-06-04

- ✅ Instalado `documentation-expert` agent
- ✅ Skill `ui-ux-pro-max` ya presente en proyecto
- ✅ Documentación inicial del proyecto
- ✅ Estructura organizada según mejores prácticas

---

**Última actualización:** Junio 2026
**Proyecto:** Sistema de Registro de Asistencia - MI Technologies

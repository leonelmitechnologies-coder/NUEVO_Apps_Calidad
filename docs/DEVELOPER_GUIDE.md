# Guía para Desarrolladores

Guía completa para desarrolladores que trabajarán en el Sistema de Registro de Asistencia.

## 📋 Tabla de Contenidos

- [Bienvenida](#bienvenida)
- [Quick Start](#quick-start)
- [Flujo de Desarrollo](#flujo-de-desarrollo)
- [Stack Tecnológico](#stack-tecnológico)
- [Estándares de Código](#estándares-de-código)
- [Workflow Diario](#workflow-diario)
- [Recursos](#recursos)
- [Tips y Trucos](#tips-y-trucos)

## 👋 Bienvenida

Bienvenido al equipo de desarrollo de MI Technologies. Esta guía te ayudará a comenzar a trabajar en el proyecto de forma rápida y efectiva.

### ¿Qué es este Proyecto?

Sistema web para registro y control de asistencia de empleados en MI Technologies, Inc.

**Características principales:**
- Login seguro con validación
- Dashboard intuitivo
- Diseño responsive mobile-first
- Accesibilidad WCAG 2.1 AA
- Testing automatizado

## 🚀 Quick Start

### 1. Clonar y Setup (5 minutos)

```bash
# Clonar repositorio
git clone https://github.com/mi-technologies/apps-calidad.git
cd apps-calidad

# Instalar dependencias
npm install

# Instalar navegadores para testing
npx playwright install

# Verificar instalación
npm test
```

### 2. Ejecutar Localmente

```bash
# Opción más simple: VS Code Live Server
# 1. Instalar extensión "Live Server"
# 2. Abrir src/pages/index1000.html
# 3. Click derecho > "Open with Live Server"

# Alternativa: Python
python -m http.server 8000
# Abrir: http://localhost:8000/src/pages/index1000.html
```

### 3. Credenciales de Prueba

```
Usuario: admin (o cualquier texto 3+ caracteres)
Contraseña: admin123 (o cualquier texto 6+ caracteres)
```

### 4. Verificar Todo Funciona

```bash
# Tests deben pasar
npm test

# Formateo debe estar correcto
npx prettier --check .
```

## 🔄 Flujo de Desarrollo

### 1. Crear Nueva Rama

```bash
# Actualizar main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/nombre-descriptivo

# o para bug fixes
git checkout -b fix/descripcion-bug
```

### 2. Hacer Cambios

```bash
# Editar archivos necesarios
# Seguir estándares de código
# Agregar tests si es necesario
```

### 3. Probar Cambios

```bash
# Tests automatizados
npm test

# Tests específicos
npx playwright test login.spec.js

# Verificar en navegador manualmente
```

### 4. Commit

```bash
# Staged changes
git add .

# Commit descriptivo
git commit -m "feat: agregar validación de email

- Agregar función isValidEmail en utils.js
- Validar email en formulario de registro
- Agregar tests para validación

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Tipos de commit:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formateo, sin cambios de lógica
- `refactor:` - Refactorización
- `test:` - Agregar/modificar tests
- `chore:` - Cambios en build, deps, etc

### 5. Push y Pull Request

```bash
# Push a tu rama
git push origin feature/nombre-descriptivo

# Crear PR en GitHub
# Completar template de PR
# Esperar review y aprobación
```

## 🛠️ Stack Tecnológico

### Frontend

```
HTML5 → Estructura semántica
CSS3 → Estilos (variables, grid, flexbox)
JavaScript ES6+ → Lógica (async/await, modules)
```

**No usa frameworks** (Vanilla JS por diseño)

### Testing

```
Playwright → E2E testing
Jest → Unit testing (futuro)
```

### Tools

```
Git → Control de versiones
Prettier → Formateo automático
EditorConfig → Consistencia de editor
VS Code → Editor recomendado
```

### Backend (Futuro)

```
Node.js + Express → API REST
PostgreSQL → Base de datos
JWT → Autenticación
```

## 📝 Estándares de Código

### HTML

```html
<!-- ✅ Bueno: Semántico, accesible -->
<form class="login-form" id="loginForm" novalidate>
  <label for="username">Usuario</label>
  <input
    type="text"
    id="username"
    name="username"
    autocomplete="username"
    required
    aria-required="true"
  >
  <button type="submit" class="btn-primary">
    Iniciar Sesión
  </button>
</form>

<!-- ❌ Malo: No semántico, inaccesible -->
<div class="form">
  <div>Usuario</div>
  <input type="text">
  <div onclick="submit()">Login</div>
</div>
```

**Reglas:**
- Siempre usar elementos semánticos
- Todos los inputs necesitan `<label>`
- Botones deben tener `type` explícito
- Usar ARIA cuando sea necesario

### CSS

```css
/* ✅ Bueno: Variables, BEM, específico */
.login-form {
  padding: var(--spacing-lg);
  background: var(--color-white);
  transition: opacity var(--transition-base);
}

.login-form__input {
  font-size: 16px; /* No zoom en iOS */
  border: 2px solid var(--color-border);
}

.login-form__input--error {
  border-color: var(--color-error);
}

/* ❌ Malo: Hardcoded, no estructurado */
.form {
  padding: 24px;
  background: #fff;
  transition: all 0.3s;
}

.input {
  font-size: 14px;
  border: 1px solid #ccc;
}
```

**Reglas:**
- Usar variables CSS
- Metodología BEM
- Mobile-first
- No `transition: all`

### JavaScript

```javascript
// ✅ Bueno: Async/await, descriptivo, errores manejados
async function handleLogin(event) {
  event.preventDefault();

  const username = usernameInput.value;
  const password = passwordInput.value;

  // Validar
  const validation = validateLoginForm(username, password);
  if (!validation.isValid) {
    showError(usernameInput, validation.errors.username);
    return;
  }

  // Loading
  submitButton.classList.add('loading');

  try {
    const result = await login(username, password);
    saveSession(result);
    redirect('dashboard1000.html');
  } catch (error) {
    showError(passwordInput, error.message);
  } finally {
    submitButton.classList.remove('loading');
  }
}

// ❌ Malo: Callbacks, sin validación, sin errores
function handleLogin(event) {
  event.preventDefault();
  login(username.value, password.value, function(result) {
    window.location = 'dashboard1000.html';
  });
}
```

**Reglas:**
- Usar `const`/`let`, nunca `var`
- Preferir async/await
- Siempre manejar errores
- Nombres descriptivos

### Testing

```javascript
// ✅ Bueno: Descriptivo, assertions claras
test('shows error when username is empty', async ({ page }) => {
  await page.goto('/src/pages/index1000.html');

  // Click login sin llenar campos
  await page.click('.btn-login');

  // Verificar error
  const error = await page.locator('.error-message').first();
  await expect(error).toBeVisible();
  await expect(error).toContainText('requerido');
});

// ❌ Malo: Genérico, sin contexto
test('test1', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
});
```

**Reglas:**
- Nombres muy descriptivos
- Test cases realistas
- Assertions específicas
- No hardcoded timeouts

## 📅 Workflow Diario

### Comenzar el Día

```bash
# 1. Actualizar código
git checkout main
git pull origin main

# 2. Ver estado
git status

# 3. Revisar tareas
# Ver GitHub Issues asignados

# 4. Crear/cambiar a rama de trabajo
git checkout -b feature/mi-tarea
```

### Durante Desarrollo

```bash
# Ver cambios en tiempo real
# Usar Live Server o servidor local

# Ejecutar tests frecuentemente
npm test

# Commits pequeños y frecuentes
git add archivo.js
git commit -m "feat: agregar función X"
```

### Antes de Commit

```bash
# Verificar formato
npx prettier --check .

# Formatear si necesario
npx prettier --write .

# Ejecutar todos los tests
npm test

# Ver cambios
git diff

# Staged
git add .

# Commit descriptivo
git commit -m "tipo: mensaje"
```

### Fin del Día

```bash
# Push cambios
git push origin feature/mi-tarea

# Si está listo, crear PR
# Ir a GitHub > Pull Requests > New PR

# Actualizar documentación si necesario
# Actualizar CHANGELOG.md
```

## 📚 Recursos

### Documentación del Proyecto

```
docs/
├── README.md              → Índice principal
├── GETTING_STARTED.md    → Guía de inicio
├── ARCHITECTURE.md       → Arquitectura
├── DESIGN_SYSTEM.md      → UI/UX
├── CODE_EXAMPLES.md      → Ejemplos
├── TESTING.md            → Testing
├── DEPLOYMENT.md         → Despliegue
└── PROJECT_STRUCTURE.md  → Estructura
```

### Documentación Externa

- **JavaScript:** [MDN Web Docs](https://developer.mozilla.org/es/)
- **CSS:** [CSS Tricks](https://css-tricks.com/)
- **Playwright:** [playwright.dev](https://playwright.dev/)
- **Git:** [Git Book](https://git-scm.com/book/es/v2)

### Herramientas Útiles

- **Can I Use:** [caniuse.com](https://caniuse.com/) - Compatibilidad de browsers
- **Contrast Checker:** [webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)
- **Regex Tester:** [regex101.com](https://regex101.com/)
- **JSON Formatter:** [jsonformatter.org](https://jsonformatter.org/)

## 💡 Tips y Trucos

### 1. Shortcuts de VS Code

```
Ctrl+P         → Quick file open
Ctrl+Shift+F   → Search in files
Ctrl+D         → Select next occurrence
Alt+Up/Down    → Move line up/down
Ctrl+/         → Toggle comment
F12            → Go to definition
```

### 2. Git Aliases

```bash
# Agregar a ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  lg = log --oneline --graph --all
```

### 3. Debugging JavaScript

```javascript
// Console tricks
console.log('valor:', valor);
console.table(array);
console.error('error:', error);

// Debugger
debugger; // Pausa ejecución en DevTools

// Network timing
console.time('fetch');
await fetch(url);
console.timeEnd('fetch');
```

### 4. CSS Debugging

```css
/* Ver todos los elementos */
* {
  outline: 1px solid red;
}

/* Ver layout de flex/grid */
.container {
  outline: 2px solid blue;
}

.container > * {
  outline: 1px solid green;
}
```

### 5. Playwright Tips

```bash
# Modo debug (paso a paso)
npx playwright test --debug

# Grabar acciones
npx playwright codegen http://localhost:8000

# Solo un test
npx playwright test -g "texto del test"

# Ver UI interactiva
npm run test:ui
```

### 6. Productividad

**Usar snippets de código:**
```javascript
// Crear en VS Code: File > Preferences > User Snippets

{
  "Async Function": {
    "prefix": "afn",
    "body": [
      "async function ${1:name}($2) {",
      "  try {",
      "    $3",
      "  } catch (error) {",
      "    console.error(error);",
      "    throw error;",
      "  }",
      "}"
    ]
  }
}
```

### 7. Atajos de Testing

```bash
# Alias útiles (agregar a ~/.bashrc o ~/.zshrc)
alias pt="npx playwright test"
alias pth="npx playwright test --headed"
alias ptu="npx playwright test --ui"
alias ptr="npx playwright show-report"
```

## 🆘 Problemas Comunes

### "Tests failing"

```bash
# 1. Verificar servidor corriendo
python -m http.server 8000

# 2. Limpiar y reinstalar
rm -rf node_modules
npm install
npx playwright install

# 3. Ver en headed mode
npm run test:headed
```

### "CSS no se aplica"

```html
<!-- Verificar ruta correcta -->
<link rel="stylesheet" href="../assets/css/main.css">

<!-- Cache? Ctrl+F5 para hard refresh -->

<!-- DevTools > Network > Disable cache -->
```

### "Git merge conflict"

```bash
# Ver conflictos
git status

# Abrir archivo con conflicto
# Buscar marcas: <<<<<<< ======= >>>>>>>

# Resolver manualmente

# Marcar como resuelto
git add archivo-resuelto.js

# Continuar merge
git commit
```

## 🎯 Checklist del Desarrollador

Antes de cada PR:

- [ ] Tests pasan (`npm test`)
- [ ] Código formateado (`npx prettier --check .`)
- [ ] Sin console.log o debuggers
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado
- [ ] Commits descriptivos
- [ ] Branch actualizado con main
- [ ] Probado en múltiples browsers

## 🤝 Comunicación

### Canales

- **Slack:** #apps-calidad (desarrollo diario)
- **GitHub Issues:** Para bugs y features
- **GitHub Discussions:** Para preguntas generales
- **Email:** dev@mitechnologies.com (asuntos formales)

### Daily Standup

Cada día en Slack #apps-calidad:
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Tengo algún blocker?

### Code Reviews

- Ser constructivo y respetuoso
- Explicar el "por qué" de los cambios
- Usar emojis: ✅ Aprobar, 💬 Comentario, ❓ Pregunta
- Responder en menos de 24 horas

## 📈 Crecimiento

### Junior → Mid

- Dominar JavaScript ES6+
- Conocer patrones de diseño comunes
- Escribir tests sin ayuda
- Entender flujo completo de features

### Mid → Senior

- Diseñar arquitectura de features
- Mentorear otros developers
- Optimizar performance
- Contribuir a decisiones técnicas

---

**¡Bienvenido al equipo! Si tienes preguntas, no dudes en preguntar en Slack.**

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0

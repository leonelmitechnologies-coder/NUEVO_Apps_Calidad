# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Registro de Asistencia de MI Technologies! 🎉

Este documento proporciona guías y mejores prácticas para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)
- [Guías de Estilo](#guías-de-estilo)

## 🤝 Código de Conducta

### Nuestro Compromiso

- Ser respetuoso y profesional en todas las interacciones
- Aceptar críticas constructivas de manera positiva
- Enfocarse en lo que es mejor para la comunidad y el proyecto
- Mostrar empatía hacia otros miembros del equipo

### Comportamientos Inaceptables

- Lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes o ataques personales
- Acoso público o privado
- Publicar información privada de otros sin permiso

## 🚀 Cómo Contribuir

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/TU-USUARIO/apps-calidad.git
cd apps-calidad

# Agregar upstream
git remote add upstream https://github.com/mi-technologies/apps-calidad.git
```

### 2. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama descriptiva
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

**Convención de nombres de ramas:**
- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Adición o mejora de tests
- `style/` - Cambios de formato/estilo

### 3. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue las [Guías de Estilo](#guías-de-estilo)
- Agrega o actualiza tests según sea necesario
- Actualiza documentación relevante

### 4. Commit

```bash
# Staged changes
git add .

# Commit con mensaje descriptivo
git commit -m "tipo: descripción corta

Descripción detallada opcional del cambio.
Explicar el por qué, no solo el qué.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Tipos de commit:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formateo, punto y coma faltantes, etc
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Cambios en build, dependencias, etc

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Luego crear Pull Request en GitHub
```

## 📝 Estándares de Código

### HTML

```html
<!-- ✅ Bueno: Semántico, accesible -->
<button type="button" aria-label="Cerrar" class="btn-close">
  <svg aria-hidden="true">...</svg>
</button>

<!-- ❌ Malo: No semántico -->
<div onclick="close()" class="close-btn">X</div>
```

**Reglas HTML:**
- Usar HTML5 semántico (`<nav>`, `<main>`, `<section>`, etc.)
- Todos los inputs deben tener `<label>` asociado
- Imágenes deben tener `alt` descriptivo
- Botones deben tener `type` explícito
- Usar ARIA cuando sea necesario

### CSS

```css
/* ✅ Bueno: Variables, BEM, específico */
.login-form {
  padding: var(--spacing-lg);
  transition: opacity var(--transition-base);
}

.login-form__input {
  font-size: 16px; /* Previene zoom en iOS */
}

/* ❌ Malo: Hardcoded, transition-all */
.form {
  padding: 24px;
  transition: all 0.3s;
}

.form input {
  font-size: 14px;
}
```

**Reglas CSS:**
- Usar variables CSS para valores reutilizables
- Metodología BEM para nombres de clases
- Mobile-first approach
- Transiciones específicas (no `transition: all`)
- Comentarios para secciones importantes
- Evitar `!important` a menos que sea absolutamente necesario

### JavaScript

```javascript
// ✅ Bueno: Async/await, descriptivo, manejo de errores
async function handleLogin(event) {
  event.preventDefault();

  const submitButton = event.target.querySelector('.btn-login');
  submitButton.classList.add('loading');

  try {
    const result = await login(username, password);
    redirect('dashboard1000.html');
  } catch (error) {
    showError(input, error.message);
  } finally {
    submitButton.classList.remove('loading');
  }
}

// ❌ Malo: Callbacks, sin manejo de errores
function handleLogin(event) {
  event.preventDefault();
  login(username, password, function(result) {
    window.location = 'dashboard1000.html';
  });
}
```

**Reglas JavaScript:**
- Usar `const` y `let`, nunca `var`
- Preferir async/await sobre callbacks
- Nombrar funciones y variables descriptivamente
- Siempre manejar errores con try/catch
- Comentar lógica compleja
- Evitar variables globales

### Accesibilidad

**Requisitos mínimos (WCAG 2.1 AA):**

```html
<!-- ✅ Focus visible -->
<button class="btn-primary">
  Enviar
</button>

<style>
.btn-primary:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>

<!-- ✅ Contraste mínimo 4.5:1 -->
<p style="color: #333; background: white;">Texto legible</p>

<!-- ✅ Touch targets 44px+ -->
<button style="min-height: 44px; min-width: 44px;">
  <svg>...</svg>
</button>

<!-- ✅ Formularios accesibles -->
<label for="email">Email</label>
<input
  id="email"
  type="email"
  autocomplete="email"
  aria-required="true"
>
```

### Testing

```javascript
// ✅ Bueno: Descriptivo, casos edge
test('login form validates empty username', async ({ page }) => {
  await page.goto('/');
  await page.click('.btn-login');

  const error = await page.locator('.error-message').textContent();
  expect(error).toContain('El usuario es requerido');
});

// ❌ Malo: Genérico, sin assertions
test('login', async ({ page }) => {
  await page.goto('/');
  await page.fill('#username', 'admin');
  await page.click('button');
});
```

**Reglas de Testing:**
- Nombres descriptivos de tests
- Probar casos felices y edge cases
- Usar selectores semánticos (no IDs genéricos)
- Assertions claras y específicas

## 🔄 Proceso de Pull Request

### Checklist antes de PR

- [ ] El código sigue las guías de estilo
- [ ] Tests pasan (`npm test`)
- [ ] Documentación actualizada (README, CHANGELOG)
- [ ] Commits son descriptivos y atómicos
- [ ] Sin console.log o código comentado
- [ ] Branch actualizado con `main`

### Template de Pull Request

```markdown
## 📝 Descripción

Descripción clara de los cambios realizados.

## 🎯 Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que añade funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente no funcione como antes)
- [ ] Documentación

## ✅ Checklist

- [ ] Mi código sigue las guías de estilo
- [ ] He realizado auto-review de mi código
- [ ] He comentado mi código en áreas difíciles
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests que prueban mi fix o feature
- [ ] Tests nuevos y existentes pasan localmente
- [ ] He actualizado CHANGELOG.md

## 📸 Screenshots (si aplica)

[Agregar screenshots o GIFs]

## 🧪 Testing

Describe cómo probaste los cambios.

## 📚 Documentación Relacionada

Links a issues, documentación, etc.
```

### Proceso de Review

1. **Automated checks:** Tests y linters deben pasar
2. **Code review:** Al menos 1 aprobación requerida
3. **Testing:** Reviewer debe verificar funcionalidad
4. **Merge:** Squash and merge preferido

## 🐛 Reportar Bugs

### Antes de Reportar

- Verifica que el bug no esté ya reportado
- Asegúrate de usar la última versión
- Reproduce el bug en ambiente limpio

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del bug.

**Para Reproducir**
Pasos para reproducir:
1. Ir a '...'
2. Click en '....'
3. Scroll hasta '....'
4. Ver error

**Comportamiento Esperado**
Descripción clara de lo que esperabas que pasara.

**Screenshots**
Si aplica, agregar screenshots.

**Entorno:**
 - OS: [ej. iOS, Windows 11]
 - Navegador: [ej. Chrome 120, Safari 17]
 - Versión: [ej. 1.0.0]
 - Dispositivo: [ej. iPhone 14 Pro, Desktop]

**Contexto Adicional**
Cualquier otra información relevante.
```

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
**¿Tu feature request está relacionado a un problema?**
Descripción clara del problema. Ej. Siempre me frustra cuando [...]

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas que has considerado**
Descripción de soluciones o features alternativas.

**Contexto adicional**
Screenshots, mockups, ejemplos de otros proyectos.
```

## 🎨 Guías de Estilo

### Nomenclatura

```javascript
// Variables y funciones: camelCase
const userName = 'admin';
function getUserData() {}

// Constantes: UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// Clases CSS: kebab-case con BEM
.login-form {}
.login-form__input {}
.login-form__input--error {}

// Archivos: kebab-case
login-form.js
user-profile.css
```

### Comentarios

```javascript
/**
 * Maneja el login del usuario
 * @param {Event} event - Form submit event
 * @returns {Promise<void>}
 */
async function handleLogin(event) {
  // Prevenir submit por defecto
  event.preventDefault();

  // Validar formulario
  const validation = validateForm();
  if (!validation.isValid) {
    showErrors(validation.errors);
    return;
  }

  // TODO: Implementar rate limiting
  // FIXME: Manejar timeout de red

  try {
    const result = await login();
  } catch (error) {
    // Error manejado
  }
}
```

### Formateo

Usa **Prettier** para formateo automático:

```bash
# Formatear todos los archivos
npx prettier --write .

# Verificar formato
npx prettier --check .
```

## 🆘 ¿Necesitas Ayuda?

- 📧 Email: dev@mitechnologies.com
- 💬 Slack: #apps-calidad
- 📖 Documentación: `/docs`

---

**¡Gracias por contribuir a MI Technologies! 🚀**

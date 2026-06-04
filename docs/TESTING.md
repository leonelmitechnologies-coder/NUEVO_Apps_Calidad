# Guía de Testing

Documentación completa sobre testing en el Sistema de Registro de Asistencia utilizando Playwright.

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Configuración](#configuración)
- [Escribir Tests](#escribir-tests)
- [Ejecutar Tests](#ejecutar-tests)
- [Mejores Prácticas](#mejores-prácticas)
- [Debugging](#debugging)
- [CI/CD](#cicd)
- [Cobertura](#cobertura)

## 🎯 Visión General

### ¿Por Qué Testing?

- **Confianza:** Asegura que el código funciona como se espera
- **Regresiones:** Detecta bugs antes de llegar a producción
- **Documentación:** Los tests sirven como documentación viva
- **Refactoring:** Permite refactorizar con confianza
- **Calidad:** Mejora la calidad general del código

### Stack de Testing

- **Framework:** Playwright 1.60.0
- **Tipo:** End-to-End (E2E)
- **Navegadores:** Chrome, Firefox, Safari
- **Móviles:** iOS Safari, Android Chrome

### Estructura de Tests

```
tests/
├── login.spec.js           # Tests de login
├── dashboard.spec.js       # Tests de dashboard (futuro)
├── fixtures/               # Datos de prueba (futuro)
└── pages/                  # Page Objects (futuro)
```

## ⚙️ Configuración

### playwright.config.js

```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directorio de tests
  testDir: './tests',

  // Tests en paralelo
  fullyParallel: true,

  // Fail si hay test.only en CI
  forbidOnly: !!process.env.CI,

  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: 'html',

  // Configuración global
  use: {
    baseURL: 'file://' + __dirname,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

## ✍️ Escribir Tests

### Estructura Básica

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup antes de cada test
    await page.goto('/src/pages/index1000.html');
  });

  test('should do something', async ({ page }) => {
    // Arrange: Preparar
    const button = page.locator('.btn-login');

    // Act: Actuar
    await button.click();

    // Assert: Verificar
    await expect(page).toHaveURL(/dashboard1000.html/);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup después de cada test
  });
});
```

### Selectores

```javascript
// Por ID
page.locator('#username')

// Por clase
page.locator('.btn-login')

// Por texto
page.locator('text=Iniciar Sesión')

// Por role (recomendado para accesibilidad)
page.locator('role=button[name="Iniciar Sesión"]')

// Por data-testid (mejor práctica)
page.locator('[data-testid="login-form"]')

// Combinados
page.locator('.form-group >> #username')

// XPath (evitar si es posible)
page.locator('//button[@type="submit"]')
```

### Interacciones

```javascript
// Click
await page.click('.btn-login');

// Fill input
await page.fill('#username', 'admin');

// Type con delay (simula typing)
await page.type('#username', 'admin', { delay: 100 });

// Check checkbox
await page.check('#rememberMe');

// Select option
await page.selectOption('#role', 'admin');

// Upload file
await page.setInputFiles('#avatar', 'path/to/file.png');

// Hover
await page.hover('.menu-item');

// Focus
await page.focus('#username');

// Press key
await page.press('#username', 'Enter');
```

### Assertions

```javascript
// URL
await expect(page).toHaveURL(/dashboard1000/);
await expect(page).toHaveURL('http://localhost/dashboard1000.html');

// Title
await expect(page).toHaveTitle('Dashboard');

// Elemento visible
await expect(page.locator('.btn-login')).toBeVisible();

// Elemento oculto
await expect(page.locator('.loading')).toBeHidden();

// Texto
await expect(page.locator('h1')).toHaveText('Bienvenido');
await expect(page.locator('.error')).toContainText('requerido');

// Count
await expect(page.locator('.card')).toHaveCount(3);

// Atributos
await expect(page.locator('#password')).toHaveAttribute('type', 'password');

// Clase
await expect(page.locator('.btn')).toHaveClass(/btn-primary/);

// Valor de input
await expect(page.locator('#username')).toHaveValue('admin');

// Enabled/Disabled
await expect(page.locator('.btn')).toBeEnabled();
await expect(page.locator('.btn')).toBeDisabled();

// Checked
await expect(page.locator('#rememberMe')).toBeChecked();
```

### Esperas

```javascript
// Esperar por elemento
await page.waitForSelector('.btn-login');

// Esperar por navegación
await page.waitForNavigation();

// Esperar por URL
await page.waitForURL(/dashboard1000/);

// Esperar por función
await page.waitForFunction(() => {
  return document.querySelector('.loading') === null;
});

// Esperar por request
await page.waitForRequest('**/api/login');

// Esperar por response
await page.waitForResponse('**/api/login');

// Esperar timeout específico
await page.waitForTimeout(1000); // Evitar si es posible

// Esperar por condición
await expect(page.locator('.loading')).toBeHidden({ timeout: 5000 });
```

## 🚀 Ejecutar Tests

### Comandos Básicos

```bash
# Todos los tests
npm test

# Tests específicos
npx playwright test login.spec.js

# Solo un test
npx playwright test login.spec.js -g "successful login"

# Modo headed (ver navegador)
npm run test:headed

# Modo UI (interfaz interactiva)
npm run test:ui

# Solo Chrome
npm run test:chrome

# Solo móviles
npm run test:mobile

# Ver reporte
npm run test:report
```

### Flags Útiles

```bash
# Debug mode
npx playwright test --debug

# Workers (paralelo)
npx playwright test --workers=4

# Retry failed
npx playwright test --retries=2

# Screenshots
npx playwright test --screenshot=on

# Trace
npx playwright test --trace=on

# Headed
npx playwright test --headed

# Proyecto específico
npx playwright test --project=chromium

# Update snapshots
npx playwright test --update-snapshots
```

### Scripts package.json

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:chrome": "playwright test --project=chromium",
    "test:mobile": "playwright test --project='Mobile Chrome' --project='Mobile Safari'",
    "test:report": "playwright show-report",
    "test:debug": "playwright test --debug"
  }
}
```

## 📖 Mejores Prácticas

### 1. Usar Page Objects

```javascript
// tests/pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;

    // Selectores
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('.btn-login');
    this.errorMessage = page.locator('.error-message');
  }

  // Acciones
  async goto() {
    await this.page.goto('/src/pages/index1000.html');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText() {
    return await this.errorMessage.textContent();
  }
}

// Uso en test
test('login fails with empty fields', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('', '');

  const error = await loginPage.getErrorText();
  expect(error).toContain('requerido');
});
```

### 2. Usar Fixtures

```javascript
// tests/fixtures/auth.fixture.js
const { test as base } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin123');
    await use(page);
  }
});

// Uso
test('dashboard requires auth', async ({ authenticatedPage }) => {
  await expect(authenticatedPage).toHaveURL(/dashboard/);
});
```

### 3. Data-Testid

```html
<!-- Agregar data-testid a elementos importantes -->
<button data-testid="login-button" class="btn-login">
  Iniciar Sesión
</button>
```

```javascript
// Usar en tests
await page.locator('[data-testid="login-button"]').click();
```

### 4. Avoid Sleep

```javascript
// ❌ Malo: Sleep arbitrario
await page.waitForTimeout(2000);

// ✅ Bueno: Esperar condición específica
await expect(page.locator('.loading')).toBeHidden();
await page.waitForSelector('.dashboard-content');
```

### 5. Nombres Descriptivos

```javascript
// ❌ Malo
test('test1', async ({ page }) => {
  // ...
});

// ✅ Bueno
test('user can login with valid credentials', async ({ page }) => {
  // ...
});

test('shows error message when username is empty', async ({ page }) => {
  // ...
});
```

### 6. One Assertion Per Test

```javascript
// ❌ Malo: Múltiples assertions no relacionadas
test('login page', async ({ page }) => {
  await expect(page.locator('h1')).toBeVisible();
  await page.fill('#username', 'admin');
  await expect(page.locator('.btn')).toBeEnabled();
  // ...
});

// ✅ Bueno: Test enfocado
test('login button is enabled by default', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('.btn-login')).toBeEnabled();
});

test('shows username validation error', async ({ page }) => {
  await page.goto('/login');
  await page.click('.btn-login');
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### 7. Setup y Teardown

```javascript
test.describe('Login', () => {
  // Ejecutar una vez antes de todos los tests
  test.beforeAll(async () => {
    // Setup de base de datos, etc.
  });

  // Ejecutar antes de cada test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // Tests aquí...

  // Ejecutar después de cada test
  test.afterEach(async ({ page }) => {
    // Limpiar cookies, localStorage, etc.
    await page.evaluate(() => localStorage.clear());
  });

  // Ejecutar una vez después de todos los tests
  test.afterAll(async () => {
    // Cleanup
  });
});
```

## 🐛 Debugging

### Inspector UI

```bash
# Abrir inspector
npx playwright test --debug

# Inspector en test específico
npx playwright test login.spec.js --debug
```

### Codegen (Grabar tests)

```bash
# Grabar acciones
npx playwright codegen http://localhost:8000/src/pages/index1000.html

# Grabar con device específico
npx playwright codegen --device="iPhone 13" http://localhost:8000
```

### Traces

```bash
# Habilitar traces
npx playwright test --trace=on

# Ver trace
npx playwright show-trace trace.zip
```

### Screenshots

```javascript
// Screenshot manual
await page.screenshot({ path: 'screenshot.png' });

// Screenshot de elemento
await page.locator('.card').screenshot({ path: 'card.png' });

// Full page
await page.screenshot({ path: 'full.png', fullPage: true });
```

### Videos

```javascript
// playwright.config.js
module.exports = defineConfig({
  use: {
    video: 'on-first-retry', // 'on', 'off', 'retain-on-failure', 'on-first-retry'
  },
});
```

### Console Logs

```javascript
// Capturar console.log
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

// Capturar errores
page.on('pageerror', error => console.log('PAGE ERROR:', error));

// Capturar requests
page.on('request', request => console.log('REQUEST:', request.url()));

// Capturar responses
page.on('response', response => console.log('RESPONSE:', response.url()));
```

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - uses: actions/setup-node@v3
      with:
        node-version: 16

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npm test

    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Docker

```dockerfile
# Dockerfile.test
FROM mcr.microsoft.com/playwright:v1.60.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
```

```bash
# Ejecutar tests en Docker
docker build -f Dockerfile.test -t app-tests .
docker run --rm app-tests
```

## 📊 Cobertura

### Test Coverage (Futuro con Jest)

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.spec.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Visual Regression (Futuro)

```javascript
// Comparar screenshots
test('visual regression', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveScreenshot('login-page.png');
});
```

## 📚 Recursos

### Documentación

- [Playwright Docs](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Ejemplos

```bash
# Ver ejemplos de Playwright
npx playwright show-examples
```

### Comunidad

- [GitHub Discussions](https://github.com/microsoft/playwright/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)
- [Discord](https://discord.com/invite/playwright)

## 🎯 Checklist de Testing

Antes de hacer commit:

- [ ] Todos los tests pasan (`npm test`)
- [ ] Tests nuevos para nuevo código
- [ ] Tests descriptivos y bien nombrados
- [ ] No hay `test.only` o `test.skip`
- [ ] No hay `waitForTimeout` innecesarios
- [ ] Page Objects actualizados
- [ ] Screenshots/traces en caso de fallo

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0

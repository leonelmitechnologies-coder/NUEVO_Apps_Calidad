# Tests & Debug Tools

Estructura organizada de tests y herramientas de debugging para el proyecto QC Manager.

## 📁 Estructura

```
tests/
├── e2e/              # Tests End-to-End (Playwright)
│   └── login.spec.js
│
├── debug/            # Scripts de debugging
│   ├── animation-state.js
│   ├── card.js
│   ├── create-user.js
│   ├── css.js
│   ├── full-hierarchy.js
│   ├── parents.js
│   └── tab-switch.js
│
└── integration/      # Tests de integración
    ├── user-cards-visibility.js
    └── with-reload.js
```

## 🧪 Tests E2E (Playwright)

Tests automatizados end-to-end que simulan el comportamiento del usuario.

**Ejecutar tests:**
```bash
npx playwright test
```

**Ver reporte:**
```bash
npx playwright show-report
```

## 🔍 Scripts de Debug

Scripts para debugging y análisis de problemas específicos:

- `animation-state.js` - Analiza estados de animación CSS
- `card.js` - Debug de componentes card
- `create-user.js` - Debug del flujo de creación de usuarios
- `css.js` - Análisis de estilos CSS aplicados
- `full-hierarchy.js` - Inspección completa del DOM
- `parents.js` - Debug de elementos padre en jerarquía
- `tab-switch.js` - Debug del sistema de tabs

**Uso:**
```bash
node tests/debug/[script-name].js
```

## 🔗 Tests de Integración

Tests que verifican la integración entre componentes:

- `user-cards-visibility.js` - Verifica visibilidad de tarjetas de usuario
- `with-reload.js` - Tests con recarga de página

**Uso:**
```bash
node tests/integration/[test-name].js
```

## 🛠️ Agregar Nuevos Tests

### Test E2E (Playwright)
```javascript
// tests/e2e/my-feature.spec.js
import { test, expect } from '@playwright/test';

test('descripción del test', async ({ page }) => {
  await page.goto('http://localhost:8080');
  // ... tu test
});
```

### Script de Debug
```javascript
// tests/debug/my-debug.js
console.log('🔍 Debug: [Descripción]');
// ... tu código de debug
```

### Test de Integración
```javascript
// tests/integration/my-integration.js
console.log('🔗 Integration Test: [Descripción]');
// ... tu test
```

## 📝 Notas

- Los tests E2E requieren que el servidor esté corriendo en `localhost:8080`
- Los scripts de debug son herramientas de desarrollo, no tests automatizados
- Los tests de integración pueden ejecutarse directamente con Node.js

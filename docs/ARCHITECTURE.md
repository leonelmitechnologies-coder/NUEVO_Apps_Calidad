# Arquitectura del Sistema

## 📐 Visión General

El Sistema de Registro de Asistencia es una aplicación web client-side diseñada con arquitectura modular y escalable, preparada para integración futura con backend RESTful.

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Páginas   │  │   Estilos    │  │   JavaScript   │ │
│  │    HTML5    │  │     CSS3     │  │     ES6+       │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│         │                 │                  │           │
│         └─────────────────┴──────────────────┘           │
│                          │                                │
│              ┌───────────▼──────────┐                    │
│              │   LocalStorage API   │                    │
│              │  (Gestión de Sesión) │                    │
│              └───────────┬──────────┘                    │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   BACKEND (Futuro)     │
              │  ┌──────────────────┐  │
              │  │   API REST       │  │
              │  │  Node.js/Express │  │
              │  └────────┬─────────┘  │
              │           │             │
              │  ┌────────▼─────────┐  │
              │  │   Base de Datos  │  │
              │  │ PostgreSQL/MySQL │  │
              │  └──────────────────┘  │
              └────────────────────────┘
```

## 📂 Estructura de Carpetas

```
src/
├── pages/              # Páginas HTML (Vistas)
│   ├── index1000.html     # Login page
│   └── dashboard1000.html # Dashboard principal
│
├── assets/
│   ├── css/           # Estilos (Presentación)
│   │   ├── main.css       # Variables globales, reset, utilidades
│   │   ├── login.css      # Estilos específicos de login
│   │   └── dashboard.css  # Estilos del dashboard
│   │
│   ├── js/            # Scripts (Lógica)
│   │   ├── utils.js       # Funciones utilitarias reutilizables
│   │   └── auth.js        # Lógica de autenticación
│   │
│   └── img/           # Assets estáticos
│       └── logo.png       # Logo de MI Technologies
│
└── components/        # Componentes reutilizables (Futuro)
    ├── button.html
    ├── modal.html
    └── card.html
```

## 🔄 Flujo de Datos

### 1. Login Flow

```
Usuario ingresa credenciales
         │
         ▼
handleLogin() en auth.js
         │
         ├─► validateLoginForm()
         │         │
         │         ├─► isEmpty()
         │         └─► isMinLength()
         │
         ├─► login() (API Mock)
         │         │
         │         └─► Promise con delay simulado
         │
         ├─► saveSession()
         │         │
         │         └─► localStorage.setItem()
         │
         └─► redirect('dashboard1000.html')
```

### 2. Session Management

```
Carga de Página
      │
      ▼
redirectIfAuthenticated() o requireAuth()
      │
      ├─► isAuthenticated()
      │         │
      │         └─► localStorage.getItem('isLoggedIn')
      │
      └─► redirect() si es necesario
```

## 🎯 Patrones de Diseño

### 1. Module Pattern (JavaScript)

```javascript
// Encapsulación de funcionalidades relacionadas
const AuthModule = (() => {
  // Variables privadas
  const STORAGE_KEYS = {
    IS_LOGGED_IN: 'isLoggedIn',
    USERNAME: 'username',
    TOKEN: 'token'
  };

  // Funciones públicas
  return {
    login,
    logout,
    isAuthenticated,
    getCurrentUser
  };
})();
```

### 2. BEM (Block Element Modifier) - CSS

```css
/* Block */
.login-form {}

/* Element */
.login-form__input {}
.login-form__button {}

/* Modifier */
.login-form__input--error {}
.login-form__button--loading {}
```

### 3. Progressive Enhancement

```javascript
// Base funcional sin JavaScript
<form action="/api/login" method="POST">
  <input type="text" name="username">
  <button type="submit">Login</button>
</form>

// Mejorado con JavaScript
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  // Enhanced UX con loading states, validación, etc.
});
```

## 🔐 Seguridad

### Actual (Client-Side)

```javascript
// Validación en cliente (NO es seguridad real)
function validateLoginForm(username, password) {
  const errors = {};

  if (isEmpty(username)) {
    errors.username = 'Usuario requerido';
  }

  if (!isMinLength(password, 6)) {
    errors.password = 'Mínimo 6 caracteres';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
```

### Futuro (Backend)

```javascript
// JWT Authentication
POST /api/auth/login
{
  "username": "admin",
  "password": "hashed_password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "employee"
  }
}

// Protección de rutas
GET /api/attendance
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

## 📊 Gestión de Estado

### LocalStorage (Actual)

```javascript
// Estructura de datos en localStorage
{
  "isLoggedIn": "true",
  "username": "admin",
  "token": "mock-token-1685901234567",
  "rememberMe": "true"
}
```

### Futuro: State Management Library

```javascript
// Vuex, Redux, o simple Context API
const state = {
  user: {
    id: 1,
    username: 'admin',
    role: 'employee',
    isAuthenticated: true
  },
  attendance: {
    records: [],
    loading: false,
    error: null
  }
};
```

## 🎨 Sistema de Diseño

### Variables CSS (Design Tokens)

```css
:root {
  /* Colores primarios */
  --color-primary: #1E7CBA;
  --color-primary-dark: #165A8C;
  --color-primary-light: #4A9DD4;

  /* Espaciado consistente */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */

  /* Z-index scale */
  --z-base: 1;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal: 40;
  --z-popover: 50;
  --z-tooltip: 60;

  /* Transiciones */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
/* Base: 320px - 767px */

/* Tablet: 768px+ */
@media (min-width: 768px) { }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { }

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) { }
```

### Strategy

1. **Mobile First:** Estilos base para móvil
2. **Progressive Enhancement:** Agregar complejidad en pantallas grandes
3. **Touch-Friendly:** Mínimo 44px para touch targets
4. **Performance:** Reducir animaciones en móvil

## 🧪 Testing Strategy

```
┌────────────────────────────────────────┐
│           Testing Pyramid              │
├────────────────────────────────────────┤
│                                        │
│           ▲                            │
│          ╱ ╲  E2E Tests                │
│         ╱   ╲ (Playwright)             │
│        ╱─────╲                         │
│       ╱       ╲ Integration Tests      │
│      ╱         ╲ (Futuro: Jest)        │
│     ╱───────────╲                      │
│    ╱             ╲ Unit Tests          │
│   ╱   (Futuro)    ╲ (Jest)             │
│  ╱─────────────────╲                   │
│                                        │
└────────────────────────────────────────┘
```

### Actual: E2E Tests (Playwright)

```javascript
test('usuario puede hacer login', async ({ page }) => {
  await page.goto('/');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'password123');
  await page.click('.btn-login');
  await expect(page).toHaveURL(/dashboard/);
});
```

## 🚀 Performance Optimizations

### Actual

1. **CSS:**
   - Variables CSS (rápido)
   - Transiciones específicas (no `transition: all`)
   - `will-change` solo cuando necesario

2. **JavaScript:**
   - Async/await (no bloquear UI)
   - Event delegation
   - Debounce en inputs

3. **HTML:**
   - Lazy loading de imágenes
   - Preconnect a dominios externos
   - Viewport meta tag correcto

### Futuro

1. **Code Splitting:**
```javascript
// Carga bajo demanda
const dashboard = () => import('./dashboard.js');
```

2. **Service Worker:**
```javascript
// Caching estratégico
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

3. **Image Optimization:**
```html
<picture>
  <source srcset="logo.webp" type="image/webp">
  <img src="logo.png" alt="Logo">
</picture>
```

## 🔄 Migración a Backend

### Fase 1: Preparación (Actual)

- [x] Estructura modular
- [x] Funciones async preparadas
- [x] Separación de concerns
- [x] Gestión de errores

### Fase 2: API Integration

```javascript
// Reemplazar mock con API real
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

### Fase 3: State Management

- Implementar Vuex/Redux
- WebSocket para real-time
- Optimistic updates

## 📚 Dependencias Futuras

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "pg": "^8.11.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "@testing-library/dom": "^9.3.0",
    "webpack": "^5.88.0",
    "babel": "^7.22.0"
  }
}
```

## 🎯 Decisiones Arquitectónicas

### Por Qué Vanilla JS?

1. **Simplicidad:** No hay complejidad innecesaria
2. **Performance:** Sin overhead de frameworks
3. **Aprendizaje:** Fundamentos sólidos
4. **Tamaño:** Bundle size mínimo
5. **Flexibilidad:** Fácil migrar a framework después

### Por Qué Mobile-First?

1. **Tráfico móvil:** Mayoría de usuarios en móvil
2. **Performance:** Mejor en dispositivos limitados
3. **Progressive Enhancement:** Más fácil agregar que quitar
4. **Accesibilidad:** Móvil fuerza simplicidad

### Por Qué LocalStorage?

1. **Prototipo rápido:** Sin backend necesario
2. **Offline:** Funciona sin conexión
3. **Simple:** API nativa del navegador
4. **Temporal:** Fácil migrar a backend después

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0

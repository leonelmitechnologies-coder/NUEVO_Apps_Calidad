# Ejemplos de Código

Colección de ejemplos prácticos y patrones de código utilizados en el Sistema de Registro de Asistencia.

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Validación de Formularios](#validación-de-formularios)
- [Gestión de Estado](#gestión-de-estado)
- [Manejo de Errores](#manejo-de-errores)
- [Accesibilidad](#accesibilidad)
- [Patrones de UI](#patrones-de-ui)
- [Testing](#testing)
- [Integración Backend](#integración-backend-futuro)

## 🔐 Autenticación

### Login Básico

```javascript
/**
 * Ejemplo completo de flujo de login
 */
async function handleLogin(event) {
  event.preventDefault();

  // 1. Obtener elementos del formulario
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const submitButton = document.querySelector('.btn-login');

  // 2. Obtener valores
  const username = usernameInput.value;
  const password = passwordInput.value;

  // 3. Validar
  const validation = validateLoginForm(username, password);
  if (!validation.isValid) {
    showError(usernameInput, validation.errors.username);
    return;
  }

  // 4. Loading state
  submitButton.classList.add('loading');

  try {
    // 5. Llamar API
    const result = await login(username, password);

    // 6. Guardar sesión
    saveSession(result, rememberMe);

    // 7. Redirigir
    redirect('dashboard1000.html');
  } catch (error) {
    // 8. Manejar error
    showError(passwordInput, 'Credenciales incorrectas');
  } finally {
    // 9. Quitar loading
    submitButton.classList.remove('loading');
  }
}
```

### Verificar Autenticación

```javascript
/**
 * Proteger páginas que requieren autenticación
 */
function requireAuth() {
  if (!isAuthenticated()) {
    redirect('index1000.html');
  }
}

// Uso en dashboard1000.html
document.addEventListener('DOMContentLoaded', () => {
  requireAuth(); // Ejecutar primero
  initializeDashboard();
});
```

### Obtener Usuario Actual

```javascript
/**
 * Obtener información del usuario logueado
 */
function displayUserInfo() {
  const user = getCurrentUser();

  if (user) {
    document.getElementById('username-display').textContent = user.username;
    document.getElementById('user-initials').textContent = getInitials(user.username);
  }
}
```

### Logout

```javascript
/**
 * Cerrar sesión de forma segura
 */
function handleLogout() {
  // Limpiar datos locales
  clearStorage();

  // Redirigir al login
  redirect('index1000.html');
}

// Agregar listener al botón
document.getElementById('logout-btn').addEventListener('click', handleLogout);
```

## ✅ Validación de Formularios

### Validación en Tiempo Real

```javascript
/**
 * Validar mientras el usuario escribe
 */
function setupRealtimeValidation() {
  const emailInput = document.getElementById('email');

  emailInput.addEventListener('input', debounce(() => {
    const email = emailInput.value;

    if (isEmpty(email)) {
      clearError(emailInput);
      return;
    }

    if (!isValidEmail(email)) {
      showError(emailInput, 'Email inválido');
    } else {
      clearError(emailInput);
    }
  }, 300));
}

/**
 * Validar email
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### Validación de Formulario Completo

```javascript
/**
 * Validar múltiples campos
 */
function validateForm(formData) {
  const errors = {};

  // Username
  if (isEmpty(formData.username)) {
    errors.username = 'El usuario es requerido';
  } else if (!isMinLength(formData.username, 3)) {
    errors.username = 'Mínimo 3 caracteres';
  }

  // Password
  if (isEmpty(formData.password)) {
    errors.password = 'La contraseña es requerida';
  } else if (!isMinLength(formData.password, 6)) {
    errors.password = 'Mínimo 6 caracteres';
  } else if (!hasUppercase(formData.password)) {
    errors.password = 'Debe contener al menos una mayúscula';
  }

  // Email (opcional)
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Email inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validadores útiles
 */
function hasUppercase(str) {
  return /[A-Z]/.test(str);
}

function hasNumber(str) {
  return /\d/.test(str);
}

function hasSpecialChar(str) {
  return /[!@#$%^&*(),.?":{}|<>]/.test(str);
}
```

### Mostrar Errores

```javascript
/**
 * Mostrar múltiples errores en formulario
 */
function displayFormErrors(errors) {
  // Limpiar errores previos
  document.querySelectorAll('.form-control').forEach(input => {
    clearError(input);
  });

  // Mostrar nuevos errores
  Object.keys(errors).forEach(fieldName => {
    const input = document.getElementById(fieldName);
    if (input) {
      showError(input, errors[fieldName]);
    }
  });

  // Focus en primer error
  const firstErrorField = Object.keys(errors)[0];
  const firstInput = document.getElementById(firstErrorField);
  if (firstInput) {
    firstInput.focus();
  }
}
```

## 💾 Gestión de Estado

### LocalStorage con Encapsulación

```javascript
/**
 * Módulo de gestión de estado
 */
const StateManager = (() => {
  const KEYS = {
    USER: 'app_user',
    SETTINGS: 'app_settings',
    THEME: 'app_theme'
  };

  return {
    // User state
    setUser(userData) {
      setStorage(KEYS.USER, JSON.stringify(userData));
    },

    getUser() {
      const data = getStorage(KEYS.USER);
      return data ? JSON.parse(data) : null;
    },

    clearUser() {
      removeStorage(KEYS.USER);
    },

    // Settings
    setSetting(key, value) {
      const settings = this.getSettings();
      settings[key] = value;
      setStorage(KEYS.SETTINGS, JSON.stringify(settings));
    },

    getSettings() {
      const data = getStorage(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    },

    // Theme
    setTheme(theme) {
      setStorage(KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
    },

    getTheme() {
      return getStorage(KEYS.THEME) || 'light';
    }
  };
})();

// Uso
StateManager.setUser({ id: 1, username: 'admin' });
const user = StateManager.getUser();
StateManager.setTheme('dark');
```

### State con Observer Pattern

```javascript
/**
 * Observable state para UI reactiva
 */
class ObservableState {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;

    // Notificar cambios
    this.notify(key, value, oldValue);
  }

  subscribe(listener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(key, newValue, oldValue) {
    this.listeners.forEach(listener => {
      listener(key, newValue, oldValue);
    });
  }
}

// Uso
const appState = new ObservableState({
  username: '',
  isLoading: false
});

// Suscribirse a cambios
appState.subscribe((key, newValue, oldValue) => {
  console.log(`${key} cambió de ${oldValue} a ${newValue}`);

  if (key === 'username') {
    document.getElementById('username-display').textContent = newValue;
  }
});

// Actualizar state
appState.set('username', 'admin');
```

## 🚨 Manejo de Errores

### Try-Catch con Logging

```javascript
/**
 * Manejo robusto de errores
 */
async function fetchData() {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Log del error
    console.error('Error fetching data:', error);

    // Mostrar mensaje amigable al usuario
    showNotification('Error al cargar datos. Intenta nuevamente.', 'error');

    // Re-throw si necesario
    throw error;
  }
}
```

### Error Boundary Global

```javascript
/**
 * Capturar errores no manejados
 */
window.addEventListener('error', (event) => {
  console.error('Error no manejado:', event.error);

  // Mostrar mensaje al usuario
  showNotification(
    'Ocurrió un error inesperado. Por favor recarga la página.',
    'error'
  );

  // Enviar a servicio de tracking (futuro)
  // trackError(event.error);

  // Prevenir mensaje de error del navegador
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada sin manejar:', event.reason);

  showNotification(
    'Error de conexión. Verifica tu internet.',
    'error'
  );

  event.preventDefault();
});
```

### Retry con Backoff Exponencial

```javascript
/**
 * Reintentar operación con backoff exponencial
 */
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return await response.json();
      }

      // Si es error de servidor, reintentar
      if (response.status >= 500) {
        throw new Error('Server error');
      }

      // Si es error de cliente, no reintentar
      throw new Error('Client error');

    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;

      if (isLastAttempt) {
        throw error;
      }

      // Calcular delay exponencial
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s

      console.log(`Reintentando en ${delay}ms...`);
      await sleep(delay);
    }
  }
}
```

## ♿ Accesibilidad

### ARIA Live Regions

```javascript
/**
 * Notificar cambios a screen readers
 */
function createLiveRegion() {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only'; // Visually hidden
  document.body.appendChild(liveRegion);
  return liveRegion;
}

const liveRegion = createLiveRegion();

function announceToScreenReader(message) {
  liveRegion.textContent = message;

  // Limpiar después de 1 segundo
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
}

// Uso
announceToScreenReader('Login exitoso. Redirigiendo al dashboard1000.');
```

### Keyboard Navigation

```javascript
/**
 * Navegación por teclado en menú
 */
function setupKeyboardNav(menuElement) {
  const items = Array.from(menuElement.querySelectorAll('[role="menuitem"]'));

  menuElement.addEventListener('keydown', (event) => {
    const currentIndex = items.indexOf(document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus();
        break;

      case 'Home':
        event.preventDefault();
        items[0].focus();
        break;

      case 'End':
        event.preventDefault();
        items[items.length - 1].focus();
        break;

      case 'Escape':
        closeMenu();
        break;
    }
  });
}
```

### Focus Trap (Modal)

```javascript
/**
 * Atrapar focus dentro de modal
 */
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Tab hacia atrás
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab hacia adelante
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // Focus inicial
  firstElement.focus();
}
```

## 🎨 Patrones de UI

### Loading Spinner

```javascript
/**
 * Spinner de carga reutilizable
 */
function showLoadingSpinner(container) {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('role', 'status');
  spinner.innerHTML = `
    <span class="sr-only">Cargando...</span>
  `;
  container.appendChild(spinner);
  return spinner;
}

function hideLoadingSpinner(spinner) {
  spinner?.remove();
}

// Uso
const container = document.getElementById('content');
const spinner = showLoadingSpinner(container);

await fetchData();

hideLoadingSpinner(spinner);
```

### Toast Notifications

```javascript
/**
 * Sistema de notificaciones toast
 */
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-cerrar
    setTimeout(() => {
      this.hide(toast);
    }, duration);

    return toast;
  },

  hide(toast) {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }
};

// Uso
Toast.show('Login exitoso', 'success');
Toast.show('Error al conectar', 'error');
```

### Modal Dialog

```javascript
/**
 * Modal dialog accesible
 */
class Modal {
  constructor(content) {
    this.create(content);
  }

  create(content) {
    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';

    // Modal
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.innerHTML = content;

    this.backdrop.appendChild(this.modal);
  }

  show() {
    document.body.appendChild(this.backdrop);
    document.body.style.overflow = 'hidden';

    // Trap focus
    trapFocus(this.modal);

    // Close on backdrop click
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.hide();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', this.handleEscape);
  }

  hide() {
    this.backdrop.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleEscape);
  }

  handleEscape = (e) => {
    if (e.key === 'Escape') {
      this.hide();
    }
  };
}

// Uso
const modal = new Modal(`
  <h2>Confirmar Acción</h2>
  <p>¿Estás seguro?</p>
  <button onclick="modal.hide()">Cancelar</button>
  <button onclick="confirm()">Confirmar</button>
`);

modal.show();
```

## 🧪 Testing

### Test de Login

```javascript
// tests/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/src/pages/index1000.html');

    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('.btn-login');

    await expect(page).toHaveURL(/dashboard1000.html/);
  });

  test('shows error on empty fields', async ({ page }) => {
    await page.goto('/src/pages/index1000.html');

    await page.click('.btn-login');

    const error = await page.locator('.error-message').first();
    await expect(error).toBeVisible();
  });

  test('password toggle works', async ({ page }) => {
    await page.goto('/src/pages/index1000.html');

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.click('.password-toggle');
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
```

### Page Object Pattern

```javascript
// tests/pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('.btn-login');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/src/pages/index1000.html');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

// Uso en test
test('login with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('', '');

  const error = await loginPage.getErrorMessage();
  expect(error).toContain('requerido');
});
```

## 🔄 Integración Backend (Futuro)

### Fetch con Manejo de Errores

```javascript
/**
 * API client con manejo robusto de errores
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Agregar token si existe
    const token = getStorage('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async handleError(response) {
    const data = await response.json().catch(() => ({}));

    const error = new Error(data.message || 'Error desconocido');
    error.status = response.status;
    error.code = data.code;

    return error;
  }

  // Métodos convenientes
  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Uso
const api = new ApiClient('https://api.mitechnologies.com/v1');

// Login
const loginData = await api.post('/auth/login', {
  username: 'admin',
  password: 'admin123'
});

// Get user
const user = await api.get('/users/me');

// Update user
await api.put('/users/me', {
  email: 'new@email.com'
});
```

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0

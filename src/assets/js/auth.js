/* ============================================
   MI Technologies - Authentication Logic
   ============================================ */

// Storage keys
const STORAGE_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  USERNAME: 'username',
  REMEMBER_ME: 'rememberMe',
  TOKEN: 'token'
};

// Development/Testing Credentials
// TODO: Remove in production - use actual authentication
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

/**
 * Mock login function - prepared for backend integration
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Login result
 */
async function login(username, password) {
  // TODO: Replace with actual API call when backend is ready
  /*
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Credenciales incorrectas');
  }

  const data = await response.json();
  return data; // { success: true, token: '...', user: {...} }
  */

  // Mock implementation with credential validation
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // First, check against users created in the system (appUsers)
      const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
      const foundUser = appUsers.find(u => u.usuario === username && u.password === password);

      if (foundUser) {
        // User found in appUsers
        resolve({
          success: true,
          token: 'mock-token-' + Date.now(),
          user: {
            id: foundUser.id,
            username: foundUser.usuario,
            name: `${foundUser.nombre} ${foundUser.apellido}`,
            photo: foundUser.photo || null,
            password: foundUser.password,
            departamento: foundUser.departamento || null,
            departamentosPasarAsistencia: foundUser.departamentosPasarAsistencia || (foundUser.departamento ? [foundUser.departamento] : []),
            departamentosTiempoExtra: foundUser.departamentosTiempoExtra || (foundUser.departamento ? [foundUser.departamento] : []),
            permisos: foundUser.permisos || {
              usuarios: false,
              asistencia: true,
              pasarAsistencia: false,
              agregarColaborador: false,
              historial: false,
              inasistencia: false,
              colaboradores: false,
              bajas: false,
              tiempoExtra: false,
              miPerfil: true
            }
          }
        });
      } else if (username === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password) {
        // Fallback to test credentials (admin/admin123)
        resolve({
          success: true,
          token: 'mock-token-' + Date.now(),
          user: {
            id: 1,
            username: username,
            name: 'Administrador',
            password: password,
            departamento: null, // null = puede ver todos los departamentos
            departamentosPasarAsistencia: [], // array vacío = puede ver todos
            departamentosTiempoExtra: [], // array vacío = puede ver todos
            permisos: {
              usuarios: true,
              asistencia: true,
              pasarAsistencia: true,
              agregarColaborador: true,
              historial: true,
              inasistencia: true,
              colaboradores: true,
              bajas: true,
              tiempoExtra: true,
              miPerfil: true
            }
          }
        });
      } else {
        reject(new Error('Usuario o contraseña incorrectos'));
      }
    }, 200); // Simulate network delay
  });
}

/**
 * Saves session data to localStorage
 * @param {Object} data - Session data from login
 * @param {boolean} rememberMe - Whether to persist session
 */
function saveSession(data, rememberMe = false) {
  setStorage(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  setStorage(STORAGE_KEYS.USERNAME, data.user.username);
  setStorage(STORAGE_KEYS.TOKEN, data.token);
  setStorage(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
}

/**
 * Checks if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return getStorage(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
}

/**
 * Gets current user data from storage
 * @returns {Object|null}
 */
function getCurrentUser() {
  if (!isAuthenticated()) {
    return null;
  }

  return {
    username: getStorage(STORAGE_KEYS.USERNAME),
    token: getStorage(STORAGE_KEYS.TOKEN)
  };
}

/**
 * Logs out the current user
 */
function logout() {
  // Solo eliminar datos de sesión, NO los usuarios creados
  removeStorage(STORAGE_KEYS.IS_LOGGED_IN);
  removeStorage(STORAGE_KEYS.USERNAME);
  removeStorage(STORAGE_KEYS.TOKEN);
  removeStorage(STORAGE_KEYS.REMEMBER_ME);
  clearNavigationHistory();

  // Verificar si navigateTo existe
  if (typeof navigateTo === 'function') {
    navigateTo('login');
  } else {
    // Fallback: recargar página si navigateTo no está disponible
    window.location.reload();
  }
}

/**
 * Protects a page - redirects to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    navigateTo('login');
  }
}

/**
 * Redirects to dashboard if already logged in
 */
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    navigateTo('dashboard');
  }
}

/**
 * Validates login form
 * @param {string} username - Username value
 * @param {string} password - Password value
 * @returns {Object} - Validation result { isValid, errors }
 */
function validateLoginForm(username, password) {
  const errors = {};

  // Validate username
  if (isEmpty(username)) {
    errors.username = 'El usuario es requerido';
  } else if (!isMinLength(username, 3)) {
    errors.username = 'El usuario debe tener al menos 3 caracteres';
  }

  // Validate password
  if (isEmpty(password)) {
    errors.password = 'La contraseña es requerida';
  } else if (!isMinLength(password, 6)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Handles login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();

  // Get form elements
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const submitButton = document.querySelector('.btn-login');

  // Get values
  const username = usernameInput.value;
  const password = passwordInput.value;
  const rememberMe = rememberMeCheckbox.checked;

  // Clear previous errors
  clearError(usernameInput);
  clearError(passwordInput);

  // Validate form
  const validation = validateLoginForm(username, password);

  if (!validation.isValid) {
    // Show errors
    if (validation.errors.username) {
      showError(usernameInput, validation.errors.username);
      usernameInput.focus();
    }
    if (validation.errors.password) {
      showError(passwordInput, validation.errors.password);
      if (!validation.errors.username) {
        passwordInput.focus();
      }
    }
    return;
  }

  // Show loading state - keep button enabled per UX best practices
  submitButton.classList.add('loading');
  submitButton.setAttribute('aria-busy', 'true');

  try {
    // Attempt login
    const result = await login(username, password);

    if (result.success) {
      // Save session
      saveSession(result, rememberMe);

      // Set currentUser global with complete user data
      window.currentUser = result.user;

      // Small delay for UX
      await sleep(100);

      // Redirect to dashboard
      navigateTo('dashboard');
    }
  } catch (error) {
    // Show error message
    showError(passwordInput, 'Usuario o contraseña incorrectos');
    passwordInput.focus();
    passwordInput.select();
  } finally {
    // Remove loading state
    submitButton.classList.remove('loading');
    submitButton.setAttribute('aria-busy', 'false');
  }
}

/**
 * Sets up password toggle functionality
 */
function setupPasswordToggle() {
  const passwordInput = document.getElementById('password');
  const toggleButton = document.querySelector('.password-toggle');

  if (!toggleButton || !passwordInput) return;

  toggleButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    // Update icon
    const icon = toggleButton.querySelector('svg');
    if (icon) {
      if (isPassword) {
        // Eye slash icon (hide password)
        icon.innerHTML = `
          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
          <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
        `;
      } else {
        // Eye icon (show password)
        icon.innerHTML = `
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        `;
      }
    }

    // Update aria-label and aria-pressed for better accessibility
    const newLabel = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
    toggleButton.setAttribute('aria-label', newLabel);
    toggleButton.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
  });
}

/**
 * Sets up input field event listeners for real-time validation
 */
function setupInputValidation() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  // Clear error on input
  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      if (usernameInput.classList.contains('error')) {
        clearError(usernameInput);
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      if (passwordInput.classList.contains('error')) {
        clearError(passwordInput);
      }
    });
  }
}

/**
 * Handles forgot password link click
 * @param {Event} event - Click event
 */
function handleForgotPassword(event) {
  event.preventDefault();

  const passwordInput = document.getElementById('password');
  showError(passwordInput, 'Funcionalidad en desarrollo. Contacta al administrador del sistema.');

  // Auto-hide message after 3 seconds
  setTimeout(() => {
    clearError(passwordInput);
  }, 3000);

  // TODO: Implement forgot password flow
  // navigateTo('recover-password');
}

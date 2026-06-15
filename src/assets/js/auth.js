/* ============================================
   MI Technologies - Authentication Logic
   MIGRADO A BACKEND API
   ============================================ */

// API Configuration
const API_BASE_URL = 'http://192.168.80.103:3005/api';

// Storage keys (solo tokens ahora)
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  REMEMBER_ME: 'rememberMe'
};

/**
 * Login function - USA BACKEND API
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @param {boolean} rememberMe - Remember session
 * @returns {Promise<Object>} - Login result
 */
async function login(username, password, rememberMe = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, rememberMe })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Credenciales incorrectas');
    }

    const data = await response.json();
    // data = { success, accessToken, refreshToken, user }

    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Saves session data to sessionStorage
 * SOLO GUARDA TOKENS - Los datos del usuario vienen del backend
 * @param {Object} data - Session data from login
 * @param {boolean} rememberMe - Whether to persist session
 */
function saveSession(data, rememberMe = false) {
  sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  sessionStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
}

/**
 * Checks if user is authenticated
 * Verifica que exista un access token
 * @returns {boolean}
 */
function isAuthenticated() {
  const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return !!token;
}

/**
 * Gets current user data from API
 * MIGRADO: Ahora usa /api/auth/me en lugar de localStorage
 * @returns {Promise<Object|null>}
 */
async function getCurrentUser() {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Token inválido o expirado - intentar refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Reintentar con el nuevo token
        return await getCurrentUser();
      }

      // No se pudo renovar - logout
      logout();
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    return null;
  }
}

/**
 * Renueva el access token usando el refresh token
 * @returns {Promise<boolean>}
 */
async function refreshAccessToken() {
  try {
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    // Guardar nuevo access token
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);

    return true;
  } catch (error) {
    console.error('Error renovando token:', error);
    return false;
  }
}

/**
 * Logs out the current user
 * MIGRADO: Llama a /api/auth/logout y limpia tokens
 */
async function logout() {
  try {
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // Intentar invalidar el refresh token en el servidor
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    // Limpiar tokens locales
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    clearNavigationHistory();

    // Verificar si navigateTo existe
    if (typeof navigateTo === 'function') {
      navigateTo('login');
    } else {
      // Fallback: recargar página
      window.location.reload();
    }
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
 * ACTUALIZADO: Usa backend API
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
  const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

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

  // Show loading state
  submitButton.classList.add('loading');
  submitButton.setAttribute('aria-busy', 'true');

  try {
    // Attempt login con backend
    const result = await login(username, password, rememberMe);

    if (result.success) {
      // Save session (solo tokens)
      saveSession(result, rememberMe);

      // Set currentUser global con datos del backend
      window.currentUser = result.user;

      // Small delay for UX
      await sleep(100);

      // Check if user needs to set up security question
      if (!result.user.securityQuestion) {
        // Redirect to dashboard first, then show setup modal
        navigateTo('dashboard');
        setTimeout(() => {
          if (typeof openSetupSecurityQuestionModal === 'function') {
            openSetupSecurityQuestionModal();
          }
        }, 500);
      } else {
        // Redirect to dashboard normally
        navigateTo('dashboard');
      }
    }
  } catch (error) {
    // Show error message
    showError(passwordInput, error.message || 'Usuario o contraseña incorrectos');
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

    // Update aria-label
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
  if (typeof openForgotPasswordModal === 'function') {
    openForgotPasswordModal();
  }
}

/* ============================================
   PASSWORD RECOVERY - SECURITY QUESTION
   NOTA: Esta funcionalidad aún usa localStorage
   TODO: Migrar a backend en Fase 2
   ============================================ */

// State for recovery process
const recoveryState = {
  username: null,
  userPassword: null,
  attempts: 0,
  lastAttempt: 0,
  maxAttempts: 3,
  lockoutTime: 15 * 60 * 1000 // 15 minutes
};

/**
 * Opens the forgot password modal (Step 1)
 */
function openForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (!modal) return;

  // Reset to step 1
  showRecoveryStep(1);

  // Clear inputs
  const usernameInput = document.getElementById('recoveryUsername');
  if (usernameInput) {
    usernameInput.value = '';
  }

  // Reset attempts if lockout expired
  if (recoveryState.attempts >= recoveryState.maxAttempts) {
    const timeSinceLastAttempt = Date.now() - recoveryState.lastAttempt;
    if (timeSinceLastAttempt >= recoveryState.lockoutTime) {
      recoveryState.attempts = 0;
    }
  }

  // Show modal
  modal.style.display = 'flex';
}

/**
 * Closes the forgot password modal
 */
function closeForgotPasswordModal() {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) {
    modal.style.display = 'none';
  }

  // Reset state
  recoveryState.username = null;
  recoveryState.userPassword = null;
  showRecoveryStep(1);
}

/**
 * Shows specific step in recovery process
 * @param {number} step - Step number (1, 2, or 3)
 */
function showRecoveryStep(step) {
  const steps = [1, 2, 3];
  steps.forEach(s => {
    const stepElement = document.getElementById(`recoveryStep${s}`);
    if (stepElement) {
      stepElement.style.display = s === step ? 'block' : 'none';
    }
  });
}

/**
 * Goes back to step 1
 */
function goBackToRecoveryStep1() {
  showRecoveryStep(1);
}

// NOTE: Las funciones de recuperación de contraseña
// (verifyUsernameForRecovery, verifySecurityAnswer, etc.)
// aún usan localStorage temporalmente.
// Se migrarán en la Fase 2 cuando se implementen los endpoints
// de recuperación de contraseña en el backend.

/**
 * NOTA: Esta función aún usa localStorage (migrar en Fase 2)
 */
function verifyUsernameForRecovery() {
  const usernameInput = document.getElementById('recoveryUsername');
  const username = usernameInput.value.trim();

  if (!username) {
    if (typeof showToast === 'function') {
      showToast('Por favor ingresa tu nombre de usuario', 'warning');
    }
    usernameInput.focus();
    return;
  }

  // Check if user is locked out
  if (isLockedOut()) {
    const timeLeft = getRemainingLockoutTime();
    if (typeof showToast === 'function') {
      showToast(`Demasiados intentos. Intenta en ${timeLeft} minutos`, 'error');
    }
    return;
  }

  // TODO: Reemplazar con API call a /api/auth/forgot-password
  // Por ahora, usa localStorage
  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  const user = appUsers.find(u => u.usuario === username);

  if (!user || !user.securityQuestion || !user.securityAnswer) {
    if (typeof showToast === 'function') {
      showToast('Usuario no encontrado o sin pregunta configurada. Contacta al administrador.', 'error');
    }
    return;
  }

  recoveryState.username = username;
  recoveryState.userPassword = user.password;

  const questionLabel = document.getElementById('recoveryQuestion');
  if (questionLabel) {
    questionLabel.textContent = user.securityQuestion;
  }

  const answerInput = document.getElementById('recoveryAnswer');
  if (answerInput) {
    answerInput.value = '';
  }

  showRecoveryStep(2);
}

/**
 * NOTA: Esta función aún usa localStorage (migrar en Fase 2)
 */
function verifySecurityAnswer() {
  const answerInput = document.getElementById('recoveryAnswer');
  const userAnswer = answerInput.value.trim().toLowerCase();

  if (!userAnswer) {
    if (typeof showToast === 'function') {
      showToast('Por favor ingresa tu respuesta', 'warning');
    }
    answerInput.focus();
    return;
  }

  // TODO: Reemplazar con API call a /api/auth/verify-security-answer
  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  const user = appUsers.find(u => u.usuario === recoveryState.username);

  if (!user) {
    handleRecoveryFailedAttempt();
    return;
  }

  const correctAnswer = (user.securityAnswer || '').toLowerCase();
  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect) {
    recoveryState.attempts = 0;

    const recoveredPasswordInput = document.getElementById('recoveredPassword');
    if (recoveredPasswordInput) {
      recoveredPasswordInput.value = recoveryState.userPassword;
    }

    logSecurityEvent('password_recovered', recoveryState.username);

    showRecoveryStep(3);
  } else {
    handleRecoveryFailedAttempt();
  }
}

/**
 * Handles failed recovery attempt
 */
function handleRecoveryFailedAttempt() {
  recoveryState.attempts++;
  recoveryState.lastAttempt = Date.now();

  const remainingAttempts = recoveryState.maxAttempts - recoveryState.attempts;

  if (remainingAttempts > 0) {
    if (typeof showToast === 'function') {
      showToast(`Respuesta incorrecta. Intentos restantes: ${remainingAttempts}`, 'error');
    }
  } else {
    if (typeof showToast === 'function') {
      showToast('Demasiados intentos fallidos. Bloqueado por 15 minutos', 'error');
    }
    closeForgotPasswordModal();

    logSecurityEvent('password_recovery_lockout', recoveryState.username);
  }
}

/**
 * Checks if user is locked out
 */
function isLockedOut() {
  if (recoveryState.attempts < recoveryState.maxAttempts) {
    return false;
  }

  const timeSinceLastAttempt = Date.now() - recoveryState.lastAttempt;
  return timeSinceLastAttempt < recoveryState.lockoutTime;
}

/**
 * Gets remaining lockout time in minutes
 */
function getRemainingLockoutTime() {
  const timeSinceLastAttempt = Date.now() - recoveryState.lastAttempt;
  const remainingTime = recoveryState.lockoutTime - timeSinceLastAttempt;
  return Math.ceil(remainingTime / (60 * 1000));
}

/**
 * Closes recovery modal and fills login with username
 */
function closeRecoveryAndFillLogin() {
  const usernameInput = document.getElementById('username');
  if (usernameInput && recoveryState.username) {
    usernameInput.value = recoveryState.username;
  }

  closeForgotPasswordModal();

  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    setTimeout(() => passwordInput.focus(), 300);
  }
}

/**
 * Toggles password visibility
 */
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Logs security events
 * TODO: Migrar a backend en Fase 2 - POST /api/audit-log
 */
function logSecurityEvent(event, username, metadata = null) {
  try {
    const securityLog = JSON.parse(localStorage.getItem('securityLog') || '[]');

    securityLog.push({
      event,
      username,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      metadata
    });

    // Keep only last 100 events
    if (securityLog.length > 100) {
      securityLog.shift();
    }

    localStorage.setItem('securityLog', JSON.stringify(securityLog));
  } catch (error) {
    console.error('Error guardando log de seguridad:', error);
  }
}

/* ============================================
   SECURITY QUESTION SETUP (First Login)
   TODO: Migrar a backend en Fase 2
   ============================================ */

/**
 * Opens the security question setup modal
 */
function openSetupSecurityQuestionModal() {
  const modal = document.getElementById('setupSecurityQuestionModal');
  if (!modal) return;

  const questionSelect = document.getElementById('setupSecurityQuestion');
  const answerInput = document.getElementById('setupSecurityAnswer');

  if (questionSelect) questionSelect.value = '';
  if (answerInput) answerInput.value = '';

  modal.style.display = 'flex';
}

/**
 * Saves security question from setup modal
 * Migrated to backend - PUT /api/users/:id/security-question
 */
window.saveSecurityQuestion = async function() {
  try {
    const questionSelect = document.getElementById('setupSecurityQuestion');
    const answerInput = document.getElementById('setupSecurityAnswer');

    if (!questionSelect || !answerInput) {
      console.error('Elements not found:', {questionSelect, answerInput});
      alert('Error: No se encontraron los campos del formulario');
      return;
    }

    const question = questionSelect.value;
    const answer = answerInput.value.trim();

    const showMessage = (msg, type) => {
      if (typeof showToast === 'function') {
        showToast(msg, type);
      } else {
        alert(msg);
      }
    };

    if (!question || question === '') {
      showMessage('Por favor selecciona una pregunta', 'warning');
      questionSelect.focus();
      return;
    }

    if (!answer) {
      showMessage('Por favor ingresa tu respuesta', 'warning');
      answerInput.focus();
      return;
    }

    if (answer.length < 2) {
      showMessage('La respuesta debe tener al menos 2 caracteres', 'warning');
      answerInput.focus();
      return;
    }

    // Get current user ID
    const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      showMessage('No autenticado', 'error');
      return;
    }

    // Get current user info to obtain ID
    const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!meResponse.ok) {
      throw new Error('Error al obtener información del usuario');
    }

    const meData = await meResponse.json();
    const userId = meData.user.id;

    // Call API to save security question
    const response = await fetch(`${API_BASE_URL}/users/${userId}/security-question`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        securityQuestion: question,
        securityAnswer: answer
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return saveSecurityQuestion(); // Retry
        } else {
          showMessage('Sesión expirada', 'error');
          logout();
          return;
        }
      }
      throw new Error('Error al guardar la pregunta de seguridad');
    }

    const data = await response.json();

    // Update current user in memory
    if (window.currentUser) {
      window.currentUser.securityQuestion = question;
      window.currentUser.securityAnswer = answer.toLowerCase();
    }

    showMessage('Pregunta de seguridad configurada exitosamente', 'success');

    const modal = document.getElementById('setupSecurityQuestionModal');
    if (modal) {
      modal.style.display = 'none';
    }

    logSecurityEvent('security_question_setup', window.currentUser?.username || 'unknown');

    if (typeof cargarPreguntaSeguridad === 'function') {
      cargarPreguntaSeguridad();
    }

  } catch (error) {
    console.error('Error in saveSecurityQuestion:', error);
    const showMessage = (msg, type) => {
      if (typeof showToast === 'function') {
        showToast(msg, type);
      } else {
        alert(msg);
      }
    };
    showMessage('Error al guardar: ' + error.message, 'error');
  }
}

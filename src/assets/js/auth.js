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
            securityQuestion: foundUser.securityQuestion || null,
            securityAnswer: foundUser.securityAnswer || null,
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
        // Check if admin exists in appUsers, if not create it
        let adminUser = appUsers.find(u => u.usuario === 'admin');

        if (!adminUser) {
          // Create admin user in appUsers
          adminUser = {
            id: Date.now(),
            usuario: 'admin',
            password: 'admin123',
            nombre: 'Administrador',
            apellido: 'Sistema',
            puesto: 'Administrador',
            departamento: null,
            departamentosPasarAsistencia: [],
            departamentosTiempoExtra: [],
            securityQuestion: null,
            securityAnswer: null,
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
          };
          appUsers.push(adminUser);
          localStorage.setItem('appUsers', JSON.stringify(appUsers));
        }

        resolve({
          success: true,
          token: 'mock-token-' + Date.now(),
          user: {
            id: adminUser.id,
            username: adminUser.usuario,
            name: `${adminUser.nombre} ${adminUser.apellido}`,
            password: adminUser.password,
            departamento: adminUser.departamento || null,
            departamentosPasarAsistencia: adminUser.departamentosPasarAsistencia || [],
            departamentosTiempoExtra: adminUser.departamentosTiempoExtra || [],
            securityQuestion: adminUser.securityQuestion || null,
            securityAnswer: adminUser.securityAnswer || null,
            permisos: adminUser.permisos || {
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

      // Check if user needs to set up security question (first time login)
      if (!result.user.securityQuestion || !result.user.securityAnswer) {
        // Redirect to dashboard first, then show setup modal
        navigateTo('dashboard');
        setTimeout(() => {
          openSetupSecurityQuestionModal();
        }, 500);
      } else {
        // Redirect to dashboard normally
        navigateTo('dashboard');
      }
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
  openForgotPasswordModal();
}

/* ============================================
   PASSWORD RECOVERY - SECURITY QUESTION
   New simplified flow
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

/**
 * Verifies username and shows security question (Step 1 -> Step 2)
 */
function verifyUsernameForRecovery() {
  const usernameInput = document.getElementById('recoveryUsername');
  const username = usernameInput.value.trim();

  if (!username) {
    showToast('Por favor ingresa tu nombre de usuario', 'warning');
    usernameInput.focus();
    return;
  }

  // Check if user is locked out
  if (isLockedOut()) {
    const timeLeft = getRemainingLockoutTime();
    showToast(`Demasiados intentos. Intenta en ${timeLeft} minutos`, 'error');
    return;
  }

  // Check if user exists
  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  const user = appUsers.find(u => u.usuario === username);

  // SECURITY: Always show same message (prevent user enumeration)
  if (!user || !user.securityQuestion || !user.securityAnswer) {
    showToast('Usuario no encontrado o sin pregunta configurada. Contacta al administrador.', 'error');
    return;
  }

  // Store username and password for later
  recoveryState.username = username;
  recoveryState.userPassword = user.password;

  // Show user's security question
  const questionLabel = document.getElementById('recoveryQuestion');
  if (questionLabel) {
    questionLabel.textContent = user.securityQuestion;
  }

  // Clear answer input
  const answerInput = document.getElementById('recoveryAnswer');
  if (answerInput) {
    answerInput.value = '';
  }

  // Go to step 2
  showRecoveryStep(2);
}

/**
 * Verifies security answer and shows password (Step 2 -> Step 3)
 */
function verifySecurityAnswer() {
  const answerInput = document.getElementById('recoveryAnswer');
  const userAnswer = answerInput.value.trim().toLowerCase();

  if (!userAnswer) {
    showToast('Por favor ingresa tu respuesta', 'warning');
    answerInput.focus();
    return;
  }

  // Get user to verify answer
  const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
  const user = appUsers.find(u => u.usuario === recoveryState.username);

  if (!user) {
    handleRecoveryFailedAttempt();
    return;
  }

  // Verify answer (case-insensitive)
  const correctAnswer = (user.securityAnswer || '').toLowerCase();
  const isCorrect = userAnswer === correctAnswer;

  if (isCorrect) {
    // Success! Reset attempts and show password
    recoveryState.attempts = 0;

    // Display the password
    const recoveredPasswordInput = document.getElementById('recoveredPassword');
    if (recoveredPasswordInput) {
      recoveredPasswordInput.value = recoveryState.userPassword;
    }

    // Log security event
    logSecurityEvent('password_recovered', recoveryState.username);

    showRecoveryStep(3);
  } else {
    // Failed attempt
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
    showToast(`Respuesta incorrecta. Intentos restantes: ${remainingAttempts}`, 'error');
  } else {
    // Lock out user
    showToast('Demasiados intentos fallidos. Bloqueado por 15 minutos', 'error');
    closeForgotPasswordModal();

    // Log security event
    logSecurityEvent('password_recovery_lockout', recoveryState.username);
  }
}

/**
 * Checks if user is locked out
 * @returns {boolean}
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
 * @returns {number}
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
  // Auto-fill username in login form
  const usernameInput = document.getElementById('username');
  if (usernameInput && recoveryState.username) {
    usernameInput.value = recoveryState.username;
  }

  // Close modal
  closeForgotPasswordModal();

  // Focus password field
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    setTimeout(() => passwordInput.focus(), 300);
  }
}

/**
 * Toggles password visibility
 * @param {string} inputId - Input element ID
 */
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Logs security events for audit trail
 * @param {string} event - Event type
 * @param {string} username - Username involved
 */
function logSecurityEvent(event, username) {
  const securityLog = JSON.parse(localStorage.getItem('securityLog') || '[]');

  securityLog.push({
    event,
    username,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

  // Keep only last 100 events
  if (securityLog.length > 100) {
    securityLog.shift();
  }

  localStorage.setItem('securityLog', JSON.stringify(securityLog));
}

/* ============================================
   SECURITY QUESTION SETUP (First Login)
   ============================================ */

/**
 * Opens the security question setup modal
 */
function openSetupSecurityQuestionModal() {
  const modal = document.getElementById('setupSecurityQuestionModal');
  if (!modal) return;

  // Clear inputs
  const questionSelect = document.getElementById('setupSecurityQuestion');
  const answerInput = document.getElementById('setupSecurityAnswer');

  if (questionSelect) questionSelect.value = '';
  if (answerInput) answerInput.value = '';

  // Show modal
  modal.style.display = 'flex';
}

/**
 * Skips security question setup - allows user to configure later
 */
window.skipSecurityQuestion = function() {
  const modal = document.getElementById('setupSecurityQuestionModal');
  if (modal) {
    modal.style.display = 'none';
  }

  // Show informative message
  const showMessage = (msg, type) => {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  showMessage('Puedes configurar tu pregunta de seguridad desde "Mi Perfil" en cualquier momento', 'info');
};

/**
 * Saves security question from setup modal
 */
window.saveSecurityQuestion = function() {
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

    // Helper to show message (with fallback)
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

    // Save to user's record
    const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const userIndex = appUsers.findIndex(u => u.usuario === window.currentUser.username);

    if (userIndex !== -1) {
      appUsers[userIndex].securityQuestion = question;
      appUsers[userIndex].securityAnswer = answer.toLowerCase(); // Store lowercase
      localStorage.setItem('appUsers', JSON.stringify(appUsers));

      // Update current user object
      window.currentUser.securityQuestion = question;
      window.currentUser.securityAnswer = answer.toLowerCase();

      showMessage('Pregunta de seguridad configurada exitosamente', 'success');

      // Close modal
      const modal = document.getElementById('setupSecurityQuestionModal');
      if (modal) {
        modal.style.display = 'none';
      }

      // Log event
      logSecurityEvent('security_question_setup', window.currentUser.username);

      // Refresh the Mi Perfil section if it's visible
      if (typeof cargarPreguntaSeguridad === 'function') {
        cargarPreguntaSeguridad();
      }
    } else {
      console.error('User not found in appUsers array');
      showMessage('Error al guardar la pregunta de seguridad', 'error');
    }
  } catch (error) {
    console.error('Error in saveSecurityQuestion:', error);
    alert('Error al guardar: ' + error.message);
  }
}

/* ============================================
   MI Technologies - Utility Functions
   ============================================ */

// Global variable to track current view in SPA
let currentView = null;

/**
 * Validates if a string is empty or only whitespace
 * @param {string} value - The string to validate
 * @returns {boolean}
 */
function isEmpty(value) {
  return !value || value.trim().length === 0;
}

/**
 * Validates minimum length of a string
 * @param {string} value - The string to validate
 * @param {number} minLength - Minimum required length
 * @returns {boolean}
 */
function isMinLength(value, minLength) {
  return value && value.trim().length >= minLength;
}

/**
 * Shows error message for a form field
 * @param {HTMLElement} inputElement - The input element
 * @param {string} message - Error message to display
 */
function showError(inputElement, message) {
  // Add error class to input
  inputElement.classList.add('error');
  inputElement.setAttribute('aria-invalid', 'true');

  // Find or create error message element
  let errorElement = inputElement.parentElement.querySelector('.error-message');

  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');

    // Insert after input or after password-toggle if exists
    const toggleBtn = inputElement.parentElement.querySelector('.password-toggle');
    if (toggleBtn) {
      inputElement.parentElement.insertBefore(errorElement, toggleBtn.nextSibling);
    } else {
      inputElement.parentElement.appendChild(errorElement);
    }
  }

  errorElement.textContent = message;
  errorElement.setAttribute('id', `${inputElement.id}-error`);
  inputElement.setAttribute('aria-describedby', `${inputElement.id}-error`);
}

/**
 * Clears error message for a form field
 * @param {HTMLElement} inputElement - The input element
 */
function clearError(inputElement) {
  inputElement.classList.remove('error');
  inputElement.setAttribute('aria-invalid', 'false');
  inputElement.removeAttribute('aria-describedby');

  const errorElement = inputElement.parentElement.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Gets value from localStorage
 * @param {string} key - The key to retrieve
 * @returns {string|null}
 */
function getStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Sets value in localStorage
 * @param {string} key - The key to set
 * @param {string} value - The value to store
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Removes value from localStorage
 * @param {string} key - The key to remove
 */
function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Clears all data from localStorage
 */
function clearStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a delay/sleep promise
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
function getInitials(name) {
  if (!name) return '??';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats a date to readable string
 * @param {Date} date - Date object
 * @returns {string}
 */
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-MX', options);
}

/**
 * Safely redirects to a URL
 * @param {string} url - URL to redirect to
 */
function redirect(url) {
  window.location.href = url;
}

/**
 * Smart navigation back that stays within the system
 * Prevents going back to pages outside the application
 */
function safeGoBack() {
  // Check if we're in a subview within Asistencia
  if (currentView === 'asistencia') {
    const asistenciaColabView = document.getElementById('asistencia-colaborador');
    const asistenciaListaView = document.getElementById('asistencia-colaboradores-lista');
    const departamentoDetalleView = document.getElementById('asistencia-departamento-detalle');
    const colaboradorDetalleView = document.getElementById('asistencia-colaborador-detalle');
    const asistenciaPasarLista = document.getElementById('asistencia-pasar-lista');
    const asistenciaPasarDepartamento = document.getElementById('asistencia-pasar-departamento');

    // Si el formulario de agregar colaborador está visible, volver al grid
    if (asistenciaColabView && asistenciaColabView.style.display === 'block') {
      if (typeof window.volverAGrid === 'function') {
        window.volverAGrid();
        return;
      }
    }

    // Si el detalle de colaborador está visible, volver a detalle de departamento
    if (colaboradorDetalleView && colaboradorDetalleView.style.display === 'block') {
      if (typeof window.volverADepartamento === 'function') {
        window.volverADepartamento();
        return;
      }
    }

    // Si el detalle de departamento está visible, volver a lista de departamentos
    if (departamentoDetalleView && departamentoDetalleView.style.display === 'block') {
      if (typeof window.volverAListaDepartamentos === 'function') {
        window.volverAListaDepartamentos();
        return;
      }
    }

    // Si la lista de departamentos (colaboradores) está visible, volver al grid
    if (asistenciaListaView && asistenciaListaView.style.display === 'block') {
      if (typeof window.volverAGridDesdeColaboradores === 'function') {
        window.volverAGridDesdeColaboradores();
        return;
      }
    }

    // Si los colaboradores de pasar asistencia están visibles, volver a lista de departamentos
    if (asistenciaPasarDepartamento && asistenciaPasarDepartamento.style.display === 'block') {
      if (typeof window.volverAListaDepartamentosAsistencia === 'function') {
        window.volverAListaDepartamentosAsistencia();
        return;
      }
    }

    // Si la lista de departamentos de pasar asistencia está visible, volver al grid
    if (asistenciaPasarLista && asistenciaPasarLista.style.display === 'block') {
      if (typeof window.volverAGridDesdePasarAsistencia === 'function') {
        window.volverAGridDesdePasarAsistencia();
        return;
      }
    }
  }

  // Define internal navigation routes for SPA
  const routes = {
    'usuarios': 'dashboard',
    'asistencia': 'dashboard',
  };

  // Get the back destination for current view
  const backDestination = routes[currentView];

  if (backDestination) {
    navigateTo(backDestination);
  }
}

/**
 * Initializes the back button behavior
 * Call this in DOMContentLoaded to setup smart navigation
 */
function initBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  // Add click handler for safe navigation
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    safeGoBack();
  });
}

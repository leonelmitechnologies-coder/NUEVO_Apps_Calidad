/* ============================================
   MI Technologies - Utility Functions
   ============================================ */

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
  const currentPath = window.location.pathname;

  // Define internal navigation routes
  const routes = {
    '/src/pages/usuarios1000.html': '/src/pages/dashboard1000.html',
    '/src/pages/dashboard1000.html': null, // Dashboard has no back action
  };

  // Get the back destination for current page
  const backDestination = routes[currentPath];

  if (backDestination) {
    // Navigate to specific internal page
    window.location.href = backDestination;
  } else if (currentPath.includes('/src/pages/') && !currentPath.includes('dashboard1000.html')) {
    // For any other page in /src/pages/, default to dashboard
    window.location.href = '/src/pages/dashboard1000.html';
  }
  // If we're on dashboard or unknown page, do nothing (stay on page)
}

/**
 * Initializes the back button behavior
 * Call this in DOMContentLoaded to setup smart navigation
 */
function initBackButton() {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  const currentPath = window.location.pathname;

  // Hide back button on dashboard
  if (currentPath.includes('dashboard1000.html')) {
    backBtn.style.display = 'none';
    return;
  }

  // Remove inline onclick and add safe navigation
  backBtn.removeAttribute('onclick');
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    safeGoBack();
  });
}

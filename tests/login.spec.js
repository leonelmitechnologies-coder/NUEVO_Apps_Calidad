// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Login Page', () => {
  test('should load login page successfully', async ({ page }) => {
    await page.goto('/index1000.html');

    // Check if logo is visible
    await expect(page.locator('.login-logo img')).toBeVisible();

    // Check if form elements are present
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('.btn-login')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/index1000.html');

    // Click login without filling fields
    await page.click('.btn-login');

    // Check for error messages
    await expect(page.locator('.error-message')).toHaveCount(2);
  });

  test('should show error for short username', async ({ page }) => {
    await page.goto('/index1000.html');

    // Fill username with less than 3 characters
    await page.fill('#username', 'ab');
    await page.fill('#password', 'password123');
    await page.click('.btn-login');

    // Check for username error
    const usernameError = page.locator('#username-error');
    await expect(usernameError).toBeVisible();
    await expect(usernameError).toContainText('al menos 3 caracteres');
  });

  test('should show error for short password', async ({ page }) => {
    await page.goto('/index1000.html');

    // Fill password with less than 6 characters
    await page.fill('#username', 'admin');
    await page.fill('#password', '12345');
    await page.click('.btn-login');

    // Check for password error
    const passwordError = page.locator('#password-error');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toContainText('al menos 6 caracteres');
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/index1000.html');

    const passwordInput = page.locator('#password');
    const toggleButton = page.locator('.password-toggle');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle
    await toggleButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/index1000.html');

    // Fill form with valid credentials
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');

    // Check remember me
    await page.check('#rememberMe');

    // Click login
    await page.click('.btn-login');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard1000.html', { timeout: 5000 });

    // Check we're on dashboard
    expect(page.url()).toContain('dashboard1000.html');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index1000.html');

    // Check if elements are still visible
    await expect(page.locator('.login-logo img')).toBeVisible();
    await expect(page.locator('.login-card')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E Authentication Flow Tests
 * 
 * These tests cover the critical authentication journey:
 * - User signup
 * - User login
 * - Password recovery
 * - Session persistence
 * 
 * Priority: P0 (Security-critical paths)
 * 
 * Knowledge fragments applied:
 * - selector-resilience: Uses data-testid > ARIA roles
 * - network-first: Intercepts API calls before navigation
 * - fixture-architecture: Pure helper functions for auth operations
 */

test.describe('Authentication Flow - E2E', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Test User'
  };

  test.beforeEach(async ({ page, context }) => {
    // Clean up test user if they exist (via API - faster than UI)
    // This would be done via API in a real implementation
    // await cleanupTestUser(testUser.email);
  });

  test('[P0] should complete full signup flow successfully', async ({ page }) => {
    // Network-first: Intercept signup API call before form submission
    const signupPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/signup') && resp.status() === 201
    );

    await page.goto('/register');

    // Fill signup form using resilient selectors
    await page.getByTestId('name-input').fill(testUser.name);
    await page.getByTestId('email-input').fill(testUser.email);
    await page.getByTestId('password-input').fill(testUser.password);
    await page.getByTestId('confirm-password-input').fill(testUser.password);

    // Submit form
    await page.getByRole('button', { name: /sign up|create account/i }).click();

    // Wait for API response (deterministic)
    const signupResponse = await signupPromise;
    expect(signupResponse.status()).toBe(201);

    // Assert redirected to dashboard or confirmation page
    await expect(page).toHaveURL(/\/dashboard|\/|\/\//i);
    await expect(page.getByRole('heading', { name: /dashboard|welcome/i })).toBeVisible();
  });

  test('[P0] should login successfully with valid credentials', async ({ page }) => {
    // Setup: Create test user first (via API for speed)
    // await createTestUserViaAPI(testUser);

    // Network-first: Intercept login API call
    const loginPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/login') && resp.status() === 200
    );

    await page.goto('/login');

    await page.getByTestId('email-input').fill(testUser.email);
    await page.getByTestId('password-input').fill(testUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Wait for API response (deterministic)
    const loginResponse = await loginPromise;
    expect(loginResponse.status()).toBe(200);

    // Assert logged in and redirected
    await expect(page).toHaveURL(/\/dashboard|\/|\/\//i);
    await expect(page.getByRole('button', { name: /logout|sign out/i })).toBeVisible();
  });

  test('[P1] should display error on invalid credentials', async ({ page }) => {
    // Network-first: Intercept login API call
    const loginPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/login')
    );

    await page.goto('/login');

    await page.getByTestId('email-input').fill('nonexistent@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Wait for API response (deterministic)
    const loginResponse = await loginPromise;
    expect(loginResponse.status()).toBe(401);

    // Assert error message displayed
    await expect(page.getByText(/invalid credentials|email or password/i)).toBeVisible();
  });

  test('[P1] should logout successfully and clear session', async ({ page }) => {
    // Setup: Login first
    // await createTestUserViaAPI(testUser);
    // await loginAsUser(page, testUser);

    await page.goto('/dashboard');
    
    // Click logout button
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Assert redirected to login/home
    await expect(page).toHaveURL(/\/login|\/|\/\//i);

    // Verify cannot access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/i); // Should redirect to login
  });

  test('[P2] should handle password recovery flow', async ({ page }) => {
    await page.goto('/login');

    // Click "Forgot password" link
    await page.getByRole('link', { name: /forgot password|reset password/i }).click();

    await expect(page).toHaveURL(/\/forgot-password|\/reset/i);

    // Network-first: Intercept recovery API call
    const recoveryPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/auth/recover') && resp.status() === 200
    );

    await page.getByTestId('email-input').fill(testUser.email);
    await page.getByRole('button', { name: /send recovery|reset password/i }).click();

    // Wait for API response
    const recoveryResponse = await recoveryPromise;
    expect(recoveryResponse.status()).toBe(200);

    // Assert success message
    await expect(page.getByText(/check your email|recovery link sent/i)).toBeVisible();
  });

  test('[P1] should persist session across page reloads', async ({ page }) => {
    // Setup: Login first
    // await createTestUserViaAPI(testUser);
    // await loginAsUser(page, testUser);

    await page.goto('/dashboard');
    
    // Store expected user content
    const expectedUser = testUser.email;
    await expect(page.getByText(expectedUser)).toBeVisible();

    // Reload page
    await page.reload();

    // Assert session persisted (no redirect to login)
    await expect(page).toHaveURL(/\/dashboard/i);
    await expect(page.getByText(expectedUser)).toBeVisible();
  });

  test('[P0] should redirect to login when accessing protected routes without auth', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/admin', '/profile'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/i);
      await expect(page.getByText(/please login|sign in to access/i)).toBeVisible();
      
      // Navigate away for next iteration
      await page.goto('/');
    }
  });
});

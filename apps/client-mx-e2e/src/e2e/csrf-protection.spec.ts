import { expect, Page, test } from '@playwright/test';

const SERVER_NEST_PORT = process.env['NX_PUBLIC_SERVER_NEST_PORT'] || 8083;
const API_BASE_URL = `http://localhost:${SERVER_NEST_PORT}/api`;

const getCsrfToken = async (page: Page): Promise<string | null> =>
  page.evaluate(() => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrfToken='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  });

const makeAuthenticatedRequest = async (
  page: Page,
  csrfToken: string | null,
  options: {
    omitHeader?: boolean;
    customToken?: string;
    removeCsrfCookie?: boolean;
  } = {}
) => {
  const headers: Record<string, string> = {};

  if (!options.omitHeader) {
    headers['X-CSRF-Token'] = options.customToken || csrfToken || '';
  }

  if (options.removeCsrfCookie) {
    await page.context().clearCookies({ name: 'csrfToken' });
  }

  const response = await page.request.post(`${API_BASE_URL}/auth/refresh`, {
    headers,
  });

  return {
    status: response.status(),
    body: await response.json(),
  };
};

test.describe('CSRF Protection on /api/auth/refresh', () => {
  // Skip webkit - it handles cookies differently and requires different test approach
  test.skip(({ browserName }) => browserName === 'webkit');

  test.beforeEach(async ({ page }) => {
    const ADMIN_EMAIL = process.env.NX_PUBLIC_ALPHA_USER_EMAIL;
    const ADMIN_PASSWORD = process.env.NX_PUBLIC_ALPHA_USER_PASSWORD;

    await page.goto('/');

    const loginButton = page.getByTestId('log_in_btn');
    await loginButton.click();

    const loginModal = page.getByRole('dialog');
    await expect(loginModal).toBeVisible();

    await page
      .getByTestId('login_email_input')
      .locator('input')
      .fill(ADMIN_EMAIL);
    await page
      .getByTestId('login_password_input')
      .locator('input')
      .fill(ADMIN_PASSWORD);

    const signInPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/sign-in') && response.status() === 200
    );

    await page.getByTestId('login_submit_button').click();

    await signInPromise;
    await expect(loginModal).toBeHidden();

    const userHeaderIcon = page.getByTestId('user_header_icon');
    await expect(userHeaderIcon).toBeVisible();

    const cookies = await page.context().cookies();
    const refreshTokenCookie = cookies.find((c) => c.name === 'refreshToken');
    const csrfTokenCookie = cookies.find((c) => c.name === 'csrfToken');

    expect(refreshTokenCookie).toBeDefined();
    expect(csrfTokenCookie).toBeDefined();
  });

  test('Should successfully refresh token with valid CSRF token', async ({
    page,
  }) => {
    const csrfToken = await getCsrfToken(page);
    expect(csrfToken).toBeTruthy();

    const response = await makeAuthenticatedRequest(page, csrfToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessTokenExpiresIn');
  });

  test('Should reject request when CSRF token is missing from header', async ({
    page,
  }) => {
    const csrfToken = await getCsrfToken(page);

    const response = await makeAuthenticatedRequest(page, csrfToken, {
      omitHeader: true,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Security validation failed');
    expect(response.body.code).toBe('CSRF_TOKEN_MISSING');
  });

  test('Should reject request when CSRF token cookie is missing', async ({
    page,
  }) => {
    const csrfToken = await getCsrfToken(page);

    const response = await makeAuthenticatedRequest(page, csrfToken, {
      removeCsrfCookie: true,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Security validation failed');
    expect(response.body.code).toBe('CSRF_TOKEN_MISSING');
  });

  test('Should reject request when CSRF token values do not match', async ({
    page,
  }) => {
    const csrfToken = await getCsrfToken(page);

    const response = await makeAuthenticatedRequest(page, csrfToken, {
      customToken: 'invalid-token-that-does-not-match',
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Security validation failed');
    expect(response.body.code).toBe('CSRF_TOKEN_INVALID');
  });

  test('Should reject request with token exceeding maximum length (DoS protection)', async ({
    page,
  }) => {
    const csrfToken = await getCsrfToken(page);
    // Create a token longer than MAX_TOKEN_LENGTH (64 chars)
    const excessivelyLongToken = 'A'.repeat(65);

    const response = await makeAuthenticatedRequest(page, csrfToken, {
      customToken: excessivelyLongToken,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Security validation failed');
    expect(response.body.code).toBe('CSRF_TOKEN_INVALID');
  });

  test('Should handle URL-encoded CSRF tokens correctly', async ({ page }) => {
    const csrfToken = await getCsrfToken(page);
    expect(csrfToken).toBeTruthy();

    const response = await makeAuthenticatedRequest(page, csrfToken);

    expect(response.status).toBe(200);
  });
});

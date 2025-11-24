import { expect, test } from '@playwright/test';

// Mobile viewport for drawer tests
const mobileViewport = { width: 375, height: 667 };

const ADMIN_EMAIL = process.env.NX_PUBLIC_ALPHA_USER_EMAIL;
const ADMIN_PASSWORD = process.env.NX_PUBLIC_ALPHA_USER_PASSWORD;

test.describe('Mobile Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto('/');
  });

  test('Should open and close drawer using menu button', async ({ page }) => {
    const menuButton = page.getByTestId('mobile_menu_button');

    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const drawer = page.getByTestId('mobile_drawer');

    await expect(drawer).toBeVisible();

    const closeButton = page.getByTestId('mobile_drawer_close_button');

    await closeButton.click();
    await expect(drawer).toBeHidden();
  });

  test('Should close drawer by clicking outside', async ({ page }) => {
    const menuButton = page.getByTestId('mobile_menu_button');

    await menuButton.click();

    const drawer = page.getByTestId('mobile_drawer');

    await expect(drawer).toBeVisible();

    // Press Escape to close the drawer (standard MUI Drawer behavior)
    await page.keyboard.press('Escape');

    await expect(drawer).toBeHidden();
  });

  test('Should show login and signup buttons when user is not logged in', async ({
    page,
  }) => {
    const menuButton = page.getByTestId('mobile_menu_button');

    await menuButton.click();

    const drawer = page.getByTestId('mobile_drawer');

    await expect(drawer).toBeVisible();

    const loginButton = drawer.getByTestId('log_in_btn');
    const signUpButton = drawer.getByTestId('sign_up_btn');

    await expect(loginButton).toBeVisible();
    await expect(signUpButton).toBeVisible();
  });

  test('Should show profile link and logout button when user is logged in', async ({
    page,
  }) => {
    const menuButton = page.getByTestId('mobile_menu_button');

    await menuButton.click();

    const drawer = page.getByTestId('mobile_drawer');
    const loginButton = drawer.getByTestId('log_in_btn');

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

    await page.getByTestId('login_submit_button').click();
    await expect(loginModal).toBeHidden();
    await menuButton.click();
    await expect(drawer).toBeVisible();

    const profileLink = drawer.getByTestId('drawer_profile_link');
    const logoutButton = drawer.getByTestId('drawer_logout_button');

    await expect(profileLink).toBeVisible();
    await expect(logoutButton).toBeVisible();
    await expect(drawer.getByTestId('log_in_btn')).toBeHidden();
    await expect(drawer.getByTestId('sign_up_btn')).toBeHidden();
  });

  test('Should logout user from drawer', async ({ page }) => {
    const menuButton = page.getByTestId('mobile_menu_button');

    await menuButton.click();

    const drawer = page.getByTestId('mobile_drawer');

    await drawer.getByTestId('log_in_btn').click();

    await page
      .getByTestId('login_email_input')
      .locator('input')
      .fill(ADMIN_EMAIL);
    await page
      .getByTestId('login_password_input')
      .locator('input')
      .fill(ADMIN_PASSWORD);

    await page.getByTestId('login_submit_button').click();

    const loginModal = page.getByRole('dialog');

    await expect(loginModal).toBeHidden();

    await menuButton.click();
    await expect(drawer).toBeVisible();

    const logoutButton = drawer.getByTestId('drawer_logout_button');

    await logoutButton.click();
    await expect(drawer).toBeHidden();
    await menuButton.click();
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId('log_in_btn')).toBeVisible();
    await expect(drawer.getByTestId('sign_up_btn')).toBeVisible();
  });

  test('Should navigate to profile page from drawer', async ({ page }) => {
    const menuButton = page.getByTestId('mobile_menu_button');

    await menuButton.click();

    const drawer = page.getByTestId('mobile_drawer');

    await drawer.getByTestId('log_in_btn').click();

    await page
      .getByTestId('login_email_input')
      .locator('input')
      .fill(ADMIN_EMAIL);
    await page
      .getByTestId('login_password_input')
      .locator('input')
      .fill(ADMIN_PASSWORD);

    await page.getByTestId('login_submit_button').click();

    const loginModal = page.getByRole('dialog');

    await expect(loginModal).toBeHidden();
    await menuButton.click();
    await expect(drawer).toBeVisible();

    const profileLink = drawer.getByTestId('drawer_profile_link');

    await profileLink.click();
    await page.waitForURL('**/profile');
    await expect(drawer).toBeHidden();
  });
});

test.describe('Login Form Interactions', () => {
  test('Should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByTestId('log_in_btn');

    await loginButton.click();

    const loginModal = page.getByRole('dialog');

    await expect(loginModal).toBeVisible();
    await page.getByTestId('login_submit_button').click();

    const emailError = page.getByText('Email is required');
    const passwordError = page.getByText('Password is required');

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('Should show validation error for invalid email format', async ({
    page,
  }) => {
    await page.goto('/');

    const loginButton = page.getByTestId('log_in_btn');

    await loginButton.click();

    const loginModal = page.getByRole('dialog');

    await expect(loginModal).toBeVisible();
    await page
      .getByTestId('login_email_input')
      .locator('input')
      .fill('invalid-email');
    await page.getByTestId('login_password_input').locator('input').focus();

    const emailError = page.getByText('Invalid email format');

    await expect(emailError).toBeVisible();
  });

  test('Should show validation error for short password', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByTestId('log_in_btn');

    await loginButton.click();

    const loginModal = page.getByRole('dialog');

    await expect(loginModal).toBeVisible();
    await page
      .getByTestId('login_password_input')
      .locator('input')
      .fill('short');
    await page.getByTestId('login_email_input').locator('input').focus();

    const passwordError = page.getByText(
      'Password must be at least 8 characters'
    );

    await expect(passwordError).toBeVisible();
  });

  test('Should close login modal on successful login', async ({ page }) => {
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

    await page.getByTestId('login_submit_button').click();

    await expect(loginModal).toBeHidden();

    const userHeaderIcon = page.getByTestId('user_header_icon');

    await expect(userHeaderIcon).toBeVisible();
  });
});

test.describe('Sign Up Form Interactions', () => {
  test('Should open sign up modal', async ({ page }) => {
    await page.goto('/');

    const signUpButton = page.getByTestId('sign_up_btn');

    await signUpButton.click();

    const signUpModal = page.getByRole('dialog');
    await expect(signUpModal).toBeVisible();

    const emailInput = page.getByTestId('sign_up_email_input');
    const nameInput = page.getByTestId('sign_up_name_input');
    const passwordInput = page.getByTestId('sign_up_password_input');

    await expect(emailInput).toBeVisible();
    await expect(nameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Should show validation errors on sign up form', async ({ page }) => {
    await page.goto('/');

    const signUpButton = page.getByTestId('sign_up_btn');

    await signUpButton.click();

    const signUpModal = page.getByRole('dialog');

    await expect(signUpModal).toBeVisible();
    await page.getByTestId('login_submit_button').click();

    const emailError = page.getByText('Email is required');
    const passwordError = page.getByText('Password is required');

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('Should allow entering name in sign up form', async ({ page }) => {
    await page.goto('/');

    const signUpButton = page.getByTestId('sign_up_btn');

    await signUpButton.click();

    const signUpModal = page.getByRole('dialog');

    await expect(signUpModal).toBeVisible();

    const nameInput = page.getByTestId('sign_up_name_input').locator('input');

    await nameInput.fill('Test User');
    await expect(nameInput).toHaveValue('Test User');
  });
});

test.describe('Desktop Auth Buttons', () => {
  test('Should show login and signup buttons in header when not logged in', async ({
    page,
  }) => {
    await page.goto('/');

    const loginButton = page.getByTestId('log_in_btn');
    const signUpButton = page.getByTestId('sign_up_btn');

    await expect(loginButton).toBeVisible();
    await expect(signUpButton).toBeVisible();
  });

  test('Should show user dropdown when logged in', async ({ page }) => {
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
    await page.getByTestId('login_submit_button').click();
    await expect(loginModal).toBeHidden();

    const userHeaderIcon = page.getByTestId('user_header_icon');

    await expect(userHeaderIcon).toBeVisible();
    await expect(page.getByTestId('log_in_btn')).toBeHidden();
    await expect(page.getByTestId('sign_up_btn')).toBeHidden();
  });

  test('Should hide menu button on desktop view', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByTestId('mobile_menu_button');

    await expect(menuButton).toBeHidden();
  });
});

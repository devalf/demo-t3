import { expect, test } from '@playwright/test';

test('Should show error notification on wrong login credentials', async ({
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
    .fill('test@example.com');
  await page
    .getByTestId('login_password_input')
    .locator('input')
    .fill('testpassword123');

  await page.getByTestId('login_submit_button').click();

  const errorMessage = page.getByText(/password is not strong enough/i);

  await expect(errorMessage).toBeVisible();

  await expect(loginModal).toBeVisible();
});

test('Should login user successfully with ADMIN credentials', async ({
  page,
}) => {
  await page.goto('/');

  const ADMIN_EMAIL = process.env.NX_PUBLIC_ALPHA_USER_EMAIL;
  const ADMIN_PASSWORD = process.env.NX_PUBLIC_ALPHA_USER_PASSWORD;

  const userHeaderIcon = page.getByTestId('user_header_icon');

  await expect(userHeaderIcon).toBeHidden();

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
  await expect(userHeaderIcon).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('Has `Home` link', async ({ page }) => {
  await page.goto('/');

  expect(await page.getByTestId('link_to_home').innerText()).toContain('Home');
});

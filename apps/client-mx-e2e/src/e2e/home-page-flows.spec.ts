import { expect, test } from '@playwright/test';

test('Has `Home` link', async ({ page }) => {
  await page.goto('/');

  expect(await page.getByTestId('link_to_home').innerText()).toContain('Home');
});

test('Should initially load defined numbers of products', async ({ page }) => {
  await page.goto('/');

  await page
    .locator('[data-testid="product_card_grid_item"]')
    .first()
    .waitFor();

  const productsCount = await page
    .locator('[data-testid="product_card_grid_item"]')
    .count();

  expect(productsCount).toBe(10);
});

test('Should load more products on scrolling page', async ({ page }) => {
  await page.goto('/');

  const lastProductItem = page
    .locator('[data-testid="product_card_grid_item"]')
    .nth(9);

  await expect(lastProductItem).toBeVisible();

  await lastProductItem.scrollIntoViewIfNeeded();

  const infiniteLoader = page.getByTestId('infinite_loader');

  await expect(infiniteLoader).toBeVisible();

  await page.waitForTimeout(1000);

  const productsCount = await page
    .locator('[data-testid="product_card_grid_item"]')
    .count();

  expect(productsCount).toBe(20);
});

/**
 * This test is written according to current BE state,
 * all values are hardcoded.
 * This test will be adapted to dynamic calculations on later stages.
 */
test('Should load more products until the products available', async ({
  page,
}) => {
  await page.goto('/');

  const lastProductItem = page
    .locator('[data-testid="product_card_grid_item"]')
    .nth(9);

  await expect(lastProductItem).toBeVisible();

  await lastProductItem.scrollIntoViewIfNeeded();

  const infiniteLoader = page.getByTestId('infinite_loader');

  await expect(infiniteLoader).toBeVisible();

  await page.waitForTimeout(1000);

  const productsCount = await page
    .locator('[data-testid="product_card_grid_item"]')
    .count();

  expect(productsCount).toBe(20);

  const nextLastProductItem = page
    .locator('[data-testid="product_card_grid_item"]')
    .nth(19);

  await nextLastProductItem.scrollIntoViewIfNeeded();

  await expect(infiniteLoader).toBeVisible();

  await page.waitForTimeout(1000);

  const nextProductsCount = await page
    .locator('[data-testid="product_card_grid_item"]')
    .count();

  expect(nextProductsCount).toBe(27);

  const theMostLastProductItem = page
    .locator('[data-testid="product_card_grid_item"]')
    .nth(26);

  await theMostLastProductItem.scrollIntoViewIfNeeded();

  await expect(infiniteLoader).toBeHidden();
});

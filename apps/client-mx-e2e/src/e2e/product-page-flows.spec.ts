import { expect, test } from '@playwright/test';

test('Should navigate to Single Product page', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();
});

test('Should add product to Cart', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  const cartIconContainer = page.getByTestId('cart_icon_container');

  await expect(cartIconContainer).toBeVisible();

  const badge = cartIconContainer.locator('.MuiBadge-badge');

  await expect(badge).toBeHidden();

  await page.getByTestId('add_to_cart_button').click();

  await expect(badge).toBeVisible();

  const productsCountInBadge = await badge.innerText();

  expect(productsCountInBadge).toEqual('1');
});

test('Should add and remove product to/from Cart', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  const cartIconContainer = page.getByTestId('cart_icon_container');

  await expect(cartIconContainer).toBeVisible();

  const badge = cartIconContainer.locator('.MuiBadge-badge');

  await expect(badge).toBeHidden();

  await expect(page.getByTestId('remove_from_cart_button')).toHaveCount(0);

  await page.getByTestId('add_to_cart_button').click();

  await expect(badge).toBeVisible();

  await expect(page.getByTestId('remove_from_cart_button')).toHaveCount(1);

  const productsCountInBadge = await badge.innerText();

  expect(productsCountInBadge).toEqual('1');

  await page.getByTestId('remove_from_cart_button').click();

  await expect(badge).toBeHidden();

  await expect(page.getByTestId('remove_from_cart_button')).toHaveCount(0);
});

test('Should add products to cart from different pages', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  const cartIconContainer = page.getByTestId('cart_icon_container');

  await expect(cartIconContainer).toBeVisible();

  const badge = cartIconContainer.locator('.MuiBadge-badge');

  await expect(badge).toBeHidden();

  await page.getByTestId('add_to_cart_button').click();

  await expect(badge).toBeVisible();

  const productsCountInBadge = await badge.innerText();

  expect(productsCountInBadge).toEqual('1');

  await page.goBack();

  await page.getByTestId('learn_more_btn').nth(1).click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await expect(badge).toBeVisible();

  const productsCountInBadge2 = await badge.innerText();

  expect(productsCountInBadge2).toEqual('2');
});

test('Should navigate to Home page from Single Product page', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('link_to_home').click();

  await page.waitForURL('**/');

  await expect(page.getByTestId('products_list')).toBeVisible();
});

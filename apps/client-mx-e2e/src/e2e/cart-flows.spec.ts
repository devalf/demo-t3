import { expect, test } from '@playwright/test';

test('Should navigate to cart page and check that cart is empty', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await expect(cartHeading).toHaveText('Cart - is empty');
});

test('Should navigate to Home page from Cart page', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await page.getByTestId('link_to_home').click();

  await page.waitForURL('**/');

  await expect(page.getByTestId('products_list')).toBeVisible();
});

test('Should add product to Cart, navigate to Cart page and check that product is in the cart', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await expect(cartHeading).toHaveText('Cart');

  await expect(page.getByTestId('cart_item_row_0')).toBeVisible();
});

test('Should add two products to Cart, navigate to Cart page and check that products are in the cart', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.goBack();

  await page.getByTestId('learn_more_btn').nth(1).click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await expect(cartHeading).toHaveText('Cart');

  await expect(page.getByTestId('cart_item_row_0')).toBeVisible();

  await expect(page.getByTestId('cart_item_row_1')).toBeVisible();
});

test('Should add product to Cart, navigate to Cart page, remove product from Cart and check that cart is empty', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await expect(cartHeading).toHaveText('Cart');

  await expect(page.getByTestId('cart_item_row_0')).toBeVisible();

  await page.getByTestId('cart_item_remove_btn').click();

  await expect(page.getByTestId('cart_heading')).toHaveText('Cart - is empty');
});

test('Should add two products to Cart, navigate to Cart page, remove one product from Cart and check that one product is in the cart', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.goBack();

  await page.getByTestId('learn_more_btn').nth(1).click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await expect(cartHeading).toHaveText('Cart');

  await expect(page.getByTestId('cart_item_row_0')).toBeVisible();

  await expect(page.getByTestId('cart_item_row_1')).toBeVisible();

  await page.getByTestId('cart_item_remove_btn').nth(1).click();

  await expect(page.getByTestId('cart_item_row_0')).toBeVisible();

  await expect(page.getByTestId('cart_item_row_1')).toHaveCount(0);
});

test('Should add product to Cart, navigate to Cart page, increase product quantity and check that product quantity is increased and total price is calculated properly', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByTestId('learn_more_btn').first().click();

  await page.waitForURL('**/products/**');

  await expect(page.getByTestId('product_name')).toBeVisible();

  await page.getByTestId('add_to_cart_button').click();

  await page.getByTestId('link_to_cart').click();

  await page.waitForURL('**/cart');

  const cartHeading = page.getByTestId('cart_heading');

  await expect(cartHeading).toBeVisible();

  await expect(page.getByTestId('cart_item_row_0')).toBeVisible();

  await page.getByTestId('cart_item_product_quantity').fill('3');

  const productPriceRow = await page
    .getByTestId('cart_item_product_price')
    .textContent();

  const productPrice = Number(productPriceRow.match(/\d/g).join(''));

  const cartItemTotalAmountPriceRow = await page
    .getByTestId('cart_item_total_amount_price')
    .textContent();

  const cartItemTotalAmountPrice = Number(
    cartItemTotalAmountPriceRow.match(/\d/g).join('')
  );

  expect(cartItemTotalAmountPrice).toEqual(productPrice * 3);
});

import axios from 'axios';

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const res = await axios.get(`/api/products`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('metadata');
    expect(res.data).toHaveProperty('entries');
    expect(res.data.entries.length).toEqual(10);
  });

  it('Should provide a correct offset', async () => {
    const res = await axios.get(`/api/products?offset=2`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('metadata');
    expect(res.data).toHaveProperty('entries');

    // check if offset in metadata is correct
    expect(res.data.metadata.offset).toEqual(2);
  });

  it('Should return list of three products', async () => {
    const res = await axios.get(`/api/products?limit=3`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('metadata');
    expect(res.data).toHaveProperty('entries');
    expect(res.data.entries.length).toEqual(3);
  });

  it('Should return sorted list of products by price', async () => {
    const res = await axios.get(`/api/products?sort=price`);

    expect(res.status).toBe(200);

    // check if elements sorted by price ascending
    expect(res.data.entries[0].price).toBeLessThanOrEqual(
      res.data.entries[1].price
    );
  });

  it('Should return Single Product data', async () => {
    const productsList = await axios.get(`/api/products?limit=1`);
    const productId = productsList.data.entries[0].id;

    const res = await axios.get(`/api/products/${productId}`);

    expect(res.status).toBe(200);

    expect(res.data).toHaveProperty('id');
    expect(res.data).toHaveProperty('condition'); // Check for property available only ProductDetailed model
  });

  it('Should sort in descending order', async () => {
    const res = await axios.get(`/api/products?sort=price&order=desc`);

    expect(res.status).toBe(200);

    // check if elements sorted by price descending
    expect(res.data.entries[0].price).toBeGreaterThanOrEqual(
      res.data.entries[1].price
    );
  });

  it('Should throw error if limit is greater than total', async () => {
    const res = await axios.get(`/api/products`);

    const total = res.data.metadata.total;

    try {
      await axios.get(`/api/products?limit=${total + 1}`);
    } catch (err) {
      expect(err.response.status).toBe(400);
    }
  });

  it('Should return 404 on wrong product ID', async () => {
    try {
      await axios.get(`/api/products/123`);
    } catch (err) {
      expect(err.response.status).toBe(404);
    }
  });

  it('Should return error on wrong params', async () => {
    try {
      await axios.get(`/api/products?limit=abc`);
    } catch (err) {
      expect(err.response.status).toBe(400);
    }
  });
});

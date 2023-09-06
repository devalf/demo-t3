import axios from 'axios';

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const res = await axios.get(`/api/products`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('metadata');
    expect(res.data).toHaveProperty('entries');
    expect(res.data.entries.length).toEqual(10);
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
});

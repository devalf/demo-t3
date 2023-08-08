import axios from 'axios';

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const res = await axios.get(`/api/products`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('metadata');
    expect(res.data).toHaveProperty('entries');
  });
});

import axios from 'axios';

describe('GET /api/health-check', () => {
  it('should return status ok', async () => {
    const res = await axios.get(`/api/health-check`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: 'ok' });
  });
});

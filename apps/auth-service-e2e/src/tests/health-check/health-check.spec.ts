import axios from 'axios';

describe('Auth Service E2E', () => {
  it('GET /api/health-check should return status ok', async () => {
    const res = await axios.get(`/api/health-check`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: 'ok' });
  });
});

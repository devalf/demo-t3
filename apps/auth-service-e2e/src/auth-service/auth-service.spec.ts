import axios from 'axios';

describe('Auth Service E2E', () => {
  it('GET /api/health-check should return status ok', async () => {
    const res = await axios.get(`/api/health-check`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: 'ok' });
  });

  describe('POST /api/auth/register', () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const name = 'Test User';

    it('should register a new user', async () => {
      const res = await axios.post(`/api/auth/register`, {
        email: uniqueEmail,
        password,
        name,
      });

      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({
        email: uniqueEmail,
        name,
        role: expect.any(String),
        id: expect.any(Number),
      });
    });

    it('should return 409 for duplicate email', async () => {
      try {
        await axios.post(`/api/auth/register`, {
          email: uniqueEmail,
          password,
          name,
        });

        throw new Error('Expected 409 Conflict');
      } catch (err: any) {
        expect(err.response.status).toBe(409);
      }
    });
  });
});

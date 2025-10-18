import axios, { AxiosError } from 'axios';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrismaClient } from '../../../auth-service/src/prisma-setup/generated';

const SIGN_IN_ENDPOINT = '/api/auth/sign-in';
const REGISTER_ENDPOINT = '/api/auth/register';

describe('POST /api/auth/sign-in', () => {
  const prisma = new PrismaClient();

  const getUniqueEmail = (prefix: string) =>
    `${prefix}-${Date.now()}@example.com`;

  const validCredentials = {
    email: getUniqueEmail('signin-test'),
    password: 'TestPassword123!',
  };

  const invalidCredentials = {
    email: validCredentials.email,
    password: 'wrongpassword',
  };

  beforeAll(async () => {
    try {
      const registerResponse = await axios.post(
        REGISTER_ENDPOINT,
        validCredentials
      );
      // Mark email as verified for e2e testing
      await prisma.user.update({
        where: { id: registerResponse.data.id },
        data: { email_verified: true },
      });
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Successful sign-in', () => {
    it('should sign in with valid credentials', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessTokenExpiresIn');
      expect(typeof response.data.accessTokenExpiresIn).toBe('number');
      expect(response.data.accessTokenExpiresIn).toBeGreaterThan(0);

      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.startsWith('accessToken='))
      ).toBe(true);
      expect(
        cookies.some((cookie: string) => cookie.startsWith('refreshToken='))
      ).toBe(true);
    });

    it('should set secure cookie attributes', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials);

      const cookies = response.headers['set-cookie'];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('accessToken=')
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('refreshToken=')
      );

      expect(accessTokenCookie).toContain('HttpOnly');
      expect(accessTokenCookie).toContain('Path=/');
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('Path=/');
    });
  });

  describe('Authentication failures', () => {
    it('should return 400 for invalid credentials', async () => {
      try {
        await axios.post(SIGN_IN_ENDPOINT, invalidCredentials);

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentUser = {
        email: getUniqueEmail('nonexistent'),
        password: 'TestPassword123!',
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, nonExistentUser);

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('Input validation', () => {
    it('should return 400 for invalid email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, invalidEmailData);

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordData = {
        email: getUniqueEmail('weak-pwd'),
        password: '123',
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, weakPasswordData);

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 for missing email', async () => {
      const missingEmailData = {
        password: 'TestPassword123!',
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, missingEmailData);

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 for missing password', async () => {
      const missingPasswordData = {
        email: getUniqueEmail('missing-pwd'),
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, missingPasswordData);

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 for empty request body', async () => {
      try {
        await axios.post(SIGN_IN_ENDPOINT, {});

        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('Request headers and device info', () => {
    it('should accept requests with User-Agent header', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Test Browser) E2E Test',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessTokenExpiresIn');
    });

    it('should accept requests with X-Forwarded-For header', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials, {
        headers: {
          'X-Forwarded-For': '192.168.1.100',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessTokenExpiresIn');
    });
  });

  describe('Response format and structure', () => {
    it('should return correct response structure', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        accessTokenExpiresIn: expect.any(Number),
      });
    });

    it('should return Content-Type application/json', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Cookie management', () => {
    it('should set cookies with appropriate expiration', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials);

      const cookies = response.headers['set-cookie'];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('accessToken=')
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('refreshToken=')
      );

      expect(accessTokenCookie).toContain('Max-Age=');
      expect(refreshTokenCookie).toContain('Max-Age=');
    });

    it('should not include sensitive information in response body', async () => {
      const response = await axios.post(SIGN_IN_ENDPOINT, validCredentials);

      expect(response.data).not.toHaveProperty('accessToken');
      expect(response.data).not.toHaveProperty('refreshToken');
      expect(response.data).not.toHaveProperty('password');
      expect(response.data).not.toHaveProperty('user');
    });
  });

  describe('Edge cases', () => {
    it('should handle email with different casing', async () => {
      const upperCaseEmailCreds = {
        email: validCredentials.email.toUpperCase(),
        password: validCredentials.password,
      };

      const response = await axios.post(SIGN_IN_ENDPOINT, upperCaseEmailCreds);
      expect(response.status).toBe(200);
    });

    it('should handle extra whitespace in email', async () => {
      const whitespaceEmailCreds = {
        email: `  ${validCredentials.email}  `,
        password: validCredentials.password,
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, whitespaceEmailCreds);
        // If it succeeds, that's fine (trimming is handled)
      } catch (error) {
        // If it fails, it should be a validation error (400)
        const axiosError = error as AxiosError;

        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should reject null values', async () => {
      const nullData = {
        email: null,
        password: null,
      };

      try {
        await axios.post(SIGN_IN_ENDPOINT, nullData);
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });
});

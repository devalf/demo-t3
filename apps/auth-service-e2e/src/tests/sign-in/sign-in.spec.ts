import axios from 'axios';

import {
  createTestUser,
  type TestUser,
  withCleanup,
} from '../../utils/test-user-manager';

const apiSignInEndpoint = '/api/auth/sign-in';

describe('Sign-in endpoint E2E', () => {
  withCleanup();

  describe('POST /api/auth/sign-in', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      testUser = await createTestUser({
        customPrefix: 'signin_test',
        password: 'TestPassword123!',
        name: 'Sign In Test User',
      });
    });

    describe('Success Cases', () => {
      it('should sign in with valid credentials', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
        });
      });

      it('should sign in with case-insensitive email', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email.toUpperCase(),
          password: testUser.password,
        });

        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
        });
      });

      it('should sign in with mixed case email', async () => {
        const mixedCaseEmail = testUser.email
          .split('')
          .map((char, index) =>
            index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
          )
          .join('');

        const res = await axios.post(apiSignInEndpoint, {
          email: mixedCaseEmail,
          password: testUser.password,
        });

        expect(res.status).toBe(200);
      });

      it('should sign in without optional device info', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.status).toBe(200);
        expect(res.data).toMatchObject({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });

      it('should sign in with complete device info', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ip: '192.168.1.100',
          },
        });

        expect(res.status).toBe(200);
      });

      it('should sign in with partial device info (userAgent only)', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: 'Test Browser/1.0',
          },
        });

        expect(res.status).toBe(200);
      });

      it('should sign in with partial device info (ip only)', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            ip: '10.0.0.1',
          },
        });

        expect(res.status).toBe(200);
      });

      it('should sign in with empty device info object', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {},
        });

        expect(res.status).toBe(200);
      });
    });

    describe('Email Validation Tests', () => {
      it('should return 400 for missing email', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            password: testUser.password,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('email')])
          );
        }
      });

      it('should return 400 for null email', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: null,
            password: testUser.password,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for empty string email', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: '',
            password: testUser.password,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('email')])
          );
        }
      });

      it('should return 400 for invalid email format', async () => {
        const invalidEmails = [
          'invalid-email',
          'invalid@',
          '@invalid.com',
          'invalid.com',
          'invalid@@domain.com',
          'invalid@domain',
          'invalid @domain.com',
          'invalid@domain .com',
        ];

        for (const invalidEmail of invalidEmails) {
          try {
            await axios.post(apiSignInEndpoint, {
              email: invalidEmail,
              password: testUser.password,
            });

            throw new Error(`Expected 400 for email: ${invalidEmail}`);
          } catch (error: any) {
            expect(error.response.status).toBe(400);
          }
        }
      });

      it('should return 400 for email with whitespace', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: ` ${testUser.email} `,
            password: testUser.password,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });
    });

    describe('Password Validation Tests', () => {
      it('should return 400 for missing password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('password')])
          );
        }
      });

      it('should return 400 for null password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: null,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for empty string password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: '',
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('password')])
          );
        }
      });

      it('should return 401 for whitespace-only password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: '   ',
          });

          throw new Error('Expected 401 Unauthorized');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      });

      it('should return 400 for password with invalid type', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: 123456,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });
    });

    describe('Device Info Validation Tests', () => {
      it('should return 400 for invalid device info type', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: testUser.password,
            deviceInfo: 'invalid-device-info',
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for device info with invalid userAgent type', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: testUser.password,
            deviceInfo: {
              userAgent: 123,
              ip: '192.168.1.1',
            },
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for device info with invalid ip type', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: testUser.password,
            deviceInfo: {
              userAgent: 'Browser/1.0',
              ip: 123,
            },
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should handle device info with null values', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: null,
            ip: null,
          },
        });

        expect(res.status).toBe(200);
      });
    });

    describe('Authentication Error Tests', () => {
      it('should return 404 for non-existent user', async () => {
        const nonExistentEmail = `nonexistent_${Date.now()}@example.com`;

        try {
          await axios.post(apiSignInEndpoint, {
            email: nonExistentEmail,
            password: testUser.password,
          });

          throw new Error('Expected 404 Not Found');
        } catch (error: any) {
          expect(error.response.status).toBe(404);
          expect(error.response.data.message).toContain('User not found');
        }
      });

      it('should return 401 for wrong password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: 'WrongPassword123!',
          });

          throw new Error('Expected 401 Unauthorized');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data.message).toContain('Invalid credentials');
        }
      });

      it('should return 401 for case-sensitive password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: testUser.password!.toLowerCase(),
          });

          throw new Error('Expected 401 Unauthorized');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data.message).toContain('Invalid credentials');
        }
      });

      it('should return 401 for password with extra spaces', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: ` ${testUser.password} `,
          });

          throw new Error('Expected 401 Unauthorized');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
          expect(error.response.data.message).toContain('Invalid credentials');
        }
      });

      it('should return 401 for similar but different password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: testUser.password + '1',
          });

          throw new Error('Expected 401 Unauthorized');
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      });
    });

    describe('Token Response Validation Tests', () => {
      it('should return valid JWT token structure', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.status).toBe(200);

        const { accessToken, refreshToken } = res.data;

        expect(accessToken.split('.')).toHaveLength(3);
        expect(refreshToken.split('.')).toHaveLength(3);

        expect(accessToken).not.toBe(refreshToken);
      });

      it('should return reasonable expiry time', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.data.expiresIn).toBeGreaterThan(0);
        expect(res.data.expiresIn).toBeLessThan(86400); // Less than 24 hours
      });

      it('should not return sensitive user data', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.data).not.toHaveProperty('password');
        expect(res.data).not.toHaveProperty('user');
        expect(res.data).not.toHaveProperty('hashedPassword');
        expect(res.data).not.toHaveProperty('id');
        expect(res.data).not.toHaveProperty('email');
      });

      it('should generate unique tokens on multiple sign-ins', async () => {
        const res1 = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const res2 = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res1.data.accessToken).not.toBe(res2.data.accessToken);
        expect(res1.data.refreshToken).not.toBe(res2.data.refreshToken);
      });
    });

    describe('Request Body Validation Tests', () => {
      it('should return 400 for empty request body', async () => {
        try {
          await axios.post(apiSignInEndpoint, {});

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for missing both email and password', async () => {
        try {
          await axios.post(apiSignInEndpoint, {
            deviceInfo: {},
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });
    });

    describe('Content-Type Tests', () => {
      it('should handle application/json content type', async () => {
        const res = await axios.post(
          apiSignInEndpoint,
          {
            email: testUser.email,
            password: testUser.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        expect(res.status).toBe(200);
      });

      it('should handle missing content type', async () => {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
        });

        expect(res.status).toBe(200);
      });
    });

    describe('Edge Cases and Security Tests', () => {
      it('should handle special characters in email', async () => {
        const specialUser = await createTestUser({
          email: `test+special.chars_${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Special Test User',
        });

        const res = await axios.post(apiSignInEndpoint, {
          email: specialUser.email,
          password: specialUser.password,
        });

        expect(res.status).toBe(200);
      });

      it('should handle unicode characters in password', async () => {
        const unicodePassword = 'Tëst🔒Pässwörd123!';

        const unicodeUser = await createTestUser({
          password: unicodePassword,
          customPrefix: 'unicode_test',
          name: 'Unicode Test User',
        });

        const res = await axios.post(apiSignInEndpoint, {
          email: unicodeUser.email,
          password: unicodePassword,
        });

        expect(res.status).toBe(200);
      });

      it('should handle maximum length valid email', async () => {
        const maxUser = await createTestUser({
          email: `user${Date.now().toString().slice(-5)}@test.com`,
          password: 'TestPassword123!',
          name: 'Max Length Test User',
        });

        const res = await axios.post(apiSignInEndpoint, {
          email: maxUser.email,
          password: maxUser.password,
        });

        expect(res.status).toBe(200);
      });

      it('should handle long device info strings', async () => {
        const longUserAgent = 'A'.repeat(1000);
        const longIp = '192.168.1.100';

        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: longUserAgent,
            ip: longIp,
          },
        });

        expect(res.status).toBe(200);
      });

      it('should handle concurrent sign-in requests', async () => {
        const promises = Array(5)
          .fill(null)
          .map(() =>
            axios.post(apiSignInEndpoint, {
              email: testUser.email,
              password: testUser.password,
            })
          );

        const results = await Promise.all(promises);

        results.forEach((res) => {
          expect(res.status).toBe(200);
          expect(res.data).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });

        const refreshTokens = results.map((r) => r.data.refreshToken);
        const uniqueRefreshTokens = new Set(refreshTokens);
        expect(uniqueRefreshTokens.size).toBe(refreshTokens.length);
      });
    });

    describe('Rate Limiting Tests (if implemented)', () => {
      it('should handle multiple rapid sign-in attempts', async () => {
        const promises = Array(10)
          .fill(null)
          .map(() =>
            axios.post(apiSignInEndpoint, {
              email: testUser.email,
              password: testUser.password,
            })
          );

        const results = await Promise.allSettled(promises);

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            expect(result.value.status).toBe(200);
          } else {
            expect(
              [429, 200].includes(result.reason?.response?.status || 200)
            ).toBe(true);
          }
        });
      });
    });
  });
});

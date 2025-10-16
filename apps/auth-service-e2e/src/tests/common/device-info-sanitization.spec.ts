import axios from 'axios';

import {
  createTestUser,
  type TestUser,
  withCleanup,
} from '../../utils/test-user-manager';

const apiSignInEndpoint = '/api/auth/sign-in';

describe('Device Info Sanitization E2E', () => {
  withCleanup();

  let testUser: TestUser;

  beforeAll(async () => {
    testUser = await createTestUser({
      customPrefix: 'device_test',
      password: 'TestPassword123!',
      name: 'Device Test User',
    });
  });

  describe('User Agent Sanitization', () => {
    it('should sanitize various XSS attack vectors in userAgent', async () => {
      const testCases = [
        {
          input: 'Mozilla/5.0 <img src=x onerror=alert(1)> Safari/537.36',
          description: 'img tag with onerror in userAgent',
        },
        {
          input: 'Chrome/91.0 javascript:alert(1) Safari/537.36',
          description: 'javascript protocol in userAgent',
        },
        {
          input: 'Mozilla<iframe src="javascript:alert(1)"></iframe>Chrome',
          description: 'iframe with javascript in userAgent',
        },
        {
          input: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          description: 'legitimate userAgent string',
        },
      ];

      for (const testCase of testCases) {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: testCase.input,
            ip: '192.168.1.1',
          },
        });

        expect(res.status).toBe(200);
        expect(res.data.accessToken).toBeDefined();
      }
    });

    it('should enforce maximum length for userAgent field', async () => {
      const longUserAgent = 'A'.repeat(1001);

      try {
        await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: longUserAgent,
            ip: '192.168.1.1',
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([
            expect.stringContaining(
              'User agent must not exceed 1000 characters'
            ),
          ])
        );
      }
    });

    it('should accept maximum allowed length for userAgent field', async () => {
      const maxLengthUserAgent = 'A'.repeat(1000); // Exactly 1000 characters

      const res = await axios.post(apiSignInEndpoint, {
        email: testUser.email,
        password: testUser.password,
        deviceInfo: {
          userAgent: maxLengthUserAgent,
          ip: '192.168.1.1',
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.accessToken).toBeDefined();
    });
  });

  describe('IP Address Validation', () => {
    it('should reject invalid IP addresses with XSS content', async () => {
      const maliciousIp = '192.168.1.1<script>alert("xss")</script>';

      try {
        await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: 'Mozilla/5.0 Chrome/91.0',
            ip: maliciousIp,
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Invalid IP address format'),
          ])
        );
      }
    });

    it('should validate IP addresses correctly', async () => {
      const invalidTestCases = [
        {
          input: '192.168.1.1<img src=x onerror=alert(1)>',
          description: 'img tag with onerror in ip',
        },
        {
          input: 'javascript:alert(1)',
          description: 'javascript protocol as ip',
        },
        {
          input: '::1<iframe></iframe>',
          description: 'iframe in IPv6 address',
        },
        {
          input: 'not.an.ip.address',
          description: 'invalid IP format',
        },
      ];

      const validTestCases = [
        {
          input: '192.168.1.1',
          description: 'legitimate IPv4 address',
        },
        {
          input: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
          description: 'legitimate IPv6 address',
        },
        {
          input: '::1',
          description: 'IPv6 localhost',
        },
        {
          input: '127.0.0.1',
          description: 'IPv4 localhost',
        },
      ];

      for (const testCase of invalidTestCases) {
        try {
          await axios.post(apiSignInEndpoint, {
            email: testUser.email,
            password: testUser.password,
            deviceInfo: {
              userAgent: 'Mozilla/5.0 Chrome/91.0',
              ip: testCase.input,
            },
          });

          throw new Error(
            `Expected 400 Bad Request for ${testCase.description}`
          );
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('Invalid IP address format'),
            ])
          );
        }
      }

      for (const testCase of validTestCases) {
        const res = await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: 'Mozilla/5.0 Chrome/91.0',
            ip: testCase.input,
          },
        });

        expect(res.status).toBe(200);
        expect(res.data.accessToken).toBeDefined();
      }
    });

    it('should reject invalid long strings as IP addresses', async () => {
      const longInvalidIp = 'A'.repeat(46);

      try {
        await axios.post(apiSignInEndpoint, {
          email: testUser.email,
          password: testUser.password,
          deviceInfo: {
            userAgent: 'Mozilla/5.0 Chrome/91.0',
            ip: longInvalidIp,
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Invalid IP address format'),
          ])
        );
      }
    });

    it('should accept valid IPv6 addresses (which can be long)', async () => {
      const validLongIPv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334'; // Valid IPv6

      const res = await axios.post(apiSignInEndpoint, {
        email: testUser.email,
        password: testUser.password,
        deviceInfo: {
          userAgent: 'Mozilla/5.0 Chrome/91.0',
          ip: validLongIPv6,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.accessToken).toBeDefined();
    });
  });

  describe('Combined Device Info Validation', () => {
    it('should handle missing deviceInfo gracefully', async () => {
      const res = await axios.post(apiSignInEndpoint, {
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.data.accessToken).toBeDefined();
    });

    it('should handle partial deviceInfo', async () => {
      const res = await axios.post(apiSignInEndpoint, {
        email: testUser.email,
        password: testUser.password,
        deviceInfo: {
          userAgent: 'Mozilla/5.0 Chrome/91.0',
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.accessToken).toBeDefined();
    });
  });
});

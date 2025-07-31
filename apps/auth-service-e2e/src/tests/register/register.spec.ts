import axios from 'axios';

const apiRegisterEndpoint = '/api/auth/register';

describe('Register endpoint E2E', () => {
  describe('POST /api/auth/register', () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const name = 'Test User';

    it('should register a new user with all fields', async () => {
      const res = await axios.post(apiRegisterEndpoint, {
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
      expect(res.data.password).toBeUndefined();
    });

    it('should register a new user without optional name field', async () => {
      const emailWithoutName = `testuser_no_name_${Date.now()}@example.com`;

      const res = await axios.post(apiRegisterEndpoint, {
        email: emailWithoutName,
        password,
      });

      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({
        email: emailWithoutName,
        role: expect.any(String),
        id: expect.any(Number),
      });
      expect(res.data.name).toBeUndefined();
    });

    it('should return 409 for duplicate email', async () => {
      try {
        await axios.post(apiRegisterEndpoint, {
          email: uniqueEmail,
          password,
          name,
        });

        throw new Error('Expected 409 Conflict');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
      }
    });

    describe('Validation tests', () => {
      it('should return 400 for missing email', async () => {
        try {
          await axios.post(apiRegisterEndpoint, {
            password,
            name,
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
        try {
          await axios.post(apiRegisterEndpoint, {
            email: 'invalid-email',
            password,
            name,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('email')])
          );
        }
      });

      it('should return 400 for missing password', async () => {
        try {
          await axios.post(apiRegisterEndpoint, {
            email: `test_missing_pass_${Date.now()}@example.com`,
            name,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('password')])
          );
        }
      });

      it('should return 400 for weak password', async () => {
        try {
          await axios.post(apiRegisterEndpoint, {
            email: `test_weak_pass_${Date.now()}@example.com`,
            password: '123',
            name,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('password')])
          );
        }
      });

      it('should return 400 for empty request body', async () => {
        try {
          await axios.post(apiRegisterEndpoint, {});

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for invalid name type', async () => {
        try {
          await axios.post(apiRegisterEndpoint, {
            email: `test_invalid_name_${Date.now()}@example.com`,
            password,
            name: 123,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('name')])
          );
        }
      });
    });

    describe('Edge cases', () => {
      it('should handle reasonably long valid email', async () => {
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits
        const longEmail = `user_${timestamp}@longdomain.com`; // About 30 chars

        const res = await axios.post(apiRegisterEndpoint, {
          email: longEmail,
          password,
          name,
        });

        expect(res.status).toBe(201);
        expect(res.data.email).toBe(longEmail);
      });

      it('should return 400 for email exceeding 45 character limit', async () => {
        const tooLongEmail = `${'verylongusername'.repeat(3)}@example.com`; // ~54 characters

        try {
          await axios.post(apiRegisterEndpoint, {
            email: tooLongEmail,
            password,
            name,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([expect.stringContaining('email')])
          );
        }
      });

      it('should handle empty string name (should be treated as null)', async () => {
        const emptyNameEmail = `test_empty_name_${Date.now()}@example.com`;

        const res = await axios.post(apiRegisterEndpoint, {
          email: emptyNameEmail,
          password,
          name: '',
        });

        expect(res.status).toBe(201);
        expect(res.data.name === null || res.data.name === '').toBe(true);
      });

      it('should handle case-insensitive email duplicates', async () => {
        const baseEmail = `testcase_${Date.now()}@example.com`;

        await axios.post(apiRegisterEndpoint, {
          email: baseEmail.toLowerCase(),
          password,
          name,
        });

        try {
          await axios.post(apiRegisterEndpoint, {
            email: baseEmail.toUpperCase(),
            password,
            name,
          });

          throw new Error('Expected 409 Conflict');
        } catch (error: any) {
          expect(error.response.status).toBe(409);
        }
      });
    });

    describe('Security tests', () => {
      it('should not return password in response', async () => {
        const securityTestEmail = `security_test_${Date.now()}@example.com`;

        const res = await axios.post(apiRegisterEndpoint, {
          email: securityTestEmail,
          password,
          name,
        });

        expect(res.status).toBe(201);
        expect(res.data).not.toHaveProperty('password');
        expect(res.data).not.toHaveProperty('hashedPassword');
      });

      it('should sanitize XSS content in name field', async () => {
        const maliciousName =
          "John O'Connor-Smith <script>alert('xss')</script>";
        const sanitizedName = "John O'Connor-Smith";
        const xssTestEmail = `xss_test_${Date.now()}@example.com`;

        const res = await axios.post(apiRegisterEndpoint, {
          email: xssTestEmail,
          password,
          name: maliciousName,
        });

        expect(res.status).toBe(201);
        expect(res.data.name).toBe(sanitizedName);
        expect(res.data.name).not.toContain('<script>');
        expect(res.data.name).not.toContain('alert');
      });

      it('should sanitize various XSS attack vectors in name', async () => {
        const testCases = [
          {
            input: '<img src=x onerror=alert(1)>',
            expected: '',
            description: 'img tag with onerror',
          },
          {
            input: 'javascript:alert(1)',
            expected: 'alert(1)',
            description: 'javascript protocol',
          },
          {
            input: '<iframe src="javascript:alert(1)"></iframe>',
            expected: '',
            description: 'iframe with javascript',
          },
          {
            input: 'John<script>alert("xss")</script>Doe',
            expected: 'JohnDoe',
            description: 'script tag in middle',
          },
          {
            input: 'Valid Name 123',
            expected: 'Valid Name 123',
            description: 'legitimate name with numbers',
          },
        ];

        for (const testCase of testCases) {
          const testEmail = `xss_vector_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 5)}@example.com`;

          const res = await axios.post(apiRegisterEndpoint, {
            email: testEmail,
            password,
            name: testCase.input,
          });

          expect(res.status).toBe(201);
          expect(res.data.name).toBe(testCase.expected);

          expect(res.data.name).not.toMatch(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
          );
          expect(res.data.name).not.toMatch(/javascript:/gi);
          expect(res.data.name).not.toMatch(/on\w+\s*=/gi);
        }
      });

      it('should enforce maximum length for name field', async () => {
        const longName = 'A'.repeat(101);
        const longNameEmail = `long_name_${Date.now()}@example.com`;

        try {
          await axios.post(apiRegisterEndpoint, {
            email: longNameEmail,
            password,
            name: longName,
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('Name must not exceed 100 characters'),
            ])
          );
        }
      });

      it('should accept maximum allowed length for name field', async () => {
        const maxLengthName = 'A'.repeat(100);
        const maxLengthEmail = `max_length_${Date.now()}@example.com`;

        const res = await axios.post(apiRegisterEndpoint, {
          email: maxLengthEmail,
          password,
          name: maxLengthName,
        });

        expect(res.status).toBe(201);
        expect(res.data.name).toBe(maxLengthName);
        expect(res.data.name.length).toBe(100);
      });
    });

    describe('Content-Type tests', () => {
      it('should handle application/json content type', async () => {
        const jsonTestEmail = `json_test_${Date.now()}@example.com`;

        const res = await axios.post(
          apiRegisterEndpoint,
          {
            email: jsonTestEmail,
            password,
            name,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        expect(res.status).toBe(201);
      });

      it('should return 400 for invalid content type', async () => {
        try {
          await axios.post(apiRegisterEndpoint, 'invalid=data', {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          throw new Error('Expected 400 Bad Request');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });
    });
  });
});

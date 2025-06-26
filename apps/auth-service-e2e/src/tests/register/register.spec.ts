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

      it('should handle special characters in name', async () => {
        const specialCharName =
          "John O'Connor-Smith <script>alert('xss')</script>";
        const specialCharEmail = `special_char_${Date.now()}@example.com`;

        const res = await axios.post(apiRegisterEndpoint, {
          email: specialCharEmail,
          password,
          name: specialCharName,
        });

        expect(res.status).toBe(201);
        expect(res.data.name).toBe(specialCharName);
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

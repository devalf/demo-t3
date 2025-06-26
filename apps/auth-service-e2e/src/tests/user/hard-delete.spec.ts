import axios from 'axios';

const apiRegisterEndpoint = '/api/auth/register';
const apiSignInEndpoint = '/api/auth/sign-in';
const apiHardDeleteEndpoint = '/api/auth/user';

describe('DELETE /api/auth/user E2E', () => {
  let testEmail: string;
  let password: string;
  let name: string;
  let userId: number;
  let accessToken: string;
  let currentTestName: string;

  beforeEach(async () => {
    currentTestName = expect.getState().currentTestName || 'unknown test';

    testEmail = `harddelete_test_${Date.now()}@example.com`;
    password = 'HardDeletePassword123!';
    name = 'Hard Delete Test User';

    const regRes = await axios.post(apiRegisterEndpoint, {
      email: testEmail,
      password,
      name,
    });

    expect(regRes.status).toBe(201);
    userId = regRes.data.id;

    const signInRes = await axios.post(apiSignInEndpoint, {
      email: testEmail,
      password,
    });

    expect(signInRes.status).toBe(200);
    accessToken = signInRes.data.accessToken;
  });

  afterEach(async () => {
    try {
      const signInRes = await axios.post(apiSignInEndpoint, {
        email: testEmail,
        password,
      });

      if (signInRes.status === 200) {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: userId,
            accessToken: signInRes.data.accessToken,
          },
        });
      }
    } catch (error: any) {
      // console.error(error.message);
    }
  });

  it('should hard delete the user successfully', async () => {
    const res = await axios.delete(apiHardDeleteEndpoint, {
      data: {
        targetUserId: userId,
        accessToken,
      },
    });

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      message: expect.stringContaining('deleted successfully'),
    });
  });

  it('should not find the user after hard delete', async () => {
    await axios.delete(apiHardDeleteEndpoint, {
      data: {
        targetUserId: userId,
        accessToken,
      },
    });

    try {
      await axios.post(apiSignInEndpoint, {
        email: testEmail,
        password,
      });

      throw new Error('Expected 404 Not Found');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toContain('User not found');
    }
  });

  it('should return 404 when trying to hard delete non-existent user', async () => {
    const nonExistentUserId = 999999;

    try {
      await axios.delete(apiHardDeleteEndpoint, {
        data: {
          targetUserId: nonExistentUserId,
          accessToken,
        },
      });

      throw new Error('Expected 404 Not Found');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('should return 401 when trying to hard delete already deleted user', async () => {
    await axios.delete(apiHardDeleteEndpoint, {
      data: {
        targetUserId: userId,
        accessToken,
      },
    });

    try {
      await axios.delete(apiHardDeleteEndpoint, {
        data: {
          targetUserId: userId,
          accessToken,
        },
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  describe('Validation tests', () => {
    it('should return 400 for missing targetUserId', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            accessToken,
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([expect.stringContaining('targetUserId')])
        );
      }
    });

    it('should return 400 for missing accessToken', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: userId,
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([expect.stringContaining('accessToken')])
        );
      }
    });

    it('should return 400 for invalid targetUserId type', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: 'invalid-id',
            accessToken,
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([expect.stringContaining('targetUserId')])
        );
      }
    });

    it('should return 400 for empty accessToken', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: userId,
            accessToken: '',
          },
        });

        throw new Error('Expected 400 Bad Request');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toEqual(
          expect.arrayContaining([expect.stringContaining('accessToken')])
        );
      }
    });
  });

  describe('Authorization tests', () => {
    it('should return 401 for invalid access token', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: userId,
            accessToken: 'invalid-token',
          },
        });

        throw new Error('Expected 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should return 401 for malformed JWT token', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: userId,
            accessToken: 'not.a.jwt',
          },
        });

        throw new Error('Expected 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle deletion with negative user ID', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: -1,
            accessToken,
          },
        });

        throw new Error('Expected 400 or 404');
      } catch (error: any) {
        expect([400, 404].includes(error.response.status)).toBe(true);
      }
    });

    it('should handle deletion with zero user ID', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: 0,
            accessToken,
          },
        });

        throw new Error('Expected 400 or 404');
      } catch (error: any) {
        expect([400, 404].includes(error.response.status)).toBe(true);
      }
    });
  });

  describe('Security tests', () => {
    it('should not allow deletion with expired token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: userId,
            accessToken: expiredToken,
          },
        });

        throw new Error('Expected 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should not delete other users without proper authorization', async () => {
      const otherEmail = `other_user_${Date.now()}@example.com`;
      const otherRegRes = await axios.post(apiRegisterEndpoint, {
        email: otherEmail,
        password,
        name: 'Other User',
      });

      const otherUserId = otherRegRes.data.id;

      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: {
            targetUserId: otherUserId,
            accessToken,
          },
        });

        throw new Error('Expected 403 Forbidden');
      } catch (error: any) {
        expect([401, 403].includes(error.response.status)).toBe(true);
      }

      const otherSignInRes = await axios.post(apiSignInEndpoint, {
        email: otherEmail,
        password,
      });

      await axios.delete(apiHardDeleteEndpoint, {
        data: {
          targetUserId: otherUserId,
          accessToken: otherSignInRes.data.accessToken,
        },
      });
    });
  });

  describe('Content-Type tests', () => {
    it('should handle application/json content type', async () => {
      const res = await axios.delete(apiHardDeleteEndpoint, {
        data: {
          targetUserId: userId,
          accessToken,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid content type', async () => {
      try {
        await axios.delete(apiHardDeleteEndpoint, {
          data: 'invalid=data',
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

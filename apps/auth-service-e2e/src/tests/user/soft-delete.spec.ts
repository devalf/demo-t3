import axios from 'axios';

import {
  createTestUser,
  type TestUser,
  withCleanup,
} from '../../utils/test-user-manager';

const apiSignInEndpoint = '/api/auth/sign-in';
const apiSoftDeleteEndpoint = '/api/auth/user/soft-delete';

describe('PATCH /api/auth/user/soft-delete E2E', () => {
  let testUser: TestUser;
  let accessToken: string;

  beforeEach(async () => {
    testUser = await createTestUser({
      customPrefix: 'softdelete_test',
      password: 'SoftDeletePassword123!',
      name: 'Soft Delete Test User',
    });

    const signInRes = await axios.post(apiSignInEndpoint, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(signInRes.status).toBe(200);

    accessToken = signInRes.data.accessToken;
  });

  it('should soft delete the user successfully', async () => {
    const res = await axios.patch(apiSoftDeleteEndpoint, {
      targetUserId: testUser.id,
      accessToken,
    });

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      message: expect.stringContaining('soft deleted successfully'),
    });
  });

  it('should not allow login after soft delete', async () => {
    await axios.patch(apiSoftDeleteEndpoint, {
      targetUserId: testUser.id,
      accessToken,
    });

    try {
      await axios.post(apiSignInEndpoint, {
        email: testUser.email,
        password: testUser.password,
      });

      throw new Error('Expected 404 Not Found');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
      expect(error.response?.data?.message).toContain('User not found');
    }
  });

  it('should return 401 when trying to soft delete already soft deleted user', async () => {
    await axios.patch(apiSoftDeleteEndpoint, {
      targetUserId: testUser.id,
      accessToken,
    });

    try {
      await axios.patch(apiSoftDeleteEndpoint, {
        targetUserId: testUser.id,
        accessToken,
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});

describe('PATCH /api/auth/user/soft-delete E2E - with force DB clean up', () => {
  let testUser: TestUser;
  let accessToken: string;

  withCleanup();

  beforeEach(async () => {
    testUser = await createTestUser({
      customPrefix: 'softdelete_test_2',
      password: 'SoftDeletePassword123!',
      name: 'Soft Delete Test 2 User',
    });

    const signInRes = await axios.post(apiSignInEndpoint, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(signInRes.status).toBe(200);

    accessToken = signInRes.data.accessToken;
  });

  it('should return 404 when trying to soft delete non-existent user', async () => {
    const nonExistentUserId = 999999;

    try {
      await axios.patch(apiSoftDeleteEndpoint, {
        targetUserId: nonExistentUserId,
        accessToken,
      });
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  describe('Validation tests', () => {
    it('should return 400 for missing targetUserId', async () => {
      try {
        await axios.patch(apiSoftDeleteEndpoint, {
          accessToken,
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
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: testUser.id,
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
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: 'invalid-id',
          accessToken,
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
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: testUser.id,
          accessToken: '',
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
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: testUser.id,
          accessToken: 'invalid-token',
        });

        throw new Error('Expected 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should return 401 for malformed JWT token', async () => {
      try {
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: testUser.id,
          accessToken: 'not.a.jwt',
        });

        throw new Error('Expected 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should not allow deletion with expired token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      try {
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: testUser.id,
          accessToken: expiredToken,
        });

        throw new Error('Expected 401 Unauthorized');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should not delete other users without proper authorization', async () => {
      const otherUser = await createTestUser({
        customPrefix: 'other_user_soft',
        password: 'SoftDeletePassword123!',
        name: 'Other User',
      });

      try {
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: otherUser.id,
          accessToken,
        });

        throw new Error('Expected 403 Forbidden');
      } catch (error: any) {
        expect([401, 403].includes(error.response.status)).toBe(true);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle deletion with negative user ID', async () => {
      try {
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: -1,
          accessToken,
        });

        throw new Error('Expected 400 or 404');
      } catch (error: any) {
        expect([400, 404].includes(error.response.status)).toBe(true);
      }
    });

    it('should handle deletion with zero user ID', async () => {
      try {
        await axios.patch(apiSoftDeleteEndpoint, {
          targetUserId: 0,
          accessToken,
        });

        throw new Error('Expected 400 or 404');
      } catch (error: any) {
        expect([400, 404].includes(error.response.status)).toBe(true);
      }
    });
  });
});

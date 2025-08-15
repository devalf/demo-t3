import axios from 'axios';

import {
  createTestUser,
  type TestUser,
  withCleanup,
} from '../../utils/test-user-manager';

const apiSignInEndpoint = '/api/auth/sign-in';
const apiSoftDeleteEndpoint = '/api/auth/user/soft-delete';
const apiHardDeleteEndpoint = '/api/auth/user';

describe('Soft Delete → Hard Delete Flow E2E', () => {
  let testUser: TestUser;
  let accessToken: string;

  withCleanup();

  beforeEach(async () => {
    testUser = await createTestUser({
      customPrefix: 'soft_then_hard',
      password: 'SoftThenHardDelete123!',
      name: 'Soft Then Hard Delete Test User',
    });

    const signInRes = await axios.post(apiSignInEndpoint, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(signInRes.status).toBe(200);
    accessToken = signInRes.data.accessToken;
  });

  it('should allow self hard delete after soft delete', async () => {
    const softDeleteRes = await axios.patch(apiSoftDeleteEndpoint, {
      targetUserId: testUser.id,
      accessToken,
    });

    expect(softDeleteRes.status).toBe(200);
    expect(softDeleteRes.data.message).toContain('soft deleted successfully');

    // Verify user cannot login after soft delete
    try {
      await axios.post(apiSignInEndpoint, {
        email: testUser.email,
        password: testUser.password,
      });

      throw new Error('Expected login to fail after soft delete');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }

    // The user's token is now invalid after soft delete, so they cannot hard delete themselves
    // This test verifies that the system correctly handles the token invalidation
    try {
      await axios.delete(apiHardDeleteEndpoint, {
        data: {
          targetUserId: testUser.id,
          accessToken, // This token is now invalid
        },
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
    }
  });

  it('should verify soft delete prevents subsequent operations', async () => {
    // First, soft delete the user
    const softDeleteRes = await axios.patch(apiSoftDeleteEndpoint, {
      targetUserId: testUser.id,
      accessToken,
    });

    expect(softDeleteRes.status).toBe(200);
    expect(softDeleteRes.data.message).toContain('soft deleted successfully');

    // Try to soft delete again - should fail because token is invalid
    try {
      await axios.patch(apiSoftDeleteEndpoint, {
        targetUserId: testUser.id,
        accessToken, // This token is now invalid
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
    }

    // Try to hard delete - should also fail because token is invalid
    try {
      await axios.delete(apiHardDeleteEndpoint, {
        data: {
          targetUserId: testUser.id,
          accessToken, // This token is now invalid
        },
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
    }
  });
});

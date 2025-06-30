import axios from 'axios';

import {
  createTestUser,
  type TestUser,
  withCleanup,
} from '../../utils/test-user-manager';

const apiSignInEndpoint = '/api/auth/sign-in';
const apiRefreshEndpoint = '/api/auth/refresh';

describe('POST /api/auth/refresh E2E', () => {
  withCleanup();

  let testUser: TestUser;
  let refreshToken: string;
  let accessToken: string;

  beforeEach(async () => {
    testUser = await createTestUser({
      customPrefix: 'refresh_test',
      password: 'RefreshPassword123!',
      name: 'Refresh Test User',
    });

    const signInRes = await axios.post(apiSignInEndpoint, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(signInRes.status).toBe(200);

    refreshToken = signInRes.data.refreshToken;
    accessToken = signInRes.data.accessToken;
  });

  it('should refresh tokens successfully', async () => {
    const res = await axios.post(apiRefreshEndpoint, {
      refreshToken,
      deviceInfo: {
        userAgent: 'E2E Test Agent',
        ip: '127.0.0.1',
      },
    });

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      expiresIn: expect.any(Number),
    });
  });

  it('should refresh tokens with minimal device info', async () => {
    const res = await axios.post(apiRefreshEndpoint, {
      refreshToken,
      deviceInfo: {},
    });

    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      expiresIn: expect.any(Number),
    });
  });

  it('should return 401 for invalid refresh token', async () => {
    try {
      await axios.post(apiRefreshEndpoint, {
        refreshToken: 'invalid.token.value',
        deviceInfo: {},
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should return 401 for expired refresh token', async () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjoiZXhwaXJlZCIsInR5cGUiOiJyZWZyZXNoIiwiZXhwIjoxMDEwMDAwMDAwLCJ1c2VySWQiOjEyMzQ1Nn0.invalid';
    try {
      await axios.post(apiRefreshEndpoint, {
        refreshToken: expiredToken,
        deviceInfo: {},
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should return 401 for revoked refresh token', async () => {
    await axios.post(apiRefreshEndpoint, {
      refreshToken,
      deviceInfo: {},
    });

    try {
      await axios.post(apiRefreshEndpoint, {
        refreshToken,
        deviceInfo: {},
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should return 400 for missing refreshToken', async () => {
    try {
      await axios.post(apiRefreshEndpoint, {
        deviceInfo: {},
      });

      throw new Error('Expected 400 Bad Request');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toEqual(
        expect.arrayContaining([expect.stringContaining('refreshToken')])
      );
    }
  });

  it('should return 400 for empty refreshToken', async () => {
    try {
      await axios.post(apiRefreshEndpoint, {
        refreshToken: '',
        deviceInfo: {},
      });

      throw new Error('Expected 400 Bad Request');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toEqual(
        expect.arrayContaining([expect.stringContaining('refreshToken')])
      );
    }
  });

  it('should return 400 for invalid deviceInfo type', async () => {
    try {
      await axios.post(apiRefreshEndpoint, {
        refreshToken,
        deviceInfo: 'not-an-object',
      });

      throw new Error('Expected 400 Bad Request');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });
});

describe('POST /api/auth/refresh E2E, scenario with user deletion', () => {
  let testUser: TestUser;
  let refreshToken: string;
  let accessToken: string;

  beforeEach(async () => {
    testUser = await createTestUser({
      customPrefix: 'refresh_test',
      password: 'RefreshPassword123!',
      name: 'Refresh Test User',
    });

    const signInRes = await axios.post(apiSignInEndpoint, {
      email: testUser.email,
      password: testUser.password,
    });

    expect(signInRes.status).toBe(200);

    refreshToken = signInRes.data.refreshToken;
    accessToken = signInRes.data.accessToken;
  });

  it('should return 401 if user no longer exists', async () => {
    await axios.delete('/api/auth/user', {
      data: {
        targetUserId: testUser.id,
        accessToken,
      },
    });

    await new Promise((res) => setTimeout(res, 50));

    try {
      await axios.post(apiRefreshEndpoint, {
        refreshToken,
      });

      throw new Error('Expected 401 Unauthorized');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});

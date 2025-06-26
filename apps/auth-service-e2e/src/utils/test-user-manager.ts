import axios from 'axios';

type TestUser = {
  id: number;
  email: string;
  name?: string;
  password?: string;
};

type CreateUserOptions = {
  email?: string;
  password?: string;
  name?: string;
  customPrefix?: string;
};

export class TestUserManager {
  private static instance: TestUserManager;
  private createdUsers: TestUser[] = [];
  private adminToken: string | null = null;

  private readonly API_REGISTER = '/api/auth/register';
  private readonly API_SIGN_IN = '/api/auth/sign-in';
  private readonly API_DELETE = '/api/auth/user';

  private readonly ADMIN_EMAIL = process.env.NX_PUBLIC_ALPHA_USER_EMAIL;
  private readonly ADMIN_PASSWORD = process.env.NX_PUBLIC_ALPHA_USER_PASSWORD;

  private constructor() {
    if (!this.ADMIN_EMAIL || !this.ADMIN_PASSWORD) {
      throw new Error(
        'Environment variables NX_PUBLIC_ALPHA_USER_EMAIL and NX_PUBLIC_ALPHA_USER_PASSWORD must be set.'
      );
    }
  }

  static getInstance(): TestUserManager {
    if (!TestUserManager.instance) {
      TestUserManager.instance = new TestUserManager();
    }
    return TestUserManager.instance;
  }

  async createTestUser(options: CreateUserOptions = {}): Promise<TestUser> {
    const timestamp = Date.now();
    const prefix = options.customPrefix || 'test';

    const userData = {
      email: options.email || `${prefix}_${timestamp}@example.com`,
      password: options.password || 'TestPassword123!',
      name: options.name || `Test User ${timestamp}`,
    };

    try {
      const response = await axios.post(this.API_REGISTER, userData);

      const testUser: TestUser = {
        id: response.data.id,
        email: userData.email,
        name: userData.name,
        password: userData.password,
      };

      this.createdUsers.push(testUser);

      return testUser;
    } catch (error) {
      console.error('Failed to create test user:', error);

      throw error;
    }
  }

  async createTestUsers(
    count: number,
    options: CreateUserOptions = {}
  ): Promise<TestUser[]> {
    const users: TestUser[] = [];

    for (let i = 0; i < count; i++) {
      const userOptions = {
        ...options,
        customPrefix: `${options.customPrefix || 'test'}_${i}`,
      };
      users.push(await this.createTestUser(userOptions));
    }

    return users;
  }

  trackUser(user: TestUser): void {
    this.createdUsers.push(user);
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const adminToken = await this.getAdminToken();

      await axios.delete(this.API_DELETE, {
        data: {
          targetUserId: userId,
          accessToken: adminToken,
        },
      });

      this.createdUsers = this.createdUsers.filter(
        (user) => user.id !== userId
      );

      return true;
    } catch (error: any) {
      console.error(
        `Failed to delete user ${userId}:`,
        error.response?.data || error.message
      );

      return false;
    }
  }

  async cleanupAllUsers(): Promise<void> {
    if (this.createdUsers.length === 0) {
      return;
    }

    const deletionPromises = this.createdUsers.map((user) =>
      this.deleteUser(user.id)
    );

    const results = await Promise.allSettled(deletionPromises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    if (failed > 0) {
      console.warn(
        `Cleanup completed: ${successful} successful, ${failed} failed`
      );
    } else {
      console.log(`Successfully cleaned up all ${successful} test users`);
    }

    this.createdUsers = [];
    this.adminToken = null;
  }

  getTrackedUsers(): TestUser[] {
    return [...this.createdUsers];
  }

  clearTracking(): void {
    this.createdUsers = [];
    this.adminToken = null;
  }

  private async getAdminToken(): Promise<string> {
    if (this.adminToken) {
      return this.adminToken;
    }

    try {
      const response = await axios.post(this.API_SIGN_IN, {
        email: this.ADMIN_EMAIL,
        password: this.ADMIN_PASSWORD,
      });

      this.adminToken = response.data.accessToken;

      return this.adminToken;
    } catch (error) {
      console.error('Failed to get admin token:', error);

      throw new Error('Cannot authenticate as admin for cleanup');
    }
  }
}

export const testUserManager = TestUserManager.getInstance();

export type { TestUser, CreateUserOptions };

export const createTestUser = (options?: CreateUserOptions) =>
  testUserManager.createTestUser(options);

export const createTestUsers = (count: number, options?: CreateUserOptions) =>
  testUserManager.createTestUsers(count, options);

export const cleanupTestUsers = () => testUserManager.cleanupAllUsers();

export const trackTestUser = (user: TestUser) =>
  testUserManager.trackUser(user);

export function withCleanup() {
  afterAll(async () => {
    try {
      await testUserManager.cleanupAllUsers();
    } catch (error) {
      console.warn('Test cleanup failed:', error.message);
    }
  });
}

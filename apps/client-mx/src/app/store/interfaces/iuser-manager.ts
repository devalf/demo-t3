import { ApiUser } from '@demo-t3/models';

export interface IUserManager {
  isLoading: boolean;
  userData: ApiUser | null;
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  handleTokenRefreshFailure: () => void;
  setUserData(userData: ApiUser | null, expiresInSeconds?: number): void;
  setIsLoading(isLoading: boolean): void;
}

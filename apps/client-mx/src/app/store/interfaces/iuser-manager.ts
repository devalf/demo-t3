export interface IUserManager {
  isSignedIn: boolean;
  isLoading: boolean;
  usedData: unknown;
  logout: () => Promise<void>;
  checkAuthStatusOnLoad: () => Promise<void>;
  setIsSignedIn(isSignedIn: boolean): void;
  setIsLoading(isLoading: boolean): void;
}

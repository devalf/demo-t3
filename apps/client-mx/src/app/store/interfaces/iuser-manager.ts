export interface IUserManager {
  isSignedIn: boolean;
  usedData: unknown;
  logout: () => Promise<void>;
  checkAuthStatusOnLoad: () => Promise<void>;
  setIsSignedIn(isSignedIn: boolean): void;
}

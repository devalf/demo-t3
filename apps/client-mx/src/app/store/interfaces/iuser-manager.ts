export interface IUserManager {
  isSignedIn: boolean;
  usedData: unknown;
  setIsSignedIn(isSignedIn: boolean): void;
}

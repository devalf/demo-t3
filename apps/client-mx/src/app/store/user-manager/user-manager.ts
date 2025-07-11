import { makeAutoObservable } from 'mobx';
import { injectable } from 'inversify';

import { IUserManager } from '../interfaces';
import { checkAuthStatusRequest, logoutRequest } from '../../repository';
import { diContainer } from '../../bootstrap/ioc/di-container';

@injectable()
export class UserManager implements IUserManager {
  constructor() {
    makeAutoObservable(this);

    void this.checkAuthStatusOnLoad();
  }

  private _isSignedIn = false;

  get isSignedIn(): boolean {
    return this._isSignedIn;
  }

  private _isLoading = true;

  get isLoading(): boolean {
    return this._isLoading;
  }

  get usedData(): unknown {
    return undefined;
  }

  setIsSignedIn = (isSignedIn: boolean, expiresInSeconds?: number): void => {
    this._isSignedIn = isSignedIn;

    try {
      const refreshTokenManager = diContainer.refreshTokenManager;

      if (isSignedIn) {
        refreshTokenManager.resetRefreshFailureState();

        if (expiresInSeconds) {
          refreshTokenManager.startProactiveRefresh(expiresInSeconds);
        } else {
          console.warn(
            'No expiration time provided, proactive refresh not started'
          );
        }
      } else {
        refreshTokenManager.stopProactiveRefresh();
      }
    } catch (diError) {
      console.warn('Could not manage refresh token state:', diError);
    }
  };

  setIsLoading = (isLoading: boolean): void => {
    this._isLoading = isLoading;
  };

  checkAuthStatusOnLoad = async (): Promise<void> => {
    this.setIsLoading(true);
    try {
      const isSignedIn = await checkAuthStatusRequest();
      this.setIsSignedIn(isSignedIn);
    } finally {
      this.setIsLoading(false);
    }
  };

  logout = async (): Promise<void> => {
    await logoutRequest();

    this.setIsSignedIn(false);
  };

  handleTokenRefreshFailure = (): void => {
    this.setIsSignedIn(false);
  };
}

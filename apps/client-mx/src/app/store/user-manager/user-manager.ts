import { ACCESS_TOKEN_PUB, ApiUser, REFRESH_TOKEN_PUB } from '@demo-t3/models';
import { inject, injectable } from 'inversify';
import { makeAutoObservable } from 'mobx';

import { DependencyType } from '../../bootstrap/ioc/dependency-type';
import { fetchUserProfileData, logoutRequest } from '../../repository';
import type { IRefreshTokenManager, IUserManager } from '../interfaces';

@injectable()
export class UserManager implements IUserManager {
  private userProfileData: ApiUser | null = null;

  constructor(
    @inject(DependencyType.RefreshTokenManager)
    private readonly refreshTokenManager: IRefreshTokenManager
  ) {
    makeAutoObservable(this);

    void this.fetchUserData();
  }

  private _isLoading = true;

  get isLoading(): boolean {
    return this._isLoading;
  }

  get userData(): ApiUser | null {
    return this.userProfileData;
  }

  setUserData = (userData: ApiUser | null, expiresInSeconds?: number): void => {
    this.userProfileData = userData;

    try {
      if (userData !== null) {
        this.refreshTokenManager.resetRefreshFailureState();

        if (expiresInSeconds) {
          this.refreshTokenManager.startProactiveRefresh(expiresInSeconds);
        } else {
          console.warn(
            'No expiration time provided, proactive refresh not started'
          );
        }
      } else {
        this.refreshTokenManager.stopProactiveRefresh();
      }
    } catch (error) {
      console.warn('Could not manage refresh token state:', error);
    }
  };

  setIsLoading = (isLoading: boolean): void => {
    this._isLoading = isLoading;
  };

  fetchUserData = async (): Promise<void> => {
    this.setIsLoading(true);

    try {
      if (!this.hasSessionCookie()) {
        this.setUserData(null);

        return;
      }

      const userData = await fetchUserProfileData();

      if (userData) {
        const expiresInSeconds = await this.getAccessTokenExpiresIn();

        this.setUserData(userData, expiresInSeconds ?? undefined);
      } else {
        this.setUserData(null);
      }
    } finally {
      this.setIsLoading(false);
    }
  };

  logout = async (): Promise<void> => {
    await logoutRequest();

    this.setUserData(null);
  };

  handleTokenRefreshFailure = (): void => {
    this.setUserData(null);
  };

  private getCookies = (): string[] => {
    try {
      return document.cookie ? document.cookie.split('; ') : [];
    } catch {
      return [];
    }
  };

  private hasSessionCookie = (): boolean => {
    const cookies = this.getCookies();

    return cookies.some((c) => c.startsWith(`${REFRESH_TOKEN_PUB}=`));
  };

  private getAccessTokenExpiresIn = async (): Promise<number | null> => {
    try {
      if ('cookieStore' in window) {
        const cookie = await window.cookieStore.get(ACCESS_TOKEN_PUB);

        if (!cookie || !cookie.expires) {
          return null;
        }

        const expiryDate = new Date(cookie.expires);
        const now = new Date();
        const secondsRemaining = Math.floor(
          (expiryDate.getTime() - now.getTime()) / 1000
        );

        return secondsRemaining > 0 ? secondsRemaining : null;
      }

      const cookies = this.getCookies();
      const accessTokenCookie = cookies.find((c) =>
        c.startsWith(`${ACCESS_TOKEN_PUB}=`)
      );

      if (!accessTokenCookie) {
        return null;
      }

      console.warn(
        'Cookie Store API not available, cannot read cookie expiration'
      );

      return null;
    } catch (error) {
      console.warn('Failed to read access token expiration:', error);
      return null;
    }
  };
}

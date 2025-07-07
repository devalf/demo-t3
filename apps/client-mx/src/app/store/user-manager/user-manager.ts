import { makeAutoObservable } from 'mobx';
import { injectable } from 'inversify';

import { IUserManager } from '../interfaces/iuser-manager';
import { checkAuthStatusRequest, logoutRequest } from '../../repository';

@injectable()
export class UserManager implements IUserManager {
  constructor() {
    makeAutoObservable(this);

    void this.checkAuthStatusOnLoad();
  }

  private _isSignedIn = false;
  private _isLoading = true;

  get isSignedIn(): boolean {
    return this._isSignedIn;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get usedData(): unknown {
    return undefined;
  }

  setIsSignedIn = (isSignedIn: boolean): void => {
    this._isSignedIn = isSignedIn;
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
}

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

  get isSignedIn(): boolean {
    return this._isSignedIn;
  }

  get usedData(): unknown {
    return undefined;
  }

  setIsSignedIn = (isSignedIn: boolean): void => {
    this._isSignedIn = isSignedIn;
  };

  checkAuthStatusOnLoad = async (): Promise<void> => {
    const isSignedIn = await checkAuthStatusRequest();

    this.setIsSignedIn(isSignedIn);
  };

  logout = async (): Promise<void> => {
    await logoutRequest();

    this.setIsSignedIn(false);
  };
}

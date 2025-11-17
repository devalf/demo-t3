import { Container } from 'inversify';

import {
  AuthInterceptorService,
  type IAuthInterceptorService,
} from '../../http';
import {
  CartManager,
  ModalManager,
  RefreshTokenManager,
  ToastManager,
} from '../../store';
import type {
  ICartManager,
  IModalManager,
  IRefreshTokenManager,
  IToastManager,
  IUserManager,
} from '../../store/interfaces';
import { UserManager } from '../../store/user-manager/user-manager';

import { DependencyType } from './dependency-type';

export class DiContainer {
  public inversifyContainer: Container;

  public constructor() {
    this.inversifyContainer = new Container({ defaultScope: 'Singleton' });

    this.inversifyContainer
      .bind<ICartManager>(DependencyType.CartManager)
      .to(CartManager);

    this.inversifyContainer
      .bind<IModalManager>(DependencyType.ModalManager)
      .to(ModalManager);

    this.inversifyContainer
      .bind<IUserManager>(DependencyType.UserManager)
      .to(UserManager);

    this.inversifyContainer
      .bind<IToastManager>(DependencyType.ToastManager)
      .to(ToastManager);

    this.inversifyContainer
      .bind<IRefreshTokenManager>(DependencyType.RefreshTokenManager)
      .to(RefreshTokenManager);

    this.inversifyContainer
      .bind<IAuthInterceptorService>(DependencyType.AuthInterceptorService)
      .to(AuthInterceptorService);
  }

  public get refreshTokenManager(): IRefreshTokenManager {
    return this.inversifyContainer.get<IRefreshTokenManager>(
      DependencyType.RefreshTokenManager
    );
  }

  public get userManager(): IUserManager {
    return this.inversifyContainer.get<IUserManager>(
      DependencyType.UserManager
    );
  }

  public get authInterceptorService(): IAuthInterceptorService {
    return this.inversifyContainer.get<IAuthInterceptorService>(
      DependencyType.AuthInterceptorService
    );
  }
}

let diContainer: DiContainer;

if (typeof module !== 'undefined' && module.hot?.data?.diContainer) {
  diContainer = module.hot.data.diContainer;
} else {
  diContainer = new DiContainer();
}

if (typeof module !== 'undefined' && module.hot) {
  module.hot.dispose((data) => {
    data.diContainer = diContainer;
  });
}

export { diContainer };

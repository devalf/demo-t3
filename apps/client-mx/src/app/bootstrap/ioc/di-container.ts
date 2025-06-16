import { Container } from 'inversify';

import {
  CartManager,
  ModalManager,
  StoreExampleOne,
  StoreExampleTwo,
} from '../../store';
import {
  ICartManager,
  IModalManager,
  IStoreExampleOne,
  IStoreExampleTwo,
} from '../../store/interfaces';
import { IUserManager } from '../../store/interfaces/iuser-manager';
import { UserManager } from '../../store/user-manager/user-manager';

import { DependencyType } from './dependency-type';

export class DiContainer {
  public inversifyContainer: Container;

  public constructor() {
    this.inversifyContainer = new Container({ defaultScope: 'Singleton' });

    this.inversifyContainer
      .bind<IStoreExampleOne>(DependencyType.StoreExampleOne)
      .to(StoreExampleOne);

    this.inversifyContainer
      .bind<IStoreExampleTwo>(DependencyType.StoreExampleTwo)
      .to(StoreExampleTwo);

    this.inversifyContainer
      .bind<ICartManager>(DependencyType.CartManager)
      .to(CartManager);

    this.inversifyContainer
      .bind<IModalManager>(DependencyType.ModalManager)
      .to(ModalManager);

    this.inversifyContainer
      .bind<IUserManager>(DependencyType.UserManager)
      .to(UserManager);
  }

  public get storeExampleOne(): IStoreExampleOne {
    return this.inversifyContainer.get<IStoreExampleOne>(
      DependencyType.StoreExampleOne
    );
  }
}

export const diContainer = new DiContainer();

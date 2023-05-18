import { Container } from 'inversify';

import { StoreExampleOne, StoreExampleTwo } from '../../store';
import { IStoreExampleOne, IStoreExampleTwo } from '../../store/interfaces';

import { DependencyType } from './DependencyType';

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
  }

  public get storeExampleOne(): IStoreExampleOne {
    return this.inversifyContainer.get<IStoreExampleOne>(
      DependencyType.StoreExampleOne
    );
  }
}

export const diContainer = new DiContainer();

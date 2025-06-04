import { Container } from 'inversify';

import {
  ICartManager,
  IStoreExampleOne,
  IStoreExampleTwo,
} from '../../store/interfaces';
import {
  createCartManagerMock,
  createStoreExampleOneMock,
  createStoreExampleTwoMock,
} from '../../store/__dummy__';

import { DependencyType } from './dependency-type';

export function createTestContainer(): Container {
  const inversifyContainer = new Container({ defaultScope: 'Singleton' });

  inversifyContainer
    .bind<IStoreExampleOne>(DependencyType.StoreExampleOne)
    .toConstantValue(createStoreExampleOneMock());

  inversifyContainer
    .bind<IStoreExampleTwo>(DependencyType.StoreExampleTwo)
    .toConstantValue(createStoreExampleTwoMock());

  inversifyContainer
    .bind<ICartManager>(DependencyType.CartManager)
    .toConstantValue(createCartManagerMock());

  return inversifyContainer;
}

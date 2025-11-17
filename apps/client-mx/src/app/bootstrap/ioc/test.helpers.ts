import { Container } from 'inversify';

import {
  ICartManager,
  IStoreExampleOne,
  IStoreExampleTwo,
  IToastManager,
} from '../../store/interfaces';
import {
  createCartManagerMock,
  createStoreExampleOneMock,
  createStoreExampleTwoMock,
  createToastManagerMock,
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

  inversifyContainer
    .bind<IToastManager>(DependencyType.ToastManager)
    .toConstantValue(createToastManagerMock());

  return inversifyContainer;
}

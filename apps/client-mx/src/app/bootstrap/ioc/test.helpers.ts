import { Container } from 'inversify';

import { IStoreExampleOne, IStoreExampleTwo } from '../../store/interfaces';
import {
  createStoreExampleOneMock,
  createStoreExampleTwoMock,
} from '../../store/__dummy__';

import { DependencyType } from './DependencyType';

export function createTestContainer(): Container {
  const inversifyContainer = new Container({ defaultScope: 'Singleton' });

  inversifyContainer
    .bind<IStoreExampleOne>(DependencyType.StoreExampleOne)
    .toConstantValue(createStoreExampleOneMock());

  inversifyContainer
    .bind<IStoreExampleTwo>(DependencyType.StoreExampleTwo)
    .toConstantValue(createStoreExampleTwoMock());

  return inversifyContainer;
}

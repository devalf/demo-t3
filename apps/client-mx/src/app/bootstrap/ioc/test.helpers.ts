import { Container } from 'inversify';

import { ICartManager, IToastManager } from '../../store/interfaces';
import {
  createCartManagerMock,
  createToastManagerMock,
} from '../../store/__dummy__';

import { DependencyType } from './dependency-type';

export function createTestContainer(): Container {
  const inversifyContainer = new Container({ defaultScope: 'Singleton' });

  inversifyContainer
    .bind<ICartManager>(DependencyType.CartManager)
    .toConstantValue(createCartManagerMock());

  inversifyContainer
    .bind<IToastManager>(DependencyType.ToastManager)
    .toConstantValue(createToastManagerMock());

  return inversifyContainer;
}

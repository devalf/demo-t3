import { Container } from 'inversify';
import { FC, PropsWithChildren } from 'react';

import { ICartManager, IToastManager } from '../../store/interfaces';
import {
  createCartManagerMock,
  createToastManagerMock,
} from '../../store/__dummy__';

import { DependencyType } from './dependency-type';
import { Provider } from './inversify-context';

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

export function createInversifyProviderMock(
  container: Container
): FC<PropsWithChildren> {
  return ({ children }) => (
    <Provider container={container}>{children}</Provider>
  );
}

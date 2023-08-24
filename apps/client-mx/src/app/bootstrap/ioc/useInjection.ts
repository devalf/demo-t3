import { useContext } from 'react';
import type { interfaces } from 'inversify';

import { InversifyContext } from './InversifyContext';

export function useInjection<T>(
  serviceIdentifier: interfaces.ServiceIdentifier<T>
): T {
  const { container } = useContext(InversifyContext);

  if (!container) {
    throw new Error();
  }

  return container.get<T>(serviceIdentifier);
}

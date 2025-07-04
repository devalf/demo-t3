import { useContext } from 'react';
import type { interfaces } from 'inversify';

import { InversifyContext } from './inversify-context';
import { DependencyType } from './dependency-type';

export function useInjection<T>(
  serviceIdentifier: interfaces.ServiceIdentifier<T>
): T {
  const { container } = useContext(InversifyContext);

  if (!container) {
    throw new Error(
      'InversifyContext container is not available. Make sure your component is wrapped with Provider.'
    );
  }

  try {
    return container.get<T>(serviceIdentifier);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes(
          'No matching bindings found for serviceIdentifier'
        )
      ) {
        let dependencyName = 'Unknown';

        for (const [key, value] of Object.entries(DependencyType)) {
          if (value === serviceIdentifier) {
            dependencyName = key;
            break;
          }
        }

        const isClassReference =
          typeof serviceIdentifier === 'function' &&
          serviceIdentifier.toString().startsWith('class');

        throw new Error(
          `Dependency injection failed for ${dependencyName}. ${
            isClassReference
              ? `Use DependencyType.${serviceIdentifier.name} instead of direct class reference.`
              : 'The dependency may not be registered in the container.'
          }`
        );
      }
    }

    throw error;
  }
}

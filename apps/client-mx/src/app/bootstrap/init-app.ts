import { loadGTM } from '../utils';

import { diContainer } from './ioc/di-container';

export const initApp = async () => {
  // 'Resolve at the root, inject everywhere else' - principal
  // this is not a business logic, this is init of infrastructure. So such a call in general is fine
  diContainer.authInterceptorService.setupInterceptors();

  loadGTM();
};

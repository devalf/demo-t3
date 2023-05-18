import { diContainer } from './ioc/DiContainer';

export async function initApp() {
  const exampleStrFromStore =
    await diContainer.storeExampleOne.getExampleOneMethod();

  console.log('log string from store method on init', exampleStrFromStore);
}

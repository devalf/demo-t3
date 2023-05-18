import { IStoreExampleTwo } from '../interfaces';

export const createStoreExampleTwoMock = (): IStoreExampleTwo => ({
  getExampleTwoMethod: () => 5,
  getStringFromStoreExampleOne: () => 'String from Store Example One',
});

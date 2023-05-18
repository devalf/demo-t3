import { IStoreExampleOne } from '../interfaces';

export const createStoreExampleOneMock = (): IStoreExampleOne => ({
  getExampleOneMethod: () => 'Example One',
});

import { makeAutoObservable } from 'mobx';
import { injectable } from 'inversify';

import { IStoreExampleOne } from '../interfaces';

@injectable()
export class StoreExampleOne implements IStoreExampleOne {
  public constructor() {
    makeAutoObservable(this);
  }

  getExampleOneMethod = () => {
    return 'Example One';
  };
}

import { makeAutoObservable } from 'mobx';
import { inject, injectable } from 'inversify';

import type { IStoreExampleOne, IStoreExampleTwo } from '../interfaces';
import { DependencyType } from '../../bootstrap/ioc/DependencyType';

@injectable()
export class StoreExampleTwo implements IStoreExampleTwo {
  public constructor(
    @inject(DependencyType.StoreExampleOne)
    protected storeExampleOne: IStoreExampleOne
  ) {
    makeAutoObservable(this);
  }

  getExampleTwoMethod(): number {
    return 5;
  }

  getStringFromStoreExampleOne(): string {
    return this.storeExampleOne.getExampleOneMethod();
  }
}

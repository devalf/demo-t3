import { makeAutoObservable, runInAction } from 'mobx';
import { injectable } from 'inversify';

import { IModalManager, ModalOptions } from '../interfaces';
import { ModalID } from '../../components/modal/modal';

@injectable()
export class ModalManager implements IModalManager {
  constructor() {
    makeAutoObservable(this);
  }

  private _isOpen = false;

  get isOpen(): boolean {
    return this._isOpen;
  }

  private _modalTemplate: ModalID | null = null;

  get modalTemplate(): ModalID | null {
    return this._modalTemplate || null;
  }

  private _modalProps: ModalOptions = {};

  get modalProps(): ModalOptions {
    return this._modalProps;
  }

  showModal = (modalTemplate: ModalID, options: ModalOptions = {}): void => {
    this._modalTemplate = modalTemplate;
    this._modalProps = options;
    this._isOpen = true;
  };

  closeModal = (): void => {
    if (this._modalProps.onClose) {
      this._modalProps.onClose();
    }

    this._isOpen = false;

    setTimeout(() => {
      runInAction(() => {
        this._modalTemplate = null;
        this._modalProps = {};
      });
    }, 300);
  };

  acceptModal = (result?: unknown): void => {
    if (this._modalProps.onAccept) {
      this._modalProps.onAccept(result);
    }

    this.closeModal();
  };

  rejectModal = (result?: unknown): void => {
    if (this._modalProps.onReject) {
      this._modalProps.onReject(result);
    }

    this.closeModal();
  };
}

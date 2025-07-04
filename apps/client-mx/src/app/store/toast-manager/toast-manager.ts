import { makeAutoObservable } from 'mobx';
import { injectable } from 'inversify';
import { ReactNode } from 'react';

import { IToastManager, ToastOptions, ToastVariant } from '../interfaces';
import { TOAST_HIDE_DURATION_MS } from '../../constants';

@injectable()
export class ToastManager implements IToastManager {
  private _onClose: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private _isOpen = false;

  get isOpen(): boolean {
    return this._isOpen;
  }

  private _message = '';

  get message(): string {
    return this._message;
  }

  private _variant: ToastVariant = 'info';

  get variant(): ToastVariant {
    return this._variant;
  }

  private _autoHideDuration = TOAST_HIDE_DURATION_MS;

  get autoHideDuration(): number {
    return this._autoHideDuration;
  }

  private _action: ReactNode | null = null;

  get action(): ReactNode | null {
    return this._action;
  }

  showToast = (options: ToastOptions): void => {
    const {
      message,
      variant = 'info',
      autoHideDuration = TOAST_HIDE_DURATION_MS,
      action = null,
      onClose,
    } = options;

    this._message = message;
    this._variant = variant;
    this._autoHideDuration = autoHideDuration;
    this._action = action;
    this._onClose = onClose || null;
    this._isOpen = true;
  };

  closeToast = (): void => {
    this._isOpen = false;

    if (this._onClose) {
      this._onClose();
    }

    // Reset after animation completed
    setTimeout(() => {
      this._message = '';
      this._variant = 'info';
      this._autoHideDuration = TOAST_HIDE_DURATION_MS;
      this._action = null;
      this._onClose = null;
    }, 300);
  };
}

import { IToastManager } from '../interfaces';

export const createToastManagerMock = (): IToastManager => ({
  isOpen: false,
  message: '',
  variant: 'info',
  autoHideDuration: 5000,
  action: null,
  showToast: () => {
    //
  },
  closeToast: () => {
    //
  },
});

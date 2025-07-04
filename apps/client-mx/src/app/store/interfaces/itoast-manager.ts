import { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  autoHideDuration?: number;
  action?: ReactNode;
  onClose?: () => void;
};

export interface IToastManager {
  isOpen: boolean;
  message: string;
  variant: ToastVariant;
  autoHideDuration: number;
  action: ReactNode | null;

  showToast(options: ToastOptions): void;
  closeToast(): void;
}

import { extractErrorMessage } from '@demo-t3/utils';

import type { IToastManager } from '../store/interfaces';

export type HandleErrorOptions = {
  customMessage?: string;
  logToConsole?: boolean;
  context?: string;
};

/**
 * Handles errors by extracting the message and displaying it in a toast.
 * This is a standalone utility that can be used in MobX classes, regular functions,
 * or anywhere you have access to the ToastManager.
 *
 * @param error - The error object to handle
 * @param toastManager - The toast manager instance to display the error
 * @param options - Optional configuration for error handling
 *
 * @example
 * ```typescript
 * // In a MobX class
 * class UserManager {
 *   constructor(
 *     @inject(DependencyType.ToastManager)
 *     private readonly toastManager: IToastManager
 *   ) {}
 *
 *   async fetchUserData() {
 *     try {
 *       const data = await fetchUserProfileData();
 *       this.setUserData(data);
 *     } catch (error) {
 *       handleErrorWithToast(error, this.toastManager, {
 *         context: 'fetchUserData',
 *       });
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom message
 * handleErrorWithToast(error, toastManager, {
 *   customMessage: 'Failed to load user profile',
 *   logToConsole: true,
 * });
 * ```
 */
export const handleErrorWithToast = (
  error: unknown,
  toastManager: IToastManager,
  options: HandleErrorOptions = {}
): void => {
  const { customMessage, logToConsole = true, context } = options;
  const errorMessage = customMessage || extractErrorMessage(error);

  toastManager.showToast({
    message: errorMessage,
    variant: 'error',
  });

  if (logToConsole) {
    const logContext = context ? `[${context}]` : '';

    console.error(`${logContext} Error:`, error);
  }
};

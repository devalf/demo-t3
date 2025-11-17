import { DependencyType } from '../bootstrap/ioc/dependency-type';
import { useInjection } from '../bootstrap/ioc/use-injection';
import { IToastManager } from '../store/interfaces';
import { type HandleErrorOptions, handleErrorWithToast } from '../utils';

/**
 * A reusable hook for handling mutation errors consistently across the app.
 * Extracts error messages from various error formats and displays them in a toast.
 *
 * This hook wraps the `handleErrorWithToast` utility and automatically injects
 * the ToastManager dependency, making it convenient for use in React components
 * and custom hooks.
 *
 * @param options - Optional configuration for error handling
 * @returns Error handler function to be used in mutation's onError callback
 *
 * @example
 * ```typescript
 * // Basic usage
 * const handleError = useMutationErrorHandler();
 *
 * useMutation({
 *   mutationFn: signUpRequest,
 *   onError: handleError,
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With custom message
 * const handleError = useMutationErrorHandler({
 *   customMessage: 'Failed to sign up. Please try again.',
 * });
 *
 * useMutation({
 *   mutationFn: signUpRequest,
 *   onError: handleError,
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With context for debugging
 * const handleError = useMutationErrorHandler({
 *   context: 'SignUpMutation',
 * });
 *
 * useMutation({
 *   mutationFn: signUpRequest,
 *   onError: handleError,
 * });
 * ```
 */
export const useMutationErrorHandler = (options: HandleErrorOptions = {}) => {
  const toastManager = useInjection<IToastManager>(DependencyType.ToastManager);

  return (error: unknown) => {
    handleErrorWithToast(error, toastManager, options);
  };
};

import { get } from 'lodash-es';

import { errorCodeKeyMap } from './error-code-key-map';

/**
 * Extracts a human-readable error message from various error object formats.
 * Tries multiple potential paths where error messages might be located.
 * Handles both string and array message formats.
 *
 * @param error - The error object to extract a message from
 * @returns A string containing the most relevant error message
 */
export const extractErrorMessage = (error: unknown): string => {
  const errorPaths = [
    'response.data.message', // Common Axios error path
    'data.message', // Another common API error path
    'message', // Standard Error object message
    'error.message', // Nested error object
    'error', // Simple error string in error property
    'cause.errors[0].error', // Nested error arrays
    'cause.message', // Error cause message
    'cause.status', // Error status code
    'status', // HTTP status code
    'code', // Error code
  ];

  for (const path of errorPaths) {
    const errorValue: unknown = get(error, path, null);

    // Handle array of error messages (e.g., ["password is not strong enough"])
    if (Array.isArray(errorValue) && errorValue.length > 0) {
      const firstMessage = errorValue[0];

      if (typeof firstMessage === 'string') {
        return firstMessage.trim();
      }
    }

    if (typeof errorValue === 'string') {
      const trimmedErrorValue = errorValue.trim();
      const status = get(error, 'status', '') || get(error, 'cause.status', '');

      if (
        path === 'cause.errors[0].error' ||
        path === 'cause.status' ||
        path === 'status' ||
        path === 'code' ||
        status
      ) {
        const errorKeyOrValue = trimmedErrorValue || status;

        // Return the mapped value if it exists, otherwise the original error
        return errorCodeKeyMap[errorKeyOrValue] || trimmedErrorValue;
      }

      return trimmedErrorValue;
    }
  }

  const configData = get(error, 'config.data');

  if (configData && typeof configData === 'string') {
    try {
      const parsedData = JSON.parse(configData);

      if (parsedData.message && typeof parsedData.message === 'string') {
        return parsedData.message.trim();
      }
    } catch {
      // Parsing failed, continue with fallback
    }
  }

  return 'Unknown error';
};

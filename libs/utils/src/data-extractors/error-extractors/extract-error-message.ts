import { get, isString } from 'lodash-es';

import { errorCodeKeyMap } from './error-code-key-map';

/**
 * Extracts a human-readable error message from various error object formats.
 * Tries multiple potential paths where error messages might be located.
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
    const errorValue = get(error, path, null);

    if (errorValue && isString(errorValue)) {
      const trimmedErrorValue = (errorValue as string).trim();
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

  if (configData && isString(configData)) {
    try {
      const parsedData = JSON.parse(configData);

      if (parsedData.message && isString(parsedData.message)) {
        return parsedData.message.trim();
      }
    } catch {
      // Parsing failed, continue with fallback
    }
  }

  return 'Unknown error';
};

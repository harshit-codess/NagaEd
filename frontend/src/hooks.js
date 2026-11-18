import { useCallback, useState } from 'react';
import { ApiError } from './services/api.js';

/** Wraps an async action with loading + error state. */
export function useAsyncAction(action) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        return await action(...args);
      } catch (err) {
        setError(err instanceof ApiError ? err : new ApiError('Unexpected error. Please try again.'));
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [action]
  );

  return { run, loading, error, clearError: () => setError(null) };
}

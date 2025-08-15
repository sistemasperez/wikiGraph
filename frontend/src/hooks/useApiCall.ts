import { useState, useCallback } from 'react';

type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

export const useApiCall = <T extends any[], R>(
  apiFunction: AsyncFunction<T, R>
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: T): Promise<R | undefined> => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const result = await apiFunction(...args);
        return result;
      } catch (e: any) {
        setError(e.message);
        // Re-throw to allow caller to handle if needed
        throw e; // Propagate the error
      } finally {
        setLoading(false);
      }
    },
    [apiFunction] // Dependency array for useCallback
  );

  return { execute, loading, error };
};

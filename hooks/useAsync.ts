import { useState, useEffect, useCallback, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
): AsyncState<T> & {
  execute: () => Promise<T | undefined>;
  reset: () => void;
} {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction();

      if (mountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
      }

      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err });
        onError?.(err);
      }

      throw err;
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      execute();
    }

    return () => {
      mountedRef.current = false;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for managing multiple async operations
export function useAsyncQueue() {
  const [queue, setQueue] = useState<Promise<any>[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [errors, setErrors] = useState<Error[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addToQueue = useCallback((promise: Promise<any>) => {
    setQueue(prev => [...prev, promise]);
  }, []);

  const executeQueue = useCallback(async () => {
    if (queue.length === 0) return;

    setIsComplete(false);
    setResults([]);
    setErrors([]);

    try {
      const resolvedResults = await Promise.allSettled(queue);

      const successful: any[] = [];
      const failed: Error[] = [];

      resolvedResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push(result.reason);
        }
      });

      setResults(successful);
      setErrors(failed);
    } finally {
      setIsComplete(true);
      setQueue([]);
    }
  }, [queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setResults([]);
    setErrors([]);
    setIsComplete(false);
  }, []);

  return {
    queue,
    results,
    errors,
    isComplete,
    addToQueue,
    executeQueue,
    clearQueue,
    hasErrors: errors.length > 0,
  };
}
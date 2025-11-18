import { useCallback, useEffect, useState } from 'react';

export type UseFetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export function useFetch<T = unknown>(input: RequestInfo, init?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetcher = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(input, { ...init, signal });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = (await res.json()) as T;
      setData(json);
      return json;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err);
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [input, init]);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal).catch(() => {
      /* handled in fetcher */
    });
    return () => controller.abort();
  }, [fetcher]);

  return {
    data,
    loading,
    error,
    refetch: (signal?: AbortSignal) => fetcher(signal),
  } as UseFetchState<T> & { refetch: (signal?: AbortSignal) => Promise<T | void> };
}

export default useFetch;

import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../api';

export function useApi<T>(factory: () => Promise<T>, deps: unknown[], enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const next = await factory();
      setData(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [enabled, ...deps]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void load();
  }, [enabled, load]);

  return { data, error, loading, reload: load, setData };
}

import { useState, useEffect, useRef } from 'react';

// Calls fetchFn every intervalMs, storing the latest result.
// Reused across every page instead of duplicating setInterval logic.
export function usePolling(fetchFn, intervalMs = 2000, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const savedFetch = useRef(fetchFn);
  savedFetch.current = fetchFn;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await savedFetch.current();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    const interval = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}
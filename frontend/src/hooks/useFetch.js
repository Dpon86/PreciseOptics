/**
 * useFetch - Generic data-fetching hook
 *
 * Eliminates the repeated loading/error/data useState + useEffect boilerplate
 * found throughout page components.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(apiService.getPatients);
 *   const { data, loading, error, refetch } = useFetch(
 *     () => apiService.getPatients({ limit: 20 }),
 *     []           // deps - refetch when these change
 *   );
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a stable reference to fetchFn so callers can pass inline arrow functions
  // without causing infinite re-render loops.
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFnRef.current();
      const result = response?.data;
      // Support both paginated (results array) and plain array responses
      setData(result?.results ?? result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-run whenever deps change (behaves like useEffect dependencies)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { execute(); }, deps);

  return { data, loading, error, refetch: execute };
};

export default useFetch;

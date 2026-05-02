/**
 * useDebounce - Debounces a value for N milliseconds
 *
 * Useful for search inputs to avoid making an API call on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 300);
 *   useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

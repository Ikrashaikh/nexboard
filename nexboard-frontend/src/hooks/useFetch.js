import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../utils/errorHandler';

/**
 * Generic data-fetching hook.
 * @param {Function} fetchFn - async function that returns a response with .data
 * @param {Array}    deps    - dependency array (re-fetches when these change)
 * @param {boolean}  skip    - if true, does not fetch (useful for conditional fetches)
 */
export function useFetch(fetchFn, deps = [], skip = false) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError]     = useState(null);

  const fetch_ = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

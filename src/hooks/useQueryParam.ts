import { useLocation } from 'react-router';
import { useMemo } from 'react';

function useQueryParam(key: string): string | undefined {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  return useMemo(() => searchParams.get(key) || undefined, [searchParams, key]);
}

export default useQueryParam;

import { useLocation } from 'react-router';
import { useEffect, useMemo, useState } from 'react';

function useQueryParam(key: string): string | undefined {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [param, setParam] = useState<string | undefined>(searchParams.get(key) || undefined);

  useEffect(() => {
    setParam(searchParams.get(key) || undefined);
  }, [searchParams]);

  return param;
}

export default useQueryParam;

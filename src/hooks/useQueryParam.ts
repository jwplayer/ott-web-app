import { useLocation } from 'react-router';
import { useEffect, useState } from 'react';

function useQueryParam(key: string): string | undefined {
  const [param, setParam] = useState<string | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(location.search);

    setParam(urlSearchParams.get(key) || undefined);
  }, [location]);

  return param;
}

export default useQueryParam;

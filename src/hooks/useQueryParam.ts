import { useLocation } from 'react-router';
import { useEffect, useState } from 'react';

function useQueryParam(key: string): string | null {
  const [param, setParam] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(location.search);

    setParam(urlSearchParams.get(key));
  }, [location]);

  return param;
}

export default useQueryParam;

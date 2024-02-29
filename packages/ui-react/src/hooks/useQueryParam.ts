import { useSearchParams } from 'react-router-dom';

function useQueryParam(key: string): string | null {
  const [searchParams] = useSearchParams();

  return searchParams.get(key);
}

export default useQueryParam;

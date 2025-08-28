import { useSearchParams } from 'next/navigation';

function useQueryParam(key: string): string | null {
  const searchParams = useSearchParams();

  return searchParams.get(key);
}

export default useQueryParam;

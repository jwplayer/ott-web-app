import { MutableRefObject, useEffect, useRef } from 'react';

import { debounce } from '#src/utils/common';

const useDebounce = <T extends (...args: any[]) => unknown>(callback: T, time: number) => {
  const fnRef = useRef() as MutableRefObject<T | undefined>;
  const debounceRef = useRef(
    debounce((...rest) => {
      if (fnRef.current) fnRef.current(...rest);
    }, time),
  );

  useEffect(() => {
    fnRef.current = callback;
  }, [callback]);

  return debounceRef.current;
};

export default useDebounce;

import { useEffect, useRef } from 'react';

const useFirstRender = () => {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    firstRenderRef.current = false;
  }, []);

  return firstRenderRef.current;
};

export default useFirstRender;

import { useEffect, useRef, useState } from 'react';

const useCountdown = (durationSeconds: number, intervalSeconds: number = 1, completeHandler?: () => void) => {
  const timerRef = useRef<number>();
  const [countdown, setCountdown] = useState(durationSeconds);

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    if (countdown === 0) {
      if (completeHandler) completeHandler();
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setCountdown((count) => count - intervalSeconds);
    }, intervalSeconds * 1000);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [countdown]);

  return countdown;
};

export default useCountdown;

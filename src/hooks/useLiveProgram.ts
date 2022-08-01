import { useEffect, useState } from 'react';

import type { EpgProgram } from '#src/services/epg.service';
import { programIsFullyWatchable, programIsLive, programIsVod } from '#src/utils/epg';

/**
 * This hook returns memoized program state variables that change based on the given program and the current time.
 * For example, the live and VOD states, toggle when the program is not live anymore.
 */
const useLiveProgram = (program: EpgProgram | undefined, catchupHours: number | undefined) => {
  const [isLive, setIsLive] = useState(false);
  const [isVod, setIsVod] = useState(false);
  const [isWatchableFromBeginning, setIsWatchableFromBeginning] = useState(false);

  // update when the program changes
  useEffect(() => {
    const calculateStatus = () => {
      setIsLive(!!program && programIsLive(program));
      setIsVod(!!program && programIsVod(program));
      setIsWatchableFromBeginning(!!program && programIsFullyWatchable(program, catchupHours));
    };

    // recalculate the program status every 5 seconds
    const intervalId = setInterval(calculateStatus, 5_000);

    // immediately update the program status when the program changes
    calculateStatus();

    return () => clearInterval(intervalId);
  }, [program]);

  return {
    isLive,
    isVod,
    isWatchableFromBeginning,
  };
};

export default useLiveProgram;

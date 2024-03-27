import React, { useCallback, useLayoutEffect, useRef } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The `useEventCallback` hook can be compared to the `useCallback` hook but without dependencies. It is a "shortcut"
 * to prevent re-renders based on callback changes due to dependency changes. This can be useful to improve the
 * performance or to prevent adding/removing event listeners to third-party libraries such as JW Player.
 *
 * @see {https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down}
 *
 * @param {function} [callback]
 */
const useEventCallback = <T extends (...args: any[]) => unknown>(callback?: T): T => {
  const fnRef = useRef(() => {
    throw new Error('Callback called in render');
  }) as unknown as React.MutableRefObject<T | undefined>;

  useLayoutEffect(() => {
    fnRef.current = callback;
  }, [callback]);

  // @ts-ignore
  // ignore since we just want to pass all arguments to the callback function (which we don't know)
  return useCallback((...args) => {
    if (typeof fnRef.current === 'function') {
      return fnRef.current(...args);
    }
  }, []);
};

export default useEventCallback;

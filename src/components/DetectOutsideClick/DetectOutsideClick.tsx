import React, { useEffect, RefObject } from 'react';

type Prop = {
  el?: RefObject<HTMLDivElement>;
  callback: () => void;
  isActive: boolean;
  children: React.ReactNode;
};

const DetectOutsideClick = ({ el, callback, isActive, children }: Prop) => {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // If the active element exists and is clicked outside of
      if (isActive && el?.current !== null && !el?.current?.contains(event.target as Node)) {
        callback();
      }
    };

    // If the item is active (ie open) then listen for clicks outside
    if (isActive) {
      setTimeout(() => window.addEventListener('click', onClick), 0);
    }

    return () => {
      window.removeEventListener('click', onClick);
    };
  }, [isActive, el, callback]);

  return <React.Fragment>{children}</React.Fragment>;
};

export default DetectOutsideClick;

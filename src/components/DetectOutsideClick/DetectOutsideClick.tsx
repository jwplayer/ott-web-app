import React, { useEffect, useRef } from 'react';

type Prop = {
  callback: () => void;
  children: React.ReactElement;
};

const DetectOutsideClick = ({ callback, children }: Prop) => {
  const elementRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!elementRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (elementRef.current !== event.target && !elementRef.current?.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
  }, [callback]);

  return React.cloneElement(children, {
    ref: (node: HTMLDivElement) => {
      elementRef.current = node;
    },
  });
};

export default DetectOutsideClick;

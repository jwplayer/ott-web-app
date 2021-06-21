import React, { useState, useEffect, ReactNode, useRef, CSSProperties } from 'react';

type Props = {
  createStyle: (status: Status) => CSSProperties;
  open?: boolean;
  duration?: number;
  delay?: number;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
  children: ReactNode;
};

export type Status = 'opening' | 'open' | 'closing' | 'closed';

const Animation = ({
  createStyle,
  open = true,
  duration = 250,
  delay = 0,
  onOpenAnimationEnd,
  onCloseAnimationEnd,
  children,
}: Props): JSX.Element | null => {
  const [status, setStatus] = useState<Status>('closed');
  const [hasOpenedBefore, setHasOpenedBefore] = useState<boolean>(false);
  const seconds = duration / 1000;
  const transition = `transform ${seconds}s ease-out`; // todo: -webkit-transform;

  const timeout = useRef<NodeJS.Timeout>();
  const timeout2 = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (timeout2.current) clearTimeout(timeout2.current);
    if (open) {
      setHasOpenedBefore(true);
      timeout.current = setTimeout(() => setStatus('opening'), delay);
      timeout2.current = setTimeout(() => {
        setStatus('open');
        onOpenAnimationEnd && onOpenAnimationEnd();
      }, duration + delay);
    } else if (hasOpenedBefore) {
      timeout.current = setTimeout(() => setStatus('closing'), delay);
      timeout2.current = setTimeout(() => {
        setStatus('closed');
        onCloseAnimationEnd && onCloseAnimationEnd();
      }, duration + delay);
    }
  }, [duration, delay, transition, open, onOpenAnimationEnd, onCloseAnimationEnd, hasOpenedBefore, setHasOpenedBefore]);

  if (!open && status === 'closed') {
    return null;
  }

  return <div style={createStyle(status)}>{children}</div>;
};

export default Animation;

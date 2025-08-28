import React, { type CSSProperties, type ReactNode } from 'react';

import Animation, { type Status } from '../Animation';

type Props = {
  open?: boolean;
  duration?: number;
  delay?: number;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
  children: ReactNode;
  className?: string;
};

const Grow = ({ open = true, duration = 250, delay = 0, onOpenAnimationEnd, onCloseAnimationEnd, children, className }: Props): JSX.Element | null => {
  const seconds = duration / 1000;
  const transition = `transform ${seconds}s ease-out`; // todo: -webkit-transform;
  const createStyle = (status: Status): CSSProperties => ({
    transition,
    transform: status === 'opening' || status === 'open' ? 'scale(1)' : 'scale(0.7)',
  });

  return (
    <Animation
      createStyle={(status: Status) => createStyle(status)}
      open={open}
      duration={duration}
      delay={delay}
      onOpenAnimationEnd={onOpenAnimationEnd}
      onCloseAnimationEnd={onCloseAnimationEnd}
      className={className}
    >
      {children}
    </Animation>
  );
};

export default Grow;

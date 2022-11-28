import React, { ReactNode, CSSProperties } from 'react';

import Animation, { Status } from '#components/Animation/Animation';

type Props = {
  open?: boolean;
  duration?: number;
  delay?: number;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
  children: ReactNode;
  direction?: 'left' | 'top' | 'right' | 'bottom';
};

const Slide = ({ open = true, duration = 250, delay = 0, onOpenAnimationEnd, onCloseAnimationEnd, children, direction = 'top' }: Props): JSX.Element | null => {
  const seconds = duration / 1000;
  const transition = `transform ${seconds}s ease, opacity ${seconds}s ease`; // todo: -webkit-transform;
  const directions = {
    left: 'translate(-15px, 0)',
    top: 'translate(0, -15px)',
    right: 'translate(15px, 0)',
    bottom: 'translate(0, 15px)',
  };
  const createStyle = (status: Status): CSSProperties => ({
    transition,
    transform: status === 'opening' || status === 'open' ? 'translate(0, 0)' : directions[direction],
    opacity: status === 'opening' || status === 'open' ? 1 : 0,
    zIndex: 15,
  });

  return (
    <Animation
      createStyle={(status: Status) => createStyle(status)}
      open={open}
      duration={duration}
      delay={delay}
      onOpenAnimationEnd={onOpenAnimationEnd}
      onCloseAnimationEnd={onCloseAnimationEnd}
    >
      {children}
    </Animation>
  );
};

export default Slide;

import React, { CSSProperties } from 'react';

import Animation, { Status } from '#components/Animation/Animation';

type Props = {
  className?: string;
  open?: boolean;
  duration?: number;
  delay?: number;
  keepMounted?: boolean;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
};

const Fade: React.FC<Props> = ({ className, open = true, duration = 250, delay = 0, onOpenAnimationEnd, onCloseAnimationEnd, keepMounted, children }) => {
  const seconds = duration / 1000;
  const transition = `opacity ${seconds}s ease-in-out`;

  const createStyle = (status: Status): CSSProperties => ({
    transition,
    opacity: status === 'opening' || status === 'open' ? 1 : 0,
  });

  return (
    <Animation
      className={className}
      createStyle={(status: Status) => createStyle(status)}
      open={open}
      duration={duration}
      delay={delay}
      onOpenAnimationEnd={onOpenAnimationEnd}
      onCloseAnimationEnd={onCloseAnimationEnd}
      keepMounted={keepMounted}
    >
      {children}
    </Animation>
  );
};

export default Fade;

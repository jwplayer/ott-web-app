import React from 'react';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import styles from './MediaHeroButtons.module.scss';

const MediaHeroButtons = ({
  cta,
  children,
  buttonClassOverride = true,
}: {
  cta: React.ReactNode;
  children: React.ReactNode;
  buttonClassOverride?: boolean;
}) => {
  const breakpoint = useBreakpoint();
  const buttonClassName = buttonClassOverride ? (breakpoint < Breakpoint.md ? styles.rectangleButton : styles.roundButton) : undefined;

  const validChildren = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <div className={styles.buttonBar}>
      {cta}
      {validChildren.map((child) => React.cloneElement(child as React.ReactElement, { className: buttonClassName }))}
    </div>
  );
};

export default MediaHeroButtons;

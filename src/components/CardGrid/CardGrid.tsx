import React from 'react';

import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './CardGrid.module.scss';

// TEMP DATA
const cols = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

type CardGridProps = {
  children: React.ReactNode;
};

function CardGrid({ children }: CardGridProps) {
  const breakpoint: Breakpoint = useBreakpoint();

  return (
    <div
      className={styles.cardGrid}
      style={{
        gridTemplateColumns: `repeat(${cols[breakpoint]}, minmax(0,1fr))`,
      }}
    >
      {children}
    </div>
  );
}

export default CardGrid;

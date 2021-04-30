import React from 'react';

import useBreakpoint from '../../hooks/useBreakpoint';

import styles from './CardGrid.module.scss';

// TEMP DATA
const cols = { "xs": 2, "sm": 3, "md": 4, "lg": 5, "xl": 6 }

type CardGridProps = {
  children: React.ReactNode;
};

function CardGrid({
  children,
}: CardGridProps) {
  const breakpoint = useBreakpoint();

  return (
    <div
      className={styles.cardGrid}
      style={{ gridTemplateColumns: `repeat(${cols[breakpoint]}, minmax(0,1fr))` }}
    >
      {children}
    </div>
  );
}

export default CardGrid;

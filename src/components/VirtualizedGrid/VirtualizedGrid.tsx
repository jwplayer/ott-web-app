/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';
import { AutoSizer, Grid, WindowScroller } from 'react-virtualized';

import scrollbarSize from '../../utils/domHelpers';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './VirtualizedGrid.module.scss';

const cols = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

const calculateHeight = (
  width: number,
  rat1: number = 16,
  rat2: number = 9,
) => {
  const ratio = width / rat1;
  return ratio * rat2;
};

const VirtualizedGrid = ({ cellRenderer, length }: any) => {
  const windowScrollerRef = useRef(null);
  const breakpoint: Breakpoint = useBreakpoint();

  return (
    <WindowScroller ref={windowScrollerRef} scrollElement={window}>
      {({ height, isScrolling, registerChild }) => (
        <div className={styles.WindowScrollerWrapper}>
          <AutoSizer disableHeight>
            {({ width }) => {
              const correctWidth = width - 10;
              return (
                <div ref={registerChild}>
                  <Grid
                    cellRenderer={cellRenderer}
                    // onScroll={onChildScroll}
                    isScrolling={isScrolling}
                    // scrollTop={scrollTop}
                    columnCount={cols[breakpoint]}
                    columnWidth={correctWidth / cols[breakpoint]}
                    height={height - 200}
                    rowCount={length}
                    rowHeight={
                      calculateHeight(correctWidth / cols[breakpoint]) + 30
                    }
                    width={correctWidth}
                    getScrollbarSize={scrollbarSize}
                  />
                </div>
              );
            }}
          </AutoSizer>
        </div>
      )}
    </WindowScroller>
  );
};

export default VirtualizedGrid;

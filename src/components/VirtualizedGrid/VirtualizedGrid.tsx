import React from 'react';
import { Grid, WindowScroller, AutoSizer, GridCellRenderer } from 'react-virtualized';

import scrollbarSize from '../../utils/domHelpers';
import useBreakpoint, { Breakpoint, Breakpoints } from '../../hooks/useBreakpoint';

import styles from './VirtualizedGrid.module.scss';

type Props = {
  cellRenderer: GridCellRenderer;
  rowCount: number;
  cols: Breakpoints;
  spacing: number;
};

const calculateHeight = (width: number, rat1: number = 16, rat2: number = 9) => {
  const ratio = width / rat1;
  return ratio * rat2;
};

const VirtualizedGrid = ({ cellRenderer, rowCount, cols, spacing }: Props) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const columnCount = cols[breakpoint];

  return (
    <WindowScroller>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <Grid
              role="grid"
              className={styles.grid}
              tabIndex={-1}
              autoHeight
              cellRenderer={cellRenderer}
              onScroll={onChildScroll}
              isScrolling={isScrolling}
              scrollTop={scrollTop}
              columnCount={columnCount}
              columnWidth={width / columnCount}
              height={height}
              rowCount={rowCount}
              rowHeight={calculateHeight(width / columnCount) + spacing}
              width={width}
              getScrollbarSize={scrollbarSize}
            />
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
};

export default VirtualizedGrid;

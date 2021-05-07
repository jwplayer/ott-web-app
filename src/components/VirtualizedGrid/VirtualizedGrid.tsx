import React from 'react';
import { Grid, WindowScroller, AutoSizer, GridCellRenderer } from 'react-virtualized';

import scrollbarSize from '../../utils/domHelpers';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

type props = {
  cellRenderer: GridCellRenderer;
  rowCount: number;
  spacing: number;
};

const cols = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

const calculateHeight = (width: number, rat1: number = 16, rat2: number = 9) => {
  const ratio = width / rat1;
  return ratio * rat2;
};

const VirtualizedGrid = ({ cellRenderer, rowCount, spacing }: props) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const columnCount = cols[breakpoint];

  return (
    <WindowScroller>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <Grid
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

import { throttle } from '@jwp/ott-common/src/utils/common';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './LayoutGrid.module.scss';

type Props<Item> = {
  className?: string;
  columnCount: number;
  data: Item[];
  renderCell: (item: Item, tabIndex: number) => JSX.Element;
  getCellKey: (item: Item) => string;
};

const scrollIntoViewThrottled = throttle(function (focusedElement: HTMLElement) {
  focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, 300);

// Keyboard-accessible grid layout, with focus management
const LayoutGrid = <Item extends object>({ className, columnCount, data, renderCell, getCellKey }: Props<Item>) => {
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(data.length / columnCount);

  const focusGridCell = (rowIndex: number, columnIndex: number) => {
    const gridCell = document.getElementById(`layout_grid_${rowIndex}-${columnIndex}`) as HTMLDivElement | null;
    const focusableElement = gridCell?.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])') as HTMLElement | null;
    const elementToFocus = focusableElement || gridCell;

    setCurrentRowIndex(rowIndex);
    setCurrentColumnIndex(columnIndex);

    if (!elementToFocus) return;

    elementToFocus.focus({ preventScroll: true });
    scrollIntoViewThrottled(elementToFocus);
  };

  const handleKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const { key, ctrlKey } = event;

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) return;

    event.preventDefault();

    const maxRow = rowCount - 1;
    const isOnFirstColumn = currentColumnIndex === 0;
    const isOnLastColumn = currentColumnIndex === columnCount - 1;
    const isOnFirstRow = currentRowIndex === 0;
    const isOnLastRow = currentRowIndex === maxRow;
    const maxRightLastRow = (data.length % columnCount || columnCount) - 1; // Never go beyond last item
    const maxRight = isOnLastRow ? maxRightLastRow : columnCount - 1;

    const nextRowIndex = Math.min(currentRowIndex + 1, maxRow);
    const previousRowIndex = Math.max(currentRowIndex - 1, 0);

    switch (key) {
      case 'ArrowLeft':
        if (isOnFirstColumn && !isOnFirstRow) {
          // Move to last of previous row
          return focusGridCell(previousRowIndex, columnCount - 1);
        }
        return focusGridCell(currentRowIndex, Math.max(currentColumnIndex - 1, 0));
      case 'ArrowRight':
        if (isOnLastColumn && !isOnLastRow) {
          // Move to first of next row
          return focusGridCell(nextRowIndex, 0);
        }
        return focusGridCell(currentRowIndex, Math.min(currentColumnIndex + 1, maxRight));
      case 'ArrowUp':
        return focusGridCell(previousRowIndex, currentColumnIndex);
      case 'ArrowDown':
        return focusGridCell(nextRowIndex, nextRowIndex === maxRow ? Math.min(currentColumnIndex, maxRightLastRow) : currentColumnIndex);
      case 'Home':
        if (ctrlKey) {
          return focusGridCell(0, 0);
        }
        return focusGridCell(currentRowIndex, 0);
      case 'End':
        if (ctrlKey) {
          return focusGridCell(maxRow, maxRightLastRow);
        }
        return focusGridCell(currentRowIndex, maxRight);
      case 'PageUp':
        return focusGridCell(previousRowIndex, currentColumnIndex);
      case 'PageDown':
        return focusGridCell(nextRowIndex, nextRowIndex === maxRow ? Math.min(maxRightLastRow, currentColumnIndex) : currentColumnIndex);
      default:
        return;
    }
  });

  // When the window size changes, correct indexes if necessary
  useEffect(() => {
    // the focused element is not within the grid element
    if (!gridRef.current?.contains(document.activeElement)) {
      return;
    }

    const maxRightLastRow = (data.length % columnCount || columnCount) - 1; // Never go beyond last item

    if (currentColumnIndex > columnCount - 1) {
      return focusGridCell(currentRowIndex, columnCount - 1);
    }

    if (currentRowIndex === rowCount - 1 && currentColumnIndex > maxRightLastRow) {
      return focusGridCell(currentRowIndex, maxRightLastRow);
    }
    // this logic should only react when the column count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount]);

  const gridCellStyle = useMemo(() => ({ width: `${Math.floor((100 / columnCount) * 100) / 100}%` }), [columnCount]);

  return (
    <div role="grid" ref={gridRef} aria-rowcount={rowCount} className={className} onKeyDown={handleKeyDown}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div role="row" key={rowIndex} aria-rowindex={rowIndex + 1} className={styles.row}>
          {data.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount).map((item, columnIndex) => (
            <div
              role="gridcell"
              id={`layout_grid_${rowIndex}-${columnIndex}`}
              key={getCellKey(item)}
              aria-colindex={columnIndex + 1}
              className={styles.cell}
              style={gridCellStyle}
            >
              {renderCell(item, currentRowIndex === rowIndex && currentColumnIndex === columnIndex ? 0 : -1)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LayoutGrid;

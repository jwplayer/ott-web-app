// Keyboard-accessible grid layout, with focus management

import { throttle } from '@jwp/ott-common/src/utils/common';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './LayoutGrid.module.scss';

type Props<Item> = {
  className?: string;
  columnCount: number;
  data: Item[];
  renderCell: (item: Item, tabIndex: number) => JSX.Element;
};

const scrollIntoViewThrottled = throttle(function (focusedElement: HTMLElement) {
  focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, 300);

const LayoutGrid = <Item extends object>({ className, columnCount, data, renderCell }: Props<Item>) => {
  const [focused, setFocused] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(data.length / columnCount);

  const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
    if (event instanceof KeyboardEvent === false) return;

    const { key, ctrlKey } = event;

    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) return;

    event.preventDefault();

    const isOnFirstColumn = currentColumnIndex === 0;
    const isOnLastColumn = currentColumnIndex === columnCount - 1;
    const isOnFirstRow = currentRowIndex === 0;
    const isOnLastRow = currentRowIndex === rowCount - 1;
    const maxRightLastRow = (data.length % columnCount || columnCount) - 1; // Never go beyond last item
    const maxRight = isOnLastRow ? maxRightLastRow : columnCount - 1;

    switch (key) {
      case 'ArrowLeft':
        if (isOnFirstColumn && !isOnFirstRow) {
          // Move to last of previous row
          setCurrentColumnIndex(columnCount - 1);
          setCurrentRowIndex((current) => Math.max(current - 1, 0));

          return;
        }
        return setCurrentColumnIndex((current) => Math.max(current - 1, 0));
      case 'ArrowRight':
        if (isOnLastColumn && !isOnLastRow) {
          // Move to first of next row
          setCurrentColumnIndex(0);
          setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));

          return;
        }
        return setCurrentColumnIndex((current) => Math.min(current + 1, maxRight));
      case 'ArrowUp':
        return setCurrentRowIndex((current) => Math.max(current - 1, 0));
      case 'ArrowDown':
        return setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));
      case 'Home':
        if (ctrlKey) {
          setCurrentRowIndex(0);
        }
        return setCurrentColumnIndex(0);
      case 'End':
        if (ctrlKey) {
          setCurrentRowIndex(maxRight);
          setCurrentColumnIndex(maxRightLastRow);

          return;
        }
        return setCurrentColumnIndex(rowCount - 1);
      case 'PageUp':
        return setCurrentRowIndex((current) => Math.max(current - 1, 0));
      case 'PageDown':
        return setCurrentRowIndex((current) => Math.min(current + 1, rowCount - 1));
      default:
        return;
    }
  });

  const originalScrollBehavior = useRef<string | null>(null);

  useEffect(() => {
    if (focused) {
      document.addEventListener('keydown', handleKeyDown);

      // Prevent immediate page scrolling when out-of-viewport element gets focus
      originalScrollBehavior.current = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    return () => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior.current || '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focused, handleKeyDown, columnCount, rowCount]);

  // Set DOM focus to a focusable element within the currently focusable grid cell
  useLayoutEffect(() => {
    if (!focused) return;

    const gridCell = document.getElementById(`layout_grid_${currentRowIndex}-${currentColumnIndex}`) as HTMLDivElement | null;
    const focusableElement = gridCell?.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])') as HTMLElement | null;
    const elementToFocus = focusableElement || gridCell;

    if (!elementToFocus) return;

    elementToFocus.focus();
    scrollIntoViewThrottled(elementToFocus);
  }, [focused, currentRowIndex, currentColumnIndex]);

  // When the window size changes, correct indexes if necessary
  useEffect(() => {
    const maxRightLastRow = (data.length % columnCount || columnCount) - 1; // Never go beyond last item

    if (currentColumnIndex > columnCount - 1) {
      setCurrentColumnIndex(columnCount - 1);
    }
    if (currentRowIndex === rowCount - 1 && currentColumnIndex > maxRightLastRow) {
      setCurrentColumnIndex(maxRightLastRow);
    }
  }, [currentColumnIndex, currentRowIndex, columnCount, rowCount, data.length]);

  return (
    <div role="grid" ref={gridRef} aria-rowcount={rowCount} className={className} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div role="row" key={rowIndex} aria-rowindex={rowIndex} className={styles.row}>
          {data.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount).map((item, columnIndex) => (
            <div
              role="gridcell"
              id={`layout_grid_${rowIndex}-${columnIndex}`}
              key={columnIndex}
              aria-colindex={columnIndex}
              className={styles.cell}
              style={{ width: `${Math.round(100 / columnCount)}%` }}
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

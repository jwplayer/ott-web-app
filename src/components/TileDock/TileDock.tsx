import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

// import './TileDock.css';
import styles from './TileDock.module.scss';

export type CycleMode = 'stop' | 'restart' | 'endless';
type Direction = 'left' | 'right';
type Position = { x: number; y: number };

export type TileDockProps<T> = {
  items: T[];
  cycleMode?: CycleMode;
  tilesToShow?: number;
  spacing?: number;
  tileHeight?: number;
  minimalTouchMovement?: number;
  showControls?: boolean;
  animated?: boolean;
  transitionTime?: string;
  renderTile: (item: T, isInView: boolean) => JSX.Element;
  renderLeftControl?: (handleClick: () => void) => JSX.Element;
  renderRightControl?: (handleClick: () => void) => JSX.Element;
};

type Tile<T> = {
  item: T;
  key: string;
};

const makeTiles = <T,>(originalList: T[], slicedItems: T[]): Tile<T>[] => {
  const itemIndices: string[] = [];

  return slicedItems.map((item) => {
    let key = `tile_${originalList.indexOf(item)}`;
    while (itemIndices.includes(key)) {
      key += '_';
    }
    itemIndices.push(key);
    return { item, key };
  });
};

const sliceItems = <T,>(
  items: T[],
  isMultiPage: boolean,
  index: number,
  tilesToShow: number,
  cycleMode: CycleMode,
): Tile<T>[] => {
  if (!isMultiPage) return makeTiles(items, items);

  const sliceFrom: number = index;
  const sliceTo: number = index + tilesToShow * 3;
  const cycleModeEndlessCompensation: number = cycleMode === 'endless' ? tilesToShow : 0;
  const listStartClone: T[] = items.slice(0, tilesToShow + cycleModeEndlessCompensation + 1);
  const listEndClone: T[] = items.slice(0 - (tilesToShow + cycleModeEndlessCompensation + 1));
  const itemsWithClones: T[] = [...listEndClone, ...items, ...listStartClone];
  const itemsSlice: T[] = itemsWithClones.slice(sliceFrom, sliceTo + 2);

  return makeTiles(items, itemsSlice);
};

const TileDock = <T extends unknown>({
  items,
  tilesToShow = 6,
  cycleMode = 'endless',
  spacing = 12,
  minimalTouchMovement = 30,
  showControls = true,
  animated = !window.matchMedia('(prefers-reduced-motion)').matches,
  transitionTime = '0.6s',
  renderTile,
  renderLeftControl,
  renderRightControl,
}: TileDockProps<T>) => {
  const [index, setIndex] = useState<number>(0);
  const [slideToIndex, setSlideToIndex] = useState<number>(0);
  const [transform, setTransform] = useState<number>(-100);
  const [doAnimationReset, setDoAnimationReset] = useState<boolean>(false);
  const [touchPosition, setTouchPosition] = useState<Position>({
    x: 0,
    y: 0,
  } as Position);
  const frameRef = useRef<HTMLUListElement>() as React.MutableRefObject<HTMLUListElement>;
  const tileWidth: number = 100 / tilesToShow;
  const isMultiPage: boolean = items.length > tilesToShow;
  const transformWithOffset: number = isMultiPage ? 100 - tileWidth * (tilesToShow + 1) + transform : 0;

  const tileList: Tile<T>[] = useMemo(() => {
    return sliceItems<T>(items, isMultiPage, index, tilesToShow, cycleMode);
  }, [items, isMultiPage, index, tilesToShow, cycleMode]);

  const transitionBasis: string = `transform ${animated ? transitionTime : '0s'} ease`;

  const needControls: boolean = showControls && isMultiPage;
  const showLeftControl: boolean = needControls && !(cycleMode === 'stop' && index === 0);
  const showRightControl: boolean = needControls && !(cycleMode === 'stop' && index === items.length - tilesToShow);

  const slide = (direction: Direction): void => {
    const directionFactor = direction === 'right' ? 1 : -1;
    let nextIndex: number = index + tilesToShow * directionFactor;

    if (nextIndex < 0) {
      if (cycleMode === 'stop') nextIndex = 0;
      if (cycleMode === 'restart') nextIndex = index === 0 ? 0 - tilesToShow : 0;
    }
    if (nextIndex > items.length - tilesToShow) {
      if (cycleMode === 'stop') nextIndex = items.length - tilesToShow;
      if (cycleMode === 'restart')
        nextIndex = index >= items.length - tilesToShow ? items.length : items.length - tilesToShow;
    }

    const steps: number = Math.abs(index - nextIndex);
    const movement: number = steps * tileWidth * (0 - directionFactor);

    setSlideToIndex(nextIndex);
    setTransform(-100 + movement);
    if (!animated) setDoAnimationReset(true);
  };

  const handleTouchStart = (event: React.TouchEvent): void =>
    setTouchPosition({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  const handleTouchEnd = (event: React.TouchEvent): void => {
    const newPosition = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
    const movementX: number = Math.abs(newPosition.x - touchPosition.x);
    const movementY: number = Math.abs(newPosition.y - touchPosition.y);
    const direction: Direction = newPosition.x < touchPosition.x ? 'right' : 'left';

    if (movementX > minimalTouchMovement && movementX > movementY) {
      slide(direction);
    }
  };

  useLayoutEffect(() => {
    const resetAnimation = (): void => {
      let resetIndex: number = slideToIndex;

      resetIndex = resetIndex >= items.length ? slideToIndex - items.length : resetIndex;
      resetIndex = resetIndex < 0 ? items.length + slideToIndex : resetIndex;

      if (resetIndex !== slideToIndex) {
        setSlideToIndex(resetIndex);
      }

      setIndex(resetIndex);
      if (frameRef.current) frameRef.current.style.transition = 'none';
      setTransform(-100);
      setTimeout(() => {
        if (frameRef.current) frameRef.current.style.transition = transitionBasis;
      }, 0);
      setDoAnimationReset(false);
    };

    if (doAnimationReset) resetAnimation();
  }, [doAnimationReset, index, items.length, slideToIndex, tileWidth, tilesToShow, transitionBasis]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLUListElement>) => {
    if (event.target === frameRef.current) {
      setDoAnimationReset(true);
    }
  };

  const ulStyle = {
    transform: `translate3d(${transformWithOffset}%, 0, 0)`,
    // prettier-ignore
    WebkitTransform: `translate3d(${transformWithOffset}%, 0, 0)`,
    transition: transitionBasis,
    marginLeft: -spacing / 2,
    marginRight: -spacing / 2,
  };

  const slideOffset = index - slideToIndex;

  return (
    <div className={styles.tileDock}>
      {showLeftControl && !!renderLeftControl && (
        <div className={styles.leftControl}>{renderLeftControl(() => slide('left'))}</div>
      )}
      <ul
        ref={frameRef}
        style={ulStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTransitionEnd={handleTransitionEnd}
      >
        {tileList.map((tile: Tile<T>, listIndex) => {
          // Todo:
          // const isTabable = isAnimating || !isMultiPage || (listIndex > tilesToShow - 1 && listIndex < tilesToShow * 2);
          const isInView =
            !isMultiPage || (listIndex > tilesToShow - slideOffset && listIndex < tilesToShow * 2 + 1 - slideOffset);

          return (
            <li
              key={tile.key}
              style={{
                width: `${tileWidth}%`,
                paddingLeft: spacing / 2,
                paddingRight: spacing / 2,
                boxSizing: 'border-box',
                opacity: isInView ? 1 : 0.1,
                transition: 'opacity .2s ease-in 0s',
              }}
            >
              {renderTile(tile.item, isInView)}
            </li>
          );
        })}
      </ul>
      {showRightControl && !!renderRightControl && (
        <div className={styles.rightControl}>{renderRightControl(() => slide('right'))}</div>
      )}
    </div>
  );
};

export default TileDock;

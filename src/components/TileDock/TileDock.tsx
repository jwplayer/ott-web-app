import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './TileDock.css';

export type CycleMode = 'stop' | 'restart' | 'endless';
type Direction = 'left' | 'right';
type Position = { x: number; y: number };

export type TileDockProps = {
  items: unknown[];
  cycleMode?: CycleMode;
  tilesToShow?: number;
  spacing?: number;
  tileHeight?: number;
  minimalTouchMovement?: number;
  showControls?: boolean;
  animated?: boolean;
  transitionTime?: string;
  renderTile: (item: unknown) => JSX.Element;
  renderLeftControl?: (handleClick: () => void) => JSX.Element;
  renderRightControl?: (handleClick: () => void) => JSX.Element;
};

type Tile = {
  item: unknown;
  key: string;
};

const makeTiles = (originalList: unknown[], slicedItems: unknown[]): Tile[] => {
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

const sliceItems = (
  items: unknown[],
  isMultiPage: boolean,
  index: number,
  tilesToShow: number,
  cycleMode: CycleMode,
): Tile[] => {
  if (!isMultiPage) return makeTiles(items, items);

  const sliceFrom: number = index;
  const sliceTo: number = index + tilesToShow * 3;
  const cycleModeEndlessCompensation: number = cycleMode === 'endless' ? tilesToShow : 1;
  const listStartClone: unknown[] = items.slice(0, tilesToShow + cycleModeEndlessCompensation);
  const listEndClone: unknown[] = items.slice(0 - tilesToShow + 1);
  const itemsWithClones: unknown[] = [...listEndClone, ...items, ...listStartClone];
  const itemsSlice: unknown[] = itemsWithClones.slice(sliceFrom, sliceTo);

  return makeTiles(items, itemsSlice);
};

const TileDock = ({
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
}: TileDockProps) => {
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
  const transformWithOffset: number = isMultiPage ? 100 - tileWidth * (tilesToShow - 1) + transform : 0;

  const tileList: Tile[] = useMemo(() => {
    return sliceItems(items, isMultiPage, index, tilesToShow, cycleMode);
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
    <div className="tileDock">
      {showLeftControl && !!renderLeftControl && (
        <div className="leftControl">{renderLeftControl(() => slide('left'))}</div>
      )}
      <ul
        ref={frameRef}
        style={ulStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTransitionEnd={handleTransitionEnd}
      >
        {tileList.map((tile: Tile, listIndex) => {
          // Todo:
          // const isTabable = isAnimating || !isMultiPage || (listIndex > tilesToShow - 1 && listIndex < tilesToShow * 2);
          const isVisible = true; // Todo: hide all but visible?
          const isOpaque =
            !isMultiPage ||
            (listIndex > tilesToShow - (slideOffset + 2) && listIndex < tilesToShow * 2 - slideOffset - 1);

          return (
            <li
              key={tile.key}
              style={{
                width: `${tileWidth}%`,
                visibility: isVisible ? 'visible' : 'hidden',
                paddingLeft: spacing / 2,
                paddingRight: spacing / 2,
                boxSizing: 'border-box',
                opacity: isOpaque ? 1 : 0.1,
                transition: 'opacity .2s ease-in 0s',
              }}
            >
              {renderTile(tile.item)}
            </li>
          );
        })}
      </ul>
      {showRightControl && !!renderRightControl && (
        <div className="rightControl">{renderRightControl(() => slide('right'))}</div>
      )}
    </div>
  );
};

export default TileDock;

import React, { useLayoutEffect, useRef, useState } from 'react';
import './TileDock.css';

export type CycleMode = 'stop' | 'restart' | 'endless';
type Direction        = 'left' | 'right';
type Position         = { x: number; y: number; };

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
  renderTile: (item: unknown, index: number) => JSX.Element;
  renderLeftControl?: (handleClick: () => void) => JSX.Element;
  renderRightControl?: (handleClick: () => void) => JSX.Element;
};

const TileDock = ({
  items,
  tilesToShow = 6,
  cycleMode = 'endless',
  spacing = 12,
  tileHeight = 300,
  minimalTouchMovement = 30,
  showControls = true,
  animated = !window.matchMedia('(prefers-reduced-motion)').matches,
  transitionTime = '0.6s',
  renderTile,
  renderLeftControl,
  renderRightControl,
}: TileDockProps) => {
  const [index, setIndex]                       = useState<number>(0);
  const [slideToIndex, setSlideToIndex]         = useState<number>(0);
  const [transform, setTransform]               = useState<number>(-100);
  const [doAnimationReset, setDoAnimationReset] = useState<boolean>(false);
  const [touchPosition, setTouchPosition]       = useState<Position>({ x: 0, y: 0 } as Position);
  const frameRef                                = useRef<HTMLUListElement>() as React.MutableRefObject<HTMLUListElement>;
  const tilesToShowRounded: number              = Math.floor(tilesToShow);
  const offset: number                          = Math.round((tilesToShow - tilesToShowRounded) * 10) / 10;
  const offsetCompensation: number              = offset ? 1 : 0;
  const tileWidth: number                       = 100 / (tilesToShowRounded + offset * 2);
  const isMultiPage: boolean                    = items.length > tilesToShowRounded;
  const transformWithOffset: number             = isMultiPage ? 100 - tileWidth * (tilesToShowRounded + offsetCompensation - offset) + transform : 0;

  const sliceItems = (items: unknown[]): unknown[] => {
    const sliceFrom: number                    = index;
    const sliceTo: number                      = index + tilesToShowRounded * 3 + offsetCompensation * 2;
    const cycleModeEndlessCompensation: number = cycleMode === 'endless' ? tilesToShowRounded : 0;
    const listStartClone: unknown[]            = items.slice(0, tilesToShowRounded + cycleModeEndlessCompensation + offsetCompensation,);
    const listEndClone: unknown[]              = items.slice(0 - (tilesToShowRounded + offsetCompensation));
    const itemsWithClones: unknown[]           = [...listEndClone, ...items, ...listStartClone];
    const itemsSlice: unknown[]                = itemsWithClones.slice(sliceFrom, sliceTo);

    return itemsSlice;
  };

  const tileList: unknown[]       = isMultiPage ? sliceItems(items) : items;
  const isAnimating: boolean      = index !== slideToIndex;
  const transitionBasis: string   = `transform ${animated ? transitionTime : '0s'} ease`;

  const needControls: boolean     = showControls && isMultiPage;
  const showLeftControl: boolean  = needControls && !(cycleMode === 'stop' && index === 0);
  const showRightControl: boolean = needControls && !(cycleMode === 'stop' && index === items.length - tilesToShowRounded);

  const slide = (direction: Direction) : void => {
    const directionFactor = (direction === 'right')? 1 : -1;
    let nextIndex: number = index + (tilesToShowRounded * directionFactor);

    if(nextIndex < 0){
      if (cycleMode === 'stop') nextIndex = 0;
      if (cycleMode === 'restart') nextIndex = index === 0 ? 0 - tilesToShowRounded : 0;
    }
    if (nextIndex > items.length - tilesToShowRounded) {
      if(cycleMode === 'stop') nextIndex = items.length - tilesToShowRounded;
      if(cycleMode === 'restart') nextIndex = index === items.length - tilesToShowRounded ? items.length : items.length - tilesToShowRounded;
    }

    const steps: number    = Math.abs(index - nextIndex);
    const movement: number = steps * tileWidth * (0 - directionFactor);
    
    setSlideToIndex(nextIndex);
    setTransform(-100 + movement);
    if (!animated)  setDoAnimationReset(true);
  };

  const handleTouchStart = (event: React.TouchEvent): void => setTouchPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY });
  const handleTouchEnd   = (event: React.TouchEvent): void => {
    const newPosition          = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    const movementX: number    = Math.abs(newPosition.x - touchPosition.x);
    const movementY: number    = Math.abs(newPosition.y - touchPosition.y);
    const direction: Direction = (newPosition.x < touchPosition.x) ? 'right' : 'left';

    if (movementX > minimalTouchMovement && movementX > movementY) {
      slide(direction);
    }
  };

  useLayoutEffect(() => {
    const resetAnimation = (): void => {
      let resetIndex: number = slideToIndex;

      resetIndex = resetIndex >= items.length ? slideToIndex - items.length : resetIndex;
      resetIndex = resetIndex < 0 ? items.length + slideToIndex : resetIndex;
      
      setIndex(resetIndex);
      if (frameRef.current) frameRef.current.style.transition = 'none';
      setTransform(-100);
      setTimeout(() => {
        if (frameRef.current) frameRef.current.style.transition = transitionBasis;
      }, 0);
      setDoAnimationReset(false);
    };

    if (doAnimationReset) resetAnimation();
  }, [
    doAnimationReset,
    index,
    items.length,
    slideToIndex,
    tileWidth,
    tilesToShowRounded,
    transitionBasis,
  ]);

  const renderGradientEdge = () : string => {
    const firstPercentage  = cycleMode === 'stop' && index === 0 ? offset * tileWidth : 0;
    const secondPercentage = tileWidth * offset;
    const thirdPercentage  = 100 - tileWidth * offset;

    return `linear-gradient(90deg, rgba(255,255,255,1) ${firstPercentage}%, rgba(255,255,255,0) ${secondPercentage}%, rgba(255,255,255,0) ${thirdPercentage}%, rgba(255,255,255,1) 100%)`;
  };
  const ulStyle = {
    transform: `translate3d(${transformWithOffset}%, 0, 0)`,
    // Todo: set capital W before creating package
    webkitTransform: `translate3d(${transformWithOffset}%, 0, 0)`,
    transition: transitionBasis,
    marginLeft: -spacing / 2,
    marginRight: -spacing / 2,
  };

  return (
    <div className="tileDock" style={{ height: tileHeight }}>
      {showLeftControl && !!renderLeftControl && (
        <div className="leftControl">
          {renderLeftControl(() => slide('left'))}
        </div>
      )}
      <ul
        ref={frameRef}
        style={ulStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTransitionEnd={(): void => setDoAnimationReset(true)}
      >
        {tileList.map((item:any, listIndex) => {
          const isVisible =
            isAnimating ||
            !isMultiPage ||
            (listIndex > tilesToShowRounded - offsetCompensation - 1 &&
              listIndex < tilesToShowRounded * 2 + offsetCompensation + offsetCompensation);

          return (
            <li
              key={`visibleTile${listIndex}`}
              style={{
                width: `${tileWidth}%`,
                height: tileHeight,
                visibility: isVisible ? 'visible' : 'hidden',
                paddingLeft: spacing / 2,
                paddingRight: spacing / 2,
                boxSizing: 'border-box',
              }}
            >
              {renderTile(item, listIndex)}
            </li>
          );
        })}
      </ul>
      {offsetCompensation > 0 && isMultiPage && (
        <div className="offsetTile" style={{ background: renderGradientEdge() }} />
      )}
      {showRightControl && !!renderRightControl && (
        <div className="rightControl">
          {renderRightControl(() => slide('right'))}
        </div>
      )}
    </div>
  );
};

export default TileDock;

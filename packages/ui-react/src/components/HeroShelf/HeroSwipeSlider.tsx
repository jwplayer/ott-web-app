import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './HeroShelf.module.scss';

type Props = {
  hasLeftItem: boolean;
  hasRightItem: boolean;
  renderLeftItem: (isSwiping: boolean) => React.ReactNode;
  renderItem: () => React.ReactNode;
  renderRightItem: (isSwiping: boolean) => React.ReactNode;
  loading: boolean;
  direction: 'left' | 'right' | null;
  isSwipeAnimation: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const HeroSwipeSlider = ({
  hasLeftItem,
  hasRightItem,
  renderItem,
  renderLeftItem,
  renderRightItem,
  direction,
  isSwipeAnimation,
  onSwipeLeft,
  onSwipeRight,
}: Props) => {
  const movementRef = useRef({ x: 0, y: 0, start: Date.now() });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [swipeAction, setSwipeAction] = useState<'slide' | 'scroll' | null>(null);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint <= Breakpoint.sm;

  const handleTouchStart = useEventCallback((event: TouchEvent) => {
    if (direction) return;
    movementRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, start: Date.now() };
    setSwipeAction(null);
  });

  const handleTouchMove = useEventCallback((event: TouchEvent) => {
    if (direction) return;
    if (!containerRef.current) return;

    const movementX: number = event.changedTouches[0].clientX - movementRef.current.x;
    const movementY: number = event.changedTouches[0].clientY - movementRef.current.y;
    const currentSwipeAction = Math.abs(movementX) > Math.abs(movementY) ? 'slide' : 'scroll';

    if (!swipeAction) setSwipeAction(currentSwipeAction);
    if (currentSwipeAction === 'scroll' || swipeAction === 'scroll') return;

    // Prevent scrolling while sliding
    event.preventDefault();
    event.stopPropagation();

    // Follow touch horizontally
    const maxLeft = hasRightItem ? -window.innerWidth : 0;
    const maxRight = hasLeftItem ? window.innerWidth : 0;
    const limitedMovementX = Math.max(Math.min(movementX, maxRight), maxLeft);

    containerRef.current.style.transform = `translateX(${limitedMovementX}px)`;
    containerRef.current.style.transition = 'none';
  });

  const handleTouchEnd = useEventCallback((event: TouchEvent) => {
    if (direction) return;
    if (!containerRef.current) return;
    if (swipeAction === 'scroll') return;

    const movementX = movementRef.current.x - event.changedTouches[0].clientX;
    const velocity = Math.round((movementX / (Date.now() - movementRef.current.start)) * 100);
    const velocityTreshold = 80;

    if (hasRightItem && (movementX > window.innerWidth / 2 || velocity > velocityTreshold)) {
      onSwipeRight();
    } else if (hasLeftItem && (movementX < -window.innerWidth / 2 || velocity < -velocityTreshold)) {
      onSwipeLeft();
    } else {
      containerRef.current.style.transition = 'transform 0.2s ease-out';
      containerRef.current.style.transform = 'translateX(0)';
    }
    setSwipeAction(null);
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (isSwipeAnimation && direction === 'left') {
      containerRef.current.style.transition = 'transform 0.2s ease-out';
      containerRef.current.style.transform = `translateX(100%)`;
    } else if (isSwipeAnimation && direction === 'right') {
      containerRef.current.style.transition = 'transform 0.2s ease-out';
      containerRef.current.style.transform = `translateX(-100%)`;
    } else {
      containerRef.current.style.transform = 'translateX(0)';
      containerRef.current.style.transition = 'none';
    }
  }, [direction, isSwipeAnimation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className={classNames(styles.swipeSlider, isMobile && styles.swipeSliderMobile)}>
      {renderLeftItem(swipeAction === 'slide')}
      {renderItem()}
      {renderRightItem(swipeAction === 'slide')}
    </div>
  );
};

export default HeroSwipeSlider;

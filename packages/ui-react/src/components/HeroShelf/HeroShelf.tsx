import React, { useCallback, useEffect, useRef, useState, type CSSProperties, type TransitionEventHandler } from 'react';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ChevronLeft from '@jwp/ott-theme/assets/icons/chevron_left.svg?react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';

import { useScrolledDown } from '../../hooks/useScrolledDown';
import Icon from '../Icon/Icon';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './HeroShelf.module.scss';
import HeroShelfMetadata from './HeroShelfMetadata';
import HeroShelfBackground from './HeroShelfBackground';
import HeroShelfPagination from './HeroShelfPagination';
import HeroSwipeSlider from './HeroSwipeSlider';

type Props = {
  playlist: Playlist;
  loading?: boolean;
  error?: unknown;
};

const HeroShelf = ({ playlist, loading = false, error = null }: Props) => {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const { t } = useTranslation('common');
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint <= Breakpoint.sm;
  const posterRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'init' | 'start' | 'end' | null>(null);
  const [isSwipeAnimation, setIsSwipeAnimation] = useState(false);

  useScrolledDown(50, isMobile ? 200 : 600, (progress: number) => {
    if (posterRef.current) posterRef.current.style.opacity = `${Math.max(1 - progress, isMobile ? 0 : 0.1)}`;
  });

  const slideTo = (toIndex: number, isSwiping = false) => {
    if (animationPhase) return;

    setNextIndex(toIndex);
    setDirection(toIndex > index ? 'right' : 'left');
    setAnimationPhase('init');
    setIsSwipeAnimation(isSwiping);
  };

  const handleSlideLeft = () => slideTo(index - 1);
  const handleSlideRight = () => slideTo(index + 1);
  const handleSwipeLeft = () => slideTo(index - 1, true);
  const handleSwipeRight = () => slideTo(index + 1, true);

  const handleBackgroundAnimationEnd: TransitionEventHandler = useCallback(
    (event) => {
      // Transform has the longest transition (after opacity)
      if (event.propertyName === 'transform' && animationPhase === 'start') {
        setAnimationPhase('end');
      }
    },
    [animationPhase],
  );

  useEffect(() => {
    if (!direction) return;
    if (animationPhase === 'init') {
      setAnimationPhase('start');
      return;
    }
    if (animationPhase === 'end') {
      setIndex(nextIndex);
      setDirection(null);
      setAnimationPhase(null);
      setIsSwipeAnimation(false);
    }
  }, [animationPhase, direction, nextIndex]);

  const isAnimating = animationPhase === 'start' || animationPhase === 'end';
  const directionFactor = direction === 'left' ? 1 : direction === 'right' ? -1 : 0;

  const getBackgroundStyle = (side?: 'left' | 'right') => {
    const backgroundX = isMobile ? 10 : 40;

    if (side == 'left') {
      return {
        transform: `scale(1.2) translateX(${animationPhase === 'init' ? backgroundX * -1 : 0}px)`,
        opacity: isAnimating ? 1 : 0,
        transition: isAnimating ? 'opacity 0.3s ease-out, transform 0.3s ease-out' : 'none',
      };
    }
    if (side == 'right') {
      return {
        transform: `scale(1.2) translateX(${animationPhase === 'init' ? backgroundX : 0}px)`,
        opacity: isAnimating ? 1 : 0,
        transition: isAnimating ? 'opacity 0.3s ease-out, transform 0.3s ease-out' : 'none',
      };
    }
    return {
      transform: `scale(1.2) translateX(${isAnimating ? backgroundX * directionFactor : 0}px)`,
      opacity: isAnimating ? 0 : 1,
      transition: isAnimating ? `opacity ${isMobile ? 0.3 : 0.1}s ease-out, transform 0.3s ease-in` : 'none',
    };
  };

  const getMetadataStyle = (side?: 'left' | 'right', isSwiping = false): CSSProperties => {
    if (side === 'left') {
      return {
        left: isSwiping || isSwipeAnimation ? '-100%' : animationPhase === 'init' ? -60 : 0,
        opacity: isSwiping || isSwipeAnimation || isAnimating ? 1 : 0,
        transition: isAnimating ? 'opacity 0.2s ease-out, left 0.2s ease-out' : 'none',
        pointerEvents: 'none',
      };
    }
    if (side === 'right') {
      return {
        left: isSwiping || isSwipeAnimation ? '100%' : animationPhase === 'init' ? 60 : 0,
        opacity: isSwiping || isSwipeAnimation || isAnimating ? 1 : 0,
        transition: isAnimating ? 'opacity 0.2s ease-out, left 0.2s ease-out' : 'none',
        pointerEvents: 'none',
      };
    }
    return {
      left: isAnimating && direction ? 60 * directionFactor : 0,
      opacity: isAnimating ? 0 : 1,
      transition: isAnimating ? 'opacity 0.15s ease-out, left 0.15s ease-out' : 'none',
      pointerEvents: isAnimating ? 'none' : 'initial',
    };
  };

  const item = playlist.playlist[index];
  const leftItem = playlist.playlist[nextIndex < index ? nextIndex : index - 1] || null;
  const rightItem = playlist.playlist[nextIndex > index ? nextIndex : index + 1] || null;

  const renderedItem = animationPhase !== 'end' ? item : direction === 'right' ? leftItem : rightItem;

  if (error || !playlist?.playlist) return <h2 className={styles.error}>Could not load items</h2>;

  return (
    <div className={classNames(styles.shelf)}>
      <div className={styles.poster} ref={posterRef}>
        <div className={styles.background} id="background">
          <HeroShelfBackground
            item={leftItem}
            style={getBackgroundStyle('left')}
            key={renderedItem?.mediaid === leftItem?.mediaid ? 'left-item' : leftItem?.mediaid}
            hidden={direction !== 'left'}
          />
          <HeroShelfBackground item={renderedItem} style={getBackgroundStyle()} key={renderedItem?.mediaid} onTransitionEnd={handleBackgroundAnimationEnd} />
          <HeroShelfBackground
            item={rightItem}
            style={getBackgroundStyle('right')}
            key={renderedItem?.mediaid === rightItem?.mediaid ? 'right-item' : rightItem?.mediaid}
            hidden={direction !== 'right'}
          />
          <div className={styles.fade} />
        </div>
        <div className={styles.fade2} />
      </div>
      <button
        className={classNames(styles.chevron, styles.chevronLeft)}
        aria-label={t('slide_previous')}
        disabled={!leftItem}
        onClick={leftItem ? handleSlideLeft : undefined}
      >
        <Icon icon={ChevronLeft} />
      </button>
      <HeroSwipeSlider
        direction={direction}
        isSwipeAnimation={isSwipeAnimation}
        loading={loading}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        hasLeftItem={!!leftItem}
        hasRightItem={!!rightItem}
        renderLeftItem={(isSwiping: boolean) => (
          <HeroShelfMetadata
            loading={loading}
            item={leftItem}
            playlistId={playlist.feedid}
            style={getMetadataStyle('left', isSwiping)}
            key={renderedItem?.mediaid === leftItem?.mediaid ? 'left-item' : leftItem?.mediaid}
            hidden={direction !== 'left' && !isSwiping}
          />
        )}
        renderItem={() => (
          <HeroShelfMetadata loading={loading} item={renderedItem} playlistId={playlist.feedid} key={renderedItem?.mediaid} style={getMetadataStyle()} />
        )}
        renderRightItem={(isSwiping: boolean) => (
          <HeroShelfMetadata
            loading={loading}
            item={rightItem}
            playlistId={playlist.feedid}
            style={getMetadataStyle('right', isSwiping)}
            key={renderedItem?.mediaid === rightItem?.mediaid ? 'right-item' : rightItem?.mediaid}
            hidden={direction !== 'right' && !isSwiping}
          />
        )}
      />
      <button
        className={classNames(styles.chevron, styles.chevronRight)}
        aria-label={t('slide_next')}
        disabled={!rightItem}
        onClick={rightItem ? handleSlideRight : undefined}
      >
        <Icon icon={ChevronRight} />
      </button>
      <HeroShelfPagination playlist={playlist} index={index} setIndex={slideTo} nextIndex={nextIndex} direction={direction || false} />
    </div>
  );
};

export default HeroShelf;

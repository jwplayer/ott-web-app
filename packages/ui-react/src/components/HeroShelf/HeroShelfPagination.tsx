import classNames from 'classnames';
import type { Playlist } from '@jwp/ott-common/types/playlist';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import styles from './HeroShelf.module.scss';

const calculateDotSize = (direction: 'left' | 'right' | false, itemIndex: number, index: number, range: number, sizeSmall: number) => {
  const isAnimatingLeft = direction === 'left';
  const isAnimatingRight = direction === 'right';

  const dotPosition = {
    semiEdgeLeft: itemIndex === index - range + 1 && isAnimatingRight,
    edgeLeft: itemIndex === index - range,
    newDotLeft: itemIndex === index - range - 1,
    semiEdgeRight: itemIndex === index + range - 1 && isAnimatingLeft,
    edgeRight: itemIndex === index + range,
    newDotRight: itemIndex === index + range + 1,
  };

  if (dotPosition.semiEdgeLeft || dotPosition.semiEdgeRight) return sizeSmall;
  if (dotPosition.edgeLeft) return isAnimatingRight ? 0 : isAnimatingLeft ? 1 : sizeSmall;
  if (dotPosition.edgeRight) return isAnimatingLeft ? 0 : isAnimatingRight ? 1 : sizeSmall;
  if (dotPosition.newDotLeft) return isAnimatingLeft ? sizeSmall : 0;
  if (dotPosition.newDotRight) return isAnimatingRight ? sizeSmall : 0;

  return 1;
};

type Props = {
  playlist: Playlist;
  index: number;
  direction: 'left' | 'right' | false;
  nextIndex: number;
  setIndex: (index: number) => void;
  range?: number;
  animationDuration?: number;
};

const HeroShelfPagination = ({ playlist, index: indexIn, direction, nextIndex: nextIndexIn, setIndex, range = 3, animationDuration = 200 }: Props) => {
  const { t } = useTranslation('common');
  const placeholderCount = range + 1; // Placeholders are used to keep a stable amount of DOM elements
  const index = indexIn + placeholderCount;
  const nextIndex = nextIndexIn + placeholderCount;

  const playlistWithPlaceholders = useMemo(() => {
    const placeholders: false[] = Array.from({ length: placeholderCount }).map(() => false);

    return [...placeholders, ...playlist.playlist, ...placeholders];
  }, [playlist.playlist, placeholderCount]);

  return (
    <nav className={styles.dots}>
      <div aria-live="polite" className="hidden">
        {t('slide_indicator', { page: indexIn + 1, pages: playlist.playlist.length })}
      </div>
      <ul className={styles.dotsList}>
        {playlistWithPlaceholders.map((current, itemIndex) => {
          if (itemIndex < index - range - 1 || itemIndex > index + range + 1) {
            return null;
          }
          if (!current) {
            return <div className={classNames(styles.dotPlaceholder)} key={itemIndex} aria-hidden="true" />;
          }

          const movementBase = 22; // dot width (10) + gap(12)
          const movementTotal = Math.abs(index - nextIndex) * movementBase;
          const movement = direction === 'left' ? movementTotal : direction === 'right' ? 0 - movementTotal : 0;
          const transform = `translateX(${movement}px)`;
          const transition = direction
            ? `transform ${animationDuration}ms ease-out ${animationDuration / 3}ms, width ${animationDuration / 2}ms ease-out ${animationDuration / 3}ms`
            : '';

          const size = calculateDotSize(direction, itemIndex, index, range, 0.6);
          const transformDiv = `scale(${size})`;
          const transitionDiv = direction
            ? `width ${animationDuration}ms ease-out, height ${animationDuration}ms ease-out, transform ${animationDuration}ms ease-out`
            : '';

          const isCurrent = itemIndex === index;
          const hidden = size !== 1;
          const ariaLabel = hidden ? undefined : t('slide_to', { item: itemIndex - placeholderCount + 1, items: playlist.playlist.length });

          return (
            <button
              key={current?.mediaid}
              className={classNames(styles.dot, itemIndex === nextIndex && styles.dotActive, !direction && itemIndex === index && styles.dotActive)}
              style={{ transform, transition }}
              aria-label={ariaLabel}
              aria-hidden={hidden ? 'true' : undefined}
              aria-current={isCurrent ? 'true' : undefined}
              onClick={hidden || isCurrent ? undefined : () => setIndex(itemIndex - placeholderCount)}
            >
              <div style={{ transform: transformDiv, transition: transitionDiv }} />
            </button>
          );
        })}
      </ul>
    </nav>
  );
};

export default HeroShelfPagination;

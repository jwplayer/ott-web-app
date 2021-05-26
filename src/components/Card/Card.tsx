import React, { KeyboardEvent, memo } from 'react';
import classNames from 'classnames';

import { formatDurationTag } from '../../utils/formatting';

import styles from './Card.module.scss';

type CardProps = {
  onClick?: () => void;
  onHover?: () => void;
  title: string;
  duration: number;
  posterSource?: string;
  seriesId?: string;
  posterAspect?: '1:1' | '2:1' | '2:3' | '4:3' | '5:3' | '16:9' | '9:16';
  featured?: boolean;
  disabled?: boolean;
};

function Card({
  onClick,
  onHover,
  title,
  duration,
  posterSource,
  seriesId,
  posterAspect = '16:9',
  featured = false,
  disabled = false,
}: CardProps): JSX.Element {
  const cardClassName = classNames(styles.card, { [styles.featured]: featured, [styles.disabled]: disabled });
  const posterClassNames = classNames(styles.poster, styles[`aspect${posterAspect.replace(':', '')}`]);
  const metaData = () => {
    if (seriesId) {
      return <div className={styles.tag}>Series</div>;
    } else if (duration) {
      return <div className={styles.tag}>{formatDurationTag(duration)}</div>;
    }
  };

  return (
    <div
      className={cardClassName}
      onClick={onClick}
      onMouseEnter={onHover}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event: KeyboardEvent) =>
        (event.key === 'Enter' || event.key === ' ') && !disabled && onClick && onClick()
      }
      role="button"
      aria-label={`Play ${title}`}
    >
      <div className={posterClassNames} style={{ backgroundImage: posterSource ? `url(${posterSource})` : '' }}>
        <div className={styles.meta}>
          <div className={styles.title}>{featured ? title : ''}</div>
          {metaData()}
        </div>
      </div>
      {!featured && (
        <div className={styles.titleContainer}>
          <div className={styles.title}>{title}</div>
        </div>
      )}
    </div>
  );
}

export default memo(Card);

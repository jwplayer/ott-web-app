import React, { memo } from 'react';
import classNames from 'classnames';

import { formatDurationTag } from '../../utils/formatting';

import styles from './Card.module.scss';

type CardProps = {
  onClick: () => void;
  onHover: () => void;
  title: string;
  duration: number;
  posterSource?: string;
  posterAspect?: '1:1' | '2:1' | '2:3' | '4:3' | '5:3' | '16:9' | '9:16';
  featured: boolean;
};

function Card({
  onClick,
  onHover,
  title,
  duration,
  posterSource,
  posterAspect = '16:9',
  featured = false,
}: CardProps): JSX.Element {
  const posterClassNames = classNames(styles.poster, styles[`aspect${posterAspect.replace(':', '')}`]);

  return (
    <div className={styles.card} onClick={onClick} onMouseEnter={onHover} role="button" aria-label={`Play ${title}`}>
      <div className={posterClassNames} style={{ backgroundImage: `url(${posterSource})` }}>
        {duration && <div className={styles.tag}>{formatDurationTag(duration)}</div>}
        {featured && <div className={styles.titleFeatured}>{title}</div>}
      </div>
      {!featured && <p className={styles.title}>{title}</p>}
    </div>
  );
}

export default memo(Card);

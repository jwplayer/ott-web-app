import React, { memo } from 'react';
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
  featured: boolean;
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
}: CardProps): JSX.Element {
  const posterClassNames = classNames(styles.poster, styles[`aspect${posterAspect.replace(':', '')}`]);
  const metaData = () => {
    if (seriesId) {
      return <div className={styles.tag}>Series</div>;
    } else if (duration) {
      return <div className={styles.tag}>{formatDurationTag(duration)}</div>;
    }
  };

  return (
    <div className={styles.card} onClick={onClick} onMouseEnter={onHover} role="button" aria-label={`Play ${title}`}>
      <div className={posterClassNames} style={{ backgroundImage: `url(${posterSource})` }}>
        {metaData()}
        {featured && <div className={styles.titleFeatured}>{title}</div>}
      </div>
      {!featured && <div className={styles.title}>{title}</div>}
    </div>
  );
}

export default memo(Card);

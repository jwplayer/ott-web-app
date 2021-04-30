import React from 'react';
import classNames from 'classnames';

import { formatDurationTag } from '../../utils/formatting';

import styles from './Card.module.scss';

type CardProps = {
  onClick: (() => void);
  title: string;
  duration: number;
  posterSource?: string;
  posterAspect?: "1:1" | "2:1" | "2:3" | "4:3" | "5:3" | "16:9" | "9:16";
};

function Card({
  onClick,
  title,
  duration,
  posterSource,
  posterAspect = "16:9",
}: CardProps): JSX.Element {
  const posterClassNames = classNames(styles.poster, styles[`aspect${posterAspect.replace(':', '')}`])

  return (
    <div className={styles.card} onClick={onClick} role="button" aria-label={`Play ${title}`}>
      <div
        className={posterClassNames}
        style={{ backgroundImage: `url(${posterSource})` }}
      >
        {duration && <div className={styles.tag}>{formatDurationTag(duration)}</div>}
      </div>
      <p className={styles.title}>{title}</p>
    </div>
  );
}

export default Card;

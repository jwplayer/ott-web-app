import React from 'react';
import classNames from 'classnames';

import { Aspect } from '../../enum/card';
import { formatVideoDurationTag } from '../../utils/formatting';

import styles from './Card.module.scss';

type CardProps = {
  onClick: (() => void);
  videoTitle: string;
  videoDuration: number;
  posterSource?: string;
  posterAspectRatio?: number;
};

function Card({
  onClick,
  videoTitle,
  videoDuration,
  posterSource,
  posterAspectRatio = Aspect["16:9"],
}: CardProps): JSX.Element {

  return (
    <div className={styles.root} onClick={onClick} role="button" aria-label={`Play ${videoTitle}`}>
      <div className={classNames(styles.poster, styles[`aspect-${posterAspectRatio}`])} style={{ backgroundImage: `url(${posterSource})` }}>
        {videoDuration && <div className={styles.videoDurationTag}>{formatVideoDurationTag(videoDuration)}</div>}
      </div>
      <p className={styles.videoTitle}>{videoTitle}</p>
    </div>
  );
}

export default Card;

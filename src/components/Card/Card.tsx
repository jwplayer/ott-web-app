import React from 'react';
import classNames from 'classnames';

import { ASPECT_RATIO } from '../../enum/Card.js'
import { formatVideoDuration } from '../../utils/formatting.ts'

import styles from './Card.module.scss';

type CardProps = {
  videoTitle: string;
  videoDuration: number;
  posterSource?: string;
  aspectRatio?: string;
};

function Card({
  videoTitle,
  videoDuration,
  posterSource,
  aspectRatio = ASPECT_RATIO[16_9],
}: CardProps): JSX.Element {

  return (
    <div className={styles.root}>
      <div className={classNames(styles.poster, styles[aspectRatio])} style={{ backgroundImage: `url(${posterSource})` }}>
        {videoDuration && <div className={styles.videoDurationTag}>{formatVideoDuration(videoDuration)}</div>}
      </div>
      <p className={styles.videoTitle}>{videoTitle}</p>
    </div>
  );
}

export default Card;

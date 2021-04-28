import React from 'react';
import classNames from 'classnames';

import { ASPECT_RATIO } from '../../enum/Card.js'
import { formatVideoDurationTag } from '../../utils/formatting.ts'

import styles from './Card.module.scss';

type CardProps = {
  onClick: (() => void);
  videoTitle: string;
  videoDuration: number;
  posterSource?: string;
  posterAspectRatio?: string;
};

function Card({
  onClick,
  videoTitle,
  videoDuration,
  posterSource,
  posterAspectRatio = ASPECT_RATIO[16_9],
}: CardProps): JSX.Element {

  return (
    <div className={styles.root} onClick={onClick}>
      <div className={classNames(styles.poster, styles[posterAspectRatio])} style={{ backgroundImage: `url(${posterSource})` }}>
        {videoDuration && <div className={styles.videoDurationTag}>{formatVideoDurationTag(videoDuration)}</div>}
      </div>
      <p className={styles.videoTitle}>{videoTitle}</p>
    </div>
  );
}

export default Card;

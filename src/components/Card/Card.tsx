import React from 'react';
import classNames from 'classnames';

import { ASPECT_RATIO } from '../../enum/Card.js'

import styles from './Card.module.scss';

type CardProps = {
  title: string;
  duration: number;
  imageSource?: string;
  aspectRatio?: string;
};

function Card({
  title,
  duration,
  imageSource,
  aspectRatio = ASPECT_RATIO[16_9],
}: CardProps): JSX.Element {
  return (
    <div className={classNames(styles.root, styles[aspectRatio])}>
      <div className={styles.container} style={{ backgroundImage: `url(${imageSource})` }}>
        <span>Card</span>
      </div>
    </div >
  );
}

export default Card;

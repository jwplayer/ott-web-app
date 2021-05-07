import React from 'react';

import styles from './Video.module.scss';

type Props = {
  prop?: string;
};

const Video: React.FC<Props> = ({ prop }: Props) => {
  return (
    <div className={styles.Video}>
      <p>{prop}</p>
    </div>
  );
};

export default Video;

import React from 'react';

import styles from './Series.module.scss';

type Props = {
  prop?: string;
};

const Series: React.FC<Props> = ({ prop }: Props) => {
  return (
    <div className={styles.Series}>
      <p>{prop}</p>
    </div>
  );
};

export default Series;

import React from 'react';

import styles from './Base.module.scss';

type Props = {
  prop?: string;
};

const Base: React.FC<Props> = ({ prop }: Props) => {
  return (
    <div className={styles.base}>
      <p>{prop}</p>
    </div>
  );
};

export default Base;

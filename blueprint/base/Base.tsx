import React from 'react';

import styles from './Base.module.scss';

type BaseProps = {
  dummy?: string;
};

const Base: React.FC<BaseProps> = ({ dummy = 'defaultValue' }: BaseProps) => {
  return (
    <div className={styles['base']}>
      <p>hello world</p>
      <p>{dummy}</p>
    </div>
  );
};

export default Base;
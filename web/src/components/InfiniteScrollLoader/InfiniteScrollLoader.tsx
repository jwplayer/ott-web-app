import React from 'react';

import Spinner from '../Spinner/Spinner';

import styles from './InfiniteScrollLoader.module.scss';

const InfiniteScrollLoader = () => {
  return (
    <div className={styles.infiniteScrollLoader}>
      <Spinner />
    </div>
  );
};

export default InfiniteScrollLoader;

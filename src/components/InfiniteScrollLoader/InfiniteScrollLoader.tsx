import React from 'react';

import styles from './InfiniteScrollLoader.module.scss';

import Spinner from '#components/Spinner/Spinner';

const InfiniteScrollLoader = () => {
  return (
    <div className={styles.infiniteScrollLoader}>
      <Spinner />
    </div>
  );
};

export default InfiniteScrollLoader;

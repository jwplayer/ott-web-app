import React from 'react';

import styles from './LoadingOverlay.module.scss';

const LoadingOverlay: React.FC = () => {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.buffer}>
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default LoadingOverlay;

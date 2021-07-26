import React from 'react';
import classNames from 'classnames';

import styles from './LoadingOverlay.module.scss';

type Props = {
  inline?: boolean;
}

const LoadingOverlay: React.FC<Props> = ({ inline = false }) => {
  const className = classNames(styles.loadingOverlay, {
    [styles.fixed]: !inline,
    [styles.inline]: inline,
  })
  return (
    <div className={className}>
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

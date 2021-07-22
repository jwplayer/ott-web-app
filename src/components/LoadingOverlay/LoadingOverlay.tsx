import React from 'react';
import classNames from 'classnames';

import styles from './LoadingOverlay.module.scss';

type Props = {
  transparentBackground?: boolean;
};

const LoadingOverlay = ({ transparentBackground = false }: Props): JSX.Element => {
  return (
    <div className={classNames(styles.loadingOverlay, { [styles.transparent]: transparentBackground })}>
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

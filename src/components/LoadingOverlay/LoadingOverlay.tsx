import React from 'react';
import classNames from 'classnames';

import Spinner from '../Spinner/Spinner';

import styles from './LoadingOverlay.module.scss';

type Props = {
  transparentBackground?: boolean;
};

const LoadingOverlay = ({ transparentBackground = false }: Props): JSX.Element => {
  return (
    <div className={classNames(styles.loadingOverlay, { [styles.transparent]: transparentBackground })}>
      <Spinner />
    </div>
  );
};

export default LoadingOverlay;

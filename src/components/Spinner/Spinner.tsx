import classNames from 'classnames';
import React from 'react';

import styles from './Spinner.module.scss';

type Props = {
  size?: 'small' | 'medium';
};

const Spinner = ({ size = 'medium' }: Props): JSX.Element => {
  return (
    <div className={classNames(styles.buffer, { [styles.small]: size === 'small' })}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default Spinner;

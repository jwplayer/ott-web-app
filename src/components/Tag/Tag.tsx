import React from 'react';
import classNames from 'classnames';

import styles from './Tag.module.scss';

type Props = {
  className?: string;
  isLive?: boolean;
  size?: 'normal' | 'large';
};

const Tag: React.FC<Props> = ({ children, className, isLive = false, size = 'normal' }) => {
  return (
    <div
      className={classNames(className, styles.tag, styles[size], {
        [styles.live]: isLive,
      })}
    >
      {children}
    </div>
  );
};

export default Tag;

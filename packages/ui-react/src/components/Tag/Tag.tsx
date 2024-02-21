import React from 'react';
import classNames from 'classnames';

import styles from './Tag.module.scss';

type TagProps = {
  className?: string;
  isLive?: boolean;
  children?: React.ReactNode;
  size?: 'normal' | 'large';
};

const Tag: React.FC<TagProps> = ({ children, className, isLive = false, size = 'normal' }: TagProps) => {
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

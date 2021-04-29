import React from 'react';
import classNames from 'classnames';

import styles from './Icon.module.scss';

type Props = {
  className?: string;
};

export default (viewBox: string, icon: JSX.Element) => ({
  className,
  ...props
}: Props) => {
  return (
    <svg
      className={classNames(styles.icon, className)}
      viewBox={viewBox}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      {icon}
    </svg>
  );
};

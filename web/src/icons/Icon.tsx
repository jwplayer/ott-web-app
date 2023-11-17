import React from 'react';
import classNames from 'classnames';

import styles from './Icon.module.scss';

type Props = {
  className?: string;
};

export default (viewBox: string, icon: JSX.Element) =>
  ({ className, ...props }: Props) =>
    (
      <svg className={classNames(styles.icon, className)} viewBox={viewBox} {...props} focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        {icon}
      </svg>
    );

import React, { type PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Header.module.scss';

const HeaderActions = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <div className={classNames(styles.actions, className)}>{children}</div>;
};

export default HeaderActions;

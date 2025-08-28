import React from 'react';
import classNames from 'classnames';

import IconButton, { type Props as IconButtonProps } from '../IconButton/IconButton';

import styles from './Header.module.scss';

const HeaderActionButton = ({ children, className, ...rest }: IconButtonProps) => {
  return (
    <IconButton className={classNames(styles.iconButton, className)} {...rest}>
      {children}
    </IconButton>
  );
};

export default HeaderActionButton;

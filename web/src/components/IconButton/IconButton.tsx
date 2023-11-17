import classNames from 'classnames';
import React from 'react';

import styles from './IconButton.module.scss';

type Props = {
  onClick?: () => void;
  children: JSX.Element;
  'aria-label': string;
  tabIndex?: number;
  className?: string;
};

const IconButton: React.FC<Props> = ({ children, onClick, 'aria-label': ariaLabel, tabIndex = 0, className }: Props) => {
  return (
    <div
      className={classNames(styles.iconButton, className)}
      onClick={onClick}
      aria-label={ariaLabel}
      role="button"
      tabIndex={tabIndex}
      onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && tabIndex >= 0 && onClick && onClick()}
    >
      {children}
    </div>
  );
};

export default IconButton;

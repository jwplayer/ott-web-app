import classNames from 'classnames';
import React, { AriaAttributes } from 'react';

import styles from './IconButton.module.scss';

type Props = AriaAttributes & {
  onClick?: () => void;
  onBlur?: () => void;
  children: JSX.Element;
  tabIndex?: number;
  className?: string;
};

const IconButton: React.FC<Props> = ({ children, onClick, tabIndex = 0, className, ...ariaProps }: Props) => {
  return (
    <div
      className={classNames(styles.iconButton, className)}
      onClick={onClick}
      role="button"
      tabIndex={tabIndex}
      onKeyDown={(event: React.KeyboardEvent) => (event.key === 'Enter' || event.key === ' ') && tabIndex >= 0 && onClick && onClick()}
      {...ariaProps}
    >
      {children}
    </div>
  );
};

export default IconButton;

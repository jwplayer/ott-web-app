import classNames from 'classnames';
import React, { type AriaAttributes } from 'react';

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
      onKeyDown={(event: React.KeyboardEvent) => {
        if ((event.key === 'Enter' || event.key === ' ') && tabIndex >= 0 && onClick) {
          onClick();
          event.preventDefault(); // prevent click being called when this component unmounts
        }
      }}
      {...ariaProps}
    >
      {children}
    </div>
  );
};

export default IconButton;

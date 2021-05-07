import React from 'react';

import styles from './IconButton.module.scss';

type Props = {
  onClick?: () => void;
  children: JSX.Element;
  'aria-label': string;
};

const IconButton: React.FC<Props> = ({ children, onClick, 'aria-label': ariaLabel }: Props) => {
  return (
    <div className={styles.iconButton} onClick={onClick} aria-label={ariaLabel} role="button">
      {children}
    </div>
  );
};

export default IconButton;

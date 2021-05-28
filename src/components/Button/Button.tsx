import React from 'react';
import classNames from 'classnames';

import styles from './Button.module.scss';

type Color = 'primary' | 'secondary';

type Props = {
  label: string;
  active?: boolean;
  color?: Color;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  onClick: () => void;
};
const Button: React.FC<Props> = ({
  label,
  color = 'primary',
  startIcon,
  fullWidth = false,
  active = false,
  onClick,
}: Props) => {
  return (
    <button
      className={classNames(styles.button, {
        [styles.active]: active,
        [styles.secondary]: color === 'secondary',
        [styles.fullWidth]: fullWidth,
      })}
      onClick={onClick}
    >
      {startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null}
      <span className={styles.buttonLabel}>{label}</span>
    </button>
  );
};

export default Button;

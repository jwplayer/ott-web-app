import React from 'react';
import classNames from 'classnames';

import styles from './Button.module.scss';

type Color = 'default' | 'primary';

type Variant = 'contained' | 'outlined' | 'text';

type Props = {
  label: string;
  active?: boolean;
  color?: Color;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  variant?: Variant;
  onClick: () => void;
};
const Button: React.FC<Props> = ({
  label,
  color = 'default',
  startIcon,
  fullWidth = false,
  active = false,
  variant = 'outlined',
  onClick,
}: Props) => (
  <button
    className={classNames(styles.button, {
      [styles.active]: active,
      [styles[color]]: true,
      [styles[variant]]: true,
      [styles.fullWidth]: fullWidth,
    })}
    onClick={onClick}
  >
    {startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null}
    <span className={styles.buttonLabel}>{label}</span>
  </button>
);

export default Button;

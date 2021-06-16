import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

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
  onClick?: () => void;
  to?: string;
};

const Button: React.FC<Props & React.AriaAttributes> = ({
  label,
  color = 'default',
  startIcon,
  fullWidth = false,
  active = false,
  variant = 'outlined',
  to,
  onClick,
  ...rest
}: Props) => {
  const className = classNames(styles.button, [styles[color]], [styles[variant]], {
    [styles.active]: active,
    [styles.fullWidth]: fullWidth,
  });

  const icon = startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null;
  const span = <span className={styles.buttonLabel}>{label}</span>;

  return to ? (
    <NavLink className={className} to={to} activeClassName={styles.active} {...rest} exact>
      {icon}
      {span}
    </NavLink>
  ) : (
    <button className={className} onClick={onClick} {...rest}>
      {icon}
      {span}
    </button>
  );
};
export default Button;

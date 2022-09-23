import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import styles from './Button.module.scss';

type Color = 'default' | 'primary';

type Variant = 'contained' | 'outlined' | 'text';

type Props = {
  children?: React.ReactNode;
  label: string;
  active?: boolean;
  color?: Color;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  variant?: Variant;
  onClick?: () => void;
  tabIndex?: number;
  size?: 'small' | 'medium' | 'large';
  to?: string;
  role?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  id?: string;
} & React.AriaAttributes;

const Button: React.FC<Props> = ({
  label,
  children,
  color = 'default',
  startIcon,
  fullWidth = false,
  active = false,
  variant = 'outlined',
  size = 'medium',
  disabled,
  type,
  to,
  onClick,
  className,
  ...rest
}: Props) => {
  const buttonClassName = (isActive: boolean) =>
    classNames(styles.button, className, styles[color], styles[variant], {
      [styles.active]: isActive,
      [styles.fullWidth]: fullWidth,
      [styles.large]: size === 'large',
      [styles.small]: size === 'small',
      [styles.disabled]: disabled,
    });

  const icon = startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null;
  const span = <span className={styles.buttonLabel}>{label}</span>;

  return to ? (
    <NavLink className={({ isActive }) => buttonClassName(isActive)} to={to} {...rest}>
      {icon}
      {span}
      {children}
    </NavLink>
  ) : (
    <button className={buttonClassName(active)} onClick={onClick} type={type} disabled={disabled} aria-disabled={disabled} {...rest}>
      {icon}
      {span}
      {children}
    </button>
  );
};
export default Button;

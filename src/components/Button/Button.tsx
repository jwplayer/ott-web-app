import React, { MouseEventHandler } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import styles from './Button.module.scss';

import Spinner from '#components/Spinner/Spinner';

type Color = 'default' | 'primary' | 'delete';

type Variant = 'contained' | 'outlined' | 'text' | 'danger' | 'delete';

type Props = {
  children?: React.ReactNode;
  label: string;
  active?: boolean;
  color?: Color;
  fullWidth?: boolean;
  startIcon?: JSX.Element;
  variant?: Variant;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  size?: 'small' | 'medium' | 'large';
  to?: string;
  role?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  busy?: boolean;
  id?: string;
  as?: 'button' | 'a';
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
  busy,
  type,
  to,
  as = 'button',
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

  const content = (
    <>
      {startIcon && <div className={styles.startIcon}>{startIcon}</div>}
      {<span className={classNames(styles.buttonLabel, { [styles.hidden]: busy }) || undefined}>{label}</span>}
      {children}
      {busy && <Spinner className={styles.centerAbsolute} size={'small'} />}
    </>
  );

  if (to) {
    return (
      <NavLink className={({ isActive }) => buttonClassName(isActive)} to={to} {...rest} end>
        {content}
      </NavLink>
    );
  }

  return (
    <button className={buttonClassName(active)} onClick={onClick} type={type} disabled={disabled} aria-disabled={disabled} {...rest}>
      {content}
    </button>
  );
};
export default Button;

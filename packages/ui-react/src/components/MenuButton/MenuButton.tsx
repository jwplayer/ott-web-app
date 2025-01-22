import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import createInjectableComponent from '../../modules/createInjectableComponent';

import styles from './MenuButton.module.scss';

export const MenuButtonIdentifier = Symbol(`MENU_BUTTON`);

export type MenuButtonProps = {
  label?: string;
  to?: string;
  onClick?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  tabIndex?: number;
  active?: boolean;
  startIcon?: React.ReactElement;
  small?: boolean;
} & React.AriaAttributes;

const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  to,
  onClick,
  onBlur,
  onFocus,
  tabIndex = 0,
  active = false,
  startIcon,
  small = false,
  ...rest
}: MenuButtonProps) => {
  const icon = startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null;
  const getClassName = (isActive: boolean) => classNames(styles.menuButton, { [styles.small]: small }, { [styles.active]: isActive });

  if (to) {
    return (
      <NavLink
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
        className={({ isActive }) => getClassName(isActive || active)}
        to={to}
        tabIndex={tabIndex}
        end
      >
        {icon}
        <span className={styles.label}>{label}</span>
      </NavLink>
    );
  }

  return (
    <div role="button" onBlur={onBlur} onFocus={onFocus} className={getClassName(active)} onClick={onClick} tabIndex={tabIndex} {...rest}>
      {icon}
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default createInjectableComponent(MenuButtonIdentifier, MenuButton);

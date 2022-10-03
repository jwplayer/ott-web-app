import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import styles from './MenuButton.module.scss';

type Props = {
  label?: string;
  to?: string;
  onClick?: () => void;
  tabIndex?: number;
  active?: boolean;
  startIcon?: JSX.Element;
  small?: boolean;
};

const MenuButton: React.FC<Props> = ({ label, to, onClick, tabIndex = 0, active = false, startIcon, small = false }: Props) => {
  const icon = startIcon ? <div className={styles.startIcon}>{startIcon}</div> : null;
  const getClassName = (isActive: boolean) => classNames(styles.menuButton, { [styles.small]: small }, { [styles.active]: isActive });

  if (to) {
    return (
      <NavLink aria-label={label} className={({ isActive }) => getClassName(isActive || active)} onClick={onClick} to={to} tabIndex={tabIndex} end>
        {icon}
        <span className={styles.label}>{label}</span>
      </NavLink>
    );
  }

  return (
    <div aria-label={label} className={getClassName(active)} onClick={onClick} tabIndex={tabIndex}>
      {icon}
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default MenuButton;

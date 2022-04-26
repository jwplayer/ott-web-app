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

  if (to) {
    return (
      <NavLink
        aria-label={label}
        className={classNames(styles.menuButton, { [styles.small]: small })}
        onClick={onClick}
        activeClassName={styles.active}
        to={to}
        tabIndex={tabIndex}
        exact
      >
        {icon}
        <span className={styles.label}>{label}</span>
      </NavLink>
    );
  }

  return (
    <div aria-label={label} className={classNames(styles.menuButton, { [styles.active]: active })} onClick={onClick} tabIndex={tabIndex}>
      {icon}
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default MenuButton;

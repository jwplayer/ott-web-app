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
};

const MenuButton: React.FC<Props> = ({ label, to, onClick, tabIndex = 0, active = false }: Props) => {
  if (to) {
    return (
      <NavLink className={styles.menuButton} activeClassName={styles.active} to={to} tabIndex={tabIndex} exact>
        <span className={styles.label}>{label}</span>
      </NavLink>
    );
  }

  return (
    <div className={classNames(styles.menuButton, { [styles.active]: active })} onClick={onClick} tabIndex={tabIndex}>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default MenuButton;

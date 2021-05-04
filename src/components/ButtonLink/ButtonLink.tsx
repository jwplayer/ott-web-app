import React from 'react';
import { NavLink } from 'react-router-dom';

import styles from './ButtonLink.module.scss';

type Props = {
  label: string;
  to: string;
};

const ButtonLink: React.FC<Props> = ({ label, to }) => {
  return (
    <NavLink
      className={styles.link}
      activeClassName={styles.active}
      to={to}
      exact
    >
      <span className={styles.buttonLabel}>{label}</span>
    </NavLink>
  );
};

export default ButtonLink;

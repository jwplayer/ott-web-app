import React, { Fragment } from 'react';
import classNames from 'classnames';

import Close from '../../icons/Close';
import ButtonLink from '../ButtonLink/ButtonLink';

import styles from './SideBar.module.scss';

type SideBarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SideBar: React.FC<SideBarProps> = ({ isOpen, onClose }) => {
  return (
    <Fragment>
      <div
        className={classNames(styles.backdrop, {
          [styles.visible]: isOpen,
        })}
        onClick={onClose}
      ></div>
      <div
        className={classNames(styles.sidebar, {
          [styles.open]: isOpen,
        })}
        onClick={onClose}
      >
        <div className={styles.group} aria-label="close menu" role="button">
          <Close />
        </div>
        <nav className={styles.group}>
          <ButtonLink label="Home" to="/" />
          <ButtonLink label="Test" to="/" />
          <hr className={styles.divider} />
          <ButtonLink label="Settings" to="/" />
        </nav>
      </div>
    </Fragment>
  );
};

export default SideBar;

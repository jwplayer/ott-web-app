import React, { Fragment } from 'react';
import classNames from 'classnames';

import Close from '../../icons/Close';
import ButtonLink from '../ButtonLink/ButtonLink';

import styles from './SideBar.module.scss';

type SideBarProps = {
  sideBarOpen: boolean;
  closeSideBar: () => void;
};

const SideBar: React.FC<SideBarProps> = ({ sideBarOpen, closeSideBar }) => {
  return (
    <Fragment>
      <div
        className={classNames(styles.backdrop, {
          [styles.visible]: sideBarOpen,
        })}
        onClick={closeSideBar}
      ></div>
      <div
        className={classNames(styles.sidebar, {
          [styles.open]: sideBarOpen,
        })}
        onClick={closeSideBar}
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

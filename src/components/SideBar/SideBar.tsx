import React, { Fragment, FC } from 'react';
import classNames from 'classnames';

import Close from '../../icons/Close';
import ButtonLink from '../ButtonLink/ButtonLink';

import styles from './SideBar.module.scss';

type SideBarProps = {
  isOpen: boolean;
  onClose: () => void;
  playlistMenuItems: JSX.Element[];
};

const SideBar: FC<SideBarProps> = ({ isOpen, onClose, playlistMenuItems }) => (
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
        {playlistMenuItems}
        <hr className={styles.divider} />
        <ButtonLink label="Settings" to="/" />
      </nav>
    </div>
  </Fragment>
);

export default SideBar;

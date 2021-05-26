import React, { Fragment } from 'react';
import classNames from 'classnames';

import MenuButton from '../../components/MenuButton/MenuButton';
import IconButton from '../../components/IconButton/IconButton';
import Close from '../../icons/Close';

import styles from './Sidebar.module.scss';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  playlistMenuItems: JSX.Element[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, playlistMenuItems }) => {
  return (
    <Fragment>
      <div
        className={classNames(styles.backdrop, {
          [styles.visible]: isOpen,
        })}
        onClick={onClose}
      />
      <div
        className={classNames(styles.sidebar, {
          [styles.open]: isOpen,
        })}
      >
        <div className={styles.heading}>
          <IconButton onClick={onClose} aria-label="close menu" tabIndex={isOpen ? 0 : -1}>
            <Close />
          </IconButton>
        </div>
        <nav className={styles.group} onClick={onClose}>
          <MenuButton label="Home" to="/" tabIndex={isOpen ? 0 : -1} />
          {playlistMenuItems}
          <hr className={styles.divider} />
          <MenuButton label="Settings" to="/u" tabIndex={isOpen ? 0 : -1} />
        </nav>
      </div>
    </Fragment>
  );
};

export default Sidebar;

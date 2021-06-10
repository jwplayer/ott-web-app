import React, { Fragment, ReactFragment } from 'react';
import classNames from 'classnames';

import IconButton from '../../components/IconButton/IconButton';
import Close from '../../icons/Close';

import styles from './Sidebar.module.scss';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactFragment;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
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
          {children}
        </nav>
      </div>
    </Fragment>
  );
};

export default Sidebar;

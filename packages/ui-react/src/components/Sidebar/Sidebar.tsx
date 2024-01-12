import React, { Fragment, type ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Close from '../../icons/Close';
import IconButton from '../IconButton/IconButton';

import styles from './Sidebar.module.scss';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation('menu');

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
          <IconButton onClick={onClose} aria-label={t('close_menu')} tabIndex={isOpen ? 0 : -1}>
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

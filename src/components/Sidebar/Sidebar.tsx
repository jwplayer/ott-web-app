import React, { Fragment, ReactFragment } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Sidebar.module.scss';

import Close from '#src/icons/Close';
import IconButton from '#components/IconButton/IconButton';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactFragment;
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

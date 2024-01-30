import React, { AriaAttributes, Fragment, useEffect, useRef, type ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';

import styles from './Sidebar.module.scss';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation('menu');
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const ariaAttributes: AriaAttributes = {};

  if (!isOpen) {
    ariaAttributes['aria-hidden'] = true;
  }

  useEffect(() => {
    if (isOpen) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
      sidebarRef.current.querySelectorAll('a')[0]?.focus({ preventScroll: true });
    } else {
      lastFocusedElementRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  return (
    <Fragment>
      <div
        ref={sidebarRef}
        className={classNames(styles.sidebar, {
          [styles.open]: isOpen,
        })}
        id="sidebar"
        {...ariaAttributes}
      >
        <div className={styles.heading}>
          <IconButton onClick={onClose} aria-label={t('close_menu')}>
            <Icon icon={Close} />
          </IconButton>
        </div>
        <nav className={styles.group} onClick={onClose}>
          {children}
        </nav>
      </div>
      <div
        className={classNames(styles.backdrop, {
          [styles.visible]: isOpen,
        })}
        onClick={onClose}
      />
    </Fragment>
  );
};

export default Sidebar;

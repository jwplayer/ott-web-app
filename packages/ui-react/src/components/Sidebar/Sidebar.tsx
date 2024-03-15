import React, { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';
import scrollbarSize from '../../utils/dom';

import styles from './Sidebar.module.scss';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation('menu');
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const htmlAttributes = { inert: !isOpen ? '' : undefined }; // inert is not yet officially supported in react. see: https://github.com/facebook/react/pull/24730

  useEffect(() => {
    if (isOpen) {
      // Before inert on the body is applied in Layout, we need to set this ref
      lastFocusedElementRef.current = document.activeElement as HTMLElement;

      // When opened, adjust the margin-right to accommodate for the scrollbar width to prevent UI shifts in background
      document.body.style.marginRight = `${scrollbarSize()}px`;
      document.body.style.overflowY = 'hidden';

      // Scroll the sidebar to the top if the user has previously scrolled down in the sidebar
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.removeProperty('margin-right');
      document.body.style.removeProperty('overflow-y');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    const handleTransitionEnd = () => {
      setVisible(isOpen);
    };

    sidebarElement?.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      sidebarElement?.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [isOpen]);

  useEffect(() => {
    if (visible) {
      sidebarRef.current?.querySelectorAll('a')[0]?.focus({ preventScroll: true });
    } else {
      lastFocusedElementRef.current?.focus({ preventScroll: true });
    }
  }, [visible]);

  return (
    <Fragment>
      <div
        className={classNames(styles.backdrop, {
          [styles.visible]: isOpen,
        })}
        onClick={onClose}
      />
      <div
        ref={sidebarRef}
        className={classNames(styles.sidebar, {
          [styles.open]: isOpen,
        })}
        id="sidebar"
        {...htmlAttributes}
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
    </Fragment>
  );
};

export default Sidebar;

import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';
import Modal, { type AnimationProps } from '../Modal/Modal';
import Slide from '../Animation/Slide/Slide';
import createInjectableComponent from '../../modules/createInjectableComponent';

import styles from './Sidebar.module.scss';

export const SidebarIdentifier = Symbol(`SIDEBAR`);

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

const SlideLeft = ({ children, ...props }: AnimationProps) => (
  <Slide direction="left" {...props}>
    {children}
  </Slide>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation('menu');

  return (
    <Modal open={isOpen} onClose={onClose} AnimationComponent={SlideLeft}>
      <div className={styles.sidebar} id="sidebar">
        <div className={styles.heading}>
          <IconButton onClick={onClose} aria-label={t('close_menu')}>
            <Icon icon={Close} />
          </IconButton>
        </div>
        <nav className={styles.group} onClick={onClose}>
          {children}
        </nav>
      </div>
    </Modal>
  );
};

export default createInjectableComponent(SidebarIdentifier, Sidebar);

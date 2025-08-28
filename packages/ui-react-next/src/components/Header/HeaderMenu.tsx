import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Menu from '@jwp/ott-theme/assets/icons/menu.svg?react';

import Icon from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';

import styles from './Header.module.scss';

type Props = {
  className?: string;
  sideBarOpen: boolean;
  onClick: () => void;
};

const HeaderMenu = ({ className, sideBarOpen, onClick }: Props) => {
  const { t } = useTranslation('menu');

  return (
    <div className={classNames(styles.menu, className)}>
      <IconButton className={styles.iconButton} aria-label={t('open_menu')} aria-expanded={sideBarOpen} onClick={onClick}>
        <Icon icon={Menu} />
      </IconButton>
    </div>
  );
};

export default HeaderMenu;

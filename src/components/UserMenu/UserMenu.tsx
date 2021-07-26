import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import AccountCircle from '../../icons/AccountCircle';
import Favorite from '../../icons/Favorite';
import BalanceWallet from '../../icons/BalanceWallet';
import Exit from '../../icons/Exit';
import MenuButton from '../MenuButton/MenuButton';

import styles from './UserMenu.module.scss';

type Props = {
  inPopover?: boolean;
};

const UserMenu = ({ inPopover = false }: Props) => {
  const { t } = useTranslation('user');

  const menuItems = (
    <ul className={styles.menuItems}>
      <li>
        <MenuButton small={inPopover} to="/u/my-account" label={t('nav.account')} startIcon={<AccountCircle />} />
      </li>
      <li>
        <MenuButton small={inPopover} to="/u/favorites" label={t('nav.favorites')} startIcon={<Favorite />} />
      </li>
      <li>
        <MenuButton small={inPopover} to="/u/payments" label={t('nav.payments')} startIcon={<BalanceWallet />} />
      </li>
      <hr className={classNames(styles.divider, { [styles.inPopover]: inPopover })} />
      <li>
        <MenuButton small={inPopover} to="/u/logout" label={t('nav.logout')} startIcon={<Exit />} />
      </li>
    </ul>
  );

  if (inPopover) {
    return <nav className={styles.panel}>{menuItems}</nav>;
  }

  return menuItems;
};

export default UserMenu;

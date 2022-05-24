import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import AccountCircle from '../../icons/AccountCircle';
import Favorite from '../../icons/Favorite';
import BalanceWallet from '../../icons/BalanceWallet';
import Exit from '../../icons/Exit';
import MenuButton from '../MenuButton/MenuButton';

import styles from './UserMenu.module.scss';

import { logout } from '#src/stores/AccountController';

type Props = {
  inPopover?: boolean;
  showPaymentsItem: boolean;
  onClick?: () => void;
};

const UserMenu = ({ showPaymentsItem, inPopover = false, onClick }: Props) => {
  const { t } = useTranslation('user');
  const history = useHistory();

  const onLogout = useCallback(() => {
    if (onClick) {
      onClick();
    }

    logout();
    history.replace('/');
  }, [onClick, history]);

  const menuItems = (
    <ul className={styles.menuItems}>
      <li>
        <MenuButton small={inPopover} onClick={onClick} to="/u/my-account" label={t('nav.account')} startIcon={<AccountCircle />} />
      </li>
      <li>
        <MenuButton small={inPopover} onClick={onClick} to="/u/favorites" label={t('nav.favorites')} startIcon={<Favorite />} />
      </li>
      {showPaymentsItem && (
        <li>
          <MenuButton small={inPopover} onClick={onClick} to="/u/payments" label={t('nav.payments')} startIcon={<BalanceWallet />} />
        </li>
      )}
      <hr className={classNames(styles.divider, { [styles.inPopover]: inPopover })} />
      <li>
        <MenuButton small={inPopover} onClick={onLogout} label={t('nav.logout')} startIcon={<Exit />} />
      </li>
    </ul>
  );

  if (inPopover) {
    return <nav className={styles.panel}>{menuItems}</nav>;
  }

  return menuItems;
};

export default UserMenu;

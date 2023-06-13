import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './UserMenu.module.scss';

import AccountCircle from '#src/icons/AccountCircle';
import Favorite from '#src/icons/Favorite';
import BalanceWallet from '#src/icons/BalanceWallet';
import Exit from '#src/icons/Exit';
import MenuButton from '#components/MenuButton/MenuButton';
import { logout } from '#src/stores/AccountController';

type Props = {
  small?: boolean;
  showPaymentsItem: boolean;
  onClick?: () => void;
};

const UserMenu = ({ showPaymentsItem, small = false, onClick }: Props) => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();

  const onLogout = useCallback(async () => {
    if (onClick) {
      onClick();
    }

    await logout();
    navigate('/', { replace: true });
  }, [onClick, navigate]);

  return (
    <ul className={styles.menuItems}>
      <li>
        <MenuButton small={small} onClick={onClick} to="/u/my-account" label={t('nav.account')} startIcon={<AccountCircle />} />
      </li>
      <li>
        <MenuButton small={small} onClick={onClick} to="/u/favorites" label={t('nav.favorites')} startIcon={<Favorite />} />
      </li>
      {showPaymentsItem && (
        <li>
          <MenuButton small={small} onClick={onClick} to="/u/payments" label={t('nav.payments')} startIcon={<BalanceWallet />} />
        </li>
      )}
      <hr className={classNames(styles.divider, { [styles.small]: small })} />
      <li>
        <MenuButton small={small} onClick={onLogout} label={t('nav.logout')} startIcon={<Exit />} />
      </li>
    </ul>
  );
};

export default UserMenu;

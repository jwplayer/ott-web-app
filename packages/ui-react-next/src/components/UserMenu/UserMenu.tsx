import React from 'react';
import { useTranslation } from 'react-i18next';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';

import Icon from '../Icon/Icon';
import Popover from '../Popover/Popover';
import Panel from '../Panel/Panel';
import Button from '../Button/Button';
import UserMenuNav from '../UserMenuNav/UserMenuNav';
import HeaderActionButton from '../Header/HeaderActionButton';

import styles from './UserMenu.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onLoginButtonClick: () => void;
  onSignUpButtonClick: () => void;
  isLoggedIn: boolean;
  favoritesEnabled: boolean;
};

const UserMenu = ({ isLoggedIn, favoritesEnabled, open, onClose, onOpen, onLoginButtonClick, onSignUpButtonClick }: Props) => {
  const { t } = useTranslation('menu');

  if (!isLoggedIn) {
    return (
      <>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} aria-haspopup="dialog" />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} aria-haspopup="dialog" />
      </>
    );
  }

  return (
    <div>
      <HeaderActionButton
        aria-label={t('open_user_menu')}
        aria-controls="menu_panel"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={onOpen}
        onBlur={onClose}
      >
        <Icon icon={AccountCircle} />
      </HeaderActionButton>
      <Popover className={styles.popover} isOpen={open} onClose={onClose}>
        <Panel id="menu_panel">
          <div onFocus={onOpen} onBlur={onClose}>
            <UserMenuNav focusable={open} onButtonClick={onClose} showPaymentItems={true} favoritesEnabled={favoritesEnabled} small />
          </div>
        </Panel>
      </Popover>
    </div>
  );
};

export default UserMenu;

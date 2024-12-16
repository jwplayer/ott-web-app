import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';
import { useLocation, useNavigate } from 'react-router';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { determinePath } from '@jwp/ott-common/src/utils/urlFormatting';
import { useTranslationKey } from '@jwp/ott-hooks-react/src/useTranslationKey';

import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import MenuButton from '../../components/MenuButton/MenuButton';
import { modalURLFromLocation } from '../../utils/location';
import UserMenuNav from '../../components/UserMenuNav/UserMenuNav';

import styles from './SidebarContainer.module.scss';

const SidebarUserActions = ({
  sideBarOpen,
  canLogin,
  isLoggedIn,
  favoritesEnabled,
  onLoginClick,
  onSignUpClick,
}: {
  sideBarOpen: boolean;
  canLogin: boolean;
  isLoggedIn: boolean;
  favoritesEnabled: boolean;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}) => {
  const { t } = useTranslation('menu');
  const userMenuTitleId = useOpaqueId('usermenu-title');

  if (!canLogin) return null;

  return isLoggedIn ? (
    <section aria-labelledby={userMenuTitleId}>
      <UserMenuNav focusable={sideBarOpen} favoritesEnabled={favoritesEnabled} titleId={userMenuTitleId} showPaymentItems />
    </section>
  ) : (
    <div className={styles.buttonContainer}>
      <Button tabIndex={sideBarOpen ? 0 : -1} onClick={onLoginClick} label={t('sign_in')} fullWidth />
      <Button tabIndex={sideBarOpen ? 0 : -1} variant="contained" color="primary" onClick={onSignUpClick} label={t('sign_up')} fullWidth />
    </div>
  );
};

const SidebarContainer = () => {
  const { t } = useTranslation('common');
  const translationKey = useTranslationKey('label');
  const navigate = useNavigate();
  const location = useLocation();

  const sideBarOpen = useUIStore((state) => state.sideBarOpen);
  const {
    config: { menu, features },
    accessModel,
  } = useConfigStore((state) => ({
    config: state.config,
    accessModel: state.accessModel,
  }));
  const isLoggedIn = useAccountStore(({ user }) => !!user);

  const favoritesEnabled = !!features?.favoritesList;
  const canLogin = accessModel !== ACCESS_MODEL.AVOD;

  const closeSideBar = () => useUIStore.setState({ sideBarOpen: false });

  const loginButtonClickHandler = () => {
    navigate(modalURLFromLocation(location, 'login'));
  };

  const signUpButtonClickHandler = () => {
    navigate(modalURLFromLocation(location, 'create-account'));
  };

  return (
    <Sidebar isOpen={sideBarOpen} onClose={closeSideBar}>
      <ul>
        <li>
          <MenuButton label={t('home')} to="/" />
        </li>
        {menu.map(({ contentId, type, label, custom }) => (
          <li key={contentId}>
            <MenuButton label={custom?.[translationKey] || label} to={determinePath({ type, contentId })} />
          </li>
        ))}
      </ul>
      <hr className={styles.separator} />
      <SidebarUserActions
        sideBarOpen={sideBarOpen}
        favoritesEnabled={favoritesEnabled}
        canLogin={canLogin}
        isLoggedIn={isLoggedIn}
        onLoginClick={loginButtonClickHandler}
        onSignUpClick={signUpButtonClickHandler}
      />
    </Sidebar>
  );
};

export default SidebarContainer;

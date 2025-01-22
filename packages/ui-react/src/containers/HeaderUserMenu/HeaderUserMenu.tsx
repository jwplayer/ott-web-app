import React, { useCallback } from 'react';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import { useLocation, useNavigate } from 'react-router';

import UserMenu from '../../components/UserMenu/UserMenu';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import { modalURLFromLocation } from '../../utils/location';

const HeaderUserMenu = () => {
  const breakpoint = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuOpen = useUIStore((state) => state.userMenuOpen);
  const {
    config: { features },
    accessModel,
  } = useConfigStore((state) => ({
    config: state.config,
    accessModel: state.accessModel,
  }));
  const isLoggedIn = useAccountStore(({ user }) => !!user);

  const favoritesEnabled = !!features?.favoritesList;
  const canLogin = accessModel !== ACCESS_MODEL.AVOD;

  const openUserPanel = useCallback(() => useUIStore.setState({ userMenuOpen: true }), []);
  const closeUserPanel = useCallback(() => useUIStore.setState({ userMenuOpen: false }), []);

  const loginButtonClickHandler = () => navigate(modalURLFromLocation(location, 'login'));
  const signUpButtonClickHandler = () => navigate(modalURLFromLocation(location, 'create-account'));

  if (!canLogin || breakpoint <= Breakpoint.sm) return null;

  return (
    <UserMenu
      open={userMenuOpen}
      onOpen={openUserPanel}
      onClose={closeUserPanel}
      isLoggedIn={isLoggedIn}
      favoritesEnabled={favoritesEnabled}
      onLoginButtonClick={loginButtonClickHandler}
      onSignUpButtonClick={signUpButtonClickHandler}
    />
  );
};

export default HeaderUserMenu;

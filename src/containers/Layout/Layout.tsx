import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router';
import shallow from 'zustand/shallow';

import styles from './Layout.module.scss';

import { useAccountStore } from '#src/stores/AccountStore';
import { useUIStore } from '#src/stores/UIStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import useSearchQueryUpdater from '#src/hooks/useSearchQueryUpdater';
import useClientIntegration from '#src/hooks/useClientIntegration';
import Button from '#components/Button/Button';
import MarkdownComponent from '#components/MarkdownComponent/MarkdownComponent';
import Header from '#components/Header/Header';
import Sidebar from '#components/Sidebar/Sidebar';
import MenuButton from '#components/MenuButton/MenuButton';
import UserMenu from '#components/UserMenu/UserMenu';
import { addQueryParam } from '#src/utils/location';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { menu, assets, siteName, description, styling, features } = config;
  const { clientId } = useClientIntegration();
  const { searchPlaylist } = features || {};
  const { footerText } = styling || {};

  const { searchQuery, searchActive, userMenuOpen } = useUIStore(
    ({ searchQuery, searchActive, userMenuOpen }) => ({
      searchQuery,
      searchActive,
      userMenuOpen,
    }),
    shallow,
  );
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();
  const isLoggedIn = !!useAccountStore((state) => state.user);

  const searchInputRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const banner = assets.banner;

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const searchButtonClickHandler = () => {
    useUIStore.setState({
      searchActive: true,
      preSearchPage: location,
    });
  };

  const closeSearchButtonClickHandler = () => {
    resetSearchQuery();

    useUIStore.setState({
      searchActive: false,
    });
  };

  const loginButtonClickHandler = () => {
    navigate(addQueryParam(location, 'u', 'login'));
  };

  const signUpButtonClickHandler = () => {
    navigate(addQueryParam(location, 'u', 'create-account'));
  };

  const toggleUserMenu = (value: boolean) =>
    useUIStore.setState({
      userMenuOpen: value,
    });

  const renderUserActions = () => {
    if (!clientId) return null;

    return isLoggedIn ? (
      <UserMenu showPaymentsItem={accessModel !== 'AVOD'} />
    ) : (
      <div className={styles.buttonContainer}>
        <Button fullWidth onClick={loginButtonClickHandler} label={t('sign_in')} />
        <Button variant="contained" color="primary" onClick={signUpButtonClickHandler} label={t('sign_up')} fullWidth />
      </div>
    );
  };

  return (
    <div className={styles.layout}>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div className={styles.main}>
        <Header
          onMenuButtonClick={() => setSideBarOpen(true)}
          logoSrc={banner}
          searchEnabled={!!searchPlaylist}
          searchBarProps={{
            query: searchQuery,
            onQueryChange: (event) => updateSearchQuery(event.target.value),
            onClearButtonClick: () => updateSearchQuery(''),
            inputRef: searchInputRef,
          }}
          searchActive={searchActive}
          onSearchButtonClick={searchButtonClickHandler}
          onCloseSearchButtonClick={closeSearchButtonClickHandler}
          onLoginButtonClick={loginButtonClickHandler}
          onSignUpButtonClick={signUpButtonClickHandler}
          isLoggedIn={isLoggedIn}
          userMenuOpen={userMenuOpen}
          toggleUserMenu={toggleUserMenu}
          canLogin={!!clientId}
          showPaymentsMenuItem={accessModel !== 'AVOD'}
        >
          <Button label={t('home')} to="/" variant="text" />
          {menu.map((item) => (
            <Button key={item.contentId} label={item.label} to={`/p/${item.contentId}`} variant="text" />
          ))}
        </Header>
        <Sidebar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)}>
          <MenuButton label={t('home')} to="/" tabIndex={sideBarOpen ? 0 : -1} />
          {menu.map((item) => (
            <MenuButton key={item.contentId} label={item.label} to={`/p/${item.contentId}`} tabIndex={sideBarOpen ? 0 : -1} />
          ))}
          <hr className={styles.divider} />
          {renderUserActions()}
        </Sidebar>
        <Outlet />
      </div>
      {!!footerText && <MarkdownComponent className={styles.footer} markdownString={footerText} inline />}
    </div>
  );
};

export default Layout;

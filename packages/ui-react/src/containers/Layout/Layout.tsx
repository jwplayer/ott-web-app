import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import classNames from 'classnames';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useProfileStore } from '@jwp/ott-common/src/stores/ProfileStore';
import ProfileController from '@jwp/ott-common/src/stores/ProfileController';
import { addQueryParam } from '@jwp/ott-ui-react/src/utils/location';
import { IS_DEVELOPMENT_BUILD } from '@jwp/ott-common/src/utils/common';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import useSearchQueryUpdater from '@jwp/ott-ui-react/src/hooks/useSearchQueryUpdater';
import { useProfiles, useSelectProfile } from '@jwp/ott-hooks-react/src/useProfiles';

import Button from '../../components/Button/Button';
import MarkdownComponent from '../../components/MarkdownComponent/MarkdownComponent';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import MenuButton from '../../components/MenuButton/MenuButton';
import UserMenu from '../../components/UserMenu/UserMenu';

import styles from './Layout.module.scss';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');

  const { config, accessModel, clientId, supportedLanguages } = useConfigStore(
    ({ config, accessModel, clientId, supportedLanguages }) => ({ config, accessModel, clientId, supportedLanguages }),
    shallow,
  );
  const isLoggedIn = !!useAccountStore(({ user }) => user);
  const favoritesEnabled = !!config.features?.favoritesList;
  const { menu, assets, siteName, description, styling, features } = config;
  const metaDescription = description || t('default_description');

  const profileController = getModule(ProfileController, false);

  const { searchPlaylist } = features || {};
  const { footerText } = styling || {};
  const currentLanguage = useMemo(() => supportedLanguages.find(({ code }) => code === i18n.language), [i18n.language, supportedLanguages]);

  const {
    query: { data: { responseData: { collection: profiles = [] } = {} } = {} },
    profilesEnabled,
  } = useProfiles();

  const selectProfile = useSelectProfile();

  const { searchQuery, searchActive, userMenuOpen, languageMenuOpen } = useUIStore(
    ({ searchQuery, searchActive, userMenuOpen, languageMenuOpen }) => ({
      languageMenuOpen,
      searchQuery,
      searchActive,
      userMenuOpen,
    }),
    shallow,
  );
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();
  const { profile } = useProfileStore();

  const searchInputRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const banner = assets.banner;

  useEffect(() => {
    if (isLoggedIn && profilesEnabled && !profiles?.length) {
      profileController?.unpersistProfile();
    }
    // Trigger once on the initial page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const searchButtonClickHandler = () => {
    useUIStore.setState({
      searchActive: true,
      preSearchPage: `${location.pathname}${location.search || ''}`,
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

  const languageClickHandler = async (code: string) => {
    await i18n.changeLanguage(code);
  };

  // useCallbacks are used here to fix a bug in the Popover when using a Reactive onClose callback
  const openUserMenu = useCallback(() => useUIStore.setState({ userMenuOpen: true }), []);
  const closeUserMenu = useCallback(() => useUIStore.setState({ userMenuOpen: false }), []);
  const openLanguageMenu = useCallback(() => useUIStore.setState({ languageMenuOpen: true }), []);
  const closeLanguageMenu = useCallback(() => useUIStore.setState({ languageMenuOpen: false }), []);

  const renderUserActions = () => {
    if (!clientId) return null;

    return isLoggedIn ? (
      <UserMenu showPaymentsItem={accessModel !== ACCESS_MODEL.AVOD} favoritesEnabled={favoritesEnabled} />
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
        <meta name="description" content={metaDescription} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:title" content={siteName} />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={metaDescription} />
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
          onLanguageClick={languageClickHandler}
          supportedLanguages={supportedLanguages}
          currentLanguage={currentLanguage}
          isLoggedIn={isLoggedIn}
          userMenuOpen={userMenuOpen}
          languageMenuOpen={languageMenuOpen}
          openUserMenu={openUserMenu}
          closeUserMenu={closeUserMenu}
          openLanguageMenu={openLanguageMenu}
          closeLanguageMenu={closeLanguageMenu}
          canLogin={!!clientId}
          showPaymentsMenuItem={accessModel !== ACCESS_MODEL.AVOD}
          favoritesEnabled={favoritesEnabled}
          profilesData={{
            currentProfile: profile,
            profiles,
            profilesEnabled,
            selectProfile: ({ avatarUrl, id }) => selectProfile.mutate({ id, avatarUrl }),
            isSelectingProfile: selectProfile.isLoading,
          }}
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
      {!!footerText && (
        <MarkdownComponent
          // The extra style below is just to fix the footer on mobile when the dev selector is shown
          className={classNames(styles.footer, { [styles.testFixMargin]: IS_DEVELOPMENT_BUILD })}
          markdownString={footerText}
          inline
        />
      )}
    </div>
  );
};

export default Layout;

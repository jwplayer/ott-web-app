import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import styles from './Layout.module.scss';

import { useAccountStore } from '#src/stores/AccountStore';
import { useUIStore } from '#src/stores/UIStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import useSearchQueryUpdater from '#src/hooks/useSearchQueryUpdater';
import Button from '#src/components/Button/Button';
import MarkdownComponent from '#src/components/MarkdownComponent/MarkdownComponent';
import Header from '#src/components/Header/Header';
import Sidebar from '#src/components/Sidebar/Sidebar';
import DynamicBlur from '#src/components/DynamicBlur/DynamicBlur';
import MenuButton from '#src/components/MenuButton/MenuButton';
import UserMenu from '#src/components/UserMenu/UserMenu';
import ConfigSelect from '#src/components/ConfigSelect';
import { addQueryParam } from '#src/utils/history';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const history = useHistory();
  const { t } = useTranslation('common');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { menu, assets, siteName, description, integrations, styling, features } = config;
  const cleengId = integrations?.cleeng?.id;
  const { searchPlaylist } = features || {};
  const { footerText, dynamicBlur } = styling || {};

  const { blurImage, searchQuery, searchActive, userMenuOpen } = useUIStore(
    ({ blurImage, searchQuery, searchActive, userMenuOpen }) => ({
      blurImage,
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
  const hasDynamicBlur = dynamicBlur === true;
  const banner = assets.banner;

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const searchButtonClickHandler = () => {
    useUIStore.setState({
      searchActive: true,
      preSearchPage: history.location,
    });
  };

  const closeSearchButtonClickHandler = () => {
    resetSearchQuery();

    useUIStore.setState({
      searchActive: false,
    });
  };

  const loginButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  const signUpButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'create-account'));
  };

  const toggleUserMenu = (value: boolean) =>
    useUIStore.setState({
      userMenuOpen: value,
    });

  const renderUserActions = () => {
    if (!cleengId) return null;

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
        {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} transitionTime={1} debounceTime={350} />}
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
          canLogin={!!cleengId}
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
        {children}
      </div>
      {!!footerText && (
        <div className={styles.footer}>
          <MarkdownComponent markdownString={footerText} />
        </div>
      )}

      {/* Config select control to improve testing experience */}
      {import.meta.env.APP_INCLUDE_TEST_CONFIGS && <ConfigSelect />}
    </div>
  );
};

export default Layout;

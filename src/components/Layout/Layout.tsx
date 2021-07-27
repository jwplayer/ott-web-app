import React, { FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { AccountStore } from '../../stores/AccountStore';
import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import { UIStore } from '../../stores/UIStore';
import Button from '../Button/Button';
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import DynamicBlur from '../DynamicBlur/DynamicBlur';
import { ConfigContext } from '../../providers/ConfigProvider';
import MenuButton from '../../components/MenuButton/MenuButton';
import { addQueryParam } from '../../utils/history';
import UserMenu from '../UserMenu/UserMenu';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const history = useHistory();
  const { t } = useTranslation('common');
  const { menu, assets, options, siteName, description, footerText, searchPlaylist } = useContext(ConfigContext);
  const blurImage = UIStore.useState((s) => s.blurImage);
  const searchQuery = UIStore.useState((s) => s.searchQuery);
  const searchActive = UIStore.useState((s) => s.searchActive);
  const userMenuOpen = UIStore.useState((s) => s.userMenuOpen);
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();
  const isLoggedIn = !!AccountStore.useState((state) => state.user);

  const searchInputRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = options.dynamicBlur === true;
  const banner = assets.banner;

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const searchButtonClickHandler = () => {
    UIStore.update((s) => {
      s.searchActive = true;
    });
  };

  const closeSearchButtonClickHandler = () => {
    resetSearchQuery();

    UIStore.update((s) => {
      s.searchActive = false;
    });
  };

  const loginButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  const signUpButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'create-account'));
  };

  const toggleUserMenu = (value: boolean) =>
    UIStore.update((state) => {
      state.userMenuOpen = value;
    });

  const userActions = isLoggedIn ? (
    <UserMenu />
  ) : (
    <div className={styles.buttonContainer}>
      <Button fullWidth onClick={loginButtonClickHandler} label="Login" />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          'sign up';
        }}
        label="Sign up"
        fullWidth
      />
    </div>
  );

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
        >
          <Button label={t('home')} to="/" variant="text" />
          {menu.map((item) => (
            <Button key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} variant="text" />
          ))}
        </Header>
        <Sidebar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)}>
          <MenuButton label={t('home')} to="/" tabIndex={sideBarOpen ? 0 : -1} />
          {menu.map((item) => (
            <MenuButton key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} tabIndex={sideBarOpen ? 0 : -1} />
          ))}
          <hr className={styles.divider} />
          {userActions}
        </Sidebar>
        {children}
      </div>
      {!!footerText && (
        <div className={styles.footer}>
          <MarkdownComponent markdownString={footerText} />
        </div>
      )}
    </div>
  );
};

export default Layout;

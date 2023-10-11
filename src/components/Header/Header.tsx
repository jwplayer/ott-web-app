import React, { ReactFragment, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.scss';

import AccountCircle from '#src/icons/AccountCircle';
import SearchBar, { Props as SearchBarProps } from '#components/SearchBar/SearchBar';
import Logo from '#components/Logo/Logo';
import Menu from '#src/icons/Menu';
import SearchIcon from '#src/icons/Search';
import CloseIcon from '#src/icons/Close';
import Button from '#components/Button/Button';
import Popover from '#components/Popover/Popover';
import UserMenu from '#components/UserMenu/UserMenu';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import IconButton from '#components/IconButton/IconButton';
import Language from '#src/icons/Language';
import LanguageMenu from '#components/LanguageMenu/LanguageMenu';
import type { LanguageDefinition } from '#src/i18n/config';
import Panel from '#components/Panel/Panel';
import type { Profile } from '#types/account';
import ProfileCircle from '#src/icons/ProfileCircle';
import type { AccessModel } from '#types/Config';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  logoSrc?: string | null;
  searchBarProps: SearchBarProps;
  searchEnabled: boolean;
  searchActive: boolean;
  onSearchButtonClick?: () => void;
  onCloseSearchButtonClick?: () => void;
  onLoginButtonClick?: () => void;
  onSignUpButtonClick?: () => void;
  openUserMenu: () => void;
  closeUserMenu: () => void;
  openLanguageMenu: () => void;
  closeLanguageMenu: () => void;
  children?: ReactFragment;
  isLoggedIn: boolean;
  userMenuOpen: boolean;
  languageMenuOpen: boolean;
  canLogin: boolean;
  showPaymentsMenuItem: boolean;
  supportedLanguages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
  onLanguageClick: (code: string) => void;
  currentProfile?: Profile;
  profiles?: Profile[];
  profilesEnabled?: boolean;
  accessModel?: AccessModel;
};

const Header: React.FC<Props> = ({
  children,
  headerType = 'static',
  onMenuButtonClick,
  logoSrc,
  searchBarProps,
  searchActive,
  onSearchButtonClick,
  searchEnabled,
  onLoginButtonClick,
  onCloseSearchButtonClick,
  onSignUpButtonClick,
  isLoggedIn,
  userMenuOpen,
  languageMenuOpen,
  openUserMenu,
  closeUserMenu,
  openLanguageMenu,
  closeLanguageMenu,
  canLogin = false,
  showPaymentsMenuItem,
  supportedLanguages,
  currentLanguage,
  onLanguageClick,
  currentProfile,
  profiles,
  profilesEnabled,
  accessModel,
}) => {
  const { t } = useTranslation('menu');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const breakpoint = useBreakpoint();
  const headerClassName = classNames(styles.header, styles[headerType], {
    [styles.searchActive]: searchActive,
  });

  // only show the language dropdown when there are other languages to choose from
  const showLanguageSwitcher = supportedLanguages.length > 1;

  const renderSearch = () => {
    if (!searchEnabled) return null;

    return searchActive ? (
      <div className={styles.searchContainer}>
        <SearchBar {...searchBarProps} />
        <IconButton
          className={styles.iconButton}
          aria-label="Close search"
          onClick={() => {
            if (onCloseSearchButtonClick) {
              onCloseSearchButtonClick();
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
    ) : (
      <IconButton
        className={classNames(styles.iconButton, styles.actionButton)}
        aria-label="Open search"
        onClick={() => {
          if (onSearchButtonClick) {
            onSearchButtonClick();
          }
        }}
      >
        <SearchIcon />
      </IconButton>
    );
  };

  const renderUserActions = () => {
    if (!canLogin || breakpoint <= Breakpoint.sm) return null;

    return isLoggedIn ? (
      <React.Fragment>
        <IconButton className={classNames(styles.iconButton, styles.actionButton)} aria-label={t('open_user_menu')} onClick={openUserMenu}>
          {currentProfile?.avatar_url ? <ProfileCircle src={currentProfile.avatar_url} alt={currentProfile.name} /> : <AccountCircle />}
        </IconButton>
        <Popover isOpen={userMenuOpen} onClose={closeUserMenu}>
          <Panel>
            <UserMenu
              onClick={closeUserMenu}
              showPaymentsItem={showPaymentsMenuItem}
              small
              accessModel={accessModel}
              currentProfile={currentProfile}
              profilesEnabled={profilesEnabled}
              profiles={profiles}
            />
          </Panel>
        </Popover>
      </React.Fragment>
    ) : (
      <div className={styles.buttonContainer}>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} />
      </div>
    );
  };

  const renderLanguageDropdown = () => {
    if (!showLanguageSwitcher) return null;

    return (
      <React.Fragment>
        <IconButton className={classNames(styles.iconButton, styles.actionButton)} aria-label={t('select_language')} onClick={openLanguageMenu}>
          <Language />
        </IconButton>
        <Popover isOpen={languageMenuOpen} onClose={closeLanguageMenu}>
          <Panel>
            <LanguageMenu
              onClick={(code) => {
                onLanguageClick(code);
                closeLanguageMenu();
              }}
              languages={supportedLanguages}
              currentLanguage={currentLanguage}
            />
          </Panel>
        </Popover>
      </React.Fragment>
    );
  };

  return (
    <header className={headerClassName}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <IconButton className={styles.iconButton} aria-label={t('open_menu')} onClick={onMenuButtonClick}>
            <Menu />
          </IconButton>
        </div>
        {logoSrc && (
          <div className={styles.brand}>
            <Logo src={logoSrc} onLoad={() => setLogoLoaded(true)} />
          </div>
        )}
        <nav className={styles.nav} aria-label="menu">
          {logoLoaded || !logoSrc ? children : null}
        </nav>
        <div className={styles.actions}>
          {renderSearch()}
          {renderLanguageDropdown()}
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
};
export default Header;

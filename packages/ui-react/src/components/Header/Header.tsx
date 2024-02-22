import React, { type ReactNode, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';
import Menu from '@jwp/ott-theme/assets/icons/menu.svg?react';
import SearchIcon from '@jwp/ott-theme/assets/icons/search.svg?react';
import CloseIcon from '@jwp/ott-theme/assets/icons/close.svg?react';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';
import type { Profile } from '@jwp/ott-common/types/profiles';

import SearchBar, { type Props as SearchBarProps } from '../SearchBar/SearchBar';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import UserMenu from '../UserMenu/UserMenu';
import ProfilesMenu from '../ProfilesMenu/ProfilesMenu';
import IconButton from '../IconButton/IconButton';
import LanguageMenu from '../LanguageMenu/LanguageMenu';
import Panel from '../Panel/Panel';
import Icon from '../Icon/Icon';
import ProfileCircle from '../ProfileCircle/ProfileCircle';
import Popover from '../Popover/Popover';

import styles from './Header.module.scss';

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
  openUserPanel: () => void;
  closeUserPanel: () => void;
  openLanguageMenu: () => void;
  closeLanguageMenu: () => void;
  children?: ReactNode;
  isLoggedIn: boolean;
  sideBarOpen: boolean;
  userMenuOpen: boolean;
  languageMenuOpen: boolean;
  canLogin: boolean;
  showPaymentsMenuItem: boolean;
  supportedLanguages: LanguageDefinition[];
  currentLanguage: LanguageDefinition | undefined;
  onLanguageClick: (code: string) => void;
  favoritesEnabled?: boolean;

  profilesData?: {
    currentProfile: Profile | null;
    profiles: Profile[];
    profilesEnabled: boolean;
    selectProfile: ({ avatarUrl, id }: { avatarUrl: string; id: string }) => void;
    isSelectingProfile: boolean;
  };
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
  sideBarOpen,
  userMenuOpen,
  languageMenuOpen,
  openUserPanel,
  closeUserPanel,
  openLanguageMenu,
  closeLanguageMenu,
  canLogin = false,
  showPaymentsMenuItem,
  supportedLanguages,
  currentLanguage,
  onLanguageClick,
  favoritesEnabled,
  profilesData: { currentProfile, profiles, profilesEnabled, selectProfile, isSelectingProfile } = {},
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
        <SearchBar {...searchBarProps} onClose={onCloseSearchButtonClick} />
        <IconButton className={styles.iconButton} aria-label="Close search" onClick={onCloseSearchButtonClick}>
          <Icon icon={CloseIcon} />
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
        <Icon icon={SearchIcon} />
      </IconButton>
    );
  };

  const renderUserActions = () => {
    if (!canLogin || breakpoint <= Breakpoint.sm) return null;

    return isLoggedIn ? (
      <React.Fragment>
        <IconButton
          className={classNames(styles.iconButton, styles.actionButton)}
          aria-label={t('open_user_menu')}
          aria-controls="menu_panel"
          aria-expanded={userMenuOpen}
          aria-haspopup="menu"
          onClick={openUserPanel}
          onBlur={closeUserPanel}
        >
          {profilesEnabled && currentProfile ? (
            <ProfileCircle src={currentProfile.avatar_url} alt={currentProfile.name || t('profile_icon')} />
          ) : (
            <Icon icon={AccountCircle} />
          )}
        </IconButton>
        <Popover isOpen={userMenuOpen} onClose={closeUserPanel}>
          <Panel id="menu_panel">
            <div onFocus={openUserPanel} onBlur={closeUserPanel}>
              {profilesEnabled && (
                <ProfilesMenu
                  onButtonClick={closeUserPanel}
                  profiles={profiles ?? []}
                  currentProfile={currentProfile}
                  selectingProfile={!!isSelectingProfile}
                  selectProfile={selectProfile}
                  small
                />
              )}
              <UserMenu
                focusable={userMenuOpen}
                onButtonClick={closeUserPanel}
                showPaymentsItem={showPaymentsMenuItem}
                currentProfile={currentProfile}
                favoritesEnabled={favoritesEnabled}
                small
              />
            </div>
          </Panel>
        </Popover>
      </React.Fragment>
    ) : (
      <div className={styles.buttonContainer}>
        <Button onClick={onLoginButtonClick} label={t('sign_in')} aria-haspopup="dialog" />
        <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} aria-haspopup="dialog" />
      </div>
    );
  };

  const renderLanguageDropdown = () => {
    if (!showLanguageSwitcher) return null;

    return (
      <LanguageMenu
        className={classNames(styles.iconButton, styles.actionButton)}
        openLanguageMenu={openLanguageMenu}
        closeLanguageMenu={closeLanguageMenu}
        languageMenuOpen={languageMenuOpen}
        onClick={(code) => {
          onLanguageClick(code);
        }}
        languages={supportedLanguages}
        currentLanguage={currentLanguage}
      />
    );
  };

  return (
    <header className={headerClassName}>
      <div className={styles.container}>
        <a href="#content" className={styles.skipToContent}>
          {t('skip_to_content')}
        </a>
        <div className={styles.menu}>
          <IconButton
            className={styles.iconButton}
            aria-label={sideBarOpen ? t('close_menu') : t('open_menu')}
            aria-controls="sidebar"
            aria-haspopup="true"
            aria-expanded={sideBarOpen}
            onClick={() => onMenuButtonClick()}
          >
            <Icon icon={Menu} />
          </IconButton>
        </div>
        {logoSrc && (
          <div className={styles.brand}>
            <Logo src={logoSrc} onLoad={() => setLogoLoaded(true)} />
          </div>
        )}
        <nav className={styles.nav}>{logoLoaded || !logoSrc ? children : null}</nav>
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

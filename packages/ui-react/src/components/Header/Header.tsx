import React, { type ReactNode, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { Profile } from '@jwp/ott-common/types/account';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import type { LanguageDefinition } from '@jwp/ott-common/types/i18n';
import Menu from '@jwp/ott-theme/assets/icons/menu.svg?react';
import SearchIcon from '@jwp/ott-theme/assets/icons/search.svg?react';
import CloseIcon from '@jwp/ott-theme/assets/icons/close.svg?react';
import Language from '@jwp/ott-theme/assets/icons/language.svg?react';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';

import SearchBar, { type Props as SearchBarProps } from '../SearchBar/SearchBar';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import Popover from '../Popover/Popover';
import UserMenu from '../UserMenu/UserMenu';
import IconButton from '../IconButton/IconButton';
import LanguageMenu from '../LanguageMenu/LanguageMenu';
import Panel from '../Panel/Panel';
import Icon from '../Icon/Icon';
import ProfileCircle from '../ProfileCircle/ProfileCircle';

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
  openUserMenu: () => void;
  closeUserMenu: () => void;
  openLanguageMenu: () => void;
  closeLanguageMenu: () => void;
  children?: ReactNode;
  isLoggedIn: boolean;
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
        <IconButton className={classNames(styles.iconButton, styles.actionButton)} aria-label={t('open_user_menu')} onClick={openUserMenu}>
          {profilesEnabled && currentProfile ? (
            <ProfileCircle src={currentProfile.avatar_url} alt={currentProfile.name || t('profile_icon')} />
          ) : (
            <Icon icon={AccountCircle} />
          )}
        </IconButton>
        <Popover isOpen={userMenuOpen} onClose={closeUserMenu}>
          <Panel>
            <UserMenu
              onClick={closeUserMenu}
              showPaymentsItem={showPaymentsMenuItem}
              small
              currentProfile={currentProfile}
              profilesEnabled={profilesEnabled}
              profiles={profiles}
              selectProfile={selectProfile}
              isSelectingProfile={!!isSelectingProfile}
              favoritesEnabled={favoritesEnabled}
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
          <Icon icon={Language} />
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
            <Icon icon={Menu} />
          </IconButton>
        </div>
        <a href="#content" className={styles.skipToContent}>
          {t('skip_to_content')}
        </a>
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

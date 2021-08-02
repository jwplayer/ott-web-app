import React, { ReactFragment, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import AccountCircle from '../../icons/AccountCircle';
import SearchBar, { Props as SearchBarProps } from '../SearchBar/SearchBar';
import Logo from '../Logo/Logo';
import Menu from '../../icons/Menu';
import SearchIcon from '../../icons/Search';
import CloseIcon from '../../icons/Close';
import IconButton from '../../components/IconButton/IconButton';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Button from '../Button/Button';
import Popover from '../Popover/Popover';
import UserMenu from '../UserMenu/UserMenu';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  logoSrc?: string;
  searchBarProps: SearchBarProps;
  searchEnabled: boolean;
  searchActive: boolean;
  onSearchButtonClick?: () => void;
  onCloseSearchButtonClick?: () => void;
  onLoginButtonClick?: () => void;
  onSignUpButtonClick?: () => void;
  toggleUserMenu: (value: boolean) => void;
  children?: ReactFragment;
  isLoggedIn: boolean;
  userMenuOpen: boolean;
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
  onCloseSearchButtonClick,
  onLoginButtonClick,
  onSignUpButtonClick,
  isLoggedIn,
  userMenuOpen,
  toggleUserMenu,
}) => {
  const { t } = useTranslation('menu');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const breakpoint = useBreakpoint();
  const headerClassName = classNames(styles.header, styles[headerType], {
    [styles.mobileSearchActive]: searchActive && breakpoint <= Breakpoint.sm,
  });

  const search =
    breakpoint <= Breakpoint.sm ? (
      searchActive ? (
        <div className={styles.mobileSearch}>
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
          className={styles.iconButton}
          aria-label="Open search"
          onClick={() => {
            if (onSearchButtonClick) {
              onSearchButtonClick();
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      )
    ) : (
      <SearchBar {...searchBarProps} />
    );

  const userActions =
    breakpoint >= Breakpoint.sm ? (
      isLoggedIn ? (
        <React.Fragment>
          <IconButton className={styles.iconButton} aria-label={t('open_user_menu')} onClick={() => toggleUserMenu(!userMenuOpen)}>
            <AccountCircle />
          </IconButton>
          <Popover isOpen={userMenuOpen} onClose={() => toggleUserMenu(false)}>
            <UserMenu inPopover />
          </Popover>
        </React.Fragment>
      ) : (
        <div className={styles.buttonContainer}>
          <Button onClick={onLoginButtonClick} label={t('sign_in')} />
          <Button variant="contained" color="primary" onClick={onSignUpButtonClick} label={t('sign_up')} />
        </div>
      )
    ) : null;

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
          {logoLoaded ? children : null}
        </nav>
        <div className={styles.search}>{searchEnabled ? search : null}</div>
        {userActions}
      </div>
    </header>
  );
};
export default Header;

import React, { ReactFragment, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import SearchBar, { Props as SearchBarProps } from '../SearchBar/SearchBar';
import Logo from '../Logo/Logo';
import Menu from '../../icons/Menu';
import SearchIcon from '../../icons/Search';
import CloseIcon from '../../icons/Close';
import IconButton from '../../components/IconButton/IconButton';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  logoSrc?: string;
  searchBarProps: SearchBarProps;
  searchEnabled: boolean;
  onCloseSearchButtonClick?: () => void;
  children?: ReactFragment;
};

const Header: React.FC<Props> = (
  {
    children,
    headerType = 'static',
    onMenuButtonClick,
    logoSrc,
    searchBarProps,
    searchEnabled,
    onCloseSearchButtonClick,
  }
  ) => {
    const { t } = useTranslation('menu');
    const [mobileSearchActive, setMobileSearchActive] = useState(false);
    const breakpoint = useBreakpoint();
    const headerClassName = classNames(styles.header, styles[headerType], {
      [styles.mobileSearchActive]: mobileSearchActive && breakpoint <= Breakpoint.sm
    });

    const search = breakpoint <= Breakpoint.sm ?
      mobileSearchActive ? (
        <div className={styles.mobileSearch}>
          <SearchBar {...searchBarProps} />
          <IconButton
            className={styles.iconButton}
            aria-label="Close search"
            onClick={() => {
              setMobileSearchActive(false);

              if (onCloseSearchButtonClick) {
                onCloseSearchButtonClick();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      ) : (
        <IconButton className={styles.iconButton} aria-label="Open search" onClick={() => setMobileSearchActive(true)}>
          <SearchIcon />
        </IconButton>
      ) : (
        <SearchBar {...searchBarProps} />
      );

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
              <Logo src={logoSrc} />
            </div>
          )}
          <nav className={styles.nav} aria-label="menu">
            {children}
          </nav>
          <div className={styles.search}>{searchEnabled ? search : null}</div>
        </div>
      </header>
    );
  }
;

export default Header;

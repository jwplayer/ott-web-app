import React from 'react';
import classNames from 'classnames';

import ButtonLink from '../ButtonLink/ButtonLink';
import Logo from '../Logo/Logo';
import Menu from '../../icons/Menu';
import IconButton from '../../components/IconButton/IconButton';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  onMenuButtonClick: () => void;
  playlistMenuItems: JSX.Element[];
  logoSrc?: string;
  background?: string;
};

const Header: React.FC<Props> = ({
  headerType = 'static',
  onMenuButtonClick,
  playlistMenuItems,
  logoSrc,
  background = 'none',
}) => {
  return (
    <header className={classNames(styles.header, styles[headerType])} style={{ background }}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <IconButton aria-label="open menu" onClick={onMenuButtonClick}>
            <Menu />
          </IconButton>
        </div>
        {logoSrc && <Logo src={logoSrc} />}
        <nav className={styles.nav} aria-label="menu">
          <ButtonLink label="Home" to="/" />
          {playlistMenuItems}
          <ButtonLink label="Settings" to="/u" />
        </nav>
        <div className={styles.search}></div>
      </div>
    </header>
  );
};

export default Header;

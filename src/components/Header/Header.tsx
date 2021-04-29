import React from 'react';
import classNames from 'classnames';

import ButtonLink from '../ButtonLink/ButtonLink';
import Logo from '../Logo/Logo';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type HeaderProps = {
  headerType?: TypeHeader;
};

const Header: React.FC<HeaderProps> = ({ headerType = 'static' }) => {
  return (
    <header className={classNames(styles.header, styles[headerType])}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <span>Placeholder</span>
        </div>
        <Logo src="https://cdn.jwplayer.com/images/HXyBCU5N.png" />
        <nav className={styles.nav}>
          <ButtonLink label="Home" to="/" />
          {/* mock */}
          <ButtonLink label="Playlist" to="/p/:id" />
          <ButtonLink label="Settings" to="/u" />
          {/* mock */}
        </nav>
      </div>
    </header>
  );
};

export default Header;

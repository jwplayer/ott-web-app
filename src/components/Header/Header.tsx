import React from 'react';
import classNames from 'classnames';

import ButtonLink from '../ButtonLink/ButtonLink';
import Logo from '../Logo/Logo';
import Menu from '../../icons/Menu';

import styles from './Header.module.scss';

type TypeHeader = 'static' | 'fixed';

type Props = {
  headerType?: TypeHeader;
  openSideBar: (sideBarOpen: boolean) => void;
};

const Header: React.FC<Props> = ({ headerType = 'static', openSideBar }) => {
  return (
    <header className={classNames(styles.header, styles[headerType])}>
      <div className={styles.container}>
        <div
          className={styles.menu}
          onClick={(sideBarOpen) => openSideBar(!sideBarOpen)}
        >
          <Menu />
        </div>
        <Logo src="https://cdn.jwplayer.com/images/HXyBCU5N.png" />
        <nav className={styles.nav}>
          <ButtonLink label="Home" to="/" />
          {/* mock */}
          <ButtonLink label="Playlist" to="/p/:id" />
          <ButtonLink label="Settings" to="/u" />
          {/* mock */}
        </nav>
        <div className={styles.search}></div>
      </div>
    </header>
  );
};

export default Header;

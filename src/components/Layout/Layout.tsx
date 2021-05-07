import React, { ReactNode, FC, useState, useContext } from 'react';

import ButtonLink from '../ButtonLink/ButtonLink';
import { ConfigContext } from '../../providers/configProvider';
import Header from '../Header/Header';
import SideBar from '../SideBar/SideBar';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const { menu, assets } = useContext(ConfigContext);
  const [sideBarOpen, setSideBarOpen] = useState(false);

  const playlistMenuItems = menu.map((item) => (
    <ButtonLink
      key={item.playlistId}
      label={item.label}
      to={`/p/${item.playlistId}`}
    />
  ));

  return (
    <div className={styles.layout}>
      <Header
        onMenuButtonClick={() => setSideBarOpen(true)}
        playlistMenuItems={playlistMenuItems}
        logoSrc={assets.banner}
      />
      <SideBar
        isOpen={sideBarOpen}
        onClose={() => setSideBarOpen(false)}
        playlistMenuItems={playlistMenuItems}
      />
      {children}
    </div>
  );
};

export default Layout;

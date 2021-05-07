import React, { ReactNode, FC, useState, useContext } from 'react';

import ButtonLink from '../ButtonLink/ButtonLink';
import Header from '../Header/Header';
import SideBar from '../SideBar/SideBar';
import DynamicBlur from '../DynamicBlur/DynamicBlur';
import { ConfigContext } from '../../providers/configProvider';
import { UIStateContext } from '../../providers/uiStateProvider';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const { menu, assets, options } = useContext(ConfigContext);
  const { blurImage } = useContext(UIStateContext);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = options.dynamicBlur === true;

  const playlistMenuItems = menu.map((item) => (
    <ButtonLink key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} />
  ));

  return (
    <div className={styles.layout}>
      {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} />}
      <Header
        onMenuButtonClick={() => setSideBarOpen(true)}
        playlistMenuItems={playlistMenuItems}
        logoSrc={assets.banner}
      />
      <SideBar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)} playlistMenuItems={playlistMenuItems} />
      {children}
    </div>
  );
};

export default Layout;

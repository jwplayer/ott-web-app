import React, { ReactNode, FC, useState, useContext } from 'react';

import ButtonLink from '../ButtonLink/ButtonLink';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import DynamicBlur from '../DynamicBlur/DynamicBlur';
import { ConfigContext } from '../../providers/ConfigProvider';
import { UIStateContext } from '../../providers/uiStateProvider';

import styles from './Layout.module.scss';
import MenuButton from '../../components/MenuButton/MenuButton';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const { menu, assets, options } = useContext(ConfigContext);
  const { blurImage } = useContext(UIStateContext);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = options.dynamicBlur === true;

  return (
    <div className={styles.layout}>
      {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} transitionTime={1} debounceTime={350} />}
      <Header
        onMenuButtonClick={() => setSideBarOpen(true)}
        playlistMenuItems={menu.map((item) => (
          <ButtonLink key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} />
        ))}
        logoSrc={assets.banner}
      />
      <Sidebar
        isOpen={sideBarOpen}
        onClose={() => setSideBarOpen(false)}
        playlistMenuItems={menu.map((item) => (
          <MenuButton key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} />
        ))}
      />
      {children}
    </div>
  );
};

export default Layout;

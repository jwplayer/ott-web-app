import React, { ReactNode, FC, useState, useContext } from 'react';

import { UIStore } from '../../state/UIStore';
import ButtonLink from '../ButtonLink/ButtonLink';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import DynamicBlur from '../DynamicBlur/DynamicBlur';
import { ConfigContext } from '../../providers/ConfigProvider';
import MenuButton from '../../components/MenuButton/MenuButton';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const { menu, assets, options } = useContext(ConfigContext);
  const blurImage = UIStore.useState((s) => s.blurImage);
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
          <MenuButton
            key={item.playlistId}
            label={item.label}
            to={`/p/${item.playlistId}`}
            tabIndex={sideBarOpen ? 0 : -1}
          />
        ))}
      />
      {children}
    </div>
  );
};

export default Layout;

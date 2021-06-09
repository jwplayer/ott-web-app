import React, { ReactNode, FC, useState, useContext } from 'react';

import Button from '../Button/Button';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import DynamicBlur from '../DynamicBlur/DynamicBlur';
import { ConfigContext } from '../../providers/ConfigProvider';
import { UIStateContext } from '../../providers/uiStateProvider';
import MenuButton from '../../components/MenuButton/MenuButton';

import styles from './Layout.module.scss';

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
      <Header onMenuButtonClick={() => setSideBarOpen(true)} logoSrc={assets.banner}>
        <Button label="Home" to="/" variant="text" />
        {menu.map((item) => (
          <Button key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} variant="text" />
        ))}
        <Button label="Settings" to="/u" variant="text" />
      </Header>
      <Sidebar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)}>
        <MenuButton label="Home" to="/" tabIndex={sideBarOpen ? 0 : -1} />
        {menu.map((item) => (
          <MenuButton
            key={item.playlistId}
            label={item.label}
            to={`/p/${item.playlistId}`}
            tabIndex={sideBarOpen ? 0 : -1}
          />
        ))}
        <hr className={styles.divider} />
        <MenuButton label="Settings" to="/u" tabIndex={sideBarOpen ? 0 : -1} />
      </Sidebar>
      {children}
    </div>
  );
};

export default Layout;

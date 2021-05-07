import React, { ReactNode, FC, useState, useContext } from 'react';
import type { Config } from 'types/Config';

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
  const config: Config = useContext(ConfigContext);
  const { blurImage } = useContext(UIStateContext);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = config?.options.dynamicBlur === true;

  return (
    <div className={styles.layout}>
      {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} />}
      <Header onMenuButtonClick={() => setSideBarOpen(true)} />
      <SideBar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)} />
      {children}
    </div>
  );
};

export default Layout;

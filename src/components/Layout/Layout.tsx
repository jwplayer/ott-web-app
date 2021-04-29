import React, { ReactNode, FC, useState } from 'react';

import Header from '../Header/Header';
import SideBar from '../SideBar/SideBar';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const [sideBarOpen, toggleSideBar] = useState(false);

  return (
    <div className={styles.layout}>
      <Header openSideBar={() => toggleSideBar(true)} />
      <SideBar
        sideBarOpen={sideBarOpen}
        closeSideBar={() => toggleSideBar(false)}
      />
      {children}
    </div>
  );
};

export default Layout;

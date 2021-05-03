import React, { ReactNode, FC, useState } from 'react';

import Header from '../Header/Header';
import SideBar from '../SideBar/SideBar';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Header onMenuButtonClick={() => setSideBarOpen(true)} />
      <SideBar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)} />
      {children}
    </div>
  );
};

export default Layout;

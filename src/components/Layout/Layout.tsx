import React, { ReactNode, FC, useState, useContext } from 'react';
import { Helmet } from 'react-helmet';

import ButtonLink from '../ButtonLink/ButtonLink';
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
  const { menu, assets, options, siteName, description, footerText } = useContext(ConfigContext);
  const { blurImage } = useContext(UIStateContext);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = options.dynamicBlur === true;
  const banner = assets.banner;

  return (
    <div className={styles.layout}>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta property="og:type" content="video.other" />
        {banner && <meta property="og:image" content={banner?.replace(/^https:/, 'http:')} />}
        {banner && <meta property="og:image:secure_url" content={banner?.replace(/^http:/, 'https:')} />}
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={banner} />
      </Helmet>
      <div className={styles.main}>
        {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} transitionTime={1} debounceTime={350} />}
        <Header
          onMenuButtonClick={() => setSideBarOpen(true)}
          playlistMenuItems={menu.map((item) => (
            <ButtonLink key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} />
          ))}
          logoSrc={banner}
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
      {!!footerText && <div className={styles.footer}>{footerText}</div>}
    </div>
  );
};

export default Layout;

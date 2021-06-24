import React, { ReactNode, FC, useState, useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import { UIStore } from '../../stores/UIStore';
import Button from '../Button/Button';
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';
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
  const { t } = useTranslation('common');
  const { menu, assets, options, siteName, description, footerText, searchPlaylist } = useContext(ConfigContext);
  const blurImage = UIStore.useState((s) => s.blurImage);
  const searchQuery = UIStore.useState((s) => s.searchQuery);
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = options.dynamicBlur === true;
  const banner = assets.banner;

  useEffect(() => {
    const calculateViewHeight = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

    calculateViewHeight();
    window.addEventListener('resize', () => calculateViewHeight);

    return () => document.removeEventListener('resize', calculateViewHeight);
  }, []);

  return (
    <div className={styles.layout}>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div className={styles.main}>
        {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} transitionTime={1} debounceTime={350} />}
        <Header
          onMenuButtonClick={() => setSideBarOpen(true)}
          logoSrc={banner}
          searchEnabled={!!searchPlaylist}
          searchBarProps={{
            query: searchQuery,
            onQueryChange: (event) => updateSearchQuery(event.target.value),
            onClearButtonClick: () => updateSearchQuery(''),
          }}
          onCloseSearchButtonClick={() => resetSearchQuery()}
        >
          <Button label={t('home')} to="/" variant="text" />
          {menu.map((item) => (
            <Button key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} variant="text" />
          ))}
        </Header>
        <Sidebar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)}>
          <MenuButton label={t('home')} to="/" tabIndex={sideBarOpen ? 0 : -1} />
          {menu.map((item) => (
            <MenuButton key={item.playlistId} label={item.label} to={`/p/${item.playlistId}`} tabIndex={sideBarOpen ? 0 : -1} />
          ))}
          <hr className={styles.divider} />
        </Sidebar>
        {children}
      </div>
      {!!footerText && (
        <div className={styles.footer}>
          <MarkdownComponent markdownString={footerText} />
        </div>
      )}
    </div>
  );
};

export default Layout;

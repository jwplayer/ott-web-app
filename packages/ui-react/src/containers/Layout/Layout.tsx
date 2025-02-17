import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { unicodeToChar } from '@jwp/ott-common/src/utils/common';
import { determinePath } from '@jwp/ott-common/src/utils/urlFormatting';
import env from '@jwp/ott-common/src/env';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useTranslationKey } from '@jwp/ott-hooks-react/src/useTranslationKey';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import HeaderMenu from '../../components/Header/HeaderMenu';
import HeaderNavigation from '../../components/Header/HeaderNavigation';
import HeaderBrand from '../../components/Header/HeaderBrand';
import HeaderActions from '../../components/Header/HeaderActions';
import HeaderSkipLink from '../../components/Header/HeaderSkipLink';
import SidebarContainer from '../SidebarContainer/SidebarContainer';
import SiteMetadata from '../SiteMetadata/SiteMetadata';
import HeaderSearch from '../HeaderSearch/HeaderSearch';
import HeaderLanguageSwitcher from '../HeaderLanguageSwitcher/HeaderLanguageSwitcher';
import HeaderUserMenu from '../HeaderUserMenu/HeaderUserMenu';

import styles from './Layout.module.scss';

const Layout = () => {
  const { t } = useTranslation('common');
  const translationKey = useTranslationKey('label');

  const { config } = useConfigStore(
    ({ config, accessModel, supportedLanguages }) => ({
      config,
      accessModel,
      supportedLanguages,
    }),
    shallow,
  );
  const { menu, assets, siteName, styling } = config;
  const { footerText: configFooterText } = styling || {};
  const footerText = configFooterText || unicodeToChar(env.APP_FOOTER_TEXT);

  const { sideBarOpen, searchActive, cookieWallOpen } = useUIStore((state) => ({
    sideBarOpen: state.sideBarOpen,
    searchActive: state.searchActive,
    cookieWallOpen: state.cookieWallOpen,
  }));
  const banner = assets.banner;

  const openSideBar = () => useUIStore.setState({ sideBarOpen: true });

  const navItems = [
    { label: t('home'), to: '/' },
    ...menu.map(({ label, contentId, type, custom }) => ({
      label: custom?.[translationKey] || label,
      to: determinePath({ type, contentId, label }),
    })),
  ];

  const containerProps = { inert: sideBarOpen || cookieWallOpen ? '' : undefined }; // inert is not yet officially supported in react

  return (
    <div className={styles.layout}>
      <SiteMetadata />
      <div {...containerProps}>
        <Header searchActive={searchActive}>
          <HeaderSkipLink />
          <HeaderMenu sideBarOpen={sideBarOpen} onClick={openSideBar} />
          <HeaderBrand siteName={siteName} logoSrc={banner} setLogoLoaded={() => undefined} />
          <HeaderNavigation navItems={navItems} />
          <HeaderActions>
            <HeaderSearch />
            <HeaderLanguageSwitcher />
            <HeaderUserMenu />
          </HeaderActions>
        </Header>
        <main id="content" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
        {!!footerText && <Footer text={footerText} />}
      </div>
      <SidebarContainer />
    </div>
  );
};

export default Layout;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorPage from '@jwp/ott-ui-react/src/components/ErrorPage/ErrorPage';
import RootErrorPage from '@jwp/ott-ui-react/src/components/RootErrorPage/RootErrorPage';
import About from '@jwp/ott-ui-react/src/pages/About/About';
import Home from '@jwp/ott-ui-react/src/pages/Home/Home';
import Search from '@jwp/ott-ui-react/src/pages/Search/Search';
import User from '@jwp/ott-ui-react/src/pages/User/User';
import LegacySeries from '@jwp/ott-ui-react/src/pages/LegacySeries/LegacySeries';
import MediaScreenRouter from '@jwp/ott-ui-react/src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '@jwp/ott-ui-react/src/pages/ScreenRouting/PlaylistScreenRouter';
import Layout from '@jwp/ott-ui-react/src/containers/Layout/Layout';
import {
  PATH_ABOUT,
  PATH_CONTENT_LIST,
  PATH_LEGACY_SERIES,
  PATH_MEDIA,
  PATH_PLAYLIST,
  PATH_SEARCH,
  PATH_USER,
  RELATIVE_PATH_USER_ACCOUNT,
  RELATIVE_PATH_USER_FAVORITES,
  RELATIVE_PATH_USER_PAYMENTS,
} from '@jwp/ott-common/src/paths';
import { APP_CONFIG_ITEM_TYPE } from '@jwp/ott-common/src/constants';
import AccountSection from '@jwp/ott-ui-react/src/pages/User/sections/AccountSection/AccountSection';
import FavoritesSection from '@jwp/ott-ui-react/src/pages/User/sections/FavoritesSection/FavoritesSection';
import PaymentsSection from '@jwp/ott-ui-react/src/pages/User/sections/PaymentsSection/PaymentsSection';

import RoutesContainer from '#src/containers/RoutesContainer/RoutesContainer';

export default function AppRoutes() {
  const { t } = useTranslation('error');

  return (
    <Routes>
      <Route element={<RoutesContainer />}>
        <Route element={<Layout />} errorElement={<RootErrorPage />}>
          <Route index element={<Home />} />
          <Route path={PATH_PLAYLIST} element={<PlaylistScreenRouter type={APP_CONFIG_ITEM_TYPE.playlist} />} />
          <Route path={PATH_CONTENT_LIST} element={<PlaylistScreenRouter type={APP_CONFIG_ITEM_TYPE.content_list} />} />
          <Route path={PATH_MEDIA} element={<MediaScreenRouter />} />
          <Route path={PATH_LEGACY_SERIES} element={<LegacySeries />} />
          <Route path={PATH_SEARCH} element={<Search />} />
          <Route path={PATH_USER} element={<User />}>
            <Route path={RELATIVE_PATH_USER_ACCOUNT} element={<AccountSection />} />
            <Route path={RELATIVE_PATH_USER_FAVORITES} element={<FavoritesSection />} />
            <Route path={RELATIVE_PATH_USER_PAYMENTS} element={<PaymentsSection />} />
            <Route path="*" element={<Navigate to={RELATIVE_PATH_USER_ACCOUNT} />} />
          </Route>
          <Route path={PATH_ABOUT} element={<About />} />
          <Route
            path="/*"
            element={<ErrorPage title={t('notfound_error_heading', 'Not found')} message={t('notfound_error_description', "This page doesn't exist.")} />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

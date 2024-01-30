import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useProfileStore } from '@jwp/ott-common/src/stores/ProfileStore';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';
import { useProfiles } from '@jwp/ott-hooks-react/src/useProfiles';
import ErrorPage from '@jwp/ott-ui-react/src/components/ErrorPage/ErrorPage';
import RootErrorPage from '@jwp/ott-ui-react/src/components/RootErrorPage/RootErrorPage';
import LoadingOverlay from '@jwp/ott-ui-react/src/components/LoadingOverlay/LoadingOverlay';
import About from '@jwp/ott-ui-react/src/pages/About/About';
import Home from '@jwp/ott-ui-react/src/pages/Home/Home';
import Search from '@jwp/ott-ui-react/src/pages/Search/Search';
import User from '@jwp/ott-ui-react/src/pages/User/User';
import LegacySeries from '@jwp/ott-ui-react/src/pages/LegacySeries/LegacySeries';
import MediaScreenRouter from '@jwp/ott-ui-react/src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '@jwp/ott-ui-react/src/pages/ScreenRouting/PlaylistScreenRouter';
import Layout from '@jwp/ott-ui-react/src/containers/Layout/Layout';
import Profiles from '@jwp/ott-ui-react/src/containers/Profiles/Profiles';
import CreateProfile from '@jwp/ott-ui-react/src/containers/Profiles/CreateProfile';
import EditProfile from '@jwp/ott-ui-react/src/containers/Profiles/EditProfile';
import {
  PATH_ABOUT,
  PATH_LEGACY_SERIES,
  PATH_MEDIA,
  PATH_PLAYLIST,
  PATH_USER_PROFILES,
  PATH_USER_PROFILES_CREATE,
  PATH_USER_PROFILES_EDIT,
  PATH_USER_PROFILES_EDIT_PROFILE,
  PATH_SEARCH,
  PATH_USER,
} from '@jwp/ott-common/src/paths';

import useNotifications from '#src/hooks/useNotifications';

export default function AppRoutes() {
  const location = useLocation();

  const { t } = useTranslation('error');
  const userModal = useQueryParam('u');

  const { accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const user = useAccountStore(({ user }) => user, shallow);
  const { profile, selectingProfileAvatar } = useProfileStore();
  const { profilesEnabled } = useProfiles();

  const userData = useAccountStore((s) => ({ loading: s.loading, user: s.user }));

  // listen to websocket notifications
  useNotifications();

  if (userData.user && !userData.loading && window.location.href.includes('#token')) {
    return <Navigate to="/" />; // component instead of hook to prevent extra re-renders
  }

  if (userData.user && selectingProfileAvatar !== null) {
    return <LoadingOverlay profileImageUrl={selectingProfileAvatar || profile?.avatar_url} />;
  }

  const shouldManageProfiles =
    !!user &&
    profilesEnabled &&
    !profile &&
    (accessModel === 'SVOD' || accessModel === 'AUTHVOD') &&
    !userModal &&
    !location.pathname.includes(PATH_USER_PROFILES);

  if (shouldManageProfiles) {
    return <Navigate to={PATH_USER_PROFILES} />;
  }

  return (
    <Routes>
      <Route path={PATH_USER_PROFILES} element={<Profiles />} />
      <Route path={PATH_USER_PROFILES_CREATE} element={<CreateProfile />} />
      <Route path={PATH_USER_PROFILES_EDIT} element={<Profiles editMode />} />
      <Route path={PATH_USER_PROFILES_EDIT_PROFILE} element={<EditProfile />} />
      <Route element={<Layout />} errorElement={<RootErrorPage />}>
        <Route index element={<Home />} />
        <Route path={PATH_PLAYLIST} element={<PlaylistScreenRouter />} />
        <Route path={PATH_MEDIA} element={<MediaScreenRouter />} />
        <Route path={PATH_LEGACY_SERIES} element={<LegacySeries />} />
        <Route path={PATH_SEARCH} element={<Search />} />
        <Route path={PATH_USER} element={<User />} />
        <Route path={PATH_ABOUT} element={<About />} />
        <Route
          path="/*"
          element={<ErrorPage title={t('notfound_error_heading', 'Not found')} message={t('notfound_error_description', "This page doesn't exist.")} />}
        />
      </Route>
    </Routes>
  );
}

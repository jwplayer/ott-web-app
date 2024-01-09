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
  useNotifications(userData.user?.uuid);

  if (userData.user && !userData.loading && window.location.href.includes('#token')) {
    return <Navigate to="/" />; // component instead of hook to prevent extra re-renders
  }

  if (userData.user && selectingProfileAvatar !== null) {
    return <LoadingOverlay profileImageUrl={selectingProfileAvatar || profile?.avatar_url} />;
  }

  const shouldManageProfiles =
    !!user && profilesEnabled && !profile && (accessModel === 'SVOD' || accessModel === 'AUTHVOD') && !userModal && !location.pathname.includes('/u/profiles');

  if (shouldManageProfiles) {
    return <Navigate to="/u/profiles" />;
  }

  return (
    <Routes>
      <Route path="/u/profiles" element={<Profiles />} />
      <Route path="/u/profiles/create" element={<CreateProfile />} />
      <Route path="/u/profiles/edit" element={<Profiles editMode />} />
      <Route path="/u/profiles/edit/:id" element={<EditProfile />} />
      <Route element={<Layout />} errorElement={<RootErrorPage />}>
        <Route index element={<Home />} />
        <Route path="/p/:id" element={<PlaylistScreenRouter />} />
        <Route path="/m/:id/*" element={<MediaScreenRouter />} />
        <Route path="/s/:id/*" element={<LegacySeries />} />
        <Route path="/q/*" element={<Search />} />
        <Route path="/u/*" element={<User />} />
        <Route path="/o/about" element={<About />} />
        <Route
          path="/*"
          element={<ErrorPage title={t('notfound_error_heading', 'Not found')} message={t('notfound_error_description', "This page doesn't exist.")} />}
        />
      </Route>
    </Routes>
  );
}

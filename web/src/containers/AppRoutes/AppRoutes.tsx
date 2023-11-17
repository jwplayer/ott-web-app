import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { useConfigStore } from '@jwplayer/ott-common/src/stores/ConfigStore';
import { useAccountStore } from '@jwplayer/ott-common/src/stores/AccountStore';
import { useProfileStore } from '@jwplayer/ott-common/src/stores/ProfileStore';

import ErrorPage from '../../components/ErrorPage/ErrorPage';
import RootErrorPage from '../../components/RootErrorPage/RootErrorPage';
import About from '../../pages/About/About';
import Home from '../../pages/Home/Home';
import Search from '../../pages/Search/Search';
import User from '../../pages/User/User';
import LegacySeries from '../../pages/LegacySeries/LegacySeries';
import MediaScreenRouter from '../../pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '../../pages/ScreenRouting/PlaylistScreenRouter';
import Layout from '../Layout/Layout';
import Profiles from '../Profiles/Profiles';
import CreateProfile from '../Profiles/CreateProfile';
import EditProfile from '../Profiles/EditProfile';
import useQueryParam from '../../hooks/useQueryParam';
import { useProfiles } from '../../hooks/useProfiles';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import useNotifications from '../../hooks/useNotifications';

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

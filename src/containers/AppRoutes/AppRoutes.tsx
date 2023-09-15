import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Security } from '@okta/okta-react';
import shallow from 'zustand/shallow';

import { oktaAuth } from '../OktaAuth/config';
import OktaAuth from '../OktaAuth/OktaAuth';
import OktaAuthCallback from '../OktaAuth/OktaAuthCallback';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import RootErrorPage from '#components/RootErrorPage/RootErrorPage';
import About from '#src/pages/About/About';
import Home from '#src/pages/Home/Home';
import Search from '#src/pages/Search/Search';
import User from '#src/pages/User/User';
import LegacySeries from '#src/pages/LegacySeries/LegacySeries';
import MediaScreenRouter from '#src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '#src/pages/ScreenRouting/PlaylistScreenRouter';
import Layout from '#src/containers/Layout/Layout';
import Profiles from '#src/containers/Profiles/Profiles';
import CreateProfile from '#src/containers/Profiles/CreateProfile';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import EditProfile from '#src/containers/Profiles/EditProfile';
import useQueryParam from '#src/hooks/useQueryParam';
import { useProfileStore } from '#src/stores/ProfileStore';
import { useProfiles } from '#src/hooks/useProfiles';

export default function AppRoutes() {
  const location = useLocation();

  const { t } = useTranslation('error');
  const userModal = useQueryParam('u');

  const { accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const user = useAccountStore(({ user }) => user, shallow);
  const { profile } = useProfileStore();
  const { profilesEnabled } = useProfiles();

  const shouldManageProfiles =
    !!user && profilesEnabled && !profile && (accessModel === 'SVOD' || accessModel === 'AUTHVOD') && !userModal && !location.pathname.includes('/u/profiles');

  if (shouldManageProfiles) {
    return <Navigate to="/u/profiles" />;
  }

  const restoreOriginalUri = async () => {
    // placeholder
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <Routes>
        <Route path="/okta/auth/callback" element={<OktaAuthCallback />} />
        <Route path="/okta/auth" element={<OktaAuth />} />
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
    </Security>
  );
}

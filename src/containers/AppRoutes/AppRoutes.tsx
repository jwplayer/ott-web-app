import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import shallow from 'zustand/shallow';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import RootErrorPage from '#components/RootErrorPage/RootErrorPage';
import About from '#src/pages/About/About';
import Home from '#src/pages/Home/Home';
import Search from '#src/pages/Search/Search';
import Series from '#src/pages/Series/Series';
import User from '#src/pages/User/User';
import MediaScreenRouter from '#src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '#src/pages/ScreenRouting/PlaylistScreenRouter';
import Layout from '#src/containers/Layout/Layout';
import Profiles from '#src/containers/Profiles/Profiles';
import CreateProfile from '#src/containers/Profiles/CreateProfile';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import EditProfile from '#src/containers/Profiles/EditProfile';
import useQueryParam from '#src/hooks/useQueryParam';

export default function AppRoutes() {
  const { t } = useTranslation('error');
  const userModal = useQueryParam('u');

  const { accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { canManageProfiles, profile } = useAccountStore(({ canManageProfiles, profile }) => ({ canManageProfiles, profile }), shallow);
  const shouldManageProfiles = canManageProfiles && !profile && (accessModel === 'SVOD' || accessModel === 'AUTHVOD') && !userModal;

  return (
    <Routes>
      <Route index={shouldManageProfiles} element={<Navigate to="/u/profiles" />} />
      <Route path="/u/profiles" element={<Profiles />} />
      <Route path="/u/profiles/create" element={<CreateProfile />} />
      <Route path="/u/profiles/edit" element={<Profiles editMode />} />
      <Route path="/u/profiles/edit/:id" element={<EditProfile />} />
      <Route element={<Layout />} errorElement={<RootErrorPage />}>
        <Route index element={<Home />} />
        <Route path="/p/:id" element={<PlaylistScreenRouter />} />
        <Route path="/m/:id/*" element={<MediaScreenRouter />} />
        <Route path="/s/:id/:slug" element={<Series />} />
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

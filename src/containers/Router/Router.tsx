import React from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter, createHashRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import Root from '#src/components/Root/Root';
import RootErrorPage from '#src/components/RootErrorPage/RootErrorPage';
import About from '#src/pages/About/About';
import Home from '#src/pages/Home/Home';
import Search from '#src/pages/Search/Search';
import Series from '#src/pages/Series/Series';
import User from '#src/pages/User/User';
import MediaScreenRouter from '#src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '#src/pages/ScreenRouting/PlaylistScreenRouter';

export default function Router() {
  const { t } = useTranslation('error');

  const createRouter = import.meta.env.APP_PUBLIC_GITHUB_PAGES ? createHashRouter : createBrowserRouter;

  return (
    <RouterProvider
      router={createRouter(
        createRoutesFromElements(
          <Route element={<Root />} errorElement={<RootErrorPage />}>
            <Route index element={<Home />} />
            <Route path="/p/:id" element={<PlaylistScreenRouter />} />
            <Route path="/m/:id/*" element={<MediaScreenRouter />} />
            <Route path="/s/:id/:slug" element={<Series />} />
            <Route path="/q/*" element={<Search />} />
            <Route path="/u/*" element={<User />} />
            <Route path="/o/about" element={<About />} />
            <Route
              path="/*"
              element={
                <ErrorPage title={t('notfound_error_heading', 'Not found')}>
                  <p>{t('notfound_error_description', "This page doesn't exist.")}</p>
                </ErrorPage>
              }
            />
          </Route>,
        ),
      )}
    />
  );
}

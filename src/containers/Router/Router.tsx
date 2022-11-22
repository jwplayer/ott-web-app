import React from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter, createHashRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import Root from '#components/Root/Root';
import Layout from '#src/containers/Layout/Layout';
import About from '#src/pages/About/About';
import Home from '#src/pages/Home/Home';
import Search from '#src/pages/Search/Search';
import Series from '#src/pages/Series/Series';
import User from '#src/pages/User/User';
import MediaScreenRouter from '#src/pages/ScreenRouting/MediaScreenRouter';
import PlaylistScreenRouter from '#src/pages/ScreenRouting/PlaylistScreenRouter';

type Props = {
  error?: Error | null;
};

export default function Router({ error }: Props) {
  const { t } = useTranslation('error');

  /**
   * Ideally we should define the routes outside the router, but it doesn't work with the current setup because we need
   * to pass the error to the Root component.
   * @todo: refactor the app to use the errorElements that can be passed to the route components. see
   *        https://reactrouter.com/en/main/route/error-element so that we can define the routes outside the router.
   */
  const routes = createRoutesFromElements(
    <Route element={<Root error={error} />}>
      <Route element={<Layout />}>
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
      </Route>
    </Route>,
  );

  const router = import.meta.env.APP_PUBLIC_GITHUB_PAGES ? createHashRouter(routes) : createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}

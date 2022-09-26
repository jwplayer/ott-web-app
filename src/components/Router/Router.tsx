import React from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter, createHashRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import ErrorPage from '../ErrorPage/ErrorPage';
import Root from '../Root/Root';

import Layout from '#src/containers/Layout/Layout';
import About from '#src/screens/About/About';
import Home from '#src/screens/Home/Home';
import Movie from '#src/screens/Movie/Movie';
import Playlist from '#src/screens/Playlist/Playlist';
import Search from '#src/screens/Search/Search';
import Series from '#src/screens/Series/Series';
import User from '#src/screens/User/User';

type Props = {
  error?: Error | null;
};

export default function Router ({ error }: Props) {
  const { t } = useTranslation('error');

  /*
    Ideally we should define the routes outside the router, but it doesn't work with the current setup because we need to pass the error to the Root component.
    @todo: refactor the app to use the errorElements that can be passed to the route components. see https://reactrouter.com/en/main/route/error-element so that we can define the routes outside the router.
    And we should also consider moving the Router component to the containers folder or placing it directly in the src directory.
    */

  const routes = createRoutesFromElements(
    <Route element={<Root error={error} />}>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/p/:id" element={<Playlist />} />
        <Route path="/m/:id/:slug" element={<Movie />} />
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

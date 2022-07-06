import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import User from '../../screens/User/User';
import Series from '../../screens/Series/Series';
import Layout from '../../containers/Layout/Layout';
import Home from '../../screens/Home/Home';
import Playlist from '../../screens/Playlist/Playlist';
import Movie from '../../screens/Movie/Movie';
import Search from '../../screens/Search/Search';
import ErrorPage from '../ErrorPage/ErrorPage';
import AccountModal from '../../containers/AccountModal/AccountModal';
import About from '../../screens/About/About';

type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }: Props) => {
  const { t } = useTranslation('error');

  if (error) {
    return (
      <ErrorPage title={t('generic_error_heading', 'There was an issue loading the application')}>
        <p>{t('generic_error_description', 'Try refreshing this page or come back later.')}</p>
      </ErrorPage>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/p/:id" component={Playlist} exact />
        <Route path="/m/:id/:slug?" component={Movie} exact />
        <Route path="/s/:id/:slug?" component={Series} />
        <Route path="/q/:query?" component={Search} />
        <Route path="/u/:page?" component={User} />
        <Route path="/o/about" component={About} />
        <Route>
          <ErrorPage title={t('notfound_error_heading', 'Not found')}>
            <p>{t('notfound_error_description', "This page doesn't exist.")}</p>
          </ErrorPage>
        </Route>
      </Switch>
      <AccountModal />
    </Layout>
  );
};

export default Root;

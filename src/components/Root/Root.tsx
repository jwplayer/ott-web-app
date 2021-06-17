import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import Series from '../../screens/Series/Series';
import Layout from '../Layout/Layout';
import Home from '../../screens/Home/Home';
import Playlist from '../../screens/Playlist/Playlist';
import Settings from '../../screens/Settings/Settings';
import Movie from '../../screens/Movie/Movie';
import Search from '../../screens/Search/Search';

type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }: Props) => {
  if (error) {
    return <div>Error!</div>;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/p/:id" component={Playlist} exact />
        <Route path="/u" component={Settings} exact />
        <Route path="/m/:id/:slug?" component={Movie} exact />
        <Route path="/s/:id/:slug?" component={Series} />
        <Route path="/q/:query?" component={Search} />
      </Switch>
    </Layout>
  );
};

export default Root;

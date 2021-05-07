import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import Layout from '../Layout/Layout';
import Home from '../../screens/Home/Home';
import Playlist from '../../screens/Playlist/Playlist';
import Settings from '../../screens/Settings/Settings';
import Video from '../../screens/Video/Video';
import Series from '../../screens/Series/Series';

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
        <Route path="/m/:id/:slug" component={Video} exact />
        <Route path="/s/:seriesId/:seriesSlug/:episodeId/:episodeSlug" component={Series} exact />
      </Switch>
    </Layout>
  );
};

export default Root;

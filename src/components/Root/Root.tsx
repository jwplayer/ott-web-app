import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from '@components/Layout/Layout';

import Playlist from '../../screens/Playlist/Playlist';
import Home from '../../screens/Home/Home';

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
        <Route path="/u" component={() => <span>Settings</span>} exact />
      </Switch>
    </Layout>
  );
};

export default Root;

import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from '../../screens/Home/Home';
import Header from '../Header/Header';

// Mock screens

const PlaylistScreen = () => {
  return (
    <>
      <Header></Header>
      <span style={{ color: 'white' }}>PlaylistScreen</span>
    </>
  );
};
const Settings = () => {
  return (
    <>
      <Header></Header> <span style={{ color: 'white' }}>Settings</span>{' '}
    </>
  );
};

// Mock screens

type RootProps = {
  error?: Error | null;
};

const Root: FC<RootProps> = ({ error }: RootProps) => {
  if (error) {
    return <div>Error!</div>;
  }

  return (
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/p/:id" component={PlaylistScreen} exact />
      <Route path="/u" component={Settings} exact />
    </Switch>
  );
};

export default Root;

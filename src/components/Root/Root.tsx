import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from '../../screens/Home/Home';

// Mock screens

const PlaylistScreen = () => {
  return (
    <>
      <span>PlaylistScreen</span>
    </>
  );
};
const Settings = () => {
  return (
    <>
      <span>Settings</span>{' '}
    </>
  );
};

// Mock screens

type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }: Props) => {
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

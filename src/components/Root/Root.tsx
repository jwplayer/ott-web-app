import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

// import styles from './Root.module.scss';

const Home = () => {
  return <span>Home</span>;
};

const PlaylistScreen = () => {
  return <span>PlaylistScreen</span>;
};

interface RootProps {
  error: Error | null;
}

const Root: FC<RootProps> = ({ error }: RootProps) => {
  if (error) {
    return <span>{error}</span>;
  }

  return (
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/p/:id" component={PlaylistScreen} exact />
    </Switch>
  );
};

export default Root;

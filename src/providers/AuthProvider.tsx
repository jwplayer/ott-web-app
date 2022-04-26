import React from 'react';
import { Redirect } from 'react-router-dom';

import { AccountStore } from '../stores/AccountStore';

type Props = {
  children: JSX.Element;
};

function AuthProvider({ children }: Props): JSX.Element | null {
  const { user, loading } = AccountStore.useState((state) => state);

  if (!user && !loading) {
    return <Redirect to="/" />;
  }

  return children;
}

export default AuthProvider;

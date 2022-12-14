import React from 'react';
import { useRouteError } from 'react-router';

import ErrorPage from '#components/ErrorPage/ErrorPage';

const RootErrorPage: React.FC = () => {
  const error = useRouteError() as Error;

  return <ErrorPage error={error} />;
};

export default RootErrorPage;

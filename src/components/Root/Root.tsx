import React, { FC } from 'react';
import { Outlet, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ErrorPage from '../ErrorPage/ErrorPage';
import AccountModal from '../../containers/AccountModal/AccountModal';

type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }) => {
  const { t } = useTranslation('error');

  if (error) {
    return (
      <Route
        element={
          <ErrorPage title={t('generic_error_heading', 'There was an issue loading the application')}>
            <p>{t('generic_error_description', 'Try refreshing this page or come back later.')}</p>
          </ErrorPage>
        }
      />
    );
  }

  return (
    <>
      <Outlet />
      <AccountModal />
    </>
  );
};

export default Root;

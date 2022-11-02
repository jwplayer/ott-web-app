import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ErrorPage from '../ErrorPage/ErrorPage';
import AccountModal from '../../containers/AccountModal/AccountModal';

import { IS_DEV_BUILD } from '#src/utils/common';

type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }) => {
  const { t } = useTranslation('error');

  if (error) {
    return (
      <ErrorPage title={IS_DEV_BUILD ? error.message : t('generic_error_heading', 'There was an issue loading the application')}>
        <p>{IS_DEV_BUILD ? error.stack : t('generic_error_description', 'Try refreshing this page or come back later.')}</p>
      </ErrorPage>
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

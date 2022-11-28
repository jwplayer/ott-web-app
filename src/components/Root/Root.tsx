import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import AccountModal from '#src/containers/AccountModal/AccountModal';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD } from '#src/utils/common';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';

type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }) => {
  const { t } = useTranslation('error');

  return (
    <>
      {error ? (
        <ErrorPage title={IS_DEVELOPMENT_BUILD ? error.message : t('generic_error_heading', 'There was an issue loading the application')}>
          <p>{IS_DEVELOPMENT_BUILD ? error.stack : t('generic_error_description', 'Try refreshing this page or come back later.')}</p>
        </ErrorPage>
      ) : (
        <>
          <Outlet />
          <AccountModal />
        </>
      )}
      {IS_DEMO_MODE && <DemoConfigDialog />}
    </>
  );
};

export default Root;

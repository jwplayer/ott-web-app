import React, { FC, useEffect, useState } from 'react';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import AccountModal from '#src/containers/AccountModal/AccountModal';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE, IS_PROD_MODE } from '#src/utils/common';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';
import DevConfigSelector from '#components/DevConfigSelector/DevConfigSelector';
import AppRoutes from '#src/containers/AppRoutes/AppRoutes';
import registerCustomScreens from '#src/screenMapping';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { useBootstrapApp, type BootstrapData } from '#src/hooks/useBootstrapApp';

const IS_DEMO_OR_PREVIEW = IS_DEMO_MODE || IS_PREVIEW_MODE;

const ProdContentLoader = ({ query }: { query: BootstrapData }) => {
  const { isLoading, error } = query;

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <ErrorPage title={error.payload.title} message={error.payload.description} helpLink={error.payload.helpLink} />;
  }

  return null;
};

const DemoContentLoader = ({ query }: { query: BootstrapData }) => {
  const { isLoading, error, data } = query;

  // Show the spinner while loading except in demo mode (the demo config shows its own loading status)
  if (!IS_DEMO_OR_PREVIEW && isLoading) {
    return <LoadingOverlay />;
  }

  const { configSource, settings } = data || {};

  return (
    <>
      {/*Show the error page when error except in demo mode (the demo mode shows its own error)*/}
      {!IS_DEMO_OR_PREVIEW && error && (
        <ErrorPage title={error?.payload?.title} message={error?.payload?.description} error={error} helpLink={error?.payload?.helpLink} />
      )}
      {IS_DEMO_OR_PREVIEW && settings && <DemoConfigDialog query={query} />}
      {/* Config select control to improve testing experience */}
      {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && settings && <DevConfigSelector selectedConfig={configSource} />}
    </>
  );
};

// This is moved to a separate, parallel component to reduce rerenders
const RootLoader = ({ onReady }: { onReady: () => void }) => {
  const query = useBootstrapApp(onReady);

  return IS_PROD_MODE ? <ProdContentLoader query={query} /> : <DemoContentLoader query={query} />;
};

const Root: FC = () => {
  const [isReady, setIsReady] = useState(false);

  // Register custom screen mappings
  useEffect(() => {
    registerCustomScreens();
  }, []);

  return (
    <>
      {isReady && <AppRoutes />}
      {isReady && <AccountModal />}
      {/*This is moved to a separate, parallel component to reduce rerenders */}
      <RootLoader onReady={() => setIsReady(true)} />
    </>
  );
};

export default Root;

import React, { useEffect, useState, type FC, useCallback, useRef } from 'react';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE, IS_PROD_MODE } from '@jwp/ott-common/src/utils/common';
import ErrorPage from '@jwp/ott-ui-react/src/components/ErrorPage/ErrorPage';
import AccountModal from '@jwp/ott-ui-react/src/containers/AccountModal/AccountModal';
import DevConfigSelector from '@jwp/ott-ui-react/src/components/DevConfigSelector/DevConfigSelector';
import LoadingOverlay from '@jwp/ott-ui-react/src/components/LoadingOverlay/LoadingOverlay';
import { type BootstrapData, type OnReadyCallback, useBootstrapApp } from '@jwp/ott-hooks-react/src/useBootstrapApp';
import { setThemingVariables } from '@jwp/ott-ui-react/src/utils/theming';
import { addScript } from '@jwp/ott-ui-react/src/utils/dom';
import type { Config } from '@jwp/ott-common/types/config';
import { AppError } from '@jwp/ott-common/src/utils/error';

import DemoConfigDialog from '../../components/DemoConfigDialog/DemoConfigDialog';
import AppRoutes from '../AppRoutes/AppRoutes';

import registerCustomScreens from '#src/screenMapping';
import { useTrackConfigKeyChange } from '#src/hooks/useTrackConfigKeyChange';

const IS_DEMO_OR_PREVIEW = IS_DEMO_MODE || IS_PREVIEW_MODE;

const BootstrapError = ({ error }: { error: Error | AppError }) => {
  if (error instanceof AppError) {
    return <ErrorPage title={error.payload.title} message={error.payload.description} helpLink={error.payload.helpLink} error={error} />;
  }
  return <ErrorPage error={error} />;
};

const ProdContentLoader = ({ query }: { query: BootstrapData }) => {
  const { isLoading, error } = query;

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <BootstrapError error={error} />;
  }

  return null;
};

const DemoContentLoader = ({ query }: { query: BootstrapData }) => {
  const { isLoading, error, data } = query;

  // Show the spinner while loading except in demo mode (the demo config shows its own loading status)
  if (!IS_DEMO_OR_PREVIEW && isLoading) {
    return <LoadingOverlay />;
  }

  const { configSource } = data || {};

  return (
    <>
      {/* Show the error page when error except in demo mode (the demo mode shows its own error) */}
      {!IS_DEMO_OR_PREVIEW && error && <BootstrapError error={error} />}
      {IS_DEMO_OR_PREVIEW && <DemoConfigDialog query={query} />}
      {/* Config select control to improve testing experience */}
      {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && <DevConfigSelector selectedConfig={configSource} />}
    </>
  );
};

// This is moved to a separate, parallel component to reduce rerenders
const RootLoader = ({ onReady }: { onReady: OnReadyCallback }) => {
  const query = useBootstrapApp(window.location.href, onReady);

  // Modify query string to add / remove app-config id
  useTrackConfigKeyChange(query.data?.settings, query.data?.configSource);

  return IS_PROD_MODE ? <ProdContentLoader query={query} /> : <DemoContentLoader query={query} />;
};

const Root: FC = () => {
  const analyticsLoadedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Register custom screen mappings
  useEffect(() => {
    registerCustomScreens();
  }, []);

  const onReadyCallback = useCallback(async (config: Config | undefined) => {
    // when the config is missing, the initialization failed
    if (!config) {
      return;
    }

    // because theming and analytics are specific to web, we configure it from here
    // alternatively, we can use an events or specific callbacks or extend the AppController for each platform
    setThemingVariables(config);

    if (config.analyticsToken && !analyticsLoadedRef.current) {
      await addScript('/jwpltx.js');
      analyticsLoadedRef.current = true;
    }

    setIsReady(true);
  }, []);

  return (
    <>
      {isReady && <AppRoutes />}
      {isReady && <AccountModal />}
      {/*This is moved to a separate, parallel component to reduce rerenders */}
      <RootLoader onReady={onReadyCallback} />
    </>
  );
};

export default Root;

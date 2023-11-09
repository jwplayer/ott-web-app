import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import AccountModal from '#src/containers/AccountModal/AccountModal';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE } from '#src/utils/common';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';
import DevConfigSelector from '#components/DevConfigSelector/DevConfigSelector';
import AppRoutes from '#src/containers/AppRoutes/AppRoutes';
import registerCustomScreens from '#src/screenMapping';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import { ConfigError, SettingsError } from '#src/utils/error';
import { useBootstrapApp } from '#src/hooks/useBootstrapApp';

const IS_DEMO_OR_PREVIEW = IS_DEMO_MODE || IS_PREVIEW_MODE;

// This is moved to a separate, parallel component to reduce rerenders
const RootLoader = ({ onReady }: { onReady: () => void }) => {
  const { t } = useTranslation('error');

  const { data, isLoading, error, isSuccess } = useBootstrapApp(onReady);
  const { configSource } = data || {};

  // Show the spinner while loading except in demo mode (the demo config shows its own loading status)
  if (!IS_DEMO_OR_PREVIEW && isLoading) {
    return <LoadingOverlay />;
  }

  if (error?.name === SettingsError.name) {
    return (
      <ErrorPage
        title={t('settings_invalid')}
        message={t('check_your_settings')}
        error={error}
        helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/initialization-file.md'}
      />
    );
  }

  return (
    <>
      {/*Show the error page when error except in demo mode (the demo mode shows its own error)*/}
      {error?.name === ConfigError.name && !IS_DEMO_OR_PREVIEW && (
        <ErrorPage
          title={t('config_invalid')}
          message={t('check_your_config')}
          error={error}
          helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/configuration.md'}
        />
      )}
      {IS_DEMO_OR_PREVIEW && <DemoConfigDialog selectedConfigSource={configSource} error={error} isLoading={isLoading} isSuccess={isSuccess} />}
      {/* Config select control to improve testing experience */}
      {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && <DevConfigSelector selectedConfig={configSource} />}
    </>
  );
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

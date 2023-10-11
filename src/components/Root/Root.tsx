import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import AccountModal from '#src/containers/AccountModal/AccountModal';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE } from '#src/utils/common';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import DevConfigSelector from '#components/DevConfigSelector/DevConfigSelector';
import { useConfigSource } from '#src/utils/configOverride';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import { initSettings } from '#src/stores/SettingsController';
import AppRoutes from '#src/containers/AppRoutes/AppRoutes';
import registerCustomScreens from '#src/screenMapping';

// This is moved to a separate, parallel component to reduce rerenders
const RootLoader = ({ setAppIsReady }: { setAppIsReady: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { t } = useTranslation('error');
  const settingsQuery = useQuery('settings-init', initSettings, {
    enabled: true,
    retry: 1,
    refetchInterval: false,
  });

  const configSource = useConfigSource(settingsQuery?.data);

  const configQuery = useQuery('config-init-' + configSource, async () => await loadAndValidateConfig(configSource), {
    enabled: settingsQuery.isSuccess,
    retry: configSource ? 1 : 0,
    refetchInterval: false,
  });

  // After the config loads, we can show the rest of the App
  useEffect(() => {
    setAppIsReady(!configQuery.isError && !configQuery.isLoading && !!configQuery.data);
  }, [setAppIsReady, configQuery.isError, configQuery.isLoading, configQuery.data]);

  const IS_DEMO_OR_PREVIEW = IS_DEMO_MODE || IS_PREVIEW_MODE;

  // Show the spinner while loading except in demo mode (the demo config shows its own loading status)
  if (settingsQuery.isLoading || (!IS_DEMO_OR_PREVIEW && configQuery.isLoading)) {
    return <LoadingOverlay />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorPage
        title={t('settings_invalid')}
        message={t('check_your_settings')}
        error={settingsQuery.error as Error}
        helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/initialization-file.md'}
      />
    );
  }

  return (
    <>
      {/*Show the error page when error except in demo mode (the demo mode shows its own error)*/}
      {configQuery.isError && !IS_DEMO_OR_PREVIEW && (
        <ErrorPage
          title={t('config_invalid')}
          message={t('check_your_config')}
          error={configQuery.error as Error}
          helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/configuration.md'}
        />
      )}
      {IS_DEMO_OR_PREVIEW && <DemoConfigDialog selectedConfigSource={configSource} configQuery={configQuery} />}
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
      {/*This is moved to a separate, parallel component to reduce rerenders*/}
      <RootLoader setAppIsReady={setIsReady} />
    </>
  );
};

export default Root;

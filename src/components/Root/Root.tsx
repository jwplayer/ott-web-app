import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import AccountModal from '#src/containers/AccountModal/AccountModal';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE } from '#src/utils/common';
import DemoConfigDialog from '#components/DemoConfigDialog/DemoConfigDialog';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import DevConfigSelector from '#components/DevConfigSelector/DevConfigSelector';
import { cleanupQueryParams, getConfigSource } from '#src/utils/configOverride';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import { initSettings } from '#src/stores/SettingsController';
import AppRoutes from '#src/containers/AppRoutes/AppRoutes';
import registerCustomScreens from '#src/screenMapping';

const Root: FC = () => {
  const { t } = useTranslation('error');
  const settingsQuery = useQuery('settings-init', initSettings, {
    enabled: true,
    retry: 1,
    refetchInterval: false,
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const configSource = useMemo(() => getConfigSource(searchParams, settingsQuery.data), [searchParams, settingsQuery.data]);

  // Update the query string to maintain the right params
  useEffect(() => {
    if (settingsQuery.data && cleanupQueryParams(searchParams, settingsQuery.data, configSource)) {
      setSearchParams(searchParams, { replace: true });
    }
  }, [configSource, searchParams, setSearchParams, settingsQuery.data]);

  const configQuery = useQuery('config-init-' + configSource, async () => await loadAndValidateConfig(configSource), {
    enabled: settingsQuery.isSuccess,
    retry: configSource ? 1 : 0,
    refetchInterval: false,
  });

  // Register custom screen mappings
  useEffect(() => {
    registerCustomScreens();
  }, []);

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
      {!configQuery.isError && !configQuery.isLoading && <AppRoutes />}
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
      <AccountModal />
      {/* Config select control to improve testing experience */}
      {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && <DevConfigSelector selectedConfig={configSource} />}
    </>
  );
};

export default Root;

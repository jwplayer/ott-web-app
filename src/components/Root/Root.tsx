import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import ErrorPage from '../ErrorPage/ErrorPage';
import AccountModal from '../../containers/AccountModal/AccountModal';

import { IS_DEMO_MODE, IS_DEV_BUILD } from '#src/utils/common';
import DemoConfigDialog from '#src/components/DemoConfigDialog/DemoConfigDialog';
import { initSettings } from '#src/stores/SettingsController';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import DevConfigSelector from '#src/components/DevConfigSelector/DevConfigSelector';
import Layout from '#src/containers/Layout/Layout';
import { useConfigSource } from '#src/utils/configOverride';

const Root: FC = () => {
  const { t } = useTranslation('error');

  const settings = useQuery('settings-init', initSettings, {
    enabled: true,
    retry: 1,
  });

  const configSource = useConfigSource(settings.data);

  const config = useQuery('config-init-' + configSource, async () => await loadAndValidateConfig(configSource), {
    enabled: settings.isSuccess,
    retry: 1,
  });

  if (settings.isLoading || config.isLoading) {
    return <LoadingOverlay />;
  }

  if (settings.isError || !settings.data) {
    return (
      <ErrorPage
        title={t('settings_invalid')}
        message={t('check_your_settings')}
        error={settings.error as Error}
        helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/settings.md'}
      />
    );
  }

  return (
    <>
      {!config.isError && <Layout />}
      {config.isError && !IS_DEMO_MODE && (
        <ErrorPage
          title={t('config_invalid')}
          message={t('check_your_config')}
          error={config.error as Error}
          helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/configuration.md'}
        />
      )}
      {IS_DEMO_MODE && <DemoConfigDialog isConfigSuccess={config.isSuccess} settings={settings.data} />}
      <AccountModal />
      {/* Config select control to improve testing experience */}
      {IS_DEV_BUILD && <DevConfigSelector settings={settings.data} />}
    </>
  );
};

export default Root;

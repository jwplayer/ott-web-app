import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

import ErrorPage from '../ErrorPage/ErrorPage';
import AccountModal from '../../containers/AccountModal/AccountModal';

import { IS_DEMO_MODE, IS_DEV_BUILD } from '#src/utils/common';
import DemoConfigDialog from '#src/components/DemoConfigDialog/DemoConfigDialog';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import DevConfigSelector from '#src/components/DevConfigSelector/DevConfigSelector';
import { useConfigSource } from '#src/utils/configOverride';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import { initSettings } from '#src/stores/SettingsController';

export interface Props {
  children: React.ReactElement;
}

const Root: FC<Props> = ({ children }: Props) => {
  const { t } = useTranslation('error');

  const settingsQuery = useQuery('settings-init', initSettings, {
    enabled: true,
    retry: 1,
  });

  const configSource = useConfigSource(settingsQuery.data);

  const configQuery = useQuery('config-init-' + configSource, async () => await loadAndValidateConfig(configSource), {
    enabled: settingsQuery.isSuccess,
    retry: 1,
  });

  if (settingsQuery.isLoading || configQuery.isLoading) {
    return <LoadingOverlay />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorPage
        title={t('settings_invalid')}
        message={t('check_your_settings')}
        error={settingsQuery.error as Error}
        helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/settings.md'}
      />
    );
  }

  return (
    <>
      {!configQuery.isError && children}
      {configQuery.isError && !IS_DEMO_MODE && (
        <ErrorPage
          title={t('config_invalid')}
          message={t('check_your_config')}
          error={configQuery.error as Error}
          helpLink={'https://github.com/jwplayer/ott-web-app/blob/develop/docs/configuration.md'}
        />
      )}
      {IS_DEMO_MODE && <DemoConfigDialog isConfigSuccess={configQuery.isSuccess} settings={settingsQuery.data} />}
      <AccountModal />
      {/* Config select control to improve testing experience */}
      {IS_DEV_BUILD && <DevConfigSelector settings={settingsQuery.data} />}
    </>
  );
};

export default Root;

import React, { MouseEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './DemoConfigDialog.module.scss';

import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import TextField from '#src/components/TextField/TextField';
import Button from '#src/components/Button/Button';
import { addConfigQueryParam, clearStoredConfig, getConfigLocation } from '#src/utils/configOverride';
import Link from '#src/components/Link/Link';
import ConfirmationDialog from '#src/components/ConfirmationDialog/ConfirmationDialog';

const fallbackConfig = import.meta.env.APP_DEMO_DEFAULT_CONFIG_ID;

interface Props {
  configLocation?: string;
}

const DemoConfigDialog = ({ configLocation = getConfigLocation() }: Props) => {
  const { t } = useTranslation('demo');
  const [showDemoWarning, setShowWarning] = useState(false);

  const clearConfig = () => {
    clearStoredConfig();
    window.location.reload();
  };

  if (configLocation) {
    return (
      <div className={styles.note}>
        <div>{t('currently_previewing_config', { configLocation })}</div>
        <Link onClick={clearConfig}>{t('click_to_unselect_config')}</Link>
      </div>
    );
  }

  const cancelConfigClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    if (fallbackConfig) {
      setShowWarning(true);
    }
  };

  const confirmDemoClick = () => {
    addConfigQueryParam(fallbackConfig);
    window.location.reload();
  };

  const cancelDemoClick = () => setShowWarning(false);

  return (
    <div className={styles.configModal}>
      <ErrorPage title={t('app_config_not_found')}>
        <form method="GET" action="/">
          <TextField required placeholder={t('please_enter_config_id')} name="app-config" />
          <div className={styles.controls}>
            <Button label={t('submit_config_id')} type={'submit'} />
            {fallbackConfig && <Button label={t('cancel_config_id')} onClick={cancelConfigClick} />}
          </div>
        </form>
        <p>
          {t('use_the_jwp_dashboard')}
          <span> </span>
          <Link href={'https://docs.jwplayer.com/platform/docs/ott-create-an-app-config'} target={'_blank'}>
            {t('learn_more')}
          </Link>
        </p>
      </ErrorPage>
      <ConfirmationDialog
        open={showDemoWarning}
        title={t('view_generic_demo')}
        body={t('viewing_config_demo')}
        onConfirm={confirmDemoClick}
        onClose={cancelDemoClick}
      />
    </div>
  );
};

export default DemoConfigDialog;

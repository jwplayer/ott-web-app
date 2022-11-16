import React, { MouseEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import styles from './DemoConfigDialog.module.scss';

import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import TextField from '#src/components/TextField/TextField';
import Button from '#src/components/Button/Button';
import { useConfigSource, useConfigNavigate } from '#src/utils/configOverride';
import Link from '#src/components/Link/Link';
import ConfirmationDialog from '#src/components/ConfirmationDialog/ConfirmationDialog';
import type { Settings } from '#src/stores/SettingsStore';

const fallbackConfig = import.meta.env.APP_DEMO_FALLBACK_CONFIG_ID;

interface Props {
  isConfigSuccess: boolean;
  settings: Settings | undefined;
}

const DemoConfigDialog = ({ isConfigSuccess, settings }: Props) => {
  const { t } = useTranslation('demo');
  const [showDialog, setShowDialog] = useState(false);
  const configNavigate = useConfigNavigate();
  const navigate = useNavigate();

  const configLocation = useConfigSource(settings);
  const ref = useRef<HTMLInputElement>(null);

  const clearConfig = () => {
    configNavigate('');
  };

  const submitClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    if (ref.current?.value === configLocation) {
      navigate(0);
    } else if (ref.current?.value) {
      configNavigate(ref.current.value);
    }
  };

  const cancelConfigClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    if (fallbackConfig) {
      setShowDialog(true);
    }
  };

  const confirmDemoClick = () => {
    setShowDialog(false);
    configNavigate(fallbackConfig);
  };

  const cancelDemoClick = () => setShowDialog(false);

  return (
    <>
      {isConfigSuccess && (
        <div className={styles.note}>
          <div>{t('currently_previewing_config', { configLocation })}</div>
          <Link onClick={clearConfig}>{t('click_to_unselect_config')}</Link>
        </div>
      )}
      {!isConfigSuccess && (
        <div className={styles.configModal}>
          <ErrorPage title={t('app_config_not_found')} helpLink={'https://docs.jwplayer.com/platform/docs/ott-create-an-app-config'}>
            <form>
              <TextField required placeholder={t('please_enter_config_id')} inputRef={ref} />
              <div className={styles.controls}>
                <Button label={t('submit_config_id')} type={'submit'} onClick={submitClick} />
                {fallbackConfig && <Button label={t('cancel_config_id')} onClick={cancelConfigClick} />}
              </div>
            </form>
            <p>{t('use_the_jwp_dashboard')}</p>
            <p>{t('demo_note')}</p>
          </ErrorPage>
        </div>
      )}
      <ConfirmationDialog
        open={showDialog}
        title={t('view_generic_demo')}
        body={t('viewing_config_demo')}
        onConfirm={confirmDemoClick}
        onClose={cancelDemoClick}
      />
    </>
  );
};

export default DemoConfigDialog;

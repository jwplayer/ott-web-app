import React, { ChangeEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { UseQueryResult } from 'react-query';
import { Helmet } from 'react-helmet';

import styles from './DemoConfigDialog.module.scss';

import ErrorPage from '#components/ErrorPage/ErrorPage';
import TextField from '#components/TextField/TextField';
import Button from '#components/Button/Button';
import { getConfigNavigateCallback } from '#src/utils/configOverride';
import ConfirmationDialog from '#components/ConfirmationDialog/ConfirmationDialog';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import type { Config } from '#types/Config';
import DevStackTrace from '#components/DevStackTrace/DevStackTrace';

const regex = /^[a-z,\d]{0,8}$/g;
const DEMO_CONFIG = '225tvq1i';

interface Props {
  selectedConfigSource: string | undefined;
  configQuery: UseQueryResult<Config>;
}

interface State {
  configSource: string | undefined;
  error: string | Error | undefined;
  showDialog: boolean;
  loaded: boolean;
}

const initialState: State = {
  configSource: undefined,
  error: undefined,
  showDialog: false,
  loaded: false,
};

const DemoConfigDialog = ({ selectedConfigSource, configQuery }: Props) => {
  const { t } = useTranslation('demo');
  const navigate = useNavigate();
  const navigateCallback = getConfigNavigateCallback(navigate);

  const [state, setState] = useState<State>(initialState);

  const configNavigate = async (configSource: string | undefined) => {
    setState((s) => ({ ...s, configSource: configSource, error: undefined }));

    if (!configSource) {
      setState((s) => ({ ...s, error: t('enter_a_value') }));
    }
    // If trying to fetch the same config again, use refetch since a query param change won't work
    else if (configSource === selectedConfigSource) {
      await configQuery.refetch();
    }
    // Get a new config by triggering a query param change
    else {
      navigateCallback(configSource);
    }
  };

  useEffect(() => {
    // Don't grab values from props when config source is unset or still loading
    if (!selectedConfigSource || configQuery.isLoading) {
      return;
    }

    // Initialize the config source if it's not yet set (this happens at first load)
    setState((s) => ({ ...s, configSource: s.configSource ?? selectedConfigSource }));

    // If there's an error after loading is done, grab it to display it to the user
    if (configQuery.error) {
      setState((s) => ({ ...s, showDialog: false, error: configQuery.error as Error }));
    }
  }, [selectedConfigSource, configQuery.error, configQuery.isLoading]);

  const clearConfig = () => {
    setState(initialState);
    navigateCallback('');
  };

  const isValidSource = (configSource: string) => configSource.match(regex)?.some((m) => m === configSource);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setState((s) => ({
      ...s,
      configSource: event.target.value,
      error: isValidSource(event.target.value || '') ? undefined : t('invalid_config_id_format'),
    }));
  };

  const submitClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();

    let error: string = '';

    if (state.configSource?.length !== 8) {
      error = t('enter_8_digits');
    } else if (!isValidSource(state.configSource)) {
      error = t('invalid_config_id_format');
    }

    if (error) {
      setState((s) => ({ ...s, error: error }));
    } else {
      await configNavigate(state.configSource);
    }
  };

  const cancelConfigClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    setState({ configSource: '', error: undefined, loaded: false, showDialog: true });
  };

  const confirmDemoClick = async () => {
    await configNavigate(DEMO_CONFIG);
  };

  const cancelDemoClick = () => setState((s) => ({ ...s, showDialog: false }));

  // If the config loads, reset the demo ui state
  useEffect(() => {
    if (configQuery.isSuccess) {
      setState(initialState);
    }
  }, [setState, configQuery.isSuccess]);

  // If someone links to the app with a config query,
  // we want to show the normal spinner instead of the dialog while trying to load the first time
  // Config is only undefined when it's the first load attempt.
  if (configQuery.isLoading && state.configSource === undefined) {
    return <LoadingOverlay />;
  }

  return (
    <>
      {!configQuery.isSuccess && (
        <Helmet>
          <meta name="description" content="Enter the App Config ID" />
        </Helmet>
      )}
      {configQuery.isSuccess && (
        <div className={styles.note}>
          <div>{t('currently_previewing_config', { configSource: selectedConfigSource })}</div>
          <Button variant="text" label={t('click_to_unselect_config')} onClick={clearConfig} />
        </div>
      )}
      {!configQuery.isSuccess && (
        <div className={styles.configModal}>
          <ErrorPage
            title={t('app_config_not_found')}
            learnMoreLabel={t('app_config_learn_more')}
            helpLink={'https://docs.jwplayer.com/platform/docs/ott-create-an-app-config'}
            error={typeof state.error === 'string' ? undefined : state.error}
          >
            <form method={'GET'} target={'/'}>
              <TextField
                required
                disabled={configQuery.isLoading}
                className={styles.maxWidth}
                maxLength={8}
                value={state.configSource || ''}
                placeholder={t('please_enter_config_id')}
                name={'app-config'}
                autoCapitalize={'none'}
                error={!!state.error}
                helperText={
                  state.error && (
                    <span>
                      {typeof state.error === 'string' ? state.error : state.error?.message}
                      <br />
                      <br />
                      <DevStackTrace error={typeof state.error === 'string' ? undefined : state.error} />
                    </span>
                  )
                }
                onChange={onChange}
              />
              <div className={styles.controls}>
                <Button
                  label={t('submit_config_id')}
                  type={'submit'}
                  onClick={submitClick}
                  disabled={configQuery.isLoading}
                  busy={configQuery.isLoading && !state.showDialog}
                />
                <Button label={t('cancel_config_id')} onClick={cancelConfigClick} disabled={configQuery.isLoading} />
              </div>
            </form>
            <p>{t('use_the_jwp_dashboard')}</p>
            <p>{t('demo_note')}</p>
          </ErrorPage>
        </div>
      )}
      <ConfirmationDialog
        open={state.showDialog}
        title={t('view_generic_demo')}
        body={t('viewing_config_demo')}
        onConfirm={confirmDemoClick}
        onClose={cancelDemoClick}
        busy={configQuery.isLoading}
      />
    </>
  );
};

export default DemoConfigDialog;

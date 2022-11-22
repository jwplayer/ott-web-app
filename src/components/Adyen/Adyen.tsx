import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Adyen.module.scss';

import { addScript, addStyleSheet } from '#src/utils/dom';
import Button from '#components/Button/Button';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import { ADYEN_LIVE_CLIENT_KEY, ADYEN_TEST_CLIENT_KEY } from '#src/config';
import useOpaqueId from '#src/hooks/useOpaqueId';
import './AdyenForm.scss';

type Props = {
  onChange?: (data: AdyenEventData) => void;
  onSubmit: (data: AdyenEventData) => void;
  error?: string;
  environment?: 'test' | 'live';
};

const Adyen: React.FC<Props> = ({ onChange, onSubmit, error, environment = 'test' }) => {
  const { t } = useTranslation('account');
  const id = useOpaqueId('adyen', 'checkout');
  const adyenRef = useRef<AdyenCheckout>(null) as React.MutableRefObject<AdyenCheckout>;
  const [scriptsLoaded, setScriptsLoaded] = useState(!!window.AdyenCheckout);

  useEffect(() => {
    const loadExternalScripts = async () => {
      await Promise.all([
        addScript(`https://checkoutshopper-${environment}.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js`),
        addStyleSheet(`https://checkoutshopper-${environment}.adyen.com/checkoutshopper/sdk/3.11.4/adyen.css`),
      ]);

      setScriptsLoaded(true);
    };

    // noinspection JSIgnoredPromiseFromCall
    loadExternalScripts();
  }, [environment]);

  useEffect(() => {
    if (scriptsLoaded) {
      const configuration = {
        showPayButton: false,
        clientKey: environment === 'test' ? ADYEN_TEST_CLIENT_KEY : ADYEN_LIVE_CLIENT_KEY,
        environment,
        onSubmit,
        onChange,
      };

      // @ts-ignore
      adyenRef.current = new window.AdyenCheckout(configuration).create('card').mount(`#${id}`);

      return () => {
        if (adyenRef.current) {
          adyenRef.current.unmount();
        }
      };
    }
  }, [environment, id, onChange, onSubmit, scriptsLoaded]);

  return (
    <div className={styles.adyen}>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <div className={styles.container}>
        <div id={id} />
      </div>
      <Button label={t('checkout.continue')} variant="contained" color="primary" size="large" onClick={() => adyenRef.current?.submit()} fullWidth />
    </div>
  );
};

export default Adyen;

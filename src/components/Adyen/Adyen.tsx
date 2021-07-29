import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { addScript, addStyleSheet } from '../../utils/dom';
import useOpaqueId from '../../hooks/useOpaqueId';
import Button from '../Button/Button';
import FormFeedback from '../FormFeedback/FormFeedback';

import styles from './Adyen.module.scss';

type Props = {
  onChange?: (data: AdyenEventData) => void;
  onSubmit: (data: AdyenEventData) => void;
  error?: string;
};

const Adyen: React.FC<Props> = ({ onChange, onSubmit, error }) => {
  const { t } = useTranslation('account');
  const id = useOpaqueId('adyen', 'checkout');
  const adyenRef = useRef<AdyenCheckout>(null) as React.MutableRefObject<AdyenCheckout>;
  const [scriptsLoaded, setScriptsLoaded] = useState(!!window.AdyenCheckout);

  useEffect(() => {
    const loadExternalScripts = async () => {
      await Promise.all([
        addScript('https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js'),
        addStyleSheet('https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.11.4/adyen.css'),
      ]);

      setScriptsLoaded(true);
    };

    loadExternalScripts();
  }, []);

  useEffect(() => {
    if (scriptsLoaded) {
      const configuration = {
        showPayButton: false,
        environment: 'test',
        clientKey: 'test_I4OFGUUCEVB5TI222AS3N2Y2LY6PJM3K',
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
  }, [id, onChange, onSubmit, scriptsLoaded]);

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

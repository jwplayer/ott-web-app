import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AdyenCheckout from '@adyen/adyen-web';
import type { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import type { PaymentMethods } from '@adyen/adyen-web/dist/types/types';

import styles from './Adyen.module.scss';

import Button from '#components/Button/Button';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import '@adyen/adyen-web/dist/adyen.css';
import './AdyenForm.scss';

type Props = {
  configuration: CoreOptions;
  error?: string;
  type: AdyenPaymentMethodType;
};

const Adyen: React.FC<Props> = ({ configuration, error, type }) => {
  const { t } = useTranslation('account');
  const checkoutElementRef = useRef(null);
  const checkoutRef = useRef<InstanceType<PaymentMethods[typeof type]>>();

  useEffect(() => {
    if (!checkoutElementRef.current || !configuration.session) {
      return;
    }

    const createCheckout = async () => {
      const checkout = await AdyenCheckout(configuration);

      if (checkoutElementRef.current) {
        checkoutRef.current = checkout.create(type);
        checkoutRef.current?.mount(checkoutElementRef.current);
      }
    };

    createCheckout();

    return () => {
      checkoutRef.current?.unmount();
    };
  }, [configuration, type]);

  return (
    <div className={styles.adyen}>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <div className={styles.container} ref={checkoutElementRef} />
      <Button
        label={t('checkout.continue')}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => {
          checkoutRef.current && checkoutRef.current.submit();
        }}
        fullWidth
      />
    </div>
  );
};

export default Adyen;

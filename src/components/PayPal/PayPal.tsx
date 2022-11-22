import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PayPal.module.scss';

import Button from '#components/Button/Button';
import FormFeedback from '#components/FormFeedback/FormFeedback';

type Props = {
  onSubmit?: () => void;
  error?: string;
};

const PayPal: React.FC<Props> = ({ onSubmit, error }) => {
  const { t } = useTranslation('account');

  return (
    <div className={styles.payPal}>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <p>{t('checkout.paypal_instructions')}</p>
      <Button label={t('checkout.continue')} variant="contained" color="primary" size="large" onClick={onSubmit} fullWidth />
    </div>
  );
};

export default PayPal;

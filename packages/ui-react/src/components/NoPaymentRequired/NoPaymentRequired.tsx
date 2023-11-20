import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import FormFeedback from '../FormFeedback/FormFeedback';

import styles from './NoPaymentRequired.module.scss';

type Props = {
  onSubmit?: () => void;
  error?: string;
};

const NoPaymentRequired: React.FC<Props> = ({ onSubmit, error }) => {
  const { t } = useTranslation('account');

  return (
    <div className={styles.noPaymentRequired}>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <p>{t('checkout.no_payment_needed')}</p>
      <Button label={t('checkout.continue')} variant="contained" color="primary" size="large" onClick={onSubmit} fullWidth />
    </div>
  );
};

export default NoPaymentRequired;

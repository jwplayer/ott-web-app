import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PaymentFailed.module.scss';

import Button from '#components/Button/Button';

type Props = {
  type: 'error' | 'cancelled';
  message?: string;
  onCloseButtonClick: () => void;
};

const PaymentFailed: React.FC<Props> = ({ type, message, onCloseButtonClick }: Props) => {
  const { t } = useTranslation('account');
  return (
    <div>
      <h2 className={styles.title}>{type === 'cancelled' ? t('checkout.payment_cancelled') : t('checkout.payment_error')}</h2>
      <p className={styles.message}>{type === 'cancelled' ? t('checkout.payment_cancelled_message') : message}</p>
      <div>
        <Button label={t('checkout.close')} onClick={onCloseButtonClick} color="primary" variant="contained" size="large" fullWidth />
      </div>
    </div>
  );
};

export default PaymentFailed;

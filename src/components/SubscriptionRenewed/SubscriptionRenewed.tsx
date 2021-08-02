import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../Button/Button';
import type { Subscription } from '../../../types/subscription';
import { formatDate, formatPrice } from '../../utils/formatting';
import type { Customer } from '../../../types/account';

import styles from './SubscriptionRenewed.module.scss';

type Props = {
  customer: Customer;
  subscription: Subscription;
  onClose: () => void;
};

const SubscriptionRenewed: React.FC<Props> = ({ onClose, customer, subscription }: Props) => {
  const { t } = useTranslation('account');
  const date = formatDate(subscription.expiresAt);
  const price = formatPrice(subscription.nextPaymentPrice, subscription.nextPaymentCurrency, customer.country);

  return (
    <div>
      <h2 className={styles.title}>{t('subscription_renewed.title')}</h2>
      <p className={styles.paragraph}>{t('subscription_renewed.message', { date, price })}</p>
      <Button label={t('subscription_renewed.back_to_profile')} onClick={onClose} fullWidth />
    </div>
  );
};

export default SubscriptionRenewed;

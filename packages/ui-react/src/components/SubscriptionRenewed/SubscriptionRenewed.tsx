import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '@jwp/ott-common/types/subscription';
import type { Customer } from '@jwp/ott-common/types/account';
import { formatLocalizedDate, formatPrice } from '@jwp/ott-common/src/utils/formatting';

import Button from '../Button/Button';

import styles from './SubscriptionRenewed.module.scss';

type Props = {
  customer: Customer;
  subscription: Subscription;
  onClose: () => void;
};

const SubscriptionRenewed: React.FC<Props> = ({ onClose, customer, subscription }: Props) => {
  const { t, i18n } = useTranslation('account');
  const date = formatLocalizedDate(new Date(subscription.expiresAt * 1000), i18n.language);
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

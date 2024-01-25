import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Customer } from '@jwp/ott-common/types/account';
import type { Subscription } from '@jwp/ott-common/types/subscription';
import { formatLocalizedDate, formatPrice } from '@jwp/ott-common/src/utils/formatting';

import Button from '../Button/Button';
import FormFeedback from '../FormFeedback/FormFeedback';

import styles from './RenewSubscriptionForm.module.scss';

type Props = {
  subscription: Subscription;
  customer: Customer;
  error: string | null;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const RenewSubscriptionForm: React.FC<Props> = ({ subscription, customer, error, submitting, onConfirm, onClose }: Props) => {
  const { t, i18n } = useTranslation('account');

  return (
    <div>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <h2 className={styles.title}>{t('renew_subscription.renew_your_subscription')}</h2>
      <p className={styles.paragraph}>{t('renew_subscription.explanation')}</p>
      <div className={styles.infoBox}>
        <p>
          <strong>{subscription.offerTitle}</strong> <br />
          {t('renew_subscription.next_billing_date_on', { date: formatLocalizedDate(new Date(subscription.expiresAt * 1000), i18n.language) })}
        </p>
        <p className={styles.price}>
          <strong>{formatPrice(subscription.nextPaymentPrice, subscription.nextPaymentCurrency, customer.country)}</strong>
          <small>/{t(`periods.${subscription.period}`)}</small>
        </p>
      </div>
      <Button
        className={styles.confirmButton}
        color="primary"
        variant="contained"
        label={t('renew_subscription.renew_subscription')}
        onClick={onConfirm}
        fullWidth
        disabled={submitting}
        type="submit"
      />
      <Button label={t('renew_subscription.no_thanks')} onClick={onClose} fullWidth />
    </div>
  );
};

export default RenewSubscriptionForm;

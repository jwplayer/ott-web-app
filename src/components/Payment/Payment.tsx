import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Subscription } from 'types/subscription';

import Button from '../Button/Button';

import styles from './Payment.module.scss';

type Props = {
  subscription: Subscription;
  onEditSubscriptionClick: (subscription: Subscription) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
};

const Payment = ({ subscription, onEditSubscriptionClick, panelClassName, panelHeaderClassName }: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const showAllTransactions = () => console.info('show all');

  return (
    <>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('payment.subscription_details')}</h3>
        </div>
        <div className={styles.infoBox}>
          <p>
            <strong>{t('payment.monthly_subscription')}</strong> <br />
            {t('payment.next_billing_date_on')}
            {'<date>'}
          </p>
          <p className={styles.price}>
            <strong>{'€ 14.76'}</strong>
            {'/'}
            {t('payment.month')}
          </p>
        </div>
        <Button label={t('payment.edit_subscription')} onClick={() => onEditSubscriptionClick} />
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('payment.payment_method')}</h3>
        </div>
        <div>
          <strong>{t('payment.card_number')}</strong>
          <p>xxxx xxxx xxxx 3456</p>
          <div className={styles.cardDetails}>
            <div className={styles.expiryDate}>
              <strong>{t('payment.expiry_date')}</strong>
              <p>{subscription.expiresAt}</p>
            </div>
            <div>
              <strong>{t('payment.cvc_cvv')}</strong>
              <p>******</p>
            </div>
          </div>
        </div>
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('payment.transactions')}</h3>
        </div>
        <div className={styles.infoBox}>
          <p>
            <strong>{t('payment.monthly_subscription')}</strong> <br />
            {t('payment.price_payed_with_card')}
          </p>
          <p>
            {'<Invoice code>'}
            <br />
            {'<Date>'}
          </p>
        </div>
        <p>{t('payment.more_transactions', { amount: 4 })}</p>
        <Button label="Show all" onClick={() => showAllTransactions()} />
      </div>
    </>
  );
};

export default Payment;

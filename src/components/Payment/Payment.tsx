import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PaymentDetail, Subscription, Transaction } from 'types/subscription';

import { formatCurrencySymbol, formatSubscriptionDates } from '../../utils/formatting';
import Button from '../Button/Button';
import TextField from '../TextField/TextField';

import styles from './Payment.module.scss';

type Props = {
  subscriptions: Subscription[];
  paymentDetails: PaymentDetail[];
  transactions: Transaction[];
  isLoading: boolean;
  onUpdateSubscriptionSubmit: (subscriptions: Subscription) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
};

//@todo: remove
const mockSubscriptions: Subscription[] = [
  {
    subscriptionId: 590680399,
    offerId: 'S568296139_ZW',
    status: 'active',
    expiresAt: 1615897260,
    nextPaymentPrice: 22.15,
    nextPaymentCurrency: 'EUR',
    paymentGateway: 'adyen',
    paymentMethod: 'card',
    offerTitle: 'Annual subscription (recurring) to pride&amp;prejudice',
    period: 'year',
    totalPrice: 20,
  } as Subscription,
];

const Payment = ({
  paymentDetails,
  subscriptions = mockSubscriptions, //@todo
  transactions,
  isLoading,
  onUpdateSubscriptionSubmit,
  panelClassName,
  panelHeaderClassName,
}: Props): JSX.Element => {
  const { t } = useTranslation('user');
  const showAllTransactions = () => console.info('show all');

  const subscriptionDates = useMemo(() => formatSubscriptionDates(subscriptions), [subscriptions]);

  console.info('Variables still to use: ', transactions, isLoading, onUpdateSubscriptionSubmit);

  return (
    <>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('payment.subscription_details')}</h3>
        </div>
        {subscriptions &&
          subscriptions.map((subscription: Subscription, index: number) => (
            <div className={styles.infoBox} key={subscription.subscriptionId}>
              <p>
                <strong>{t('payment.monthly_subscription')}</strong> <br />
                {`${t('payment.next_billing_date_on')} ${subscriptionDates[index]}`}
              </p>
              <p className={styles.price}>
                <strong>{`${formatCurrencySymbol(subscription.nextPaymentCurrency)} ${subscription.totalPrice.toFixed(2)}`}</strong>
                {'/'}
                {t(`payment.month`)} {/** @todo: create dynamic translation keys by period */}
              </p>
            </div>
          ))}
        <Button label={t('payment.edit_subscription')} onClick={() => null} />
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('payment.payment_method')}</h3>
        </div>
        {paymentDetails &&
          paymentDetails.map((payment: PaymentDetail) => (
            <div key={payment.id}>
              <TextField
                label={t('payment.card_number')}
                value={`•••• •••• •••• ${payment.paymentMethodSpecificParams.lastCardFourDigits || ''}`}
                editing={false}
              />
              <div className={styles.cardDetails}>
                <TextField label={t('payment.expiry_date')} value={payment.paymentMethodSpecificParams.cardExpirationDate} editing={false} />
                <TextField label={t('payment.cvc_cvv')} value={'******'} editing={false} />
              </div>
            </div>
          ))}
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

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PaymentDetail, Subscription, Transaction } from 'types/subscription';

import { formatDate, formatPrice } from '../../utils/formatting';
import TextField from '../TextField/TextField';
import type { Customer } from '../../../types/account';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Button from '../Button/Button';

import styles from './Payment.module.scss';

type Props = {
  activeSubscription?: Subscription | null;
  activePaymentDetail?: PaymentDetail;
  transactions: Transaction[];
  customer: Customer;
  isLoading: boolean;
  panelClassName?: string;
  panelHeaderClassName?: string;
  onCompleteSubscriptionClick?: () => void;
  onCancelSubscriptionClick?: () => void;
  onRenewSubscriptionClick?: () => void;
};

const Payment = ({
  onCompleteSubscriptionClick,
  onCancelSubscriptionClick,
  onRenewSubscriptionClick,
  activePaymentDetail,
  activeSubscription,
  transactions,
  customer,
  isLoading,
  panelClassName,
  panelHeaderClassName,
}: Props): JSX.Element => {
  const { t } = useTranslation(['user', 'account']);

  return (
    <>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('user:payment.subscription_details')}</h3>
        </div>
        {activeSubscription ? (
          <React.Fragment>
            <div className={styles.infoBox} key={activeSubscription.subscriptionId}>
              <p>
                <strong>{t('user:payment.monthly_subscription')}</strong> <br />
                {activeSubscription.status === 'active'
                  ? t('user:payment.next_billing_date_on', { date: formatDate(activeSubscription.expiresAt) })
                  : t('user:payment.subscription_expires_on', { date: formatDate(activeSubscription.expiresAt) })}
              </p>
              <p className={styles.price}>
                <strong>{formatPrice(activeSubscription.totalPrice, activeSubscription.nextPaymentCurrency, customer.country)}</strong>
                <small>/{t(`account:periods.${activeSubscription.period}`)}</small>
              </p>
            </div>
            {activeSubscription.status === 'active' ? (
              <Button label={t('user:payment.cancel_subscription')} onClick={onCancelSubscriptionClick} />
            ) : (
              <Button label={t('user:payment.renew_subscription')} onClick={onRenewSubscriptionClick} />
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p>{t('user:payment.no_subscription')}</p>
            <Button variant="contained" color="primary" label={t('user:payment.complete_subscription')} onClick={onCompleteSubscriptionClick} />
          </React.Fragment>
        )}
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('user:payment.payment_method')}</h3>
        </div>
        {activePaymentDetail ? (
          <div key={activePaymentDetail.id}>
            <TextField
              label={t('user:payment.card_number')}
              value={`•••• •••• •••• ${activePaymentDetail.paymentMethodSpecificParams.lastCardFourDigits || ''}`}
              editing={false}
            />
            <div className={styles.cardDetails}>
              <TextField
                label={t('user:payment.expiry_date')}
                value={activePaymentDetail.paymentMethodSpecificParams.cardExpirationDate}
                editing={false}
              />
              <TextField label={t('user:payment.cvc_cvv')} value={'******'} editing={false} />
            </div>
          </div>
        ) : (
          <div>
            <p>{!isLoading && t('user:payment.no_payment_methods')}</p>
          </div>
        )}
      </div>
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('user:payment.transactions')}</h3>
        </div>
        {transactions?.length ? (
          transactions?.map((transaction) => (
            <div className={styles.infoBox} key={transaction.transactionId}>
              <p>
                <strong>{transaction.offerTitle}</strong> <br />
                {t('user:payment.price_payed_with', {
                  price: formatPrice(parseInt(transaction.transactionPriceInclTax), transaction.transactionCurrency, transaction.customerCountry),
                  method: transaction.paymentMethod,
                })}
              </p>
              <p>
                {transaction.transactionId}
                <br />
                {formatDate(transaction.transactionDate)}
              </p>
            </div>
          ))
        ) : (
          <div>
            <p>{!isLoading && t('user:payment.no_transactions')}</p>
          </div>
        )}
      </div>
      {isLoading && <LoadingOverlay inline />}
    </>
  );
};

export default Payment;

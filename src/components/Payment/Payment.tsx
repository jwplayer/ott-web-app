import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { formatDate, formatPrice } from '../../utils/formatting';
import TextField from '../TextField/TextField';
import type { Customer } from '../../../types/account';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Button from '../Button/Button';
import { addQueryParam } from '../../utils/history';

import styles from './Payment.module.scss';

import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import type { AccessModel } from '#types/Config';

const VISIBLE_TRANSACTIONS = 4;

type Props = {
  accessModel: AccessModel;
  activeSubscription: Subscription | null;
  activePaymentDetail: PaymentDetail | null;
  transactions: Transaction[] | null;
  customer: Customer;
  isLoading: boolean;
  panelClassName?: string;
  panelHeaderClassName?: string;
  onShowAllTransactionsClick?: () => void;
  showAllTransactions: boolean;
};

const Payment = ({
  accessModel,
  activePaymentDetail,
  activeSubscription,
  transactions,
  customer,
  isLoading,
  panelClassName,
  panelHeaderClassName,
  onShowAllTransactionsClick,
  showAllTransactions,
}: Props): JSX.Element => {
  const { t } = useTranslation(['user', 'account']);
  const hiddenTransactionsCount = transactions ? transactions?.length - VISIBLE_TRANSACTIONS : 0;
  const hasMoreTransactions = hiddenTransactionsCount > 0;
  const history = useHistory();

  function onCompleteSubscriptionClick() {
    history.push(addQueryParam(history, 'u', 'choose-offer'));
  }

  function onCancelSubscriptionClick() {
    history.push(addQueryParam(history, 'u', 'unsubscribe'));
  }

  function onRenewSubscriptionClick() {
    history.push(addQueryParam(history, 'u', 'renew-subscription'));
  }

  function getTitle(period: Subscription['period']) {
    switch (period) {
      case 'month':
        return t('user:payment.monthly_subscription');
      case 'year':
        return t('user:payment.annual_subscription');
      case 'day':
        return t('user:payment.daily_subscription');
      case 'week':
        return t('user:payment.weekly_subscription');
      default:
        throw 'Unknown period';
    }
  }

  return (
    <>
      {accessModel === 'SVOD' && (
        <div className={panelClassName}>
          <div className={panelHeaderClassName}>
            <h3>{t('user:payment.subscription_details')}</h3>
          </div>
          {activeSubscription ? (
            <React.Fragment>
              <div className={styles.infoBox} key={activeSubscription.subscriptionId}>
                <p>
                  <strong>{getTitle(activeSubscription.period)}</strong> <br />
                  {activeSubscription.status === 'active'
                    ? t('user:payment.next_billing_date_on', { date: formatDate(activeSubscription.expiresAt) })
                    : t('user:payment.subscription_expires_on', { date: formatDate(activeSubscription.expiresAt) })}
                </p>
                <p className={styles.price}>
                  <strong>{formatPrice(activeSubscription.nextPaymentPrice, activeSubscription.nextPaymentCurrency, customer.country)}</strong>
                  <small>/{t(`account:periods.${activeSubscription.period}`)}</small>
                </p>
              </div>
              {activeSubscription.status === 'active' ? (
                <Button label={t('user:payment.cancel_subscription')} onClick={onCancelSubscriptionClick} />
              ) : (
                <Button label={t('user:payment.renew_subscription')} onClick={onRenewSubscriptionClick} />
              )}
            </React.Fragment>
          ) : isLoading ? null : (
            <React.Fragment>
              <p>{t('user:payment.no_subscription')}</p>
              <Button variant="contained" color="primary" label={t('user:payment.complete_subscription')} onClick={onCompleteSubscriptionClick} />
            </React.Fragment>
          )}
        </div>
      )}
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
              <TextField label={t('user:payment.expiry_date')} value={activePaymentDetail.paymentMethodSpecificParams.cardExpirationDate} editing={false} />
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
          <React.Fragment>
            {transactions?.slice(0, showAllTransactions ? 9999 : VISIBLE_TRANSACTIONS).map((transaction) => (
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
            ))}
            {!showAllTransactions && hasMoreTransactions ? (
              <React.Fragment>
                <p>{t('user:payment.hidden_transactions', { count: hiddenTransactionsCount })}</p>
                <Button label={t('user:payment.show_all')} onClick={onShowAllTransactionsClick} />
              </React.Fragment>
            ) : null}
          </React.Fragment>
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

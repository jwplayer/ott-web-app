import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';

import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import IconButton from '../IconButton/IconButton';
import ExternalLink from '../../icons/ExternalLink';

import styles from './Payment.module.scss';

import TextField from '#components/TextField/TextField';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import Button from '#components/Button/Button';
import type { Customer } from '#types/account';
import { formatLocalizedDate, formatPrice } from '#src/utils/formatting';
import { addQueryParam } from '#src/utils/location';
import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import type { AccessModel } from '#types/Config';
import PayPal from '#src/icons/PayPal';
import type { Offer } from '#types/checkout';
import useOffers from '#src/hooks/useOffers';
import OfferSwitch from '#components/OfferSwitch/OfferSwitch';
import { changeSubscription } from '#src/stores/CheckoutController';
import Alert from '#components/Alert/Alert';

const VISIBLE_TRANSACTIONS = 4;

type Props = {
  accessModel: AccessModel;
  activeSubscription: Subscription | null;
  activePaymentDetail: PaymentDetail | null;
  transactions: Transaction[] | null;
  customer: Customer;
  pendingOffer: Offer | null;
  isLoading: boolean;
  offerSwitchesAvailable: boolean;
  onShowReceiptClick: (transactionId: string) => void;
  panelClassName?: string;
  panelHeaderClassName?: string;
  onShowAllTransactionsClick?: () => void;
  onUpgradeSubscriptionClick?: () => void;
  showAllTransactions: boolean;
  canUpdatePaymentMethod: boolean;
  canRenewSubscription?: boolean;
  canShowReceipts?: boolean;
};

const Payment = ({
  accessModel,
  activePaymentDetail,
  activeSubscription,
  pendingOffer,
  transactions,
  customer,
  isLoading,
  panelClassName,
  panelHeaderClassName,
  onShowAllTransactionsClick,
  showAllTransactions,
  onShowReceiptClick,
  canRenewSubscription = false,
  canShowReceipts = false,
  canUpdatePaymentMethod,
  onUpgradeSubscriptionClick,
  offerSwitchesAvailable,
}: Props): JSX.Element => {
  const { t, i18n } = useTranslation(['user', 'account']);
  const hiddenTransactionsCount = transactions ? transactions?.length - VISIBLE_TRANSACTIONS : 0;
  const hasMoreTransactions = hiddenTransactionsCount > 0;
  const navigate = useNavigate();
  const location = useLocation();
  const isGrantedSubscription = activeSubscription?.period === 'granted';
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const { offers } = useOffers();
  const hasSelectableOffers = offers.some((offer) => offer.planSwitchEnabled);

  const [isChangingOffer, setIsChangingOffer] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(activeSubscription?.accessFeeId ?? null);
  const [isUpgradeOffer, setIsUpgradeOffer] = useState<boolean | undefined>(undefined);

  // TODO: debug why offer upgrade works but downgrade doesn't

  useEffect(() => {
    if (!isChangingOffer) {
      setSelectedOfferId(activeSubscription?.accessFeeId ?? null);
    }
  }, [activeSubscription, isChangingOffer]);

  useEffect(() => {
    if (selectedOfferId && offers) {
      setIsUpgradeOffer(
        (offers.find((offer) => offer.offerId === selectedOfferId)?.customerPriceInclTax ?? 0) >
          (offers.find((offer) => offer.offerId === activeSubscription?.accessFeeId)?.customerPriceInclTax ?? 0),
      );
    }
  }, [selectedOfferId, offers, activeSubscription]);

  const changeSubscriptionPlan = useMutation(changeSubscription);

  const onChangePlanClick = async () => {
    if (selectedOfferId && activeSubscription?.subscriptionId) {
      changeSubscriptionPlan.mutate({
        accessFeeId: selectedOfferId.slice(1),
        subscriptionId: `${activeSubscription.subscriptionId}`,
      });
    }
  };

  function onCompleteSubscriptionClick() {
    navigate(addQueryParam(location, 'u', 'choose-offer'));
  }
  function onEditCardDetailsClick() {
    navigate(addQueryParam(location, 'u', 'edit-card'));
  }

  function onCancelSubscriptionClick() {
    navigate(addQueryParam(location, 'u', 'unsubscribe'));
  }

  function onRenewSubscriptionClick() {
    navigate(addQueryParam(location, 'u', 'renew-subscription'));
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
      case 'granted':
        return t('user:payment.granted_subscription');
      default:
        return t('user:payment.other');
    }
  }

  const showChangeSubscriptionButton = offerSwitchesAvailable || (hasSelectableOffers && !isChangingOffer && activeSubscription?.status !== 'active_trial');

  return (
    <>
      <Alert
        isSuccess={changeSubscriptionPlan.isSuccess}
        message={
          changeSubscriptionPlan.isSuccess
            ? isUpgradeOffer
              ? t('user:payment.upgrade_plan_success')
              : t('user:payment.downgrade_plan_success')
            : t('user:payment.change_plan_error')
        }
        open={isChangingOffer && (changeSubscriptionPlan.isSuccess || changeSubscriptionPlan.isError)}
        onClose={() => {
          changeSubscriptionPlan.reset();
          setIsChangingOffer(false);
        }}
      />
      {accessModel === 'SVOD' && (
        <div className={panelClassName}>
          <div className={panelHeaderClassName}>
            <h3>{isChangingOffer ? t('user:payment.change_plan') : t('user:payment.subscription_details')}</h3>
          </div>
          {activeSubscription ? (
            <React.Fragment>
              {!isChangingOffer && (
                <div className={styles.infoBox} key={activeSubscription.subscriptionId}>
                  <p>
                    <strong>{getTitle(activeSubscription.period)}</strong> <br />
                    {activeSubscription.status === 'active' && !isGrantedSubscription
                      ? t('user:payment.next_billing_date_on', { date: formatLocalizedDate(new Date(activeSubscription.expiresAt * 1000), i18n.language) })
                      : t('user:payment.subscription_expires_on', { date: formatLocalizedDate(new Date(activeSubscription.expiresAt * 1000), i18n.language) })}
                    {pendingOffer && (
                      <span className={styles.pendingSwitch}>{t('user:payment.pending_offer_switch', { title: getTitle(pendingOffer.period) })}</span>
                    )}
                  </p>
                  {!isGrantedSubscription && (
                    <p className={styles.price}>
                      <strong>{formatPrice(activeSubscription.nextPaymentPrice, activeSubscription.nextPaymentCurrency, customer.country)}</strong>
                      <small>/{t(`account:periods.${activeSubscription.period}`)}</small>
                    </p>
                  )}
                </div>
              )}
              {showChangeSubscriptionButton && (
                <Button
                  className={styles.upgradeSubscription}
                  label={t('user:payment.change_subscription')}
                  onClick={() => {
                    if (offers.length > 1) {
                      setIsChangingOffer(true);
                    } else {
                      onUpgradeSubscriptionClick?.();
                    }
                  }}
                  fullWidth={isMobile}
                  color="primary"
                  data-testid="change-subscription-button"
                />
              )}
              {activeSubscription.status === 'active' && !isGrantedSubscription && !isChangingOffer ? (
                <Button label={t('user:payment.cancel_subscription')} onClick={onCancelSubscriptionClick} fullWidth={isMobile} />
              ) : canRenewSubscription ? (
                <Button label={t('user:payment.renew_subscription')} onClick={onRenewSubscriptionClick} />
              ) : null}
            </React.Fragment>
          ) : isLoading ? null : (
            <React.Fragment>
              <p>{t('user:payment.no_subscription')}</p>
              <Button variant="contained" color="primary" label={t('user:payment.complete_subscription')} onClick={onCompleteSubscriptionClick} />
            </React.Fragment>
          )}
          {isChangingOffer && (
            <div className={styles.changePlanContainer}>
              {offers
                .filter((o) => o.planSwitchEnabled)
                .map((offer) => (
                  <OfferSwitch
                    key={offer.offerId}
                    isCurrentOffer={offer.offerId === activeSubscription?.accessFeeId}
                    offer={offer}
                    selected={{ value: selectedOfferId === offer.offerId, set: setSelectedOfferId }}
                  />
                ))}
              <div className={styles.changePlanButtons}>
                <Button label={t('user:account.save')} onClick={onChangePlanClick} disabled={changeSubscriptionPlan.isLoading} />
                <Button label={t('user:account.cancel')} onClick={() => setIsChangingOffer(false)} variant="text" />
                {activeSubscription?.status !== 'cancelled' && (
                  <Button
                    className={styles.changePlanCancelButton}
                    label={t('user:payment.cancel_subscription')}
                    onClick={onCancelSubscriptionClick}
                    variant="danger"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h3>{t('user:payment.payment_method')}</h3>
        </div>
        {activePaymentDetail ? (
          activePaymentDetail.paymentMethod === 'paypal' ? (
            <div>
              <div className={styles.paypal}>
                <PayPal /> {t('account:payment.paypal')}
              </div>

              {activePaymentDetail.currency}
            </div>
          ) : (
            <div key={activePaymentDetail.id}>
              <TextField
                label={t('user:payment.card_number')}
                value={`•••• •••• •••• ${activePaymentDetail.paymentMethodSpecificParams.lastCardFourDigits || ''}`}
                editing={false}
              />
              <div className={styles.cardDetails}>
                <TextField label={t('user:payment.expiry_date')} value={activePaymentDetail.paymentMethodSpecificParams.cardExpirationDate} editing={false} />
                <TextField label={t('user:payment.security_code')} value={'******'} editing={false} />
              </div>
              <Button label={t('account:payment.edit_card')} variant="outlined" onClick={onEditCardDetailsClick} />
            </div>
          )
        ) : (
          <div>
            <p>{!isLoading && t('user:payment.no_payment_methods')}</p>
          </div>
        )}
        {canUpdatePaymentMethod && (
          <Button label={t('user:payment.update_payment_details')} type="button" onClick={() => navigate(addQueryParam(location, 'u', 'payment-method'))} />
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
                <p className="transactionItem">
                  <strong>{transaction.offerTitle}</strong> <br />
                  {!isGrantedSubscription &&
                    t('user:payment.price_payed_with', {
                      price: formatPrice(parseFloat(transaction.transactionPriceInclTax), transaction.transactionCurrency, transaction.customerCountry),
                      method: transaction.paymentMethod,
                    })}
                </p>
                <div className={styles.transactionDetails}>
                  <p>
                    {transaction.transactionId}
                    <br />
                    {formatLocalizedDate(new Date(transaction.transactionDate * 1000), i18n.language)}
                  </p>
                  {canShowReceipts && (
                    <IconButton aria-label={t('user:payment.show_receipt')} onClick={() => !isLoading && onShowReceiptClick(transaction.transactionId)}>
                      <ExternalLink />
                    </IconButton>
                  )}
                </div>
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

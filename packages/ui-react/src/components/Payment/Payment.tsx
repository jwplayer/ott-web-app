import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AccessModel } from '@jwp/ott-common/types/config';
import type { Customer } from '@jwp/ott-common/types/account';
import type { Offer } from '@jwp/ott-common/types/checkout';
import type { PaymentDetail, Subscription, Transaction } from '@jwp/ott-common/types/subscription';
import { formatLocalizedDate, formatPrice } from '@jwp/ott-common/src/utils/formatting';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import ExternalLink from '@jwp/ott-theme/assets/icons/external_link.svg?react';
import PayPal from '@jwp/ott-theme/assets/icons/paypal.svg?react';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';
import classNames from 'classnames';

import IconButton from '../IconButton/IconButton';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import OfferSwitch from '../OfferSwitch/OfferSwitch';
import TextField from '../TextField/TextField';
import Icon from '../Icon/Icon';
import { modalURLFromLocation } from '../../utils/location';

import styles from './Payment.module.scss';

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
  offers?: Offer[];
  pendingDowngradeOfferId?: string;
  changeSubscriptionPlan: {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    reset: () => void;
  };
  onChangePlanClick: () => void;
  selectedOfferId: string | null;
  setSelectedOfferId: (offerId: string | null) => void;
  isUpgradeOffer: boolean | undefined;
  setIsUpgradeOffer: (isUpgradeOffer: boolean | undefined) => void;
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
  offers = [],
  pendingDowngradeOfferId = '',
  changeSubscriptionPlan,
  onChangePlanClick,
  selectedOfferId,
  setSelectedOfferId,
  isUpgradeOffer,
  setIsUpgradeOffer,
}: Props): JSX.Element => {
  const subscriptionDetailsId = useOpaqueId('subscription-details');
  const paymentMethodId = useOpaqueId('payment-method');
  const billingHistoryId = useOpaqueId('billing-history');
  const { t, i18n } = useTranslation(['user', 'account']);
  const hiddenTransactionsCount = transactions ? transactions?.length - VISIBLE_TRANSACTIONS : 0;
  const hasMoreTransactions = hiddenTransactionsCount > 0;
  const navigate = useNavigate();
  const location = useLocation();
  const isGrantedSubscription = activeSubscription?.period === 'granted';
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const [isChangingOffer, setIsChangingOffer] = useState(false);

  useEffect(() => {
    if (!isChangingOffer) {
      setSelectedOfferId(activeSubscription?.accessFeeId ?? null);
    }
  }, [activeSubscription, isChangingOffer, setSelectedOfferId]);

  useEffect(() => {
    setIsChangingOffer(false);
  }, [activeSubscription?.status, activeSubscription?.pendingSwitchId]);

  useEffect(() => {
    if (selectedOfferId && offers) {
      setIsUpgradeOffer(
        (offers.find((offer) => offer.offerId === selectedOfferId)?.customerPriceInclTax ?? 0) >
          (offers.find((offer) => offer.offerId === activeSubscription?.accessFeeId)?.customerPriceInclTax ?? 0),
      );
    }
  }, [selectedOfferId, offers, activeSubscription, setIsUpgradeOffer]);

  function onCompleteSubscriptionClick() {
    navigate(modalURLFromLocation(location, 'choose-offer'));
  }
  function onEditCardDetailsClick() {
    navigate(modalURLFromLocation(location, 'edit-card'));
  }

  function onCancelSubscriptionClick() {
    navigate(modalURLFromLocation(location, 'unsubscribe'));
  }

  function onRenewSubscriptionClick() {
    navigate(modalURLFromLocation(location, 'renew-subscription'));
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

  const showChangeSubscriptionButton = offerSwitchesAvailable || (!isChangingOffer && !canRenewSubscription);

  return (
    <>
      <Alert
        isSuccess={!changeSubscriptionPlan.isError}
        message={
          !changeSubscriptionPlan.isError
            ? isUpgradeOffer
              ? t('user:payment.upgrade_plan_success')
              : t('user:payment.downgrade_plan_success', {
                  date: activeSubscription?.expiresAt && formatLocalizedDate(new Date(activeSubscription.expiresAt * 1000), i18n.language),
                })
            : t('user:payment.change_plan_error')
        }
        open={isChangingOffer && (changeSubscriptionPlan.isSuccess || changeSubscriptionPlan.isError)}
        onClose={() => {
          changeSubscriptionPlan.reset();
          setIsChangingOffer(false);
        }}
      />
      <h1 className="hideUntilFocus">{t('nav.payments')}</h1>
      {accessModel === ACCESS_MODEL.SVOD && (
        <section aria-labelledby={subscriptionDetailsId} className={panelClassName}>
          <div className={panelHeaderClassName}>
            <h2 id={subscriptionDetailsId}>{isChangingOffer ? t('user:payment.change_plan') : t('user:payment.subscription_details')}</h2>
          </div>
          {activeSubscription ? (
            <React.Fragment>
              {!isChangingOffer && (
                <div className={styles.infoBox} key={activeSubscription.subscriptionId}>
                  <p>
                    <strong>{getTitle(activeSubscription.period)}</strong> <br />
                    {activeSubscription.status === 'active' && !isGrantedSubscription && !pendingDowngradeOfferId
                      ? t('user:payment.next_billing_date_on', { date: formatLocalizedDate(new Date(activeSubscription.expiresAt * 1000), i18n.language) })
                      : t('user:payment.subscription_expires_on', { date: formatLocalizedDate(new Date(activeSubscription.expiresAt * 1000), i18n.language) })}
                    {(pendingOffer || pendingDowngradeOfferId) && activeSubscription.status !== 'cancelled' && (
                      <span className={styles.pendingSwitch}>
                        {t('user:payment.pending_offer_switch', {
                          title: getTitle(pendingOffer?.period || offers.find((offer) => offer.offerId === pendingDowngradeOfferId)?.period || 'month'),
                        })}
                      </span>
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
                  disabled={!canRenewSubscription && activeSubscription.status === 'cancelled'}
                  onClick={() => {
                    if (offers.length > 1 && !canRenewSubscription) {
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
              {(activeSubscription.status === 'active' || activeSubscription.status === 'active_trial') &&
              !isGrantedSubscription &&
              !isChangingOffer &&
              canRenewSubscription ? (
                <Button
                  label={t('user:payment.cancel_subscription')}
                  onClick={onCancelSubscriptionClick}
                  fullWidth={isMobile}
                  data-testid="cancel-subscription-button"
                />
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
                    pendingDowngradeOfferId={pendingDowngradeOfferId}
                    offer={offer}
                    selected={selectedOfferId === offer.offerId}
                    onChange={(offerId) => setSelectedOfferId(offerId)}
                    expiresAt={activeSubscription?.expiresAt}
                  />
                ))}
              <div className={styles.changePlanButtons}>
                <Button
                  label={t('user:account.save')}
                  onClick={onChangePlanClick}
                  disabled={selectedOfferId === activeSubscription?.accessFeeId || changeSubscriptionPlan.isLoading}
                />
                <Button label={t('user:account.cancel')} onClick={() => setIsChangingOffer(false)} variant="text" />
                {activeSubscription?.status !== 'cancelled' && (
                  <Button
                    className={styles.changePlanCancelButton}
                    label={t('user:payment.cancel_subscription')}
                    onClick={onCancelSubscriptionClick}
                    variant="danger"
                    data-testid="cancel-subscription-button"
                  />
                )}
              </div>
            </div>
          )}
        </section>
      )}
      <section aria-labelledby={paymentMethodId} className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h2 id={paymentMethodId}>{t('user:payment.payment_method')}</h2>
        </div>
        {activePaymentDetail ? (
          activePaymentDetail.paymentMethod === 'paypal' ? (
            <div>
              <div className={styles.paypal}>
                <Icon icon={PayPal} /> {t('account:payment.paypal')}
              </div>

              {activePaymentDetail.currency}
            </div>
          ) : (
            <div key={activePaymentDetail.id}>
              <TextField
                label={t('user:payment.card_number')}
                name="cardNumber"
                value={`•••• •••• •••• ${activePaymentDetail.paymentMethodSpecificParams.lastCardFourDigits || ''}`}
                aria-label={t('user:payment.card_number_hidden', { number: activePaymentDetail.paymentMethodSpecificParams.lastCardFourDigits })}
                editing={false}
                autoComplete="cc-number"
              />
              <div className={styles.cardDetails}>
                <TextField
                  label={t('user:payment.expiry_date')}
                  name="cardExpiry"
                  value={activePaymentDetail.paymentMethodSpecificParams.cardExpirationDate}
                  editing={false}
                  autoComplete="cc-exp"
                />
                <TextField
                  label={t('user:payment.security_code')}
                  name="cardSecurityCode"
                  value={'******'}
                  editing={false}
                  aria-label={t('user:payment.security_code_hidden')}
                  autoComplete="cc-csc"
                />
              </div>
              <Button
                className={classNames({ [styles.editCard]: canUpdatePaymentMethod })}
                label={t('account:payment.edit_card')}
                variant="outlined"
                onClick={onEditCardDetailsClick}
              />
            </div>
          )
        ) : (
          <div>
            <p>{!isLoading && t('user:payment.no_payment_methods')}</p>
          </div>
        )}
        {canUpdatePaymentMethod && (
          <Button label={t('user:payment.update_payment_details')} type="button" onClick={() => navigate(modalURLFromLocation(location, 'payment-method'))} />
        )}
      </section>
      <section aria-labelledby={billingHistoryId} className={panelClassName}>
        <div className={panelHeaderClassName}>
          <h2 id={billingHistoryId}>{t('user:payment.billing_history')}</h2>
        </div>
        {transactions?.length ? (
          <React.Fragment>
            {transactions?.slice(0, showAllTransactions ? 9999 : VISIBLE_TRANSACTIONS).map((transaction) => (
              <div className={styles.infoBox} key={transaction.transactionId}>
                <p className={styles.transactionItem}>
                  <strong>{formatLocalizedDate(new Date(transaction.transactionDate * 1000), i18n.language)}</strong>
                  <span>{transaction.offerTitle}</span>
                  <span>{transaction.transactionId}</span>
                </p>
                <div className={styles.transactionDetails}>
                  <div className={styles.transactionPrice}>
                    {!isGrantedSubscription &&
                      t('user:payment.price_paid_with', {
                        price: formatPrice(parseFloat(transaction.transactionPriceInclTax), transaction.transactionCurrency, transaction.customerCountry),
                        method: transaction.paymentMethod,
                      })}
                  </div>
                  {canShowReceipts && (
                    <IconButton
                      aria-label={t('user:payment.show_receipt')}
                      // JW integration specific: uses `trxToken` as the unique identifier for each transaction
                      // Note: `transactionId` is shared with rebills and is not guaranteed to be unique
                      onClick={() => !isLoading && onShowReceiptClick(transaction?.trxToken ?? transaction.transactionId)}
                    >
                      <Icon icon={ExternalLink} />
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
      </section>
      {isLoading && <LoadingOverlay inline />}
    </>
  );
};

export default Payment;

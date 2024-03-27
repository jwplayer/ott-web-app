import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { Offer, OfferType, Order, PaymentMethod } from '@jwp/ott-common/types/checkout';
import { formatPrice } from '@jwp/ott-common/src/utils/formatting';
import Close from '@jwp/ott-theme/assets/icons/close.svg?react';
import PayPal from '@jwp/ott-theme/assets/icons/paypal.svg?react';
import CreditCard from '@jwp/ott-theme/assets/icons/creditcard.svg?react';

import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import FormFeedback from '../FormFeedback/FormFeedback';
import DialogBackButton from '../DialogBackButton/DialogBackButton';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Icon from '../Icon/Icon';

import styles from './CheckoutForm.module.scss';

type Props = {
  paymentMethodId?: string;
  onBackButtonClick: () => void;
  paymentMethods?: PaymentMethod[];
  onPaymentMethodChange: React.ChangeEventHandler<HTMLInputElement>;
  onCouponFormSubmit: React.FormEventHandler<HTMLFormElement>;
  onCouponInputChange: React.ChangeEventHandler<HTMLInputElement>;
  onRedeemCouponButtonClick: () => void;
  onCloseCouponFormClick: () => void;
  error?: string;
  couponFormOpen: boolean;
  couponFormError?: string;
  couponFormApplied?: boolean;
  couponFormSubmitting?: boolean;
  couponInputValue: string;
  order: Order;
  offer: Offer;
  offerType: OfferType;
  children: ReactNode;
  submitting: boolean;
};

const CheckoutForm: React.FC<Props> = ({
  paymentMethodId,
  paymentMethods,
  order,
  offer,
  offerType,
  onBackButtonClick,
  onPaymentMethodChange,
  error,
  couponFormOpen,
  couponInputValue,
  couponFormError,
  couponFormApplied,
  couponFormSubmitting,
  onCouponInputChange,
  onCloseCouponFormClick,
  onCouponFormSubmit,
  onRedeemCouponButtonClick,
  children,
  submitting,
}) => {
  const { t } = useTranslation('account');

  const getOfferPeriod = () => {
    // t('periods.day', { count })
    // t('periods.week', { count })
    // t('periods.month', { count })
    // t('periods.year', { count })
    return offer ? t(`periods.${offer.period}`) : '';
  };

  const getFreeTrialText = (offer: Offer) => {
    if (offer.freeDays) {
      return t('checkout.days_trial', { count: offer.freeDays });
    } else if (offer.freePeriods) {
      // t('periods.day', { count })
      // t('periods.week', { count })
      // t('periods.month', { count })
      // t('periods.year', { count })
      const period = t(`periods.${offer.period}`, { count: offer.freePeriods });

      return t('checkout.periods_trial', { count: offer.freePeriods, period });
    }

    return null;
  };

  const cardPaymentMethod = paymentMethods?.find((method) => method.methodName === 'card');
  const paypalPaymentMethod = paymentMethods?.find((method) => method.methodName === 'paypal');

  const orderTitle = offerType === 'svod' ? (offer.period === 'month' ? t('checkout.monthly') : t('checkout.yearly')) : offer.offerTitle;
  return (
    <div>
      {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}
      <h1 className={styles.title}>{t('checkout.payment_method')}</h1>
      <div className={styles.order}>
        <div className={styles.orderInfo}>
          <p className={classNames(styles.orderTitle, { [styles.orderTitleMargin]: offerType === 'svod' })}>{orderTitle}</p>
          {order.discount?.type === 'trial' ? <p className={styles.orderBillingDate}>{getFreeTrialText(offer)}</p> : null}
        </div>
        <div className={styles.orderPrice}>
          <span>{formatPrice(offer.customerPriceInclTax, order.currency, offer.customerCountry)}</span>
          {offerType === 'svod' && <small>/{getOfferPeriod()}</small>}
        </div>
      </div>
      <div className={styles.couponForm}>
        {couponFormOpen ? (
          <form onSubmit={onCouponFormSubmit} noValidate>
            <div className={styles.redeemCoupon}>
              <IconButton aria-label="Close coupon form" onClick={onCloseCouponFormClick}>
                <Icon icon={Close} />
              </IconButton>
              <input
                className={styles.couponInput}
                name="couponCode"
                type="text"
                placeholder="Coupon code"
                value={couponInputValue}
                onChange={onCouponInputChange}
              />
              <Button variant="outlined" label="Apply" type="submit" disabled={couponFormSubmitting} />
            </div>
            {couponFormError ? <FormFeedback variant="error">{couponFormError}</FormFeedback> : null}
            {couponFormApplied ? <FormFeedback variant="success">{t('checkout.coupon_applied')}</FormFeedback> : null}
          </form>
        ) : (
          <Button variant="outlined" label={t('checkout.redeem_coupon')} onClick={onRedeemCouponButtonClick} />
        )}
      </div>
      <div>
        <table className={styles.orderTotals}>
          <tbody>
            {order.discount?.applied && order.discount?.type === 'coupon' ? (
              <tr>
                <td className={styles.couponCell}>
                  {t('checkout.coupon_discount')}
                  <br />
                  {!!offer.period && offerType === 'svod' && (
                    <small>
                      {t('checkout.discount_period', {
                        count: order.discount?.periods,
                        period: t(`periods.${offer.period}`, { count: order.discount?.periods }),
                      })}
                    </small>
                  )}
                </td>
                <td>{formatPrice(-order.priceBreakdown.discountAmount * (1 + order.taxRate), order.currency, offer.customerCountry)}</td>
              </tr>
            ) : null}
            {order.discount?.applied && order.discount?.type === 'trial' ? (
              <tr>
                <td className={styles.couponCell}>{t('checkout.free_trial_discount')}</td>
                <td>{formatPrice(-offer.customerPriceInclTax, order.currency, offer.customerCountry)}</td>
              </tr>
            ) : null}
            {order.priceBreakdown.paymentMethodFee > 0 && (
              <tr>
                <td>{t('checkout.payment_method_fee')}</td>
                <td>{formatPrice(order.priceBreakdown.paymentMethodFee, order.currency, offer.customerCountry)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>{t('checkout.total_price')}</td>
              <td>{formatPrice(order.totalPrice, order.currency, offer.customerCountry)}</td>
            </tr>
            {order.priceBreakdown.taxValue > 0 && (
              <tr>
                <td>{t('checkout.applicable_tax', { taxRate: Math.round(order.taxRate * 100) })}</td>
                <td>{formatPrice(order.priceBreakdown.taxValue, order.currency, offer.customerCountry)}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
      <hr className={styles.divider} />
      {order.requiredPaymentDetails ? (
        <div className={styles.paymentMethods}>
          {cardPaymentMethod ? (
            <div className={styles.paymentMethod}>
              <input
                className={styles.radio}
                type="radio"
                name="paymentMethodId"
                value={cardPaymentMethod.id}
                id="card"
                checked={paymentMethodId === cardPaymentMethod.id.toString()}
                onChange={onPaymentMethodChange}
              />
              <label className={styles.paymentMethodLabel} htmlFor="card">
                <Icon icon={CreditCard} /> {t('checkout.credit_card')}
              </label>
            </div>
          ) : null}
          {paypalPaymentMethod ? (
            <div className={styles.paymentMethod}>
              <input
                className={styles.radio}
                type="radio"
                name="paymentMethodId"
                value={paypalPaymentMethod.id}
                id="paypal"
                checked={paymentMethodId === paypalPaymentMethod.id.toString()}
                onChange={onPaymentMethodChange}
              />
              <label className={styles.paymentMethodLabel} htmlFor="paypal">
                <Icon icon={PayPal} /> {t('checkout.paypal')}
              </label>
            </div>
          ) : null}
        </div>
      ) : null}
      {children ? <div>{children}</div> : null}
      {submitting && <LoadingOverlay transparentBackground inline />}
      <DialogBackButton onClick={onBackButtonClick} />
    </div>
  );
};

export default CheckoutForm;

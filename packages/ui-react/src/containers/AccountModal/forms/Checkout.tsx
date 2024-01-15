import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import CheckoutController from '@jwp/ott-common/src/stores/CheckoutController';
import { isSVODOffer } from '@jwp/ott-common/src/utils/subscription';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';

import CheckoutForm from '../../../components/CheckoutForm/CheckoutForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import PayPal from '../../../components/PayPal/PayPal';
import NoPaymentRequired from '../../../components/NoPaymentRequired/NoPaymentRequired';
import PaymentForm from '../../../components/PaymentForm/PaymentForm';
import AdyenInitialPayment from '../../AdyenInitialPayment/AdyenInitialPayment';

const Checkout = () => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const location = useLocation();
  const { t } = useTranslation('account');
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [couponCodeApplied, setCouponCodeApplied] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<number | undefined>(undefined);

  const { order, offer, paymentMethods, setOrder } = useCheckoutStore(
    ({ order, offer, paymentMethods, setOrder }) => ({
      order,
      offer,
      paymentMethods,
      setOrder,
    }),
    shallow,
  );

  const offerType = offer && !isSVODOffer(offer) ? 'tvod' : 'svod';

  const paymentSuccessUrl = useMemo(() => {
    return modalURLFromLocation(location, offerType === 'svod' ? 'welcome' : null);
  }, [location, offerType]);

  const couponCodeForm = useForm({ couponCode: '' }, async (values, { setSubmitting, setErrors }) => {
    setUpdatingOrder(true);
    setCouponCodeApplied(false);

    if (values.couponCode && order) {
      try {
        await checkoutController.updateOrder(order, paymentMethodId, values.couponCode);
        setCouponCodeApplied(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes(`Order with id ${order.id} not found`)) {
            navigate(modalURLFromLocation(location, 'choose-offer'), { replace: true });
          } else {
            setErrors({ couponCode: t('checkout.coupon_not_valid') });
          }
        }
      }
    }

    setUpdatingOrder(false);
    setSubmitting(false);
  });

  const handleCouponFormSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setUpdatingOrder(true);
    setCouponCodeApplied(false);
    couponCodeForm.setErrors({ couponCode: undefined });
    if (couponCodeForm.values.couponCode && order) {
      try {
        await checkoutController.updateOrder(order, paymentMethodId, couponCodeForm.values.couponCode);
        setCouponCodeApplied(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes(`Order with id ${order.id} not found`)) {
            navigate(modalURLFromLocation(location, 'choose-offer'), { replace: true });
          } else {
            couponCodeForm.setErrors({ couponCode: t('checkout.coupon_not_valid') });
          }
        }
      }
    }

    setUpdatingOrder(false);
    couponCodeForm.setSubmitting(false);
  };

  useEffect(() => {
    async function createNewOrder() {
      if (offer) {
        setUpdatingOrder(true);
        setCouponCodeApplied(false);
        const methods = await checkoutController.getPaymentMethods();

        setPaymentMethodId(methods[0]?.id);

        await checkoutController.createOrder(offer, methods[0]?.id);

        setUpdatingOrder(false);
      }
    }

    if (!offer) {
      return navigate(modalURLFromLocation(location, 'choose-offer'), { replace: true });
    }

    // noinspection JSIgnoredPromiseFromCall
    createNewOrder();
  }, [location, navigate, offer, checkoutController]);

  // clear the order after closing the checkout modal
  useEffect(() => {
    return () => setOrder(null);
  }, [setOrder]);

  const backButtonClickHandler = () => {
    navigate(modalURLFromLocation(location, 'choose-offer'));
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toPaymentMethodId = parseInt(event.target.value);

    setPaymentMethodId(toPaymentMethodId);
    setPaymentError(undefined);

    if (order && toPaymentMethodId) {
      setUpdatingOrder(true);
      setCouponCodeApplied(false);
      checkoutController
        .updateOrder(order, toPaymentMethodId, couponCodeForm.values.couponCode)
        .catch((error: Error) => {
          if (error.message.includes(`Order with id ${order.id}} not found`)) {
            navigate(modalURLFromLocation(location, 'choose-offer'));
          }
        })
        .finally(() => setUpdatingOrder(false));
    }
  };

  const handleNoPaymentRequiredSubmit = async () => {
    try {
      setUpdatingOrder(true);
      setPaymentError(undefined);
      await checkoutController.paymentWithoutDetails();
      await accountController.reloadActiveSubscription({ delay: 1000 });
      navigate(paymentSuccessUrl, { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPaymentError(error.message);
      }
    }

    setUpdatingOrder(false);
  };

  const handlePayPalSubmit = async () => {
    try {
      setPaymentError(undefined);
      setUpdatingOrder(true);
      const cancelUrl = createURL(window.location.href, { u: 'payment-cancelled' });
      const waitingUrl = createURL(window.location.href, { u: 'waiting-for-payment' });
      const errorUrl = createURL(window.location.href, { u: 'payment-error' });
      const successUrl = `${window.location.origin}${paymentSuccessUrl}`;

      const response = await checkoutController.paypalPayment(successUrl, waitingUrl, cancelUrl, errorUrl, couponCodeForm.values.couponCode);

      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPaymentError(error.message);
      }
    }
    setUpdatingOrder(false);
  };

  const renderPaymentMethod = () => {
    const paymentMethod = paymentMethods?.find((method) => method.id === paymentMethodId);

    if (!order || !offer) return null;

    if (!order.requiredPaymentDetails) {
      return <NoPaymentRequired onSubmit={handleNoPaymentRequiredSubmit} error={paymentError} />;
    }

    if (paymentMethod?.methodName === 'card') {
      if (paymentMethod?.provider === 'stripe') {
        return <PaymentForm couponCode={couponCodeForm.values.couponCode} setUpdatingOrder={setUpdatingOrder} />;
      }

      return (
        <AdyenInitialPayment
          paymentSuccessUrl={paymentSuccessUrl}
          setUpdatingOrder={setUpdatingOrder}
          setPaymentError={setPaymentError}
          orderId={order.id}
          type="card"
        />
      );
    } else if (paymentMethod?.methodName === 'paypal') {
      return <PayPal onSubmit={handlePayPalSubmit} error={paymentError} />;
    }

    return null;
  };

  // loading state
  if (!offer || !order || !paymentMethods || !offerType) {
    return (
      <div style={{ height: 300 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <CheckoutForm
      order={order}
      offer={offer}
      offerType={offerType}
      onBackButtonClick={backButtonClickHandler}
      paymentMethods={paymentMethods}
      paymentMethodId={paymentMethodId}
      onPaymentMethodChange={handlePaymentMethodChange}
      onCouponFormSubmit={handleCouponFormSubmit}
      onCouponInputChange={couponCodeForm.handleChange}
      onRedeemCouponButtonClick={() => setCouponFormOpen(true)}
      onCloseCouponFormClick={() => setCouponFormOpen(false)}
      couponInputValue={couponCodeForm.values.couponCode}
      couponFormOpen={couponFormOpen}
      couponFormApplied={couponCodeApplied}
      couponFormSubmitting={couponCodeForm.submitting}
      couponFormError={couponCodeForm.errors.couponCode}
      renderPaymentMethod={renderPaymentMethod}
      submitting={updatingOrder}
    />
  );
};

export default Checkout;

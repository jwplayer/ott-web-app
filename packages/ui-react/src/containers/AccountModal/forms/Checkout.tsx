import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import useCheckout from '@jwp/ott-hooks-react/src/useCheckout';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { FormValidationError } from '@jwp/ott-common/src/FormValidationError';

import CheckoutForm from '../../../components/CheckoutForm/CheckoutForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import PayPal from '../../../components/PayPal/PayPal';
import NoPaymentRequired from '../../../components/NoPaymentRequired/NoPaymentRequired';
import PaymentForm, { PaymentFormData } from '../../../components/PaymentForm/PaymentForm';
import AdyenInitialPayment from '../../AdyenInitialPayment/AdyenInitialPayment';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adyenUpdating, setAdyenUpdating] = useState(false); // @todo: integrate AdyenInitialPayment into useCheckout

  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [showCouponCodeSuccess, setShowCouponCodeSuccess] = useState(false);

  const chooseOfferUrl = modalURLFromLocation(location, 'choose-offer');
  const welcomeUrl = modalURLFromLocation(location, 'welcome');
  const closeModalUrl = modalURLFromLocation(location, null);

  const backButtonClickHandler = () => navigate(chooseOfferUrl);

  const { offer, offerType, paymentMethods, order, isSubmitting, updateOrder, submitPaymentWithoutDetails, submitPaymentPaypal, submitPaymentStripe } =
    useCheckout({
      onUpdateOrderSuccess: () => setShowCouponCodeSuccess(true),
      onSubmitPaymentWithoutDetailsSuccess: () => navigate(offerType === 'svod' ? welcomeUrl : closeModalUrl, { replace: true }),
      onSubmitPaypalPaymentSuccess: (paypalUrl: string) => {
        window.location.href = paypalUrl;
      },
      onSubmitStripePaymentSuccess: () => navigate(modalURLFromLocation(location, 'waiting-for-payment'), { replace: true }),
    });

  const {
    values: { couponCode, paymentMethodId },
    setValue,
    submitting: couponFormSubmitting,
    errors,
    handleChange,
    handleSubmit,
  } = useForm({
    initialValues: { couponCode: '', paymentMethodId: paymentMethods?.[0]?.id?.toString() || '' },
    onSubmit: async ({ couponCode, paymentMethodId }) => {
      setShowCouponCodeSuccess(false);

      return await updateOrder.mutateAsync({ couponCode, paymentMethodId: parseInt(paymentMethodId) });
    },
    onSubmitSuccess: ({ couponCode }): void => setShowCouponCodeSuccess(!!couponCode),
    onSubmitError: ({ error }) => {
      if (error instanceof FormValidationError && error.errors.order?.includes(`Order with id ${order?.id} not found`)) {
        navigate(modalURLFromLocation(location, 'choose-offer'), { replace: true });
      }
    },
  });

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event);

    // Always send payment method to backend
    updateOrder.mutateAsync({ couponCode, paymentMethodId: parseInt(event.target.value) });
  };

  useEffect(() => {
    if (!offer) {
      return navigate(chooseOfferUrl, { replace: true });
    }
  }, [navigate, chooseOfferUrl, offer]);

  // Pre-select first payment method
  useEffect(() => {
    if (!paymentMethods?.length) return;

    setValue('paymentMethodId', paymentMethods[0].id.toString());
  }, [paymentMethods, setValue]);

  // clear after closing the checkout modal
  useEffect(() => {
    return () => setShowCouponCodeSuccess(false);
  }, []);

  // loading state
  if (!offer || !order || !paymentMethods || !offerType) {
    return (
      <div style={{ height: 300 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  const cancelUrl = createURL(window.location.href, { u: 'payment-cancelled' });
  const waitingUrl = createURL(window.location.href, { u: 'waiting-for-payment' });
  const errorUrl = createURL(window.location.href, { u: 'payment-error' });
  const successUrl = offerType === 'svod' ? welcomeUrl : closeModalUrl;
  const successUrlWithOrigin = `${window.location.origin}${successUrl}`;
  const referrer = window.location.href;

  const paymentMethod = paymentMethods?.find((method) => method.id === parseInt(paymentMethodId));
  const noPaymentRequired = !order?.requiredPaymentDetails;
  const isStripePayment = paymentMethod?.methodName === 'card' && paymentMethod?.provider === 'stripe';
  const isAdyenPayment = paymentMethod?.methodName === 'card' && paymentMethod?.paymentGateway === 'adyen'; // @todo: conversion from controller?
  const isPayPalPayment = paymentMethod?.methodName === 'paypal';

  return (
    <CheckoutForm
      order={order}
      offer={offer}
      offerType={offerType}
      onBackButtonClick={backButtonClickHandler}
      paymentMethods={paymentMethods}
      paymentMethodId={paymentMethodId}
      onPaymentMethodChange={handlePaymentMethodChange}
      onCouponFormSubmit={handleSubmit}
      onCouponInputChange={handleChange}
      onRedeemCouponButtonClick={() => setCouponFormOpen(true)}
      onCloseCouponFormClick={() => setCouponFormOpen(false)}
      couponInputValue={couponCode}
      couponFormOpen={couponFormOpen}
      couponFormApplied={showCouponCodeSuccess}
      couponFormSubmitting={couponFormSubmitting}
      couponFormError={errors.couponCode}
      submitting={isSubmitting || adyenUpdating}
    >
      {noPaymentRequired && <NoPaymentRequired onSubmit={submitPaymentWithoutDetails.mutateAsync} error={submitPaymentWithoutDetails.error?.message || null} />}
      {isStripePayment && (
        <PaymentForm
          onPaymentFormSubmit={async (cardPaymentPayload: PaymentFormData) =>
            await submitPaymentStripe.mutateAsync({ cardPaymentPayload, referrer, returnUrl: waitingUrl })
          }
        />
      )}
      {isAdyenPayment && (
        <>
          <AdyenInitialPayment
            paymentSuccessUrl={offerType === 'svod' ? welcomeUrl : closeModalUrl}
            setUpdatingOrder={setAdyenUpdating}
            orderId={order.id}
            type="card"
          />
        </>
      )}
      {isPayPalPayment && (
        <PayPal
          onSubmit={() => submitPaymentPaypal.mutate({ successUrl: successUrlWithOrigin, waitingUrl, cancelUrl, errorUrl, couponCode })}
          error={submitPaymentPaypal.error?.message || null}
        />
      )}
    </CheckoutForm>
  );
};

export default Checkout;

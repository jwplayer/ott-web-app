import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import useCheckout from '@jwp/ott-hooks-react/src/useCheckout';
import { modalURLFromLocation, modalURLFromWindowLocation } from '@jwp/ott-ui-react/src/utils/location';
import useForm from '@jwp/ott-hooks-react/src/useForm';
import { FormValidationError } from '@jwp/ott-common/src/errors/FormValidationError';
import { useTranslation } from 'react-i18next';

import CheckoutForm from '../../../components/CheckoutForm/CheckoutForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';
import PayPal from '../../../components/PayPal/PayPal';
import NoPaymentRequired from '../../../components/NoPaymentRequired/NoPaymentRequired';
import PaymentForm, { type PaymentFormData } from '../../../components/PaymentForm/PaymentForm';
import AdyenInitialPayment from '../../AdyenInitialPayment/AdyenInitialPayment';
import { useAriaAnnouncer } from '../../AnnouncementProvider/AnnoucementProvider';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adyenUpdating, setAdyenUpdating] = useState(false); // @todo: integrate AdyenInitialPayment into useCheckout

  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [showCouponCodeSuccess, setShowCouponCodeSuccess] = useState(false);
  const { t } = useTranslation('account');
  const announce = useAriaAnnouncer();

  const chooseOfferUrl = modalURLFromLocation(location, 'choose-offer');
  const welcomeUrl = modalURLFromLocation(location, 'welcome');
  const closeModalUrl = modalURLFromLocation(location, null);

  const backButtonClickHandler = () => navigate(chooseOfferUrl);

  const { selectedOffer, offerType, paymentMethods, order, isSubmitting, updateOrder, submitPaymentWithoutDetails, submitPaymentPaypal, submitPaymentStripe } =
    useCheckout({
      onUpdateOrderSuccess: () => !!couponCode && setShowCouponCodeSuccess(true),
      onSubmitPaymentWithoutDetailsSuccess: () => {
        announce(t('checkout.payment_success'), 'success');

        return navigate(offerType === 'svod' ? welcomeUrl : closeModalUrl, { replace: true });
      },
      onSubmitPaypalPaymentSuccess: ({ redirectUrl }) => {
        window.location.href = redirectUrl;
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
    onSubmit: ({ couponCode, paymentMethodId }) => {
      setShowCouponCodeSuccess(false);

      return updateOrder.mutateAsync({ couponCode, paymentMethodId: parseInt(paymentMethodId) });
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
    if (!selectedOffer) {
      return navigate(chooseOfferUrl, { replace: true });
    }
  }, [navigate, chooseOfferUrl, selectedOffer]);

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
  if (!selectedOffer || !order || !paymentMethods || !offerType) {
    return (
      <div style={{ height: 300 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  const cancelUrl = modalURLFromWindowLocation('payment-cancelled');
  const waitingUrl = modalURLFromWindowLocation('waiting-for-payment', { offerId: selectedOffer?.offerId });
  const errorUrl = modalURLFromWindowLocation('payment-error');
  const successUrlPaypal = offerType === 'svod' ? waitingUrl : closeModalUrl;
  const referrer = window.location.href;

  const paymentMethod = paymentMethods?.find((method) => method.id === parseInt(paymentMethodId));
  const noPaymentRequired = !order?.requiredPaymentDetails;
  const isStripePayment = paymentMethod?.methodName === 'card' && paymentMethod?.provider === 'stripe';
  const isAdyenPayment = paymentMethod?.methodName === 'card' && paymentMethod?.paymentGateway === 'adyen';
  const isPayPalPayment = paymentMethod?.methodName === 'paypal';

  return (
    <CheckoutForm
      order={order}
      offer={selectedOffer}
      offerType={offerType}
      error={errors.form}
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
          onSubmit={() => submitPaymentPaypal.mutate({ successUrl: successUrlPaypal, waitingUrl, cancelUrl, errorUrl, couponCode })}
          error={submitPaymentPaypal.error?.message || null}
        />
      )}
    </CheckoutForm>
  );
};

export default Checkout;

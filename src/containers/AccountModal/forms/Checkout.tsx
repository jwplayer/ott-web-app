import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import { isSVODOffer } from '../../../utils/subscription';

import CheckoutForm from '#src/components/CheckoutForm/CheckoutForm';
import { addQueryParam, removeQueryParam } from '#src/utils/history';
import useForm from '#src/hooks/useForm';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import Adyen from '#src/components/Adyen/Adyen';
import PayPal from '#src/components/PayPal/PayPal';
import NoPaymentRequired from '#src/components/NoPaymentRequired/NoPaymentRequired';
import { addQueryParams } from '#src/utils/formatting';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import { adyenPayment, createOrder, getPaymentMethods, paymentWithoutDetails, paypalPayment, updateOrder } from '#src/stores/CheckoutController';
import { reloadActiveSubscription } from '#src/stores/AccountController';

const Checkout = () => {
  const { cleengSandbox } = useConfigStore((state) => state.getCleengData());

  const { t } = useTranslation('account');
  const history = useHistory();
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
    return offerType === 'svod' ? addQueryParam(history, 'u', 'welcome') : removeQueryParam(history, 'u');
  }, [history, offerType]);

  const couponCodeForm = useForm({ couponCode: '' }, async (values, { setSubmitting, setErrors }) => {
    setUpdatingOrder(true);
    setCouponCodeApplied(false);

    if (values.couponCode && order) {
      try {
        await updateOrder(order.id, paymentMethodId, values.couponCode);
        setCouponCodeApplied(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes(`Order with id ${order.id} not found`)) {
            history.replace(addQueryParam(history, 'u', 'choose-offer'));
          } else {
            setErrors({ couponCode: t('checkout.coupon_not_valid') });
          }
        }
      }
    }

    setUpdatingOrder(false);
    setSubmitting(false);
  });

  useEffect(() => {
    async function create() {
      if (offer) {
        setUpdatingOrder(true);
        setCouponCodeApplied(false);
        const methods = await getPaymentMethods();

        setPaymentMethodId(methods[0]?.id);

        await createOrder(offer.offerId, methods[0]?.id);
        setUpdatingOrder(false);
      }
    }

    if (!offer) {
      return history.replace(addQueryParam(history, 'u', 'choose-offer'));
    }

    create();
  }, [history, offer]);

  // clear the order after closing the checkout modal
  useEffect(() => {
    return () => setOrder(null);
  }, [setOrder]);

  const backButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'choose-offer'));
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toPaymentMethodId = parseInt(event.target.value);

    setPaymentMethodId(toPaymentMethodId);
    setPaymentError(undefined);

    if (order && toPaymentMethodId) {
      setUpdatingOrder(true);
      setCouponCodeApplied(false);
      updateOrder(order.id, toPaymentMethodId, couponCodeForm.values.couponCode)
        .catch((error: Error) => {
          if (error.message.includes(`Order with id ${order.id}} not found`)) {
            history.push(addQueryParam(history, 'u', 'choose-offer'));
          }
        })
        .finally(() => setUpdatingOrder(false));
    }
  };

  const handleNoPaymentRequiredSubmit = async () => {
    try {
      setUpdatingOrder(true);
      setPaymentError(undefined);
      await paymentWithoutDetails();
      await reloadActiveSubscription({ delay: 1000 });
      history.replace(paymentSuccessUrl);
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
      const cancelUrl = addQueryParams(window.location.href, { u: 'paypal-cancelled' });
      const errorUrl = addQueryParams(window.location.href, { u: 'paypal-error' });
      const successUrl = `${window.location.origin}${paymentSuccessUrl}`;
      const response = await paypalPayment(successUrl, cancelUrl, errorUrl);

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

  const handleAdyenSubmit = useCallback(
    async (data: AdyenEventData) => {
      if (!data.isValid) return;

      try {
        setUpdatingOrder(true);
        setPaymentError(undefined);
        await adyenPayment(data.data.paymentMethod);
        await reloadActiveSubscription({ delay: 1000 });
        history.replace(paymentSuccessUrl);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setPaymentError(error.message);
        }
      }

      setUpdatingOrder(false);
    },
    [history, paymentSuccessUrl],
  );

  const renderPaymentMethod = () => {
    const paymentMethod = paymentMethods?.find((method) => method.id === paymentMethodId);

    if (!order || !offer) return null;

    if (!order.requiredPaymentDetails) {
      return <NoPaymentRequired onSubmit={handleNoPaymentRequiredSubmit} error={paymentError} />;
    }

    if (paymentMethod?.methodName === 'card') {
      return <Adyen onSubmit={handleAdyenSubmit} error={paymentError} environment={cleengSandbox ? 'test' : 'live'} />;
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
      onCouponFormSubmit={couponCodeForm.handleSubmit}
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

import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import type { FormValidationError } from '@jwp/ott-common/src/errors/FormValidationError';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { isSVODOffer } from '@jwp/ott-common/src/utils/subscription';
import type { CardPaymentData, Offer, OfferType, Payment } from '@jwp/ott-common/types/checkout';
import { useEffect } from 'react';
import { useMutation } from 'react-query';

type Props = {
  onUpdateOrderSuccess?: () => void;
  onSubmitPaymentWithoutDetailsSuccess: () => void;
  onSubmitPaypalPaymentSuccess: (response: { redirectUrl: string }) => void;
  onSubmitStripePaymentSuccess: () => void;
};

const useCheckout = ({ onUpdateOrderSuccess, onSubmitPaymentWithoutDetailsSuccess, onSubmitPaypalPaymentSuccess, onSubmitStripePaymentSuccess }: Props) => {
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

  const { order, offer, paymentMethods, setOrder } = useCheckoutStore(({ order, offer, paymentMethods, setOrder }) => ({
    order,
    offer,
    paymentMethods,
    setOrder,
  }));

  const offerType: OfferType = offer && !isSVODOffer(offer) ? 'tvod' : 'svod';

  const createOrder = useMutation<void, FormValidationError, { offer: Offer }>({
    mutationKey: ['createOrder'],
    mutationFn: async ({ offer }) => !!offer && checkoutController.createOrder(offer),
  });

  const updateOrder = useMutation<void, string, { paymentMethodId: number; couponCode: string }>({
    mutationKey: ['updateOrder'],
    mutationFn: async ({ paymentMethodId, couponCode }) => {
      if (!order || !paymentMethodId) return;

      return await checkoutController.updateOrder(order, paymentMethodId, couponCode);
    },
    onSuccess: onUpdateOrderSuccess,
  });

  const submitPaymentWithoutDetails = useMutation<Payment, Error>({
    mutationKey: ['submitPaymentWithoutDetails'],
    mutationFn: checkoutController.paymentWithoutDetails,
    onSuccess: async () => {
      await accountController.reloadSubscriptions({ delay: 1000 });
      onSubmitPaymentWithoutDetailsSuccess();
    },
  });

  const submitPaymentPaypal = useMutation<
    { redirectUrl: string },
    Error,
    { successUrl: string; waitingUrl: string; cancelUrl: string; errorUrl: string; couponCode: string }
  >({
    mutationKey: ['submitPaymentPaypal'],
    mutationFn: checkoutController.paypalPayment,
    onSuccess: onSubmitPaypalPaymentSuccess,
  });

  const submitPaymentStripe = useMutation<boolean, Error, { cardPaymentPayload: CardPaymentData; referrer: string; returnUrl: string }>({
    mutationKey: ['submitPaymentStripe'],
    mutationFn: checkoutController.directPostCardPayment,
    onSuccess: onSubmitStripePaymentSuccess,
  });

  useEffect(() => {
    if (offer && !order && !createOrder.isLoading) {
      createOrder.mutate({ offer });
    }
  }, [offer, order, createOrder]);

  // Clear the order when unmounted
  useEffect(() => {
    return () => setOrder(null);
  }, [setOrder]);

  const isSubmitting =
    createOrder.isLoading || updateOrder.isLoading || submitPaymentWithoutDetails.isLoading || submitPaymentPaypal.isLoading || submitPaymentStripe.isLoading;

  return {
    offer,
    offerType,
    paymentMethods,
    order,
    isSubmitting,
    updateOrder,
    submitPaymentWithoutDetails,
    submitPaymentPaypal,
    submitPaymentStripe,
  };
};

export default useCheckout;

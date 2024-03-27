import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import CheckoutController from '@jwp/ott-common/src/controllers/CheckoutController';
import type { FormValidationError } from '@jwp/ott-common/src/errors/FormValidationError';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useCheckoutStore } from '@jwp/ott-common/src/stores/CheckoutStore';
import { isSVODOffer } from '@jwp/ott-common/src/utils/offers';
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

  const { order, selectedOffer, paymentMethods, setOrder } = useCheckoutStore(({ order, selectedOffer, paymentMethods, setOrder }) => ({
    order,
    selectedOffer,
    paymentMethods,
    setOrder,
  }));

  const offerType: OfferType = selectedOffer && isSVODOffer(selectedOffer) ? 'svod' : 'tvod';

  const initialiseOrder = useMutation<void, FormValidationError, { offer: Offer }>({
    mutationKey: ['initialiseOrder'],
    mutationFn: async ({ offer }) => !!offer && checkoutController.initialiseOrder(offer),
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
    if (selectedOffer && !order && !initialiseOrder.isLoading && !initialiseOrder.isError) {
      initialiseOrder.mutate({ offer: selectedOffer });
    }
  }, [selectedOffer, order, initialiseOrder]);

  // Clear the order when unmounted
  useEffect(() => {
    return () => setOrder(null);
  }, [setOrder]);

  const isSubmitting =
    initialiseOrder.isLoading ||
    updateOrder.isLoading ||
    submitPaymentWithoutDetails.isLoading ||
    submitPaymentPaypal.isLoading ||
    submitPaymentStripe.isLoading;

  return {
    selectedOffer,
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
